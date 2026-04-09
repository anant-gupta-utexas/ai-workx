# **Domain Layer - Pure Business Logic**

Complete guide to implementing the Domain Layer in Go Clean Architecture.

## **Table of Contents**

- [Purpose and Rules](#purpose-and-rules)
- [Entities](#entities)
- [Value Objects](#value-objects)
- [Domain Services](#domain-services)
- [Interfaces (Ports)](#interfaces-ports)
- [Domain Errors](#domain-errors)

---

## **Purpose and Rules**

### **What is the Domain Layer?**

The **Domain Layer** contains pure business logic with **zero external dependencies**.

**Location**: `internal/domain/` — organized by feature (e.g., `user/`, `order/`)

**Rules**:
- ✅ Only Go stdlib imports (`errors`, `fmt`, `time`, `strings`)
- ✅ Unexported struct fields with constructor functions
- ✅ Interfaces defined here, implemented in adapters
- ❌ **NO** pgx, chi, koanf, or any external package
- ❌ **NO** imports from `internal/app/`, `internal/ports/`, or `internal/adapters/`

### **Why Zero Dependencies?**

- **Testability**: Test business logic without databases or HTTP servers
- **Portability**: Switch frameworks or databases without touching domain
- **Clarity**: Business rules are explicit and isolated
- **Speed**: Pure Go tests run in milliseconds

---

## **Entities**

### **What is an Entity?**

An **Entity** is an object with:
- **Identity** (unique ID)
- **Business behavior** (methods that enforce rules)
- **Mutable state** (changes over time via controlled methods)

### **Entity Pattern: Unexported Fields + Constructor**

Go cannot prevent zero-value creation of types, so **constructor functions are essential** for enforcing invariants. Keep fields unexported (lowercase) to force usage of `New*()`.

```go
// internal/domain/user/entity.go
package user

import (
    "errors"
    "strings"
    "time"

    "github.com/google/uuid"
)

type User struct {
    id        uuid.UUID
    email     string
    name      string
    status    Status
    role      Role
    createdAt time.Time
    updatedAt time.Time
}

func NewUser(email, name string) (*User, error) {
    email = strings.TrimSpace(strings.ToLower(email))
    name = strings.TrimSpace(name)

    if email == "" {
        return nil, errors.New("email is required")
    }
    if !strings.Contains(email, "@") {
        return nil, errors.New("invalid email format")
    }
    if name == "" {
        return nil, errors.New("name is required")
    }

    now := time.Now().UTC()
    return &User{
        id:        uuid.New(),
        email:     email,
        name:      name,
        status:    StatusActive,
        role:      RoleUser,
        createdAt: now,
        updatedAt: now,
    }, nil
}

// Reconstitute recreates an entity from persistence data.
// No validation — data from DB is assumed valid at time of write.
func Reconstitute(id uuid.UUID, email, name string, status Status, role Role, createdAt, updatedAt time.Time) *User {
    return &User{
        id:        id,
        email:     email,
        name:      name,
        status:    status,
        role:      role,
        createdAt: createdAt,
        updatedAt: updatedAt,
    }
}

// --- Getters ---

func (u *User) ID() uuid.UUID       { return u.id }
func (u *User) Email() string        { return u.email }
func (u *User) Name() string         { return u.name }
func (u *User) Status() Status       { return u.status }
func (u *User) Role() Role           { return u.role }
func (u *User) CreatedAt() time.Time { return u.createdAt }
func (u *User) UpdatedAt() time.Time { return u.updatedAt }

// --- Business Behavior ---

func (u *User) Deactivate() error {
    if u.status == StatusInactive {
        return ErrAlreadyInactive
    }
    u.status = StatusInactive
    u.updatedAt = time.Now().UTC()
    return nil
}

func (u *User) Activate() error {
    if u.status == StatusActive {
        return ErrAlreadyActive
    }
    u.status = StatusActive
    u.updatedAt = time.Now().UTC()
    return nil
}

func (u *User) PromoteTo(role Role) error {
    if u.status != StatusActive {
        return errors.New("cannot promote inactive user")
    }
    if !role.IsValid() {
        return ErrInvalidRole
    }
    u.role = role
    u.updatedAt = time.Now().UTC()
    return nil
}

func (u *User) UpdateName(name string) error {
    name = strings.TrimSpace(name)
    if name == "" {
        return errors.New("name cannot be empty")
    }
    u.name = name
    u.updatedAt = time.Now().UTC()
    return nil
}
```

### **Entity Best Practices**

**DO:**
- Use unexported fields to enforce encapsulation
- Provide a `New*()` constructor that validates all invariants
- Provide a `Reconstitute()` function for rebuilding from persistence (no validation)
- Use getter methods for read access
- Create behavior methods that enforce business rules and update `updatedAt`
- Keep the `uuid` package as the only external dependency (acceptable in domain)

**DON'T:**
- Export struct fields directly
- Allow zero-value creation to produce valid entities
- Import from `app/`, `ports/`, or `adapters/`
- Include database or HTTP concerns

---

## **Value Objects**

### **What is a Value Object?**

A **Value Object** is defined by its attributes (no identity). It is immutable and equality is based on value.

### **Enum-Style Value Objects**

Go doesn't have enums, so use typed string constants:

```go
// internal/domain/user/status.go
package user

type Status string

const (
    StatusActive   Status = "active"
    StatusInactive Status = "inactive"
    StatusBanned   Status = "banned"
)

func (s Status) IsValid() bool {
    switch s {
    case StatusActive, StatusInactive, StatusBanned:
        return true
    }
    return false
}

func (s Status) IsTerminal() bool {
    return s == StatusBanned
}

func ParseStatus(raw string) (Status, error) {
    s := Status(raw)
    if !s.IsValid() {
        return "", ErrInvalidStatus
    }
    return s, nil
}
```

```go
// internal/domain/user/role.go
package user

type Role string

const (
    RoleUser    Role = "user"
    RoleAdmin   Role = "admin"
    RoleMod     Role = "moderator"
)

func (r Role) IsValid() bool {
    switch r {
    case RoleUser, RoleAdmin, RoleMod:
        return true
    }
    return false
}
```

### **Complex Value Objects**

For multi-field value objects, use unexported structs with constructors:

```go
// internal/domain/order/money.go
package order

import (
    "errors"
    "fmt"
)

type Money struct {
    amount   int64  // cents
    currency string
}

func NewMoney(amount int64, currency string) (Money, error) {
    if amount < 0 {
        return Money{}, errors.New("amount cannot be negative")
    }
    if currency == "" {
        return Money{}, errors.New("currency is required")
    }
    return Money{amount: amount, currency: currency}, nil
}

func (m Money) Amount() int64    { return m.amount }
func (m Money) Currency() string { return m.currency }

func (m Money) Add(other Money) (Money, error) {
    if m.currency != other.currency {
        return Money{}, fmt.Errorf("cannot add %s to %s", m.currency, other.currency)
    }
    return Money{amount: m.amount + other.amount, currency: m.currency}, nil
}

func (m Money) Equals(other Money) bool {
    return m.amount == other.amount && m.currency == other.currency
}
```

---

## **Domain Services**

### **What is a Domain Service?**

A **Domain Service** contains business logic that:
- Doesn't naturally fit in a single entity
- Operates on multiple entities
- Implements domain-wide rules

### **Domain Service Example**

```go
// internal/domain/order/pricing_service.go
package order

type PricingService struct{}

func NewPricingService() *PricingService {
    return &PricingService{}
}

func (s *PricingService) CalculateTotal(items []LineItem, discount *Discount) (Money, error) {
    total := Money{amount: 0, currency: "USD"}

    for _, item := range items {
        subtotal, err := item.Subtotal()
        if err != nil {
            return Money{}, err
        }
        total, err = total.Add(subtotal)
        if err != nil {
            return Money{}, err
        }
    }

    if discount != nil {
        total = discount.Apply(total)
    }

    return total, nil
}

func (s *PricingService) ValidateOrder(o *Order) error {
    if len(o.Items()) == 0 {
        return ErrEmptyOrder
    }
    for _, item := range o.Items() {
        if item.Quantity() <= 0 {
            return ErrInvalidQuantity
        }
    }
    return nil
}
```

---

## **Interfaces (Ports)**

### **Why Interfaces at the Consumer?**

Go's implicit interfaces mean you don't need a separate "ports" layer for interface definitions. **Define interfaces where they are consumed** — in the domain package. Implementations in `adapters/` satisfy them implicitly.

### **Repository Interfaces**

```go
// internal/domain/user/repository.go
package user

import (
    "context"

    "github.com/google/uuid"
)

type Repository interface {
    Create(ctx context.Context, user *User) error
    GetByID(ctx context.Context, id uuid.UUID) (*User, error)
    GetByEmail(ctx context.Context, email string) (*User, error)
    Update(ctx context.Context, user *User) error
    Delete(ctx context.Context, id uuid.UUID) error
    ListActive(ctx context.Context, limit, offset int) ([]*User, error)
}
```

```go
// internal/domain/order/repository.go
package order

import (
    "context"

    "github.com/google/uuid"
)

type Repository interface {
    Create(ctx context.Context, order *Order) error
    GetByID(ctx context.Context, id uuid.UUID) (*Order, error)
    Update(ctx context.Context, order *Order) error
    FindByUser(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*Order, error)
    UpdateInTx(ctx context.Context, id uuid.UUID, fn func(*Order) error) error
}
```

### **Gateway Interfaces**

```go
// internal/domain/notification/gateway.go
package notification

import "context"

type Message struct {
    To      string
    Subject string
    Body    string
}

type Gateway interface {
    Send(ctx context.Context, msg Message) error
}
```

### **Interface Best Practices**

- Keep interfaces **small** — prefer 1-3 methods per interface
- Name with the *-er* convention when possible: `Reader`, `Writer`, `Repository`
- Accept interfaces, return concrete types
- One interface per concern — don't bundle unrelated methods

---

## **Domain Errors**

### **Sentinel Errors and Typed Errors**

Use sentinel errors for well-known conditions and typed errors for structured data:

```go
// internal/domain/user/errors.go
package user

import "errors"

// Sentinel errors for simple conditions
var (
    ErrNotFound        = errors.New("user not found")
    ErrAlreadyExists   = errors.New("user already exists")
    ErrAlreadyActive   = errors.New("user is already active")
    ErrAlreadyInactive = errors.New("user is already inactive")
    ErrInvalidRole     = errors.New("invalid role")
    ErrInvalidStatus   = errors.New("invalid status")
)
```

```go
// internal/domain/order/errors.go
package order

import (
    "errors"
    "fmt"
)

var (
    ErrNotFound        = errors.New("order not found")
    ErrEmptyOrder      = errors.New("order must have at least one item")
    ErrInvalidQuantity = errors.New("quantity must be positive")
)

// Typed error for structured information
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation error on %s: %s", e.Field, e.Message)
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
```

### **Error Best Practices**

- Define errors in the domain package where they originate
- Use sentinel errors (`var ErrNotFound = ...`) for simple conditions
- Use typed errors (structs implementing `error`) when callers need structured data
- Repository implementations translate infrastructure errors into domain errors
- HTTP handlers translate domain errors into status codes using `errors.Is()` / `errors.As()`

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./clean-architecture.md` - Architecture overview
- `./application-layer.md` - Application layer details
- `./repository-pattern.md` - Implementing repositories
- `./error-handling.md` - Error handling patterns
