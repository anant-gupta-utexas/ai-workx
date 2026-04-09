# **Application Layer - Services and Orchestration**

Complete guide to implementing the Application Layer in Go Clean Architecture.

## **Table of Contents**

- [Purpose and Rules](#purpose-and-rules)
- [Services](#services)
- [DTOs](#dtos)
- [Application Errors](#application-errors)
- [Advanced: CQRS Pattern](#advanced-cqrs-pattern)

---

## **Purpose and Rules**

### **What is the Application Layer?**

The **Application Layer** orchestrates domain logic and coordinates workflows. It sits between the domain and the inbound ports (HTTP handlers, gRPC servers).

**Location**: `internal/app/`

**Rules**:
- ✅ Imports from `internal/domain/`
- ✅ Uses plain structs for DTOs (request/response)
- ✅ Depends on domain interfaces (not implementations)
- ✅ Coordinates multiple domain operations
- ❌ No HTTP, database, or framework code
- ❌ No direct access to pgx, chi, or external packages

### **Key Responsibilities**

- Orchestrate multi-step business workflows
- Convert between DTOs and domain entities
- Enforce application-level authorization rules
- Coordinate transactions across repositories
- Emit application events (optional)

---

## **Services**

### **Service Pattern**

Services accept domain interfaces via constructor injection and expose use-case methods:

```go
// internal/app/user_service.go
package app

import (
    "context"
    "fmt"

    "myservice/internal/domain/user"

    "github.com/google/uuid"
)

type UserService struct {
    users user.Repository
}

func NewUserService(users user.Repository) *UserService {
    return &UserService{users: users}
}

func (s *UserService) CreateUser(ctx context.Context, req CreateUserRequest) (*UserDTO, error) {
    existing, _ := s.users.GetByEmail(ctx, req.Email)
    if existing != nil {
        return nil, fmt.Errorf("creating user: %w", user.ErrAlreadyExists)
    }

    u, err := user.NewUser(req.Email, req.Name)
    if err != nil {
        return nil, fmt.Errorf("creating user: %w", err)
    }

    if err := s.users.Create(ctx, u); err != nil {
        return nil, fmt.Errorf("persisting user: %w", err)
    }

    return UserDTOFromEntity(u), nil
}

func (s *UserService) GetUser(ctx context.Context, id uuid.UUID) (*UserDTO, error) {
    u, err := s.users.GetByID(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("fetching user %s: %w", id, err)
    }
    return UserDTOFromEntity(u), nil
}

func (s *UserService) DeactivateUser(ctx context.Context, id uuid.UUID) error {
    u, err := s.users.GetByID(ctx, id)
    if err != nil {
        return fmt.Errorf("fetching user %s: %w", id, err)
    }

    if err := u.Deactivate(); err != nil {
        return fmt.Errorf("deactivating user %s: %w", id, err)
    }

    if err := s.users.Update(ctx, u); err != nil {
        return fmt.Errorf("persisting user %s: %w", id, err)
    }

    return nil
}

func (s *UserService) ListActiveUsers(ctx context.Context, limit, offset int) ([]*UserDTO, error) {
    users, err := s.users.ListActive(ctx, limit, offset)
    if err != nil {
        return nil, fmt.Errorf("listing active users: %w", err)
    }

    dtos := make([]*UserDTO, len(users))
    for i, u := range users {
        dtos[i] = UserDTOFromEntity(u)
    }
    return dtos, nil
}
```

### **Multi-Repository Services**

When a service needs multiple repositories, inject them all via the constructor:

```go
// internal/app/order_service.go
package app

import (
    "context"
    "fmt"

    "myservice/internal/domain/order"
    "myservice/internal/domain/user"

    "github.com/google/uuid"
)

type OrderService struct {
    orders order.Repository
    users  user.Repository
}

func NewOrderService(orders order.Repository, users user.Repository) *OrderService {
    return &OrderService{orders: orders, users: users}
}

func (s *OrderService) PlaceOrder(ctx context.Context, req PlaceOrderRequest) (*OrderDTO, error) {
    u, err := s.users.GetByID(ctx, req.UserID)
    if err != nil {
        return nil, fmt.Errorf("fetching user: %w", err)
    }
    if u.Status() != user.StatusActive {
        return nil, fmt.Errorf("placing order: %w", ErrUserNotActive)
    }

    items := make([]order.LineItem, len(req.Items))
    for i, ri := range req.Items {
        item, err := order.NewLineItem(ri.ProductID, ri.Quantity, ri.PriceCents, "USD")
        if err != nil {
            return nil, fmt.Errorf("creating line item: %w", err)
        }
        items[i] = item
    }

    o, err := order.NewOrder(req.UserID, items)
    if err != nil {
        return nil, fmt.Errorf("creating order: %w", err)
    }

    if err := s.orders.Create(ctx, o); err != nil {
        return nil, fmt.Errorf("persisting order: %w", err)
    }

    return OrderDTOFromEntity(o), nil
}
```

### **Closure-Based Transactions in Services**

When a use case requires transactional consistency, use the closure-based `UpdateInTx` pattern defined in the domain interface:

```go
func (s *OrderService) CancelOrder(ctx context.Context, orderID uuid.UUID) error {
    return s.orders.UpdateInTx(ctx, orderID, func(o *order.Order) error {
        return o.Cancel()
    })
}
```

The repository implementation handles `BEGIN`/`COMMIT`/`ROLLBACK` internally. The service passes pure domain logic as a closure, keeping transactions invisible to the application layer.

---

## **DTOs**

### **What Are DTOs?**

DTOs (Data Transfer Objects) are plain structs that carry data across layer boundaries. They decouple the domain entity representation from what the application exposes.

### **Request DTOs**

```go
// internal/app/dto.go
package app

import "github.com/google/uuid"

type CreateUserRequest struct {
    Email string
    Name  string
}

type PlaceOrderRequest struct {
    UserID uuid.UUID
    Items  []OrderItemRequest
}

type OrderItemRequest struct {
    ProductID  string
    Quantity   int
    PriceCents int64
}

type ListUsersRequest struct {
    Limit  int
    Offset int
}
```

### **Response DTOs**

```go
// internal/app/dto.go (continued)
package app

import (
    "time"

    "myservice/internal/domain/order"
    "myservice/internal/domain/user"

    "github.com/google/uuid"
)

type UserDTO struct {
    ID        uuid.UUID
    Email     string
    Name      string
    Status    string
    Role      string
    CreatedAt time.Time
}

func UserDTOFromEntity(u *user.User) *UserDTO {
    return &UserDTO{
        ID:        u.ID(),
        Email:     u.Email(),
        Name:      u.Name(),
        Status:    string(u.Status()),
        Role:      string(u.Role()),
        CreatedAt: u.CreatedAt(),
    }
}

type OrderDTO struct {
    ID        uuid.UUID
    UserID    uuid.UUID
    Status    string
    Total     int64
    Currency  string
    CreatedAt time.Time
}

func OrderDTOFromEntity(o *order.Order) *OrderDTO {
    return &OrderDTO{
        ID:        o.ID(),
        UserID:    o.UserID(),
        Status:    string(o.Status()),
        Total:     o.Total().Amount(),
        Currency:  o.Total().Currency(),
        CreatedAt: o.CreatedAt(),
    }
}
```

### **DTO Best Practices**

- Use plain structs — no interfaces, no methods beyond `From*Entity` converters
- Keep request and response DTOs separate even if they look similar
- DTOs expose only what the use case needs — not the entire entity
- Never return domain entities from service methods; always convert to DTOs

---

## **Application Errors**

### **Application-Level Error Types**

Define errors for application-level concerns that don't belong in the domain:

```go
// internal/app/errors.go
package app

import "errors"

var (
    ErrUnauthorized = errors.New("unauthorized")
    ErrForbidden    = errors.New("forbidden")
    ErrUserNotActive = errors.New("user is not active")
)

type NotFoundError struct {
    Entity string
    ID     string
}

func (e *NotFoundError) Error() string {
    return e.Entity + " not found: " + e.ID
}
```

### **Error Wrapping**

Always wrap errors with context using `fmt.Errorf` and `%w`:

```go
func (s *UserService) GetUser(ctx context.Context, id uuid.UUID) (*UserDTO, error) {
    u, err := s.users.GetByID(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("fetching user %s: %w", id, err)
    }
    return UserDTOFromEntity(u), nil
}
```

This preserves the error chain so HTTP handlers can use `errors.Is()` and `errors.As()` to map domain/app errors to status codes.

---

## **Advanced: CQRS Pattern**

For larger services, the Command/Query Responsibility Segregation (CQRS) pattern provides clearer separation. Start with services and migrate to CQRS when complexity grows.

### **Application Struct**

Aggregate all handlers into a central `Application` struct (Three Dots Labs pattern):

```go
// internal/app/app.go
package app

type Application struct {
    Commands Commands
    Queries  Queries
}

type Commands struct {
    CreateUser     CreateUserHandler
    DeactivateUser DeactivateUserHandler
    PlaceOrder     PlaceOrderHandler
    CancelOrder    CancelOrderHandler
}

type Queries struct {
    GetUser        GetUserHandler
    ListUsers      ListUsersHandler
    GetOrder       GetOrderHandler
    ListUserOrders ListUserOrdersHandler
}
```

### **Command Handler**

Commands modify state and return only errors:

```go
// internal/app/command/create_user.go
package command

import (
    "context"
    "fmt"

    "myservice/internal/domain/user"
)

type CreateUser struct {
    Email string
    Name  string
}

type CreateUserHandler struct {
    users user.Repository
}

func NewCreateUserHandler(users user.Repository) CreateUserHandler {
    return CreateUserHandler{users: users}
}

func (h CreateUserHandler) Handle(ctx context.Context, cmd CreateUser) error {
    u, err := user.NewUser(cmd.Email, cmd.Name)
    if err != nil {
        return fmt.Errorf("creating user: %w", err)
    }
    return h.users.Create(ctx, u)
}
```

### **Query Handler**

Queries return data and modify nothing:

```go
// internal/app/query/get_user.go
package query

import (
    "context"
    "fmt"

    "myservice/internal/domain/user"

    "github.com/google/uuid"
)

type GetUser struct {
    ID uuid.UUID
}

type GetUserHandler struct {
    users user.Repository
}

func NewGetUserHandler(users user.Repository) GetUserHandler {
    return GetUserHandler{users: users}
}

func (h GetUserHandler) Handle(ctx context.Context, q GetUser) (*UserResult, error) {
    u, err := h.users.GetByID(ctx, q.ID)
    if err != nil {
        return nil, fmt.Errorf("fetching user %s: %w", q.ID, err)
    }
    return &UserResult{
        ID:    u.ID(),
        Email: u.Email(),
        Name:  u.Name(),
    }, nil
}
```

### **When to Use CQRS**

| Start With | Migrate To |
| --- | --- |
| Single service struct with methods | Separate command/query handlers |
| Same database for reads and writes | Potentially separate read models |
| Simple CRUD | Complex domain with many use cases |

**Rule of thumb:** If a service has more than ~8 methods or the read/write patterns diverge significantly, consider splitting into commands and queries.

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./clean-architecture.md` - Architecture overview
- `./domain-layer.md` - Domain entities and interfaces
- `./repository-pattern.md` - Repository implementations
- `./complete-examples.md` - Full CQRS example
