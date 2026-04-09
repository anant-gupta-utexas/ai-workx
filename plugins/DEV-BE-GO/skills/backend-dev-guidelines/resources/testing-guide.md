# **Testing Guide - testify, mockery, and testcontainers**

Complete guide to testing Go Clean Architecture applications.

## **Table of Contents**

- [Testing Strategy](#testing-strategy)
- [Domain Tests](#domain-tests)
- [Service Tests with Mocks](#service-tests-with-mocks)
- [Table-Driven Tests](#table-driven-tests)
- [Integration Tests with testcontainers](#integration-tests-with-testcontainers)
- [HTTP Handler Tests](#http-handler-tests)
- [mockery Configuration](#mockery-configuration)
- [Build Tags](#build-tags)
- [Best Practices](#best-practices)

---

## **Testing Strategy**

### **Three Levels**

| Level | What | Tools | Speed |
| --- | --- | --- | --- |
| **Unit** | Domain entities, value objects, services | testify, no mocks needed | Milliseconds |
| **Service** | App services with mocked repositories | testify + mockery | Milliseconds |
| **Integration** | Repositories against real database | testcontainers-go + pgx | Seconds |

### **Test Organization**

- Tests live next to the code they test: `user_service_test.go` alongside `user_service.go`
- Integration tests use build tags: `//go:build integration`
- Mocks are generated into `internal/mocks/`

---

## **Domain Tests**

### **Entity Tests**

Domain tests are pure unit tests — no mocks, no setup, no external dependencies:

```go
// internal/domain/user/entity_test.go
package user_test

import (
    "testing"

    "myservice/internal/domain/user"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestNewUser_Valid(t *testing.T) {
    u, err := user.NewUser("alice@example.com", "Alice")
    require.NoError(t, err)

    assert.Equal(t, "alice@example.com", u.Email())
    assert.Equal(t, "Alice", u.Name())
    assert.Equal(t, user.StatusActive, u.Status())
    assert.NotZero(t, u.ID())
    assert.NotZero(t, u.CreatedAt())
}

func TestNewUser_EmptyEmail(t *testing.T) {
    _, err := user.NewUser("", "Alice")
    require.Error(t, err)
    assert.Contains(t, err.Error(), "email is required")
}

func TestNewUser_InvalidEmail(t *testing.T) {
    _, err := user.NewUser("not-an-email", "Alice")
    require.Error(t, err)
    assert.Contains(t, err.Error(), "invalid email")
}

func TestNewUser_TrimsInput(t *testing.T) {
    u, err := user.NewUser("  Alice@Example.COM  ", "  Alice  ")
    require.NoError(t, err)
    assert.Equal(t, "alice@example.com", u.Email())
    assert.Equal(t, "Alice", u.Name())
}

func TestUser_Deactivate(t *testing.T) {
    u, _ := user.NewUser("alice@example.com", "Alice")

    err := u.Deactivate()
    require.NoError(t, err)
    assert.Equal(t, user.StatusInactive, u.Status())
}

func TestUser_Deactivate_AlreadyInactive(t *testing.T) {
    u, _ := user.NewUser("alice@example.com", "Alice")
    _ = u.Deactivate()

    err := u.Deactivate()
    require.ErrorIs(t, err, user.ErrAlreadyInactive)
}
```

### **Value Object Tests**

```go
// internal/domain/order/money_test.go
package order_test

import (
    "testing"

    "myservice/internal/domain/order"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestNewMoney_Valid(t *testing.T) {
    m, err := order.NewMoney(1000, "USD")
    require.NoError(t, err)
    assert.Equal(t, int64(1000), m.Amount())
    assert.Equal(t, "USD", m.Currency())
}

func TestNewMoney_NegativeAmount(t *testing.T) {
    _, err := order.NewMoney(-100, "USD")
    require.Error(t, err)
}

func TestMoney_Add_SameCurrency(t *testing.T) {
    a, _ := order.NewMoney(1000, "USD")
    b, _ := order.NewMoney(500, "USD")

    result, err := a.Add(b)
    require.NoError(t, err)
    assert.Equal(t, int64(1500), result.Amount())
}

func TestMoney_Add_DifferentCurrency(t *testing.T) {
    a, _ := order.NewMoney(1000, "USD")
    b, _ := order.NewMoney(500, "EUR")

    _, err := a.Add(b)
    require.Error(t, err)
    assert.Contains(t, err.Error(), "cannot add")
}
```

---

## **Service Tests with Mocks**

### **Testing with mockery-Generated Mocks**

```go
// internal/app/user_service_test.go
package app_test

import (
    "context"
    "testing"

    "myservice/internal/app"
    "myservice/internal/domain/user"
    "myservice/internal/mocks"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    "github.com/stretchr/testify/require"
)

func TestUserService_CreateUser_Success(t *testing.T) {
    mockRepo := mocks.NewMockRepository(t)
    mockRepo.EXPECT().
        GetByEmail(mock.Anything, "alice@example.com").
        Return(nil, user.ErrNotFound)
    mockRepo.EXPECT().
        Create(mock.Anything, mock.AnythingOfType("*user.User")).
        Return(nil)

    svc := app.NewUserService(mockRepo)
    dto, err := svc.CreateUser(context.Background(), app.CreateUserRequest{
        Email: "alice@example.com",
        Name:  "Alice",
    })

    require.NoError(t, err)
    assert.Equal(t, "alice@example.com", dto.Email)
    assert.Equal(t, "Alice", dto.Name)
    assert.Equal(t, "active", dto.Status)
}

func TestUserService_CreateUser_AlreadyExists(t *testing.T) {
    existing, _ := user.NewUser("alice@example.com", "Alice")

    mockRepo := mocks.NewMockRepository(t)
    mockRepo.EXPECT().
        GetByEmail(mock.Anything, "alice@example.com").
        Return(existing, nil)

    svc := app.NewUserService(mockRepo)
    _, err := svc.CreateUser(context.Background(), app.CreateUserRequest{
        Email: "alice@example.com",
        Name:  "Alice",
    })

    require.Error(t, err)
    assert.ErrorIs(t, err, user.ErrAlreadyExists)
}

func TestUserService_DeactivateUser_Success(t *testing.T) {
    u, _ := user.NewUser("alice@example.com", "Alice")

    mockRepo := mocks.NewMockRepository(t)
    mockRepo.EXPECT().GetByID(mock.Anything, u.ID()).Return(u, nil)
    mockRepo.EXPECT().Update(mock.Anything, u).Return(nil)

    svc := app.NewUserService(mockRepo)
    err := svc.DeactivateUser(context.Background(), u.ID())

    require.NoError(t, err)
    assert.Equal(t, user.StatusInactive, u.Status())
}
```

---

## **Table-Driven Tests**

### **The Idiomatic Pattern**

Table-driven tests are the standard Go testing pattern for testing multiple scenarios:

```go
func TestNewUser_Validation(t *testing.T) {
    tests := []struct {
        name      string
        email     string
        userName  string
        wantErr   bool
        errContains string
    }{
        {
            name:     "valid input",
            email:    "alice@example.com",
            userName: "Alice",
            wantErr:  false,
        },
        {
            name:        "empty email",
            email:       "",
            userName:    "Alice",
            wantErr:     true,
            errContains: "email is required",
        },
        {
            name:        "invalid email format",
            email:       "not-an-email",
            userName:    "Alice",
            wantErr:     true,
            errContains: "invalid email",
        },
        {
            name:        "empty name",
            email:       "alice@example.com",
            userName:    "",
            wantErr:     true,
            errContains: "name is required",
        },
        {
            name:     "trims whitespace",
            email:    "  alice@example.com  ",
            userName: "  Alice  ",
            wantErr:  false,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            u, err := user.NewUser(tt.email, tt.userName)
            if tt.wantErr {
                require.Error(t, err)
                if tt.errContains != "" {
                    assert.Contains(t, err.Error(), tt.errContains)
                }
                return
            }
            require.NoError(t, err)
            assert.NotNil(t, u)
        })
    }
}
```

---

## **Integration Tests with testcontainers**

### **Database Test Setup**

Use testcontainers-go to spin up a real PostgreSQL instance for integration tests:

```go
//go:build integration

// internal/adapters/postgres/user_repo_integration_test.go
package postgres_test

import (
    "context"
    "testing"
    "time"

    "myservice/internal/adapters/postgres"
    "myservice/internal/adapters/postgres/migrations"
    "myservice/internal/domain/user"

    "github.com/jackc/pgx/v5/pgxpool"
    "github.com/pressly/goose/v3"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
    "github.com/testcontainers/testcontainers-go"
    tcpostgres "github.com/testcontainers/testcontainers-go/modules/postgres"
    "github.com/testcontainers/testcontainers-go/wait"
)

func setupTestDB(t *testing.T) *pgxpool.Pool {
    t.Helper()
    ctx := context.Background()

    container, err := tcpostgres.Run(ctx,
        "postgres:16-alpine",
        tcpostgres.WithDatabase("testdb"),
        tcpostgres.WithUsername("test"),
        tcpostgres.WithPassword("test"),
        testcontainers.WithWaitStrategy(
            wait.ForLog("database system is ready to accept connections").
                WithOccurrence(2).
                WithStartupTimeout(30*time.Second),
        ),
    )
    require.NoError(t, err)
    t.Cleanup(func() { _ = container.Terminate(ctx) })

    connStr, err := container.ConnectionString(ctx, "sslmode=disable")
    require.NoError(t, err)

    pool, err := pgxpool.New(ctx, connStr)
    require.NoError(t, err)
    t.Cleanup(func() { pool.Close() })

    // Run migrations
    db, err := sql.Open("pgx", connStr)
    require.NoError(t, err)
    defer db.Close()

    goose.SetBaseFS(migrations.FS)
    err = goose.Up(db, ".")
    require.NoError(t, err)

    return pool
}

func TestUserRepo_Create_And_GetByID(t *testing.T) {
    pool := setupTestDB(t)
    repo := postgres.NewUserRepo(pool)
    ctx := context.Background()

    u, err := user.NewUser("alice@example.com", "Alice")
    require.NoError(t, err)

    err = repo.Create(ctx, u)
    require.NoError(t, err)

    found, err := repo.GetByID(ctx, u.ID())
    require.NoError(t, err)
    assert.Equal(t, u.Email(), found.Email())
    assert.Equal(t, u.Name(), found.Name())
    assert.Equal(t, user.StatusActive, found.Status())
}

func TestUserRepo_Create_DuplicateEmail(t *testing.T) {
    pool := setupTestDB(t)
    repo := postgres.NewUserRepo(pool)
    ctx := context.Background()

    u1, _ := user.NewUser("alice@example.com", "Alice")
    u2, _ := user.NewUser("alice@example.com", "Alice 2")

    require.NoError(t, repo.Create(ctx, u1))

    err := repo.Create(ctx, u2)
    require.ErrorIs(t, err, user.ErrAlreadyExists)
}

func TestUserRepo_GetByID_NotFound(t *testing.T) {
    pool := setupTestDB(t)
    repo := postgres.NewUserRepo(pool)
    ctx := context.Background()

    _, err := repo.GetByID(ctx, uuid.New())
    require.ErrorIs(t, err, user.ErrNotFound)
}
```

### **Running Integration Tests**

```bash
# Run only integration tests
go test -v -race -count=1 -tags=integration ./...

# Via Makefile
make test-integration
```

---

## **mockery Configuration**

### **.mockery.yaml**

```yaml
# .mockery.yaml (project root)
with-expecter: true
packages:
  myservice/internal/domain/user:
    interfaces:
      Repository:
        config:
          outpkg: mocks
          dir: internal/mocks
  myservice/internal/domain/order:
    interfaces:
      Repository:
        config:
          outpkg: mocks
          dir: internal/mocks
  myservice/internal/domain/notification:
    interfaces:
      Gateway:
        config:
          outpkg: mocks
          dir: internal/mocks
```

### **Generate Mocks**

```bash
go tool mockery

# Or via Makefile
make generate
```

---

## **Build Tags**

### **Separating Test Categories**

Use build tags to separate fast unit tests from slow integration tests:

```go
//go:build integration

package postgres_test
// ... integration tests that need Docker
```

```go
//go:build !integration

package user_test
// ... fast unit tests (optional — tests without tags always run)
```

### **Running by Category**

```bash
# Unit tests only (default — no tags)
go test ./...

# Integration tests only
go test -tags=integration ./...

# All tests
go test -tags=integration ./...
```

---

## **Best Practices**

### **1. Use require for Fatal Assertions**

```go
// ✅ GOOD: require stops the test on failure
require.NoError(t, err)
assert.Equal(t, "alice@example.com", u.Email())

// ❌ BAD: assert continues after failure — panics on nil
assert.NoError(t, err)
assert.Equal(t, "alice@example.com", u.Email())  // u might be nil!
```

### **2. Use t.Helper() in Setup Functions**

```go
func setupTestDB(t *testing.T) *pgxpool.Pool {
    t.Helper()  // Error locations point to the caller, not this function
    // ...
}
```

### **3. Use t.Cleanup() for Teardown**

```go
// ✅ GOOD: Cleanup runs automatically
t.Cleanup(func() { pool.Close() })

// ❌ BAD: defer in test helper may not run in correct order
defer pool.Close()
```

### **4. Parallel Tests Where Safe**

```go
func TestNewUser_Validation(t *testing.T) {
    tests := []struct{ ... }{ ... }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()  // Safe for pure domain tests
            // ...
        })
    }
}
```

### **5. Test the Behavior, Not the Implementation**

```go
// ✅ GOOD: Test observable behavior
dto, err := svc.CreateUser(ctx, req)
require.NoError(t, err)
assert.Equal(t, "alice@example.com", dto.Email)

// ❌ BAD: Test internal implementation details
assert.Equal(t, 1, mockRepo.CreateCallCount())
```

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./domain-layer.md` - Domain entities to test
- `./application-layer.md` - Services to test
- `./repository-pattern.md` - Integration test targets
- `./complete-examples.md` - Full test examples
