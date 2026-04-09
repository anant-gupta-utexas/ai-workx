# **Observability - slog and OpenTelemetry**

Complete guide to structured logging, distributed tracing, and metrics in Go Clean Architecture.

## **Table of Contents**

- [slog Setup](#slog-setup)
- [Structured Logging Patterns](#structured-logging-patterns)
- [OpenTelemetry Tracing](#opentelemetry-tracing)
- [Log-Trace Correlation](#log-trace-correlation)
- [Metrics](#metrics)
- [Best Practices](#best-practices)

---

## **slog Setup**

### **Why slog?**

`log/slog` is the standard library structured logger (Go 1.21+). It provides:
- Zero external dependencies
- JSON and text output handlers
- Structured key-value attributes
- Extensible `Handler` interface
- Sufficient performance for the vast majority of services

Reserve zerolog or zap only for ultra-high-throughput systems (millions of log entries per second).

### **Configuration**

```go
// internal/adapters/logging/setup.go
package logging

import (
    "log/slog"
    "os"
)

func Setup(env string, level slog.Level) {
    var handler slog.Handler

    opts := &slog.HandlerOptions{
        Level:     level,
        AddSource: env != "production",
    }

    switch env {
    case "production":
        handler = slog.NewJSONHandler(os.Stdout, opts)
    default:
        handler = slog.NewTextHandler(os.Stdout, opts)
    }

    slog.SetDefault(slog.New(handler))
}
```

### **Usage in main.go**

```go
func main() {
    cfg := config.Load()

    level := slog.LevelInfo
    if cfg.Log.Debug {
        level = slog.LevelDebug
    }
    logging.Setup(cfg.Environment, level)

    slog.Info("starting server",
        "env", cfg.Environment,
        "port", cfg.Server.Port,
    )
    // ...
}
```

---

## **Structured Logging Patterns**

### **Log Attributes**

Always use structured key-value pairs, never string interpolation:

```go
// ✅ GOOD: Structured attributes
slog.Info("user created",
    "user_id", user.ID(),
    "email", user.Email(),
)

slog.Error("failed to create user",
    "error", err,
    "email", req.Email,
)

// ❌ BAD: String interpolation
slog.Info(fmt.Sprintf("user %s created with email %s", user.ID(), user.Email()))
```

### **Context-Aware Logging**

Pass `context.Context` to propagate request-scoped attributes:

```go
// ✅ GOOD: Context-aware logging preserves trace/request IDs
slog.InfoContext(ctx, "processing order",
    "order_id", orderID,
    "user_id", userID,
)

// ❌ BAD: No context — loses trace correlation
slog.Info("processing order", "order_id", orderID)
```

### **Log Levels**

| Level | Use For |
| --- | --- |
| `slog.LevelDebug` | Detailed diagnostic info (off in production) |
| `slog.LevelInfo` | Normal operational events (request served, job completed) |
| `slog.LevelWarn` | Unexpected but recoverable situations |
| `slog.LevelError` | Errors that need attention (failed operations) |

### **Logging in Each Layer**

| Layer | What to Log | Level |
| --- | --- | --- |
| HTTP Handler | Request received, response sent, errors | Info/Error |
| Middleware | Request/response timing, panics | Info/Error |
| App Service | Business workflow steps | Debug/Info |
| Repository | Database errors (not every query) | Error |
| Domain | Nothing — domain is pure logic | — |

---

## **OpenTelemetry Tracing**

### **Setup**

```go
// internal/adapters/telemetry/tracer.go
package telemetry

import (
    "context"
    "fmt"

    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
    "go.opentelemetry.io/otel/propagation"
    "go.opentelemetry.io/otel/sdk/resource"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
    semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
)

func SetupTracer(ctx context.Context, serviceName, env string) (func(context.Context) error, error) {
    exporter, err := otlptracegrpc.New(ctx)
    if err != nil {
        return nil, fmt.Errorf("creating OTLP exporter: %w", err)
    }

    res, err := resource.New(ctx,
        resource.WithAttributes(
            semconv.ServiceName(serviceName),
            semconv.DeploymentEnvironment(env),
        ),
    )
    if err != nil {
        return nil, fmt.Errorf("creating resource: %w", err)
    }

    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exporter),
        sdktrace.WithResource(res),
    )

    otel.SetTracerProvider(tp)
    otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
        propagation.TraceContext{},
        propagation.Baggage{},
    ))

    return tp.Shutdown, nil
}
```

### **HTTP Instrumentation with otelhttp**

```go
// cmd/server/main.go (excerpt)
import "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"

func main() {
    // ... setup tracer

    router := httpport.NewRouter(userHandler, orderHandler, healthHandler)

    srv := &http.Server{
        Addr:    ":" + cfg.Server.Port,
        Handler: otelhttp.NewHandler(router, "myservice"),
    }
    // ...
}
```

### **Manual Spans**

Create spans for significant operations:

```go
// internal/app/order_service.go
import "go.opentelemetry.io/otel"

var tracer = otel.Tracer("myservice/app")

func (s *OrderService) PlaceOrder(ctx context.Context, req PlaceOrderRequest) (*OrderDTO, error) {
    ctx, span := tracer.Start(ctx, "OrderService.PlaceOrder")
    defer span.End()

    span.SetAttributes(
        attribute.String("user_id", req.UserID.String()),
        attribute.Int("item_count", len(req.Items)),
    )

    // ... business logic

    if err != nil {
        span.RecordError(err)
        span.SetStatus(codes.Error, err.Error())
        return nil, err
    }

    return dto, nil
}
```

---

## **Log-Trace Correlation**

### **Injecting Trace Context into Logs**

Correlate logs with traces by extracting `trace_id` and `span_id` from the context:

```go
// internal/adapters/logging/otel_handler.go
package logging

import (
    "context"
    "log/slog"

    "go.opentelemetry.io/otel/trace"
)

type OtelHandler struct {
    inner slog.Handler
}

func NewOtelHandler(inner slog.Handler) *OtelHandler {
    return &OtelHandler{inner: inner}
}

func (h *OtelHandler) Enabled(ctx context.Context, level slog.Level) bool {
    return h.inner.Enabled(ctx, level)
}

func (h *OtelHandler) Handle(ctx context.Context, record slog.Record) error {
    span := trace.SpanFromContext(ctx)
    if span.SpanContext().IsValid() {
        record.AddAttrs(
            slog.String("trace_id", span.SpanContext().TraceID().String()),
            slog.String("span_id", span.SpanContext().SpanID().String()),
        )
    }
    return h.inner.Handle(ctx, record)
}

func (h *OtelHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
    return &OtelHandler{inner: h.inner.WithAttrs(attrs)}
}

func (h *OtelHandler) WithGroup(name string) slog.Handler {
    return &OtelHandler{inner: h.inner.WithGroup(name)}
}
```

### **Wiring the OTel-Aware Logger**

```go
func Setup(env string, level slog.Level) {
    opts := &slog.HandlerOptions{Level: level}

    var baseHandler slog.Handler
    if env == "production" {
        baseHandler = slog.NewJSONHandler(os.Stdout, opts)
    } else {
        baseHandler = slog.NewTextHandler(os.Stdout, opts)
    }

    handler := NewOtelHandler(baseHandler)
    slog.SetDefault(slog.New(handler))
}
```

### **Correlated Log Output**

```json
{
  "time": "2026-03-30T12:00:00Z",
  "level": "INFO",
  "msg": "order placed",
  "order_id": "abc-123",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7"
}
```

---

## **Metrics**

### **OpenTelemetry Metrics Setup**

```go
// internal/adapters/telemetry/meter.go
package telemetry

import (
    "context"
    "fmt"

    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
    sdkmetric "go.opentelemetry.io/otel/sdk/metric"
    "go.opentelemetry.io/otel/sdk/resource"
)

func SetupMeter(ctx context.Context, res *resource.Resource) (func(context.Context) error, error) {
    exporter, err := otlpmetricgrpc.New(ctx)
    if err != nil {
        return nil, fmt.Errorf("creating metric exporter: %w", err)
    }

    mp := sdkmetric.NewMeterProvider(
        sdkmetric.WithReader(sdkmetric.NewPeriodicReader(exporter)),
        sdkmetric.WithResource(res),
    )
    otel.SetMeterProvider(mp)

    return mp.Shutdown, nil
}
```

### **Custom Business Metrics**

```go
var meter = otel.Meter("myservice/app")

var (
    ordersCreated, _ = meter.Int64Counter("orders.created",
        metric.WithDescription("Total orders created"))
    orderValue, _ = meter.Float64Histogram("orders.value",
        metric.WithDescription("Order value in dollars"),
        metric.WithUnit("USD"))
)

func (s *OrderService) PlaceOrder(ctx context.Context, req PlaceOrderRequest) (*OrderDTO, error) {
    // ... create order
    ordersCreated.Add(ctx, 1, metric.WithAttributes(
        attribute.String("currency", dto.Currency),
    ))
    orderValue.Record(ctx, float64(dto.Total)/100.0)
    return dto, nil
}
```

---

## **Best Practices**

### **1. Handle Errors Once**

```go
// ✅ GOOD: Log OR return, not both
func (s *UserService) CreateUser(ctx context.Context, req CreateUserRequest) (*UserDTO, error) {
    u, err := user.NewUser(req.Email, req.Name)
    if err != nil {
        return nil, fmt.Errorf("creating user: %w", err)
    }
    // ...
}
// HTTP handler logs the error at the boundary

// ❌ BAD: Log AND return — creates duplicate log entries
func (s *UserService) CreateUser(ctx context.Context, req CreateUserRequest) (*UserDTO, error) {
    u, err := user.NewUser(req.Email, req.Name)
    if err != nil {
        slog.Error("failed to create user", "error", err)  // DUPLICATE!
        return nil, err
    }
}
```

### **2. Log at Boundaries**

Log in HTTP handlers (inbound boundary) and external client calls (outbound boundary). Avoid logging in domain or app layers — let errors propagate with context.

### **3. Use sloglint**

Enable `sloglint` in golangci-lint to enforce consistent attribute style:

```yaml
# .golangci.yml
linters:
  enable:
    - sloglint
```

### **4. Don't Log Sensitive Data**

```go
// ✅ GOOD: Log user ID, not PII
slog.Info("user authenticated", "user_id", user.ID())

// ❌ BAD: Logging PII
slog.Info("user authenticated", "email", user.Email(), "password_hash", hash)
```

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./configuration.md` - OpenTelemetry configuration
- `./middleware-guide.md` - Request logging middleware
- `./error-handling.md` - Error handling and logging
