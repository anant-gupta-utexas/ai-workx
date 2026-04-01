# **Middleware Guide - FastAPI Middleware Patterns**

Complete guide to creating and using middleware in FastAPI microservices.

## **Table of Contents**

- [Authentication Middleware](middleware-guide.md#authentication-middleware)
- [Logging Middleware](middleware-guide.md#logging-middleware)
- [Error Handler Middleware](middleware-guide.md#error-handler-middleware)
- [CORS Middleware](middleware-guide.md#cors-middleware)
- [Rate Limiting Middleware](middleware-guide.md#rate-limiting-middleware)
- [Request ID Middleware](middleware-guide.md#request-id-middleware)
- [Middleware Ordering](middleware-guide.md#middleware-ordering)

---

## **Authentication Middleware**

### **JWT Authentication Middleware**

**File:** `app/middleware/auth.py`

```python
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from opentelemetry import trace
from app.core.security import verify_token

tracer = trace.get_tracer(__name__)

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip auth for public endpoints
        if request.url.path in ["/health", "/docs", "/openapi.json"]:
            return await call_next(request)

        # Get token from header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid authorization header",
            )

        token = auth_header.split(" ")[1]

        try:
            # Verify and decode token
            payload = verify_token(token)

            # Add user info to request state
            request.state.user_id = payload.get("sub")
            request.state.user_email = payload.get("email")
            request.state.user_role = payload.get("role")

            # Add to trace context
            span = trace.get_current_span()
            span.set_attribute("user.id", request.state.user_id)
            span.set_attribute("user.email", request.state.user_email)

            response = await call_next(request)
            return response
        except Exception as e:
            span = trace.get_current_span()
            span.record_exception(e)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
```

**Register in main.py:**

```python
from app.middleware.auth import AuthMiddleware

app.add_middleware(AuthMiddleware)
```

---

## **Logging Middleware**

### **Request/Response Logging**

**File:** `app/middleware/logging.py`

```python
import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import json

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Log request
        logger.info(
            "Request started",
            extra={
                "method": request.method,
                "url": str(request.url),
                "path": request.url.path,
                "client_host": request.client.host if request.client else None,
                "headers": dict(request.headers),
            },
        )

        # Process request
        try:
            response = await call_next(request)
            duration = time.time() - start_time

            # Log response
            logger.info(
                "Request completed",
                extra={
                    "method": request.method,
                    "url": str(request.url),
                    "status_code": response.status_code,
                    "duration_ms": f"{duration * 1000:.2f}",
                },
            )

            # Add timing header
            response.headers["X-Process-Time"] = f"{duration:.4f}"
            return response
        except Exception as e:
            duration = time.time() - start_time
            logger.error(
                "Request failed",
                extra={
                    "method": request.method,
                    "url": str(request.url),
                    "duration_ms": f"{duration * 1000:.2f}",
                    "error": str(e),
                },
            )
            raise
```

---

## **Error Handler Middleware**

### **Global Error Handler**

**File:** `app/middleware/error_handler.py`

```python
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode
import logging

logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            # Get current span and record exception
            span = trace.get_current_span()
            span.record_exception(e)
            span.set_status(Status(StatusCode.ERROR, str(e)))

            # Log error with trace context
            span_context = span.get_span_context()
            logger.error(
                f"Unhandled error: {str(e)}",
                exc_info=True,
                extra={
                    "method": request.method,
                    "url": str(request.url),
                    "client": request.client.host if request.client else None,
                    "trace_id": format(span_context.trace_id, '032x'),
                    "span_id": format(span_context.span_id, '016x'),
                },
            )

            # Return error response with trace ID
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "detail": "Internal server error",
                    "trace_id": format(span_context.trace_id, '032x'),
                },
            )
```

**Exception Handlers:**

```python
from fastapi import FastAPI, HTTPException, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from opentelemetry import trace
import logging

logger = logging.getLogger(__name__)
app = FastAPI()

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
        },
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    # Record exception in trace
    span = trace.get_current_span()
    span.record_exception(exc)
    span_context = span.get_span_context()

    # Log error
    logger.error(
        "Unhandled exception",
        extra={"error": str(exc), "trace_id": format(span_context.trace_id, '032x')},
        exc_info=True
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "trace_id": format(span_context.trace_id, '032x'),
        },
    )
```

---

## **CORS Middleware**

### **CORS Configuration**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
    expose_headers=["X-Process-Time"],
)
```

---

## **Rate Limiting Middleware**

### **Redis-Based Rate Limiter**

```python
from redis.asyncio import Redis
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware

class RedisRateLimitMiddleware(BaseHTTPMiddleware):
    """Redis-based rate limiter for distributed systems."""

    def __init__(self, app, redis: Redis, requests_per_minute: int = 60):
        super().__init__(app)
        self.redis = redis
        self.requests_per_minute = requests_per_minute

    async def dispatch(self, request: Request, call_next):
        client_id = self._get_client_id(request)
        key = f"rate_limit:{client_id}"

        # Get current count
        count = await self.redis.get(key)

        if count and int(count) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded",
            )

        # Increment counter
        pipe = self.redis.pipeline()
        pipe.incr(key)
        pipe.expire(key, 60)  # 1 minute expiry
        await pipe.execute()

        response = await call_next(request)

        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(
            self.requests_per_minute - (int(count) if count else 0) - 1
        )

        return response

    def _get_client_id(self, request: Request) -> str:
        # Use user ID if authenticated
        if hasattr(request.state, "user_id"):
            return f"user:{request.state.user_id}"
        # Use IP address
        return f"ip:{request.client.host if request.client else 'unknown'}"
```

---

## **Request ID Middleware**

### **Add Request ID to All Requests**

**File:** `app/middleware/request_id.py`

```python
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from opentelemetry import trace

class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Generate or get request ID
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())

        # Add to request state
        request.state.request_id = request_id

        # Add to trace context
        span = trace.get_current_span()
        span.set_attribute("request.id", request_id)

        # Process request
        response = await call_next(request)

        # Add to response headers
        response.headers["X-Request-ID"] = request_id

        return response
```

---

## **Middleware Ordering**

### **Critical Order (Must Follow)**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.logging import LoggingMiddleware
from app.middleware.auth import AuthMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.error_handler import ErrorHandlerMiddleware

app = FastAPI()

# 1. Error handler (first to catch all errors)
app.add_middleware(ErrorHandlerMiddleware)

# 2. CORS (for preflight requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Request ID (early for logging)
app.add_middleware(RequestIDMiddleware)

# 4. Logging (log all requests)
app.add_middleware(LoggingMiddleware)

# 5. Rate limiting (before auth to protect auth endpoint)
app.add_middleware(RateLimitMiddleware, requests_per_minute=100)

# 6. Authentication (last, after logging and rate limiting)
app.add_middleware(AuthMiddleware)

# Include routers
app.include_router(api_router, prefix="/api/v1")
```

**Rule:** Middleware is applied in reverse order (last added = first executed)!

---

## **Custom Middleware Patterns**

### **Timing Middleware**

```python
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response
```

### **Compression Middleware**

```python
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### **Trusted Host Middleware**

```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["example.com", "*.example.com"],
)
```

---

**Related Files:**

- `../SKILL.md` - Main guide
- `./api-layer.md` - Using middleware with routes
- `./observability.md` - OpenTelemetry integration
- `./async-and-errors.md` - Error handling patterns
