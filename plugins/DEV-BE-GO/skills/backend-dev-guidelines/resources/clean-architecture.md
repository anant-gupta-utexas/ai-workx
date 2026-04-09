# **Clean Architecture - Go Project Layout**

Complete guide to Clean Architecture (Hexagonal Architecture / Ports and Adapters) for Go services.

## **Table of Contents**

- [Core Concepts](#core-concepts)
- [The Four Packages](#the-four-packages)
- [Dependency Rule](#dependency-rule)
- [Directory Structure](#directory-structure)
- [Request Lifecycle](#request-lifecycle)
- [Benefits](#benefits)

---

## **Core Concepts**

### **What is Clean Architecture?**

Clean Architecture organizes code into layers with strict dependency rules:

- **Inner layers** contain business logic
- **Outer layers** contain technical details
- **Dependencies point inward** only

```
┌───────────────────────────────────────┐
│   Adapters (outbound)                 │  ← Postgres, Redis, external APIs
│   Ports (inbound)                     │  ← HTTP handlers, gRPC servers
│        │                               │
│        ▼                               │
│   App Layer                            │  ← Services, DTOs
│        │                               │
│        ▼                               │
│   Domain Layer                         │  ← Business Rules
└───────────────────────────────────────┘
```

### **Key Principles**

**1. Dependency Inversion**
- Adapters/Ports → App → Domain
- Domain depends on NOTHING

**2. Single Responsibility**
- Each package has ONE clear purpose

**3. Testability**
- Domain: Pure unit tests (no mocks needed)
- App: Mocked infrastructure via interfaces
- Ports/Adapters: Integration tests with testcontainers

### **Go-Specific: `internal/` Enforcement**

Go's `internal/` directory is compiler-enforced: packages inside it cannot be imported from outside the module. This naturally protects your domain and application layers from external misuse.

---

## **The Four Packages**

### **Domain Layer (`internal/domain/`)**

**Purpose**: Pure business logic with zero external dependencies

**Contains**:
- **Entities**: Structs with unexported fields, constructor functions, and behavior methods
- **Value Objects**: Immutable types with validation
- **Domain Services**: Business logic spanning multiple entities
- **Interfaces (Ports)**: Repository and gateway contracts (Go interfaces)
- **Errors**: Domain-specific error types

**Rules**:
- ✅ Only stdlib imports (errors, fmt, time, etc.)
- ✅ Interfaces defined here, implemented elsewhere
- ❌ No chi, pgx, sqlc, or any external package

**Example**:

```go
// internal/domain/user/entity.go
package user

import (
    "errors"
    "time"

    "github.com/google/uuid"
)

type User struct {
    id        uuid.UUID
    email     string
    name      string
    status    Status
    createdAt time.Time
    updatedAt time.Time
}

func NewUser(email, name string) (*User, error) {
    if email == "" {
        return nil, errors.New("email is required")
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
        createdAt: now,
        updatedAt: now,
    }, nil
}

func (u *User) ID() uuid.UUID     { return u.id }
func (u *User) Email() string     { return u.email }
func (u *User) Name() string      { return u.name }
func (u *User) Status() Status    { return u.status }
func (u *User) CreatedAt() time.Time { return u.createdAt }
```

### **App Layer (`internal/app/`)**

**Purpose**: Orchestrate business logic and coordinate workflows

**Contains**:
- **Services**: Specific application workflows
- **DTOs**: Plain structs for boundary data transfer
- **Application Errors**: Errors specific to application-level concerns

**Rules**:
- ✅ Imports from `internal/domain/`
- ✅ Uses plain structs for DTOs
- ✅ Depends on domain interfaces (not implementations)
- ❌ No HTTP, database, or framework code

**Example**:

```go
// internal/app/user_service.go
package app

import (
    "context"
    "fmt"

    "myservice/internal/domain/user"
)

type UserService struct {
    users user.Repository
}

func NewUserService(users user.Repository) *UserService {
    return &UserService{users: users}
}

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
```

### **Ports Layer (`internal/ports/`)**

**Purpose**: Inbound adapters that receive external requests

**Contains**:
- **HTTP Handlers**: Chi route handlers, request/response models
- **gRPC Servers**: Protocol buffer service implementations
- **CLI Commands**: Command-line entry points

**Rules**:
- ✅ Imports from `internal/app/` and `internal/domain/`
- ✅ Converts HTTP/gRPC requests into app-layer DTOs
- ✅ Maps domain/app errors to HTTP status codes
- ❌ No direct database access

**Example**:

```go
// internal/ports/http/user_handler.go
package http

import (
    "encoding/json"
    "net/http"

    "myservice/internal/app"
)

type UserHandler struct {
    service *app.UserService
}

func NewUserHandler(service *app.UserService) *UserHandler {
    return &UserHandler{service: service}
}

func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        writeError(w, http.StatusBadRequest, "invalid request body")
        return
    }

    dto, err := h.service.CreateUser(r.Context(), app.CreateUserRequest{
        Email: req.Email,
        Name:  req.Name,
    })
    if err != nil {
        mapErrorToResponse(w, err)
        return
    }

    writeJSON(w, http.StatusCreated, dto)
}
```

### **Adapters Layer (`internal/adapters/`)**

**Purpose**: Outbound implementations of domain interfaces

**Contains**:
- **Repositories**: sqlc + pgx implementations of domain repository interfaces
- **External Clients**: HTTP/gRPC clients for third-party services
- **Cache**: Redis adapters
- **Messaging**: Kafka/NATS publishers

**Rules**:
- ✅ Imports from `internal/domain/`
- ✅ Implements domain interfaces
- ✅ All database, cache, and external API code here
- ❌ No business logic

**Example**:

```go
// internal/adapters/postgres/user_repo.go
package postgres

import (
    "context"
    "fmt"

    "myservice/internal/adapters/postgres/sqlcgen"
    "myservice/internal/domain/user"

    "github.com/jackc/pgx/v5/pgxpool"
)

type UserRepo struct {
    pool    *pgxpool.Pool
    queries *sqlcgen.Queries
}

func NewUserRepo(pool *pgxpool.Pool) *UserRepo {
    return &UserRepo{
        pool:    pool,
        queries: sqlcgen.New(pool),
    }
}

func (r *UserRepo) Create(ctx context.Context, u *user.User) error {
    err := r.queries.InsertUser(ctx, sqlcgen.InsertUserParams{
        ID:        u.ID(),
        Email:     u.Email(),
        Name:      u.Name(),
        Status:    string(u.Status()),
        CreatedAt: u.CreatedAt(),
    })
    if err != nil {
        return fmt.Errorf("inserting user: %w", err)
    }
    return nil
}
```

---

## **Dependency Rule**

### **The Golden Rule**

**Dependencies flow INWARD, never outward**

```
Adapters  ──▶  Domain  ◀──  Ports
                 ▲
                 │
                App
```

### **What This Means**

**Domain Layer**:

```go
// ✅ GOOD: Pure domain code — stdlib only
import (
    "errors"
    "time"
)

// ❌ BAD: External dependencies
import "github.com/jackc/pgx/v5"  // NO!
import "github.com/go-chi/chi/v5" // NO!
```

**App Layer**:

```go
// ✅ GOOD: Depends on domain interfaces
import "myservice/internal/domain/user"

// ❌ BAD: Depends on infrastructure
import "myservice/internal/adapters/postgres" // NO!
```

**Adapters Layer**:

```go
// ✅ GOOD: Implements domain interfaces
import (
    "myservice/internal/domain/user"
    "github.com/jackc/pgx/v5/pgxpool"
)
```

---

## **Directory Structure**

```
myservice/
├── cmd/
│   └── server/
│       └── main.go                  # Wiring, config, startup, graceful shutdown
├── internal/
│   ├── domain/                      # Domain Layer
│   │   ├── user/
│   │   │   ├── entity.go            # User entity with unexported fields
│   │   │   ├── repository.go        # Repository interface
│   │   │   ├── service.go           # Domain service (optional)
│   │   │   └── errors.go            # Domain errors
│   │   └── order/
│   │       ├── aggregate.go
│   │       ├── repository.go
│   │       └── errors.go
│   ├── app/                         # Application Layer
│   │   ├── user_service.go          # User application service
│   │   ├── order_service.go         # Order application service
│   │   └── dto.go                   # Request/Response DTOs
│   ├── ports/                       # Inbound Adapters
│   │   └── http/
│   │       ├── router.go            # Chi router setup
│   │       ├── user_handler.go      # User HTTP handlers
│   │       ├── order_handler.go     # Order HTTP handlers
│   │       ├── request.go           # HTTP request structs
│   │       ├── response.go          # HTTP response structs
│   │       └── middleware/
│   │           ├── logging.go
│   │           ├── recovery.go
│   │           └── auth.go
│   └── adapters/                    # Outbound Adapters
│       ├── postgres/
│       │   ├── user_repo.go         # User repository implementation
│       │   ├── order_repo.go        # Order repository implementation
│       │   ├── migrations/          # SQL migrations (goose)
│       │   │   ├── 001_create_users.sql
│       │   │   └── 002_create_orders.sql
│       │   └── sqlcgen/             # sqlc generated code
│       │       ├── db.go
│       │       ├── models.go
│       │       └── queries.sql.go
│       └── redis/
│           └── cache.go
├── api/
│   └── openapi.yaml                 # API specification
├── configs/
│   ├── config.yaml                  # Default config
│   └── config.local.yaml            # Local overrides (gitignored)
├── sql/
│   └── queries/                     # sqlc query files
│       ├── users.sql
│       └── orders.sql
├── go.mod
├── go.sum
├── sqlc.yaml                        # sqlc configuration
├── .golangci.yml                    # golangci-lint v2 config
├── Makefile
├── Dockerfile
└── compose.yml
```

### **Key Layout Decisions**

- **`cmd/`**: Entry points only — wiring, config loading, graceful shutdown
- **`internal/`**: All application code — compiler-enforced encapsulation
- **Domain organized by feature**: `user/`, `order/` — not `entities/`, `repositories/`
- **`sql/queries/`**: sqlc SQL files separate from generated code
- **`sqlcgen/`**: Generated code lives alongside its adapter — never edit manually
- **No `pkg/`**: Use `internal/` instead — the `pkg/` convention is discouraged for new projects

---

## **Request Lifecycle**

### **Complete Flow**

```
1. HTTP Request → Chi Router (Ports/HTTP)
   - Middleware chain (logging, auth, recovery)
   ▼
2. Handler Function
   - Decode JSON, validate request
   ▼
3. App Service (App Layer)
   - Orchestrate workflow, call domain logic
   ▼
4. Domain Logic
   - Create/modify entities, validate business rules
   ▼
5. Repository (Adapters/Postgres)
   - sqlc-generated query, pgx execution
   ▼
6. Return DTO (App Layer)
   - Convert entity to response DTO
   ▼
7. HTTP Response (Ports/HTTP)
   - Encode DTO to JSON, set status code
```

### **Code Example**

```go
// cmd/server/main.go — wiring
func main() {
    cfg := config.Load()

    pool, _ := pgxpool.New(context.Background(), cfg.Database.URL)
    defer pool.Close()

    userRepo := postgres.NewUserRepo(pool)
    userService := app.NewUserService(userRepo)
    userHandler := httpport.NewUserHandler(userService)

    r := chi.NewRouter()
    r.Use(middleware.Logger)
    r.Post("/users", userHandler.Create)
    r.Get("/users/{id}", userHandler.GetByID)

    srv := &http.Server{Addr: ":8080", Handler: r}
    // ... graceful shutdown (see complete-examples.md)
}
```

---

## **Benefits**

### **1. Testability**

**Domain Tests**: Pure unit tests, no mocks

```go
func TestNewUser_ValidInput(t *testing.T) {
    u, err := user.NewUser("alice@example.com", "Alice")
    require.NoError(t, err)
    assert.Equal(t, "alice@example.com", u.Email())
    assert.Equal(t, user.StatusActive, u.Status())
}
```

**Service Tests**: Mock interfaces with mockery

```go
func TestCreateUser(t *testing.T) {
    mockRepo := mocks.NewMockRepository(t)
    mockRepo.EXPECT().Create(mock.Anything, mock.Anything).Return(nil)

    svc := app.NewUserService(mockRepo)
    dto, err := svc.CreateUser(context.Background(), app.CreateUserRequest{
        Email: "alice@example.com",
        Name:  "Alice",
    })
    require.NoError(t, err)
    assert.Equal(t, "alice@example.com", dto.Email)
}
```

### **2. Maintainability**

- Clear boundaries between packages
- Easy to locate bugs — domain logic is isolated
- Swap implementations (Postgres → MySQL) without touching domain
- Framework independence — Chi could be replaced with stdlib mux

### **3. Scalability**

- Clear patterns for adding new features
- Teams work on different layers independently
- Fast onboarding with consistent structure
- Easy to extract microservices from domain packages

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./domain-layer.md` - Domain layer details
- `./application-layer.md` - Application layer details
- `./api-layer.md` - HTTP handler details
- `./repository-pattern.md` - Repository implementation
