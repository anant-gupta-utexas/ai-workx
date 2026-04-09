# **Error Handling - Idiomatic Go Patterns**

Complete guide to error handling in Go Clean Architecture.

## **Table of Contents**

- [Core Principles](#core-principles)
- [Domain Errors](#domain-errors)
- [Error Wrapping](#error-wrapping)
- [Error Translation at Boundaries](#error-translation-at-boundaries)
- [Multi-Error Handling](#multi-error-handling)
- [Panic and Recovery](#panic-and-recovery)
- [Best Practices](#best-practices)

---

## **Core Principles**

### **The Go Error Philosophy**

Go's `if err != nil` pattern is permanent — the Go team closed the door on syntactic alternatives in 2025. Embrace it.

### **Four Rules**

1. **Handle errors once** — either log or return, never both
2. **Wrap with context** — use `fmt.Errorf("doing X: %w", err)`
3. **Sanitize at trust boundaries** — never expose raw DB errors to API clients
4. **Log at boundaries** — HTTP handlers and external client calls, not deep in the stack

### **Error Flow in Clean Architecture**

```
Domain Layer        → Returns domain errors (sentinel + typed)
    ▲
App Layer           → Wraps with context via fmt.Errorf("%w")
    ▲
Ports (HTTP/gRPC)   → Translates to HTTP status codes, logs unhandled errors
```

---

## **Domain Errors**

### **Sentinel Errors**

Use sentinel errors for well-known conditions that callers check with `errors.Is()`:

```go
// internal/domain/user/errors.go
package user

import "errors"

var (
    ErrNotFound        = errors.New("user not found")
    ErrAlreadyExists   = errors.New("user already exists")
    ErrAlreadyActive   = errors.New("user is already active")
    ErrAlreadyInactive = errors.New("user is already inactive")
    ErrInvalidRole     = errors.New("invalid user role")
    ErrInvalidStatus   = errors.New("invalid user status")
)
```

### **Typed Errors**

Use typed errors when callers need structured data, checked with `errors.As()`:

```go
// internal/domain/order/errors.go
package order

import "fmt"

var (
    ErrNotFound   = errors.New("order not found")
    ErrEmptyOrder = errors.New("order must have at least one item")
)

type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation: %s - %s", e.Field, e.Message)
}

type InsufficientStockError struct {
    ProductID string
    Requested int
    Available int
}

func (e *InsufficientStockError) Error() string {
    return fmt.Sprintf("insufficient stock for %s: requested %d, available %d",
        e.ProductID, e.Requested, e.Available)
}

type InvalidTransitionError struct {
    From string
    To   string
}

func (e *InvalidTransitionError) Error() string {
    return fmt.Sprintf("invalid transition from %s to %s", e.From, e.To)
}
```

### **When to Use Which**

| Type | Use When | Check With |
| --- | --- | --- |
| Sentinel (`var Err*`) | Simple condition, no extra data needed | `errors.Is(err, user.ErrNotFound)` |
| Typed (`struct`) | Caller needs structured details (field, IDs) | `errors.As(err, &validationErr)` |

---

## **Error Wrapping**

### **Always Wrap with Context**

Use `fmt.Errorf` with `%w` to preserve the error chain while adding context:

```go
// ✅ GOOD: Wrapped with context — builds a readable chain
func (s *UserService) CreateUser(ctx context.Context, req CreateUserRequest) (*UserDTO, error) {
    u, err := user.NewUser(req.Email, req.Name)
    if err != nil {
        return nil, fmt.Errorf("creating user: %w", err)
    }

    if err := s.users.Create(ctx, u); err != nil {
        return nil, fmt.Errorf("persisting user: %w", err)
    }

    return UserDTOFromEntity(u), nil
}
// Error chain: "persisting user: user already exists"

// ❌ BAD: No context — caller can't tell where it failed
return nil, err

// ❌ BAD: Uses %v instead of %w — breaks error chain
return nil, fmt.Errorf("creating user: %v", err)
```

### **Wrapping Guidelines**

- Add what the current function was **trying to do**: `"creating user"`, `"querying order"`
- Include relevant IDs when helpful: `fmt.Errorf("fetching user %s: %w", id, err)`
- Use `%w` (not `%v`) to preserve the ability to unwrap
- Don't include the word "error" or "failed" — the error itself says that

```go
// ✅ GOOD: Describes the action
return nil, fmt.Errorf("querying user %s: %w", id, err)

// ❌ BAD: Redundant "error" / "failed"
return nil, fmt.Errorf("error querying user %s: %w", id, err)
return nil, fmt.Errorf("failed to query user %s: %w", id, err)
```

---

## **Error Translation at Boundaries**

### **Repository → Domain**

Repositories translate infrastructure errors into domain errors:

```go
// internal/adapters/postgres/user_repo.go
func (r *UserRepo) GetByID(ctx context.Context, id uuid.UUID) (*user.User, error) {
    row, err := r.queries.GetUserByID(ctx, id)
    if err != nil {
        if errors.Is(err, pgx.ErrNoRows) {
            return nil, user.ErrNotFound  // Translate to domain error
        }
        return nil, fmt.Errorf("querying user %s: %w", id, err)
    }
    return reconstitute(row), nil
}

func (r *UserRepo) Create(ctx context.Context, u *user.User) error {
    err := r.queries.InsertUser(ctx, /* params */)
    if err != nil {
        var pgErr *pgconn.PgError
        if errors.As(err, &pgErr) && pgErr.Code == "23505" {
            return user.ErrAlreadyExists  // Unique violation → domain error
        }
        return fmt.Errorf("inserting user: %w", err)
    }
    return nil
}
```

### **PostgreSQL Error Code Reference**

| PG Code | Meaning | Domain Error |
| --- | --- | --- |
| `23505` | Unique violation | `ErrAlreadyExists` |
| `23503` | Foreign key violation | `ErrInvalidReference` |
| `23514` | Check constraint | `ErrConstraintViolation` |

### **HTTP Handler → Client**

HTTP handlers translate domain/app errors to status codes:

```go
// internal/ports/http/error_mapper.go
func mapDomainError(w http.ResponseWriter, err error) {
    // Sentinel errors
    switch {
    case errors.Is(err, user.ErrNotFound), errors.Is(err, order.ErrNotFound):
        writeError(w, http.StatusNotFound, "resource not found")
        return
    case errors.Is(err, user.ErrAlreadyExists):
        writeError(w, http.StatusConflict, "resource already exists")
        return
    case errors.Is(err, app.ErrUnauthorized):
        writeError(w, http.StatusUnauthorized, "unauthorized")
        return
    case errors.Is(err, app.ErrForbidden):
        writeError(w, http.StatusForbidden, "forbidden")
        return
    }

    // Typed errors
    var validationErr *order.ValidationError
    if errors.As(err, &validationErr) {
        writeError(w, http.StatusBadRequest, validationErr.Error())
        return
    }

    var stockErr *order.InsufficientStockError
    if errors.As(err, &stockErr) {
        writeError(w, http.StatusConflict, stockErr.Error())
        return
    }

    // Unhandled → 500 with generic message
    slog.ErrorContext(r.Context(), "unhandled error",
        "error", err,
        "path", r.URL.Path,
    )
    writeError(w, http.StatusInternalServerError, "internal server error")
}
```

### **Error Mapping Table**

| Domain/App Error | HTTP Status | gRPC Code |
| --- | --- | --- |
| `ErrNotFound` | 404 | `NotFound` |
| `ErrAlreadyExists` | 409 | `AlreadyExists` |
| `ValidationError` | 400 | `InvalidArgument` |
| `ErrUnauthorized` | 401 | `Unauthenticated` |
| `ErrForbidden` | 403 | `PermissionDenied` |
| Business rule violation | 422 | `FailedPrecondition` |
| Unhandled | 500 | `Internal` |

---

## **Multi-Error Handling**

### **errors.Join (Go 1.20+)**

For accumulating multiple validation errors:

```go
func (o *Order) Validate() error {
    var errs []error

    if len(o.items) == 0 {
        errs = append(errs, ErrEmptyOrder)
    }
    for i, item := range o.items {
        if item.Quantity() <= 0 {
            errs = append(errs, fmt.Errorf("item[%d]: %w", i, ErrInvalidQuantity))
        }
    }

    return errors.Join(errs...)
}
```

`errors.Join` returns `nil` if all errors are nil. The joined error supports `errors.Is()` and `errors.As()` for each contained error.

---

## **Panic and Recovery**

### **When panic() Is Acceptable**

- Invalid configuration at startup (application cannot function)
- Programmer errors that should never reach production (uninitialized dependencies)

```go
// ✅ GOOD: Panic at startup for invalid config
func main() {
    cfg := config.Load()
    if err := cfg.Validate(); err != nil {
        log.Fatalf("invalid config: %v", err)
    }
}

// ❌ BAD: Panic in a handler or service
func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
    panic("something went wrong")  // NEVER DO THIS
}
```

### **Recovery Middleware**

Always use recovery middleware to catch unexpected panics in handlers:

```go
func Recoverer(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if rec := recover(); rec != nil {
                slog.ErrorContext(r.Context(), "panic recovered",
                    "panic", rec,
                    "stack", string(debug.Stack()),
                )
                writeError(w, http.StatusInternalServerError, "internal server error")
            }
        }()
        next.ServeHTTP(w, r)
    })
}
```

---

## **Best Practices**

### **1. Handle Once**

```go
// ✅ GOOD: Return error — let caller decide
func (s *UserService) GetUser(ctx context.Context, id uuid.UUID) (*UserDTO, error) {
    u, err := s.users.GetByID(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("fetching user %s: %w", id, err)
    }
    return UserDTOFromEntity(u), nil
}

// ❌ BAD: Log AND return — duplicate handling
func (s *UserService) GetUser(ctx context.Context, id uuid.UUID) (*UserDTO, error) {
    u, err := s.users.GetByID(ctx, id)
    if err != nil {
        slog.Error("failed to get user", "error", err)  // DUPLICATE
        return nil, err
    }
}
```

### **2. Never Expose Internal Errors**

```go
// ✅ GOOD: Generic message to client
writeError(w, http.StatusInternalServerError, "internal server error")

// ❌ BAD: Leaking internal details
writeError(w, http.StatusInternalServerError, err.Error())
// Client sees: "pq: duplicate key value violates unique constraint..."
```

### **3. Use errors.Is and errors.As**

```go
// ✅ GOOD: Works with wrapped errors
if errors.Is(err, user.ErrNotFound) { ... }

// ❌ BAD: Direct comparison breaks with wrapping
if err == user.ErrNotFound { ... }
```

### **4. Don't Over-Wrap**

```go
// ✅ GOOD: One wrap per function boundary
return nil, fmt.Errorf("creating user: %w", err)

// ❌ BAD: Wrapping at every line
if err != nil {
    wrapped := fmt.Errorf("step 1: %w", err)
    return nil, fmt.Errorf("step 2: %w", wrapped)
}
```

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./domain-layer.md` - Domain error types
- `./api-layer.md` - HTTP error mapping
- `./repository-pattern.md` - Infrastructure error translation
- `./middleware-guide.md` - Recovery middleware
