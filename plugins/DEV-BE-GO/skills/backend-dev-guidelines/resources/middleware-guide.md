# **Middleware Guide - Chi Middleware Patterns**

Complete guide to implementing middleware in Go Clean Architecture with Chi router.

## **Table of Contents**

- [Middleware Basics](#middleware-basics)
- [Structured Logger](#structured-logger)
- [Recovery Middleware](#recovery-middleware)
- [Authentication Middleware](#authentication-middleware)
- [Request ID](#request-id)
- [CORS](#cors)
- [Timeout and Rate Limiting](#timeout-and-rate-limiting)
- [Middleware Stack](#middleware-stack)
- [Best Practices](#best-practices)

---

## **Middleware Basics**

### **The Middleware Signature**

In Go, middleware follows the standard `func(http.Handler) http.Handler` pattern. Chi uses this natively:

```go
func MyMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Before handler
        next.ServeHTTP(w, r)
        // After handler
    })
}
```

### **Applying Middleware**

```go
r := chi.NewRouter()

// Global middleware — applies to all routes
r.Use(middleware.RequestID)
r.Use(middleware.Logger)
r.Use(middleware.Recoverer)

// Group-scoped middleware
r.Group(func(r chi.Router) {
    r.Use(middleware.Auth)
    r.Get("/protected", handler)
})

// Route-specific middleware
r.With(middleware.Timeout(5 * time.Second)).Get("/slow", handler)
```

---

## **Structured Logger**

### **slog-Based Request Logger**

```go
// internal/ports/http/middleware/logging.go
package middleware

import (
    "log/slog"
    "net/http"
    "time"

    chimw "github.com/go-chi/chi/v5/middleware"
)

func StructuredLogger(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        ww := chimw.NewWrapResponseWriter(w, r.ProtoMajor)

        next.ServeHTTP(ww, r)

        duration := time.Since(start)
        status := ww.Status()

        attrs := []any{
            "method", r.Method,
            "path", r.URL.Path,
            "status", status,
            "duration_ms", duration.Milliseconds(),
            "bytes", ww.BytesWritten(),
            "remote_addr", r.RemoteAddr,
        }

        if reqID := chimw.GetReqID(r.Context()); reqID != "" {
            attrs = append(attrs, "request_id", reqID)
        }

        switch {
        case status >= 500:
            slog.ErrorContext(r.Context(), "request completed", attrs...)
        case status >= 400:
            slog.WarnContext(r.Context(), "request completed", attrs...)
        default:
            slog.InfoContext(r.Context(), "request completed", attrs...)
        }
    })
}
```

### **Skip Health Check Logging**

Avoid flooding logs with health check requests:

```go
func StructuredLoggerWithSkip(skipPaths map[string]bool) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            if skipPaths[r.URL.Path] {
                next.ServeHTTP(w, r)
                return
            }
            // ... full logging as above
        })
    }
}

// Usage
r.Use(StructuredLoggerWithSkip(map[string]bool{
    "/livez":  true,
    "/readyz": true,
}))
```

---

## **Recovery Middleware**

### **Panic Recovery with Structured Logging**

```go
// internal/ports/http/middleware/recovery.go
package middleware

import (
    "log/slog"
    "net/http"
    "runtime/debug"
)

func Recoverer(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if rec := recover(); rec != nil {
                slog.ErrorContext(r.Context(), "panic recovered",
                    "panic", rec,
                    "method", r.Method,
                    "path", r.URL.Path,
                    "stack", string(debug.Stack()),
                )

                w.Header().Set("Content-Type", "application/json")
                w.WriteHeader(http.StatusInternalServerError)
                w.Write([]byte(`{"error":"internal server error"}`))
            }
        }()
        next.ServeHTTP(w, r)
    })
}
```

---

## **Authentication Middleware**

### **JWT Authentication**

```go
// internal/ports/http/middleware/auth.go
package middleware

import (
    "context"
    "net/http"
    "strings"
)

type contextKey string

const UserIDKey contextKey = "user_id"
const UserRoleKey contextKey = "user_role"

type TokenValidator interface {
    Validate(token string) (userID string, role string, err error)
}

func Auth(validator TokenValidator) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            header := r.Header.Get("Authorization")
            if header == "" {
                http.Error(w, `{"error":"missing authorization header"}`, http.StatusUnauthorized)
                return
            }

            token := strings.TrimPrefix(header, "Bearer ")
            if token == header {
                http.Error(w, `{"error":"invalid authorization format"}`, http.StatusUnauthorized)
                return
            }

            userID, role, err := validator.Validate(token)
            if err != nil {
                slog.WarnContext(r.Context(), "invalid token",
                    "error", err,
                    "remote_addr", r.RemoteAddr,
                )
                http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
                return
            }

            ctx := context.WithValue(r.Context(), UserIDKey, userID)
            ctx = context.WithValue(ctx, UserRoleKey, role)
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}

// Helper to extract user ID from context
func GetUserID(ctx context.Context) string {
    id, _ := ctx.Value(UserIDKey).(string)
    return id
}

func GetUserRole(ctx context.Context) string {
    role, _ := ctx.Value(UserRoleKey).(string)
    return role
}
```

### **Role-Based Authorization**

```go
func RequireRole(roles ...string) func(http.Handler) http.Handler {
    allowed := make(map[string]bool, len(roles))
    for _, r := range roles {
        allowed[r] = true
    }

    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            role := GetUserRole(r.Context())
            if !allowed[role] {
                http.Error(w, `{"error":"forbidden"}`, http.StatusForbidden)
                return
            }
            next.ServeHTTP(w, r)
        })
    }
}
```

### **Usage in Router**

```go
r.Route("/api/v1", func(r chi.Router) {
    // Public
    r.Post("/auth/login", authHandler.Login)

    // Authenticated
    r.Group(func(r chi.Router) {
        r.Use(Auth(tokenValidator))
        r.Get("/users/me", userHandler.GetCurrent)
    })

    // Admin only
    r.Group(func(r chi.Router) {
        r.Use(Auth(tokenValidator))
        r.Use(RequireRole("admin"))
        r.Delete("/admin/users/{id}", userHandler.Delete)
    })
})
```

---

## **Request ID**

### **Using Chi's Built-in RequestID**

```go
import chimw "github.com/go-chi/chi/v5/middleware"

r.Use(chimw.RequestID)

// Access in handlers
func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
    reqID := chimw.GetReqID(r.Context())
    // Include in error responses for correlation
}
```

### **Propagate in Error Responses**

```go
func writeError(w http.ResponseWriter, r *http.Request, status int, message string) {
    resp := map[string]string{"error": message}
    if reqID := chimw.GetReqID(r.Context()); reqID != "" {
        resp["request_id"] = reqID
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(resp)
}
```

---

## **CORS**

### **go-chi/cors**

```go
import "github.com/go-chi/cors"

r.Use(cors.Handler(cors.Options{
    AllowedOrigins:   []string{"https://myapp.com", "http://localhost:3000"},
    AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
    ExposedHeaders:   []string{"Link", "X-Request-Id"},
    AllowCredentials: true,
    MaxAge:           300,
}))
```

---

## **Timeout and Rate Limiting**

### **Request Timeout**

```go
import chimw "github.com/go-chi/chi/v5/middleware"

// Global timeout
r.Use(chimw.Timeout(30 * time.Second))

// Per-route timeout
r.With(chimw.Timeout(5 * time.Second)).Get("/quick", handler)
r.With(chimw.Timeout(120 * time.Second)).Post("/upload", uploadHandler)
```

### **Rate Limiting with httprate**

```go
import "github.com/go-chi/httprate"

// Global: 100 requests per minute per IP
r.Use(httprate.LimitByIP(100, time.Minute))

// Per-route: stricter limit for auth endpoints
r.Group(func(r chi.Router) {
    r.Use(httprate.LimitByIP(10, time.Minute))
    r.Post("/auth/login", authHandler.Login)
})
```

---

## **Middleware Stack**

### **Recommended Order**

Order matters — middleware executes in the order it's added:

```go
r := chi.NewRouter()

// 1. Request ID (first — everything else can reference it)
r.Use(chimw.RequestID)

// 2. Real IP (before logging, so IP is correct)
r.Use(chimw.RealIP)

// 3. Structured logging (records request duration and status)
r.Use(StructuredLoggerWithSkip(map[string]bool{"/livez": true, "/readyz": true}))

// 4. Recovery (catches panics — must be before business logic)
r.Use(Recoverer)

// 5. CORS (before auth — OPTIONS preflight must not require auth)
r.Use(cors.Handler(corsOptions))

// 6. Timeout (prevent hung requests)
r.Use(chimw.Timeout(30 * time.Second))

// 7. Rate limiting
r.Use(httprate.LimitByIP(100, time.Minute))

// Routes
r.Get("/livez", healthHandler.Liveness)
r.Get("/readyz", healthHandler.Readiness)

r.Route("/api/v1", func(r chi.Router) {
    // 8. Auth (only on protected routes)
    r.Use(Auth(tokenValidator))
    // ...
})
```

---

## **Best Practices**

### **1. Keep Middleware Focused**

```go
// ✅ GOOD: One concern per middleware
r.Use(RequestID)
r.Use(Logger)
r.Use(Recoverer)

// ❌ BAD: God-middleware that does everything
r.Use(DoEverything)
```

### **2. Use Context for Request-Scoped Data**

```go
// ✅ GOOD: Type-safe context keys
type contextKey string
const UserIDKey contextKey = "user_id"

ctx := context.WithValue(r.Context(), UserIDKey, userID)

// ❌ BAD: String keys — risk of collision
ctx := context.WithValue(r.Context(), "user_id", userID)
```

### **3. Don't Log Sensitive Headers**

```go
// ✅ GOOD: Log method, path, status
slog.Info("request", "method", r.Method, "path", r.URL.Path)

// ❌ BAD: Logging Authorization header
slog.Info("request", "auth", r.Header.Get("Authorization"))
```

### **4. Test Middleware in Isolation**

```go
func TestRecoverer_PanicRecovery(t *testing.T) {
    handler := Recoverer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        panic("test panic")
    }))

    req := httptest.NewRequest("GET", "/", nil)
    rr := httptest.NewRecorder()

    handler.ServeHTTP(rr, req)

    assert.Equal(t, http.StatusInternalServerError, rr.Code)
}
```

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./api-layer.md` - Router setup
- `./observability.md` - Logging and tracing
- `./error-handling.md` - Error response patterns
