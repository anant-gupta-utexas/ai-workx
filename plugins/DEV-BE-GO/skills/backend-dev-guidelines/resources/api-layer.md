# **API Layer - Chi Router and HTTP Handlers**

Complete guide to implementing the HTTP API layer with Chi router in Go Clean Architecture.

## **Table of Contents**

- [Router Setup](#router-setup)
- [Handler Pattern](#handler-pattern)
- [Request Decoding](#request-decoding)
- [Response Encoding](#response-encoding)
- [Error Mapping](#error-mapping)
- [Route Organization](#route-organization)
- [Health Endpoints](#health-endpoints)

---

## **Router Setup**

### **Chi Router Basics**

Chi is a lightweight, stdlib-compatible router. Handlers use the standard `http.HandlerFunc` signature.

```go
// internal/ports/http/router.go
package http

import (
    "myservice/internal/app"
    "myservice/internal/ports/http/middleware"

    "github.com/go-chi/chi/v5"
    chimw "github.com/go-chi/chi/v5/middleware"
)

func NewRouter(
    userHandler *UserHandler,
    orderHandler *OrderHandler,
    healthHandler *HealthHandler,
) chi.Router {
    r := chi.NewRouter()

    // Global middleware stack
    r.Use(chimw.RequestID)
    r.Use(chimw.RealIP)
    r.Use(middleware.StructuredLogger)
    r.Use(middleware.Recoverer)
    r.Use(chimw.Timeout(30 * time.Second))

    // Health endpoints (no auth)
    r.Get("/livez", healthHandler.Liveness)
    r.Get("/readyz", healthHandler.Readiness)

    // API routes
    r.Route("/api/v1", func(r chi.Router) {
        r.Route("/users", func(r chi.Router) {
            r.Post("/", userHandler.Create)
            r.Get("/", userHandler.List)
            r.Route("/{userID}", func(r chi.Router) {
                r.Get("/", userHandler.GetByID)
                r.Put("/", userHandler.Update)
                r.Delete("/", userHandler.Delete)
                r.Post("/deactivate", userHandler.Deactivate)
            })
        })

        r.Route("/orders", func(r chi.Router) {
            r.Post("/", orderHandler.Create)
            r.Get("/{orderID}", orderHandler.GetByID)
            r.Post("/{orderID}/cancel", orderHandler.Cancel)
        })
    })

    return r
}
```

### **Dependency Injection via Constructors**

Handlers receive app-layer services through their constructors. The wiring happens in `cmd/server/main.go`:

```go
// cmd/server/main.go (excerpt)
userService := app.NewUserService(userRepo)
userHandler := httpport.NewUserHandler(userService)
orderHandler := httpport.NewOrderHandler(orderService)
healthHandler := httpport.NewHealthHandler(pool)

router := httpport.NewRouter(userHandler, orderHandler, healthHandler)
```

---

## **Handler Pattern**

### **Handler Struct**

Each handler struct holds a reference to the application service:

```go
// internal/ports/http/user_handler.go
package http

import (
    "encoding/json"
    "errors"
    "net/http"

    "myservice/internal/app"
    "myservice/internal/domain/user"

    "github.com/go-chi/chi/v5"
    "github.com/google/uuid"
)

type UserHandler struct {
    service *app.UserService
}

func NewUserHandler(service *app.UserService) *UserHandler {
    return &UserHandler{service: service}
}

func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    if err := decodeJSON(r, &req); err != nil {
        writeError(w, http.StatusBadRequest, "invalid request body")
        return
    }

    if err := req.Validate(); err != nil {
        writeError(w, http.StatusBadRequest, err.Error())
        return
    }

    dto, err := h.service.CreateUser(r.Context(), app.CreateUserRequest{
        Email: req.Email,
        Name:  req.Name,
    })
    if err != nil {
        mapDomainError(w, err)
        return
    }

    writeJSON(w, http.StatusCreated, UserResponse{
        ID:        dto.ID.String(),
        Email:     dto.Email,
        Name:      dto.Name,
        Status:    dto.Status,
        CreatedAt: dto.CreatedAt,
    })
}

func (h *UserHandler) GetByID(w http.ResponseWriter, r *http.Request) {
    id, err := uuid.Parse(chi.URLParam(r, "userID"))
    if err != nil {
        writeError(w, http.StatusBadRequest, "invalid user ID")
        return
    }

    dto, err := h.service.GetUser(r.Context(), id)
    if err != nil {
        mapDomainError(w, err)
        return
    }

    writeJSON(w, http.StatusOK, UserResponse{
        ID:        dto.ID.String(),
        Email:     dto.Email,
        Name:      dto.Name,
        Status:    dto.Status,
        CreatedAt: dto.CreatedAt,
    })
}

func (h *UserHandler) List(w http.ResponseWriter, r *http.Request) {
    limit, offset := parsePagination(r)

    dtos, err := h.service.ListActiveUsers(r.Context(), limit, offset)
    if err != nil {
        mapDomainError(w, err)
        return
    }

    items := make([]UserResponse, len(dtos))
    for i, dto := range dtos {
        items[i] = UserResponse{
            ID:        dto.ID.String(),
            Email:     dto.Email,
            Name:      dto.Name,
            Status:    dto.Status,
            CreatedAt: dto.CreatedAt,
        }
    }

    writeJSON(w, http.StatusOK, ListResponse[UserResponse]{Items: items})
}
```

---

## **Request Decoding**

### **JSON Decoding Helper**

```go
// internal/ports/http/helpers.go
package http

import (
    "encoding/json"
    "fmt"
    "net/http"
    "strconv"
)

func decodeJSON(r *http.Request, dst any) error {
    dec := json.NewDecoder(r.Body)
    dec.DisallowUnknownFields()
    if err := dec.Decode(dst); err != nil {
        return fmt.Errorf("decoding JSON: %w", err)
    }
    return nil
}

func parsePagination(r *http.Request) (limit, offset int) {
    limit = 50
    offset = 0

    if v := r.URL.Query().Get("limit"); v != "" {
        if parsed, err := strconv.Atoi(v); err == nil && parsed > 0 && parsed <= 100 {
            limit = parsed
        }
    }
    if v := r.URL.Query().Get("offset"); v != "" {
        if parsed, err := strconv.Atoi(v); err == nil && parsed >= 0 {
            offset = parsed
        }
    }
    return limit, offset
}
```

### **Request Structs with Validation**

```go
// internal/ports/http/request.go
package http

import (
    "fmt"
    "strings"
)

type CreateUserRequest struct {
    Email string `json:"email"`
    Name  string `json:"name"`
}

func (r *CreateUserRequest) Validate() error {
    r.Email = strings.TrimSpace(strings.ToLower(r.Email))
    r.Name = strings.TrimSpace(r.Name)

    if r.Email == "" {
        return fmt.Errorf("email is required")
    }
    if r.Name == "" {
        return fmt.Errorf("name is required")
    }
    return nil
}

type CreateOrderRequest struct {
    Items []OrderItemRequest `json:"items"`
}

type OrderItemRequest struct {
    ProductID  string `json:"product_id"`
    Quantity   int    `json:"quantity"`
    PriceCents int64  `json:"price_cents"`
}

func (r *CreateOrderRequest) Validate() error {
    if len(r.Items) == 0 {
        return fmt.Errorf("at least one item is required")
    }
    for i, item := range r.Items {
        if item.ProductID == "" {
            return fmt.Errorf("item[%d]: product_id is required", i)
        }
        if item.Quantity <= 0 {
            return fmt.Errorf("item[%d]: quantity must be positive", i)
        }
    }
    return nil
}
```

---

## **Response Encoding**

### **JSON Response Helpers**

```go
// internal/ports/http/helpers.go (continued)

func writeJSON(w http.ResponseWriter, status int, data any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    if err := json.NewEncoder(w).Encode(data); err != nil {
        http.Error(w, "encoding response", http.StatusInternalServerError)
    }
}

func writeError(w http.ResponseWriter, status int, message string) {
    writeJSON(w, status, ErrorResponse{Error: message})
}
```

### **Response Structs**

```go
// internal/ports/http/response.go
package http

import "time"

type ErrorResponse struct {
    Error string `json:"error"`
}

type UserResponse struct {
    ID        string    `json:"id"`
    Email     string    `json:"email"`
    Name      string    `json:"name"`
    Status    string    `json:"status"`
    CreatedAt time.Time `json:"created_at"`
}

type OrderResponse struct {
    ID        string    `json:"id"`
    UserID    string    `json:"user_id"`
    Status    string    `json:"status"`
    Total     int64     `json:"total_cents"`
    Currency  string    `json:"currency"`
    CreatedAt time.Time `json:"created_at"`
}

type ListResponse[T any] struct {
    Items []T `json:"items"`
}
```

---

## **Error Mapping**

### **Domain Error to HTTP Status**

Map domain and application errors to appropriate HTTP status codes:

```go
// internal/ports/http/error_mapper.go
package http

import (
    "errors"
    "log/slog"
    "net/http"

    "myservice/internal/app"
    "myservice/internal/domain/order"
    "myservice/internal/domain/user"
)

func mapDomainError(w http.ResponseWriter, err error) {
    // Domain: not found
    if errors.Is(err, user.ErrNotFound) || errors.Is(err, order.ErrNotFound) {
        writeError(w, http.StatusNotFound, "resource not found")
        return
    }

    // Domain: conflict
    if errors.Is(err, user.ErrAlreadyExists) {
        writeError(w, http.StatusConflict, "resource already exists")
        return
    }

    // Domain: business rule violation
    if errors.Is(err, user.ErrAlreadyActive) ||
        errors.Is(err, user.ErrAlreadyInactive) ||
        errors.Is(err, order.ErrEmptyOrder) {
        writeError(w, http.StatusUnprocessableEntity, err.Error())
        return
    }

    // Domain: validation
    var validationErr *order.ValidationError
    if errors.As(err, &validationErr) {
        writeError(w, http.StatusBadRequest, validationErr.Error())
        return
    }

    // App: authorization
    if errors.Is(err, app.ErrUnauthorized) {
        writeError(w, http.StatusUnauthorized, "unauthorized")
        return
    }
    if errors.Is(err, app.ErrForbidden) {
        writeError(w, http.StatusForbidden, "forbidden")
        return
    }

    // Default: internal server error — never expose raw error to client
    slog.Error("unhandled error", "error", err)
    writeError(w, http.StatusInternalServerError, "internal server error")
}
```

### **Error Mapping Best Practices**

- **Sanitize at trust boundaries** — never expose raw database or internal errors to API clients
- **Log at the boundary** — log unhandled errors in the HTTP handler, not deep in the stack
- Use `errors.Is()` for sentinel errors and `errors.As()` for typed errors
- Return generic messages for 500 errors; include request ID for correlation

---

## **Route Organization**

### **Grouping with Sub-Routers**

Chi supports nested route groups. Use them to apply middleware to route subsets:

```go
r.Route("/api/v1", func(r chi.Router) {
    // Public routes
    r.Group(func(r chi.Router) {
        r.Post("/auth/login", authHandler.Login)
        r.Post("/auth/register", authHandler.Register)
    })

    // Authenticated routes
    r.Group(func(r chi.Router) {
        r.Use(middleware.Auth)
        r.Route("/users", func(r chi.Router) {
            r.Get("/me", userHandler.GetCurrent)
            r.Put("/me", userHandler.UpdateCurrent)
        })
        r.Route("/orders", func(r chi.Router) {
            r.Post("/", orderHandler.Create)
            r.Get("/", orderHandler.List)
        })
    })

    // Admin routes
    r.Group(func(r chi.Router) {
        r.Use(middleware.Auth)
        r.Use(middleware.RequireRole("admin"))
        r.Route("/admin/users", func(r chi.Router) {
            r.Get("/", userHandler.ListAll)
            r.Delete("/{userID}", userHandler.Delete)
        })
    })
})
```

---

## **Health Endpoints**

### **Liveness and Readiness**

```go
// internal/ports/http/health_handler.go
package http

import (
    "context"
    "net/http"
    "sync/atomic"
    "time"

    "github.com/jackc/pgx/v5/pgxpool"
)

type HealthHandler struct {
    pool  *pgxpool.Pool
    ready atomic.Bool
}

func NewHealthHandler(pool *pgxpool.Pool) *HealthHandler {
    h := &HealthHandler{pool: pool}
    h.ready.Store(true)
    return h
}

func (h *HealthHandler) SetReady(ready bool) {
    h.ready.Store(ready)
}

func (h *HealthHandler) Liveness(w http.ResponseWriter, r *http.Request) {
    writeJSON(w, http.StatusOK, map[string]string{"status": "alive"})
}

func (h *HealthHandler) Readiness(w http.ResponseWriter, r *http.Request) {
    if !h.ready.Load() {
        writeError(w, http.StatusServiceUnavailable, "shutting down")
        return
    }

    ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
    defer cancel()

    if err := h.pool.Ping(ctx); err != nil {
        writeError(w, http.StatusServiceUnavailable, "database unavailable")
        return
    }

    writeJSON(w, http.StatusOK, map[string]string{"status": "ready"})
}
```

### **Health Endpoint Usage**

| Endpoint | Purpose | Kubernetes Probe |
| --- | --- | --- |
| `/livez` | Is the process alive? | `livenessProbe` |
| `/readyz` | Should this instance receive traffic? | `readinessProbe` |

Set readiness to `false` during graceful shutdown so the load balancer drains traffic before the process terminates.

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./clean-architecture.md` - Architecture overview
- `./middleware-guide.md` - Middleware patterns
- `./error-handling.md` - Error handling details
- `./validation-patterns.md` - Request validation
