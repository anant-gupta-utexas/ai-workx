# **Validation Patterns - Domain and API Validation**

Complete guide to validation strategies in Go Clean Architecture.

## **Table of Contents**

- [Validation Strategy Overview](#validation-strategy-overview)
- [Domain Validation](#domain-validation)
- [API Validation](#api-validation)
- [go-playground/validator](#go-playgroundvalidator)
- [Custom Validation Functions](#custom-validation-functions)
- [Best Practices](#best-practices)

---

## **Validation Strategy Overview**

### **Two-Layer Validation**

Validation happens at two distinct layers, each with different responsibilities:

| Layer | What | How | Purpose |
| --- | --- | --- | --- |
| **Domain** | Business invariants | Constructor functions, method guards | Protect entity integrity |
| **API** | Input format, required fields | Struct tags, `Validate()` methods | Reject bad requests early |

### **The Principle**

- **Domain validation** ensures business rules are never violated — this is the last line of defense
- **API validation** provides fast feedback and user-friendly error messages — this is the first filter

```
HTTP Request
    │
    ▼
API Validation (struct tags, Validate() method)
    │  ← Reject 400 with field-level errors
    ▼
App Service
    │
    ▼
Domain Validation (constructor, method guards)
    │  ← Return domain error if invariant violated
    ▼
Repository
```

---

## **Domain Validation**

### **Constructor Validation**

Every entity constructor validates invariants at creation time:

```go
// internal/domain/user/entity.go
func NewUser(email, name string) (*User, error) {
    email = strings.TrimSpace(strings.ToLower(email))
    name = strings.TrimSpace(name)

    if email == "" {
        return nil, errors.New("email is required")
    }
    if !strings.Contains(email, "@") {
        return nil, errors.New("invalid email format")
    }
    if len(email) > 255 {
        return nil, errors.New("email too long")
    }
    if name == "" {
        return nil, errors.New("name is required")
    }
    if len(name) > 100 {
        return nil, errors.New("name too long")
    }

    now := time.Now().UTC()
    return &User{
        id:        uuid.New(),
        email:     email,
        name:      name,
        status:    StatusActive,
        createdAt: now,
        updatedAt: now,
    }, nil
}
```

### **Value Object Validation**

Value objects validate on creation and are immutable:

```go
// internal/domain/order/money.go
func NewMoney(amount int64, currency string) (Money, error) {
    if amount < 0 {
        return Money{}, errors.New("amount cannot be negative")
    }
    currency = strings.ToUpper(strings.TrimSpace(currency))
    if !isValidCurrency(currency) {
        return Money{}, fmt.Errorf("unsupported currency: %s", currency)
    }
    return Money{amount: amount, currency: currency}, nil
}

func isValidCurrency(c string) bool {
    switch c {
    case "USD", "EUR", "GBP":
        return true
    }
    return false
}
```

### **Method Guards**

Entity methods validate state transitions before modifying state:

```go
func (u *User) Deactivate() error {
    if u.status == StatusInactive {
        return ErrAlreadyInactive
    }
    if u.status == StatusBanned {
        return errors.New("cannot deactivate banned user")
    }
    u.status = StatusInactive
    u.updatedAt = time.Now().UTC()
    return nil
}

func (o *Order) Cancel() error {
    if o.status == StatusCancelled {
        return errors.New("order already cancelled")
    }
    if o.status == StatusShipped {
        return errors.New("cannot cancel shipped order")
    }
    o.status = StatusCancelled
    o.updatedAt = time.Now().UTC()
    return nil
}
```

---

## **API Validation**

### **Manual Validate() Methods**

For simple cases, a `Validate()` method on the request struct is clean and explicit:

```go
// internal/ports/http/request.go
package http

import (
    "fmt"
    "net/mail"
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
    if _, err := mail.ParseAddress(r.Email); err != nil {
        return fmt.Errorf("invalid email format")
    }
    if r.Name == "" {
        return fmt.Errorf("name is required")
    }
    if len(r.Name) < 2 || len(r.Name) > 100 {
        return fmt.Errorf("name must be 2-100 characters")
    }
    return nil
}
```

### **Usage in Handler**

```go
func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    if err := decodeJSON(r, &req); err != nil {
        writeError(w, http.StatusBadRequest, "invalid JSON")
        return
    }
    if err := req.Validate(); err != nil {
        writeError(w, http.StatusBadRequest, err.Error())
        return
    }
    // ... proceed with service call
}
```

---

## **go-playground/validator**

### **Setup**

For APIs with many fields and complex validation rules, use `go-playground/validator`:

```go
// internal/ports/http/validator.go
package http

import (
    "fmt"
    "strings"

    "github.com/go-playground/validator/v10"
)

var validate = validator.New(validator.WithRequiredStructEnabled())

type ValidationErrors struct {
    Errors []FieldError `json:"errors"`
}

type FieldError struct {
    Field   string `json:"field"`
    Message string `json:"message"`
}

func (v ValidationErrors) Error() string {
    msgs := make([]string, len(v.Errors))
    for i, e := range v.Errors {
        msgs[i] = e.Field + ": " + e.Message
    }
    return strings.Join(msgs, "; ")
}

func validateStruct(s any) error {
    err := validate.Struct(s)
    if err == nil {
        return nil
    }

    var validationErrs validator.ValidationErrors
    if !errors.As(err, &validationErrs) {
        return err
    }

    fieldErrors := make([]FieldError, len(validationErrs))
    for i, e := range validationErrs {
        fieldErrors[i] = FieldError{
            Field:   toSnakeCase(e.Field()),
            Message: formatValidationMessage(e),
        }
    }
    return ValidationErrors{Errors: fieldErrors}
}

func formatValidationMessage(e validator.FieldError) string {
    switch e.Tag() {
    case "required":
        return "is required"
    case "email":
        return "must be a valid email"
    case "min":
        return fmt.Sprintf("must be at least %s characters", e.Param())
    case "max":
        return fmt.Sprintf("must be at most %s characters", e.Param())
    case "oneof":
        return fmt.Sprintf("must be one of: %s", e.Param())
    case "gt":
        return fmt.Sprintf("must be greater than %s", e.Param())
    default:
        return fmt.Sprintf("failed %s validation", e.Tag())
    }
}
```

### **Request Structs with Validator Tags**

```go
type CreateUserRequest struct {
    Email string `json:"email" validate:"required,email,max=255"`
    Name  string `json:"name"  validate:"required,min=2,max=100"`
}

type CreateOrderRequest struct {
    Items []OrderItemRequest `json:"items" validate:"required,min=1,dive"`
}

type OrderItemRequest struct {
    ProductID  string `json:"product_id"  validate:"required"`
    Quantity   int    `json:"quantity"     validate:"required,gt=0"`
    PriceCents int64  `json:"price_cents"  validate:"required,gt=0"`
}

type UpdateUserRequest struct {
    Name   *string `json:"name,omitempty"   validate:"omitempty,min=2,max=100"`
    Status *string `json:"status,omitempty" validate:"omitempty,oneof=active inactive"`
}
```

### **Usage in Handler**

```go
func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    if err := decodeJSON(r, &req); err != nil {
        writeError(w, http.StatusBadRequest, "invalid JSON")
        return
    }

    if err := validateStruct(&req); err != nil {
        var ve ValidationErrors
        if errors.As(err, &ve) {
            writeJSON(w, http.StatusBadRequest, ve)
            return
        }
        writeError(w, http.StatusBadRequest, err.Error())
        return
    }

    // ... proceed
}
```

---

## **Custom Validation Functions**

### **Registering Custom Validators**

```go
func init() {
    validate.RegisterValidation("currency", validateCurrency)
    validate.RegisterValidation("uuid", validateUUID)
}

func validateCurrency(fl validator.FieldLevel) bool {
    switch fl.Field().String() {
    case "USD", "EUR", "GBP":
        return true
    }
    return false
}

func validateUUID(fl validator.FieldLevel) bool {
    _, err := uuid.Parse(fl.Field().String())
    return err == nil
}
```

### **Using Custom Validators**

```go
type TransferRequest struct {
    FromAccount string `json:"from_account" validate:"required,uuid"`
    ToAccount   string `json:"to_account"   validate:"required,uuid"`
    Amount      int64  `json:"amount"       validate:"required,gt=0"`
    Currency    string `json:"currency"     validate:"required,currency"`
}
```

---

## **Best Practices**

### **1. Validate at Both Layers**

```go
// ✅ GOOD: API validates format, domain validates business rules
// API layer
type CreateUserRequest struct {
    Email string `json:"email" validate:"required,email"`
}

// Domain layer
func NewUser(email, name string) (*User, error) {
    if email == "" {
        return nil, errors.New("email is required")
    }
}

// ❌ BAD: Only validate at API layer — domain is unprotected
```

### **2. Normalize Input Early**

```go
// ✅ GOOD: Trim and lowercase in the Validate() method or constructor
func (r *CreateUserRequest) Validate() error {
    r.Email = strings.TrimSpace(strings.ToLower(r.Email))
    // ...
}

// ❌ BAD: Assume input is already normalized
```

### **3. Return Structured Errors from API**

```go
// ✅ GOOD: Structured field-level errors
{
  "errors": [
    {"field": "email", "message": "must be a valid email"},
    {"field": "name", "message": "is required"}
  ]
}

// ❌ BAD: Single string error
{"error": "validation failed"}
```

### **4. Domain Errors Are Simple**

```go
// ✅ GOOD: Domain returns simple errors
return nil, errors.New("email is required")

// ❌ BAD: Domain returns HTTP-aware errors
return nil, &HTTPError{Status: 400, Message: "..."}
```

### **5. Reconstitute Skips Validation**

```go
// ✅ GOOD: No validation when reading from DB
func Reconstitute(id uuid.UUID, email string, ...) *User {
    return &User{id: id, email: email, ...}
}

// ❌ BAD: Re-validate data from database
func Reconstitute(email string, ...) (*User, error) {
    return NewUser(email, ...)  // May reject historical data!
}
```

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./domain-layer.md` - Domain entities and constructors
- `./api-layer.md` - HTTP request handling
- `./error-handling.md` - Error patterns
