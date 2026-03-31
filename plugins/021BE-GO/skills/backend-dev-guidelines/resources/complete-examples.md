# **Complete Examples - Full Feature Implementation**

Complete walkthrough of implementing a feature end-to-end, plus production deployment patterns.

## **Table of Contents**

- [Full Feature Walkthrough](#full-feature-walkthrough)
- [Main Function Wiring](#main-function-wiring)
- [Graceful Shutdown](#graceful-shutdown)
- [Dockerfile](#dockerfile)
- [Docker Compose](#docker-compose)
- [Live Reload Development](#live-reload-development)

---

## **Full Feature Walkthrough**

This walkthrough implements a "User Registration" feature across all layers.

### **Step 1: Domain Entity**

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
        createdAt: now,
        updatedAt: now,
    }, nil
}

func Reconstitute(id uuid.UUID, email, name string, status Status, createdAt, updatedAt time.Time) *User {
    return &User{id: id, email: email, name: name, status: status, createdAt: createdAt, updatedAt: updatedAt}
}

func (u *User) ID() uuid.UUID       { return u.id }
func (u *User) Email() string        { return u.email }
func (u *User) Name() string         { return u.name }
func (u *User) Status() Status       { return u.status }
func (u *User) CreatedAt() time.Time { return u.createdAt }
func (u *User) UpdatedAt() time.Time { return u.updatedAt }
```

### **Step 2: Domain Interface**

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
}
```

### **Step 3: Domain Errors**

```go
// internal/domain/user/errors.go
package user

import "errors"

var (
    ErrNotFound      = errors.New("user not found")
    ErrAlreadyExists = errors.New("user already exists")
)
```

### **Step 4: SQL Queries**

```sql
-- sql/queries/users.sql

-- name: InsertUser :exec
INSERT INTO users (id, email, name, status, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: GetUserByID :one
SELECT id, email, name, status, created_at, updated_at FROM users WHERE id = $1;

-- name: GetUserByEmail :one
SELECT id, email, name, status, created_at, updated_at FROM users WHERE email = $1;
```

### **Step 5: Repository Implementation**

```go
// internal/adapters/postgres/user_repo.go
package postgres

import (
    "context"
    "errors"
    "fmt"

    "myservice/internal/adapters/postgres/sqlcgen"
    "myservice/internal/domain/user"

    "github.com/jackc/pgx/v5"
    "github.com/jackc/pgx/v5/pgconn"
    "github.com/jackc/pgx/v5/pgxpool"
)

type UserRepo struct {
    pool    *pgxpool.Pool
    queries *sqlcgen.Queries
}

func NewUserRepo(pool *pgxpool.Pool) *UserRepo {
    return &UserRepo{pool: pool, queries: sqlcgen.New(pool)}
}

func (r *UserRepo) Create(ctx context.Context, u *user.User) error {
    err := r.queries.InsertUser(ctx, sqlcgen.InsertUserParams{
        ID: u.ID(), Email: u.Email(), Name: u.Name(),
        Status: string(u.Status()), CreatedAt: u.CreatedAt(), UpdatedAt: u.UpdatedAt(),
    })
    if err != nil {
        var pgErr *pgconn.PgError
        if errors.As(err, &pgErr) && pgErr.Code == "23505" {
            return user.ErrAlreadyExists
        }
        return fmt.Errorf("inserting user: %w", err)
    }
    return nil
}

func (r *UserRepo) GetByID(ctx context.Context, id uuid.UUID) (*user.User, error) {
    row, err := r.queries.GetUserByID(ctx, id)
    if err != nil {
        if errors.Is(err, pgx.ErrNoRows) {
            return nil, user.ErrNotFound
        }
        return nil, fmt.Errorf("querying user %s: %w", id, err)
    }
    status, _ := user.ParseStatus(row.Status)
    return user.Reconstitute(row.ID, row.Email, row.Name, status, row.CreatedAt, row.UpdatedAt), nil
}

func (r *UserRepo) GetByEmail(ctx context.Context, email string) (*user.User, error) {
    row, err := r.queries.GetUserByEmail(ctx, email)
    if err != nil {
        if errors.Is(err, pgx.ErrNoRows) {
            return nil, user.ErrNotFound
        }
        return nil, fmt.Errorf("querying user by email: %w", err)
    }
    status, _ := user.ParseStatus(row.Status)
    return user.Reconstitute(row.ID, row.Email, row.Name, status, row.CreatedAt, row.UpdatedAt), nil
}
```

### **Step 6: App Service + DTOs**

```go
// internal/app/user_service.go
package app

import (
    "context"
    "fmt"
    "time"

    "myservice/internal/domain/user"
    "github.com/google/uuid"
)

type UserService struct {
    users user.Repository
}

func NewUserService(users user.Repository) *UserService {
    return &UserService{users: users}
}

type CreateUserRequest struct {
    Email string
    Name  string
}

type UserDTO struct {
    ID        uuid.UUID
    Email     string
    Name      string
    Status    string
    CreatedAt time.Time
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

    return &UserDTO{
        ID: u.ID(), Email: u.Email(), Name: u.Name(),
        Status: string(u.Status()), CreatedAt: u.CreatedAt(),
    }, nil
}
```

### **Step 7: HTTP Handler**

```go
// internal/ports/http/user_handler.go
package http

import (
    "encoding/json"
    "errors"
    "log/slog"
    "net/http"

    "myservice/internal/app"
    "myservice/internal/domain/user"
)

type UserHandler struct {
    service *app.UserService
}

func NewUserHandler(service *app.UserService) *UserHandler {
    return &UserHandler{service: service}
}

func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
    var req struct {
        Email string `json:"email"`
        Name  string `json:"name"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
        return
    }

    dto, err := h.service.CreateUser(r.Context(), app.CreateUserRequest{
        Email: req.Email,
        Name:  req.Name,
    })
    if err != nil {
        switch {
        case errors.Is(err, user.ErrAlreadyExists):
            writeJSON(w, http.StatusConflict, map[string]string{"error": "user already exists"})
        default:
            slog.ErrorContext(r.Context(), "creating user", "error", err)
            writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
        }
        return
    }

    writeJSON(w, http.StatusCreated, map[string]any{
        "id":         dto.ID.String(),
        "email":      dto.Email,
        "name":       dto.Name,
        "status":     dto.Status,
        "created_at": dto.CreatedAt,
    })
}

func writeJSON(w http.ResponseWriter, status int, data any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}
```

### **Step 8: Tests**

```go
// internal/domain/user/entity_test.go
package user_test

import (
    "testing"
    "myservice/internal/domain/user"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestNewUser_Success(t *testing.T) {
    u, err := user.NewUser("alice@example.com", "Alice")
    require.NoError(t, err)
    assert.Equal(t, "alice@example.com", u.Email())
    assert.Equal(t, user.StatusActive, u.Status())
}

func TestNewUser_EmptyEmail(t *testing.T) {
    _, err := user.NewUser("", "Alice")
    require.Error(t, err)
}
```

---

## **Main Function Wiring**

### **cmd/server/main.go**

```go
package main

import (
    "context"
    "log"
    "log/slog"
    "net/http"
    "os/signal"
    "syscall"
    "time"

    "myservice/internal/adapters/config"
    "myservice/internal/adapters/logging"
    "myservice/internal/adapters/postgres"
    "myservice/internal/adapters/telemetry"
    "myservice/internal/app"
    httpport "myservice/internal/ports/http"
    "myservice/internal/ports/http/middleware"

    "github.com/go-chi/chi/v5"
    chimw "github.com/go-chi/chi/v5/middleware"
    "github.com/jackc/pgx/v5/pgxpool"
)

func main() {
    cfg := config.Load()
    logging.Setup(cfg.Environment, slog.LevelInfo)

    ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, syscall.SIGINT)
    defer stop()

    // Telemetry
    if cfg.Telemetry.Enabled {
        shutdown, err := telemetry.SetupTracer(ctx, "myservice", cfg.Environment)
        if err != nil {
            log.Fatalf("setting up tracer: %v", err)
        }
        defer shutdown(context.Background())
    }

    // Database
    pool, err := pgxpool.New(ctx, cfg.Database.URL)
    if err != nil {
        log.Fatalf("creating database pool: %v", err)
    }
    defer pool.Close()

    // Repositories
    userRepo := postgres.NewUserRepo(pool)

    // Services
    userService := app.NewUserService(userRepo)

    // Handlers
    userHandler := httpport.NewUserHandler(userService)
    healthHandler := httpport.NewHealthHandler(pool)

    // Router
    r := chi.NewRouter()
    r.Use(chimw.RequestID)
    r.Use(chimw.RealIP)
    r.Use(middleware.StructuredLogger)
    r.Use(middleware.Recoverer)

    r.Get("/livez", healthHandler.Liveness)
    r.Get("/readyz", healthHandler.Readiness)

    r.Route("/api/v1", func(r chi.Router) {
        r.Post("/users", userHandler.Create)
    })

    // Server
    srv := &http.Server{
        Addr:         ":" + cfg.Server.Port,
        Handler:      r,
        ReadTimeout:  time.Duration(cfg.Server.ReadTimeout) * time.Second,
        WriteTimeout: time.Duration(cfg.Server.WriteTimeout) * time.Second,
    }

    // Start
    go func() {
        slog.Info("server starting", "port", cfg.Server.Port)
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("server error: %v", err)
        }
    }()

    // Wait for shutdown signal
    <-ctx.Done()
    slog.Info("shutdown signal received")

    // Graceful shutdown
    healthHandler.SetReady(false)

    shutdownCtx, cancel := context.WithTimeout(context.Background(), time.Duration(cfg.Server.ShutdownTimeout)*time.Second)
    defer cancel()

    if err := srv.Shutdown(shutdownCtx); err != nil {
        slog.Error("server shutdown error", "error", err)
    }

    slog.Info("server stopped")
}
```

---

## **Graceful Shutdown**

### **The Pattern**

```
1. signal.NotifyContext(SIGTERM, SIGINT)
2. Start HTTP server in goroutine
3. <-ctx.Done()  (wait for signal)
4. Set readiness to false (drain traffic)
5. srv.Shutdown(timeoutCtx) (finish in-flight requests)
6. Close resources in reverse order (pool, telemetry)
```

### **Why It Matters**

- Kubernetes sends SIGTERM before killing pods
- In-flight requests complete instead of being dropped
- Load balancers stop sending traffic before the pod terminates
- Database connections are properly returned to the pool

---

## **Dockerfile**

### **Multi-Stage Production Build**

```dockerfile
# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /server ./cmd/server

# Runtime stage
FROM gcr.io/distroless/static:nonroot

COPY --from=builder /server /server
COPY configs/config.yaml /configs/config.yaml

USER nonroot:nonroot

EXPOSE 8080

ENTRYPOINT ["/server"]
```

### **Key Points**

- **~5-7 MB final image** with distroless
- `CGO_ENABLED=0` produces a static binary
- `-trimpath` removes local paths from binary
- `-ldflags="-s -w"` strips debug info and symbol table
- `nonroot` user for security
- Copy `go.mod`/`go.sum` first for Docker layer caching

### **Development Dockerfile**

```dockerfile
# Dockerfile.dev
FROM golang:1.24-alpine

RUN go install github.com/air-verse/air@latest

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .

EXPOSE 8080

CMD ["air", "-c", ".air.toml"]
```

---

## **Docker Compose**

### **compose.yml**

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "8080:8080"
    volumes:
      - .:/app
    environment:
      APP_ENVIRONMENT: development
      APP_SERVER_PORT: "8080"
      APP_DATABASE_URL: "postgres://myservice:myservice@postgres:5432/myservice?sslmode=disable"
      APP_LOG_DEBUG: "true"
    depends_on:
      postgres:
        condition: service_healthy
      migrate:
        condition: service_completed_successfully

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: myservice
      POSTGRES_PASSWORD: myservice
      POSTGRES_DB: myservice
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U myservice"]
      interval: 5s
      timeout: 5s
      retries: 5

  migrate:
    build:
      context: .
      dockerfile: Dockerfile.dev
    command: ["go", "tool", "goose", "-dir", "internal/adapters/postgres/migrations", "postgres", "postgres://myservice:myservice@postgres:5432/myservice?sslmode=disable", "up"]
    depends_on:
      postgres:
        condition: service_healthy

  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    ports:
      - "4317:4317"    # OTLP gRPC
      - "4318:4318"    # OTLP HTTP
    volumes:
      - ./configs/otel-collector.yaml:/etc/otelcol-contrib/config.yaml

volumes:
  pgdata:
```

---

## **Live Reload Development**

### **.air.toml**

```toml
root = "."
tmp_dir = "tmp"

[build]
  cmd = "go build -o ./tmp/server ./cmd/server"
  bin = "./tmp/server"
  include_ext = ["go", "yaml", "sql"]
  exclude_dir = ["tmp", "vendor", "node_modules"]
  delay = 1000

[log]
  time = false

[misc]
  clean_on_exit = true
```

### **Usage**

```bash
# Direct
go tool air -c .air.toml

# Via Makefile
make dev

# Via Docker Compose
docker compose up
```

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./clean-architecture.md` - Architecture overview
- `./api-layer.md` - Router and handler details
- `./repository-pattern.md` - Database access
- `./configuration.md` - Config management
- `./testing-guide.md` - Testing strategies
