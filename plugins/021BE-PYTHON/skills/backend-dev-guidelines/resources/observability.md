# **Observability - OpenTelemetry & Logging**

Complete guide to observability in Python/FastAPI Clean Architecture projects.

## **Table of Contents**

- [OpenTelemetry Overview](observability.md#opentelemetry-overview)
- [Setup and Configuration](observability.md#setup-and-configuration)
- [Tracing](observability.md#tracing)
- [Structured Logging](observability.md#structured-logging)
- [Best Practices](observability.md#best-practices)

---

## **OpenTelemetry Overview**

### **What is OpenTelemetry?**

**OpenTelemetry** is an open-source observability framework for collecting traces, metrics, and logs.

**Benefits**:

- ✅ Vendor-neutral (works with any observability backend)
- ✅ Automatic instrumentation for FastAPI, SQLAlchemy, HTTP clients
- ✅ Distributed tracing across services
- ✅ Performance monitoring
- ✅ Error tracking with context

**Replace Sentry with OpenTelemetry** for modern, flexible observability.

---

## **Setup and Configuration**

### **Installation**

```bash
# Using uv
uv add --group observability opentelemetry-api opentelemetry-sdk \
    opentelemetry-exporter-otlp \
    opentelemetry-instrumentation-fastapi \
    opentelemetry-instrumentation-httpx \
    opentelemetry-instrumentation-sqlalchemy

# Or add to dependency group
[dependency-groups]
observability = [
    "opentelemetry-api>=1.32.1",
    "opentelemetry-sdk>=1.32.1",
    "opentelemetry-exporter-otlp>=1.23.0",
    "opentelemetry-instrumentation-fastapi>=0.53b1",
    "opentelemetry-instrumentation-httpx>=0.53b1",
    "opentelemetry-instrumentation-sqlalchemy>=0.53b1",
]

```

### **Configuration**

```python
# src/infrastructure/observability/tracer_setup.pyfrom opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource, SERVICE_NAME
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

def setup_otel_tracer(
    service_name: str = "constellation-api",
    otlp_endpoint: str = "http://localhost:4318"
):
    """
    Setup OpenTelemetry tracer with OTLP exporter.

    Args:
        service_name: Name of the service
        otlp_endpoint: OTLP collector endpoint
    """
# Create resource with service name
    resource = Resource(attributes={
        SERVICE_NAME: service_name
    })

# Create tracer provider
    provider = TracerProvider(resource=resource)

# Create OTLP exporter
    otlp_exporter = OTLPSpanExporter(
        endpoint=otlp_endpoint,
        insecure=True# Use False for production with TLS
    )

# Add span processor
    provider.add_span_processor(
        BatchSpanProcessor(otlp_exporter)
    )

# Set global tracer provider
    trace.set_tracer_provider(provider)

# Auto-instrument libraries
    HTTPXClientInstrumentor().instrument()
    SQLAlchemyInstrumentor().instrument()

    return provider

def instrument_fastapi_app(app):
    """Instrument FastAPI application."""
    FastAPIInstrumentor.instrument_app(app)

```

### **Usage in main.py**

```python
# src/infrastructure/api/rest/main.pyfrom fastapi import FastAPI
from src.infrastructure.observability.tracer_setup import (
    setup_otel_tracer,
    instrument_fastapi_app
)

app = FastAPI(title="Constellation API")

# Setup OpenTelemetry
setup_otel_tracer(
    service_name="constellation-api",
    otlp_endpoint="http://localhost:4318"
)

# Instrument FastAPI
instrument_fastapi_app(app)

```

---

## **Tracing**

### **Manual Tracing**

```python
# src/application/use_cases/task/create_task.pyfrom opentelemetry import trace

tracer = trace.get_tracer(__name__)

class CreateTaskUseCase:
    async def execute(self, request: CreateTaskRequest):
        with tracer.start_as_current_span("create_task") as span:
# Add attributes to span
            span.set_attribute("user_id", request.user_id)
            span.set_attribute("agent_id", request.agent_id)

            try:
# Business logic
                task = await self.task_repo.create(task_entity)

                span.set_attribute("task_id", str(task.id))
                span.set_status(Status(StatusCode.OK))

                return task
            except Exception as e:
                span.set_status(Status(StatusCode.ERROR, str(e)))
                span.record_exception(e)
                raise

```

### **Nested Spans**

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

tracer = trace.get_tracer(__name__)

async def execute(self, request):
    with tracer.start_as_current_span("orchestrate_conversation") as parent_span:
# Child span 1with tracer.start_as_current_span("discover_agent"):
            agent = await self.discover_agent(request.query)

# Child span 2with tracer.start_as_current_span("create_conversation"):
            conversation = await self.create_conversation(agent.id)

# Child span 3with tracer.start_as_current_span("create_task"):
            task = await self.create_task(conversation.id)

        parent_span.set_attribute("conversation_id", str(conversation.id))
        return conversation

```

### **Automatic Instrumentation**

FastAPI, SQLAlchemy, and HTTP clients are **automatically instrumented**:

```python
# This is automatically traced!@router.post("/conversations")
async def create_conversation(request: CreateRequest):
# FastAPI automatically creates span# SQLAlchemy queries automatically traced# HTTP requests automatically traced
    result = await use_case.execute(request)
    return result

```

---

## **Structured Logging**

### **Logger Setup**

```python
# src/infrastructure/observability/logger.pyimport logging
import sys
from pythonjsonlogger import jsonlogger

def get_logger(name: str) -> logging.Logger:
    """
    Get structured JSON logger.

    Args:
        name: Logger name (usually __name__)

    Returns:
        Configured logger with JSON formatting
    """
    logger = logging.getLogger(name)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)

# JSON formatter
        formatter = jsonlogger.JsonFormatter(
            fmt='%(asctime)s %(name)s %(levelname)s %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)

    return logger

```

### **Using Structured Logging**

```python
# src/application/use_cases/conversation/create_conversation.pyfrom src.infrastructure.observability.logger import get_logger

logger = get_logger(__name__)

class CreateConversationUseCase:
    async def execute(self, request: CreateConversationRequest):
        logger.info(
            "Creating conversation",
            extra={
                "user_id": request.user_id,
                "agent_id": request.agent_id,
            }
        )

        try:
            conversation = await self.conversation_repo.create(entity)

            logger.info(
                "Conversation created successfully",
                extra={
                    "conversation_id": str(conversation.id),
                    "user_id": request.user_id,
                }
            )

            return conversation
        except Exception as e:
            logger.error(
                "Failed to create conversation",
                extra={
                    "user_id": request.user_id,
                    "error": str(e),
                },
                exc_info=True
            )
            raise

```

### **Correlating Logs with Traces**

```python
from opentelemetry import trace

logger = get_logger(__name__)

def log_with_trace_context(message: str, **kwargs):
    """Log with trace context for correlation."""
    span = trace.get_current_span()
    span_context = span.get_span_context()

    logger.info(
        message,
        extra={
            **kwargs,
            "trace_id": format(span_context.trace_id, '032x'),
            "span_id": format(span_context.span_id, '016x'),
        }
    )

# Usage
log_with_trace_context(
    "Task created",
    task_id=str(task.id),
    user_id=user_id,
)

```

---

## **Best Practices**

### **1. Always Use Structured Logging**

```python
# ✅ GOOD: Structured logging
logger.info(
    "User created",
    extra={"user_id": user.id, "email": user.email}
)

# ❌ BAD: String interpolation
logger.info(f"User {user.id} created with email {user.email}")

```

### **2. Add Meaningful Span Attributes**

```python
# ✅ GOOD: Rich span attributeswith tracer.start_as_current_span("process_task") as span:
    span.set_attribute("task.id", str(task.id))
    span.set_attribute("task.status", task.status.value)
    span.set_attribute("agent.id", task.agent_id)
    span.set_attribute("conversation.id", str(task.conversation_id))

# ❌ BAD: No contextwith tracer.start_as_current_span("process"):
    ...

```

### **3. Record Exceptions**

```python
# ✅ GOOD: Record exception in spantry:
    result = await operation()
except Exception as e:
    span.record_exception(e)
    span.set_status(Status(StatusCode.ERROR))
    logger.error("Operation failed", extra={"error": str(e)}, exc_info=True)
    raise

# ❌ BAD: Silent failurestry:
    result = await operation()
except:
    pass# Lost context!
```

### **4. Use Appropriate Log Levels**

```python
# DEBUG: Detailed diagnostic info
logger.debug("Database query", extra={"query": sql})

# INFO: Important business events
logger.info("Conversation created", extra={"id": conv_id})

# WARNING: Recoverable issues
logger.warning("Rate limit approaching", extra={"count": count})

# ERROR: Error conditions
logger.error("Failed to create task", exc_info=True)

# CRITICAL: System failure
logger.critical("Database connection lost")

```

### **5. Don't Log Sensitive Data**

```python
# ✅ GOOD: Mask sensitive data
logger.info(
    "User login",
    extra={
        "user_id": user.id,
        "email": user.email[:3] + "***",# Masked
    }
)

# ❌ BAD: Logging secrets
logger.info(f"API key: {api_key}")# NEVER!
logger.info(f"Password: {password}")# NEVER!
```

---

**Related Files:**

- `../SKILL.md` - Main guide
- `./clean-architecture.md` - Architecture overview
- `./configuration.md` - OpenTelemetry configuration