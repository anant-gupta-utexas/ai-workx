# **Repository Pattern - sqlc + pgx**

Complete guide to implementing the Repository pattern with sqlc and pgx in Go Clean Architecture.

## **Table of Contents**

- [Purpose and Rules](#purpose-and-rules)
- [sqlc Configuration](#sqlc-configuration)
- [SQL Queries](#sql-queries)
- [Repository Implementation](#repository-implementation)
- [Closure-Based Transactions](#closure-based-transactions)
- [Connection Pooling](#connection-pooling)
- [Migrations](#migrations)
- [Best Practices](#best-practices)

---

## **Purpose and Rules**

### **Why sqlc + pgx?**

- **sqlc**: Generates type-safe Go code from SQL queries — zero runtime overhead, compile-time SQL validation
- **pgx**: Fastest PostgreSQL driver with native type support (JSONB, arrays, composite types), 30-50% faster than database/sql
- **SQL-first**: Write explicit SQL, get type-safe code — no ORM magic or runtime reflection

**Location**: `internal/adapters/postgres/`

**Rules**:
- ✅ Implements domain repository interfaces
- ✅ Uses sqlc-generated code for queries
- ✅ Converts between sqlc models and domain entities
- ✅ Handles connection pooling and transactions
- ❌ No business logic (that belongs in domain)
- ❌ Never expose pgx types to domain or app layers

---

## **sqlc Configuration**

### **sqlc.yaml**

```yaml
# sqlc.yaml (project root)
version: "2"
sql:
  - engine: "postgresql"
    queries: "sql/queries/"
    schema: "internal/adapters/postgres/migrations/"
    gen:
      go:
        package: "sqlcgen"
        out: "internal/adapters/postgres/sqlcgen"
        sql_package: "pgx/v5"
        emit_json_tags: true
        emit_empty_slices: true
        emit_pointers_for_null_types: true
        overrides:
          - db_type: "uuid"
            go_type:
              import: "github.com/google/uuid"
              type: "UUID"
          - db_type: "timestamptz"
            go_type: "time.Time"
```

### **Generate Code**

```bash
# Install sqlc (via Go 1.24 tool directive)
go get -tool github.com/sqlc-dev/sqlc/cmd/sqlc@latest

# Generate
go tool sqlc generate

# Or via Makefile
make generate
```

---

## **SQL Queries**

### **Query File Convention**

One file per domain entity. Use sqlc annotations to name generated functions.

```sql
-- sql/queries/users.sql

-- name: InsertUser :exec
INSERT INTO users (id, email, name, status, role, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: GetUserByID :one
SELECT id, email, name, status, role, created_at, updated_at
FROM users
WHERE id = $1;

-- name: GetUserByEmail :one
SELECT id, email, name, status, role, created_at, updated_at
FROM users
WHERE email = $1;

-- name: UpdateUser :exec
UPDATE users
SET name = $2, status = $3, role = $4, updated_at = $5
WHERE id = $1;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;

-- name: ListActiveUsers :many
SELECT id, email, name, status, role, created_at, updated_at
FROM users
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;
```

```sql
-- sql/queries/orders.sql

-- name: InsertOrder :exec
INSERT INTO orders (id, user_id, status, total_cents, currency, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: GetOrderByID :one
SELECT id, user_id, status, total_cents, currency, created_at, updated_at
FROM orders
WHERE id = $1;

-- name: GetOrderByIDForUpdate :one
SELECT id, user_id, status, total_cents, currency, created_at, updated_at
FROM orders
WHERE id = $1
FOR UPDATE;

-- name: UpdateOrderStatus :exec
UPDATE orders SET status = $2, updated_at = $3 WHERE id = $1;

-- name: ListOrdersByUser :many
SELECT id, user_id, status, total_cents, currency, created_at, updated_at
FROM orders
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

### **sqlc Annotation Reference**

| Annotation | Returns | Use When |
| --- | --- | --- |
| `:exec` | `error` | INSERT, UPDATE, DELETE with no return |
| `:one` | `(Row, error)` | SELECT expecting exactly one row |
| `:many` | `([]Row, error)` | SELECT expecting multiple rows |
| `:execrows` | `(int64, error)` | Need affected row count |
| `:execresult` | `(pgconn.CommandTag, error)` | Need full command result |

---

## **Repository Implementation**

### **User Repository**

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
        Role:      string(u.Role()),
        CreatedAt: u.CreatedAt(),
        UpdatedAt: u.UpdatedAt(),
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
    return reconstitute(row), nil
}

func (r *UserRepo) GetByEmail(ctx context.Context, email string) (*user.User, error) {
    row, err := r.queries.GetUserByEmail(ctx, email)
    if err != nil {
        if errors.Is(err, pgx.ErrNoRows) {
            return nil, user.ErrNotFound
        }
        return nil, fmt.Errorf("querying user by email: %w", err)
    }
    return reconstitute(row), nil
}

func (r *UserRepo) Update(ctx context.Context, u *user.User) error {
    err := r.queries.UpdateUser(ctx, sqlcgen.UpdateUserParams{
        ID:        u.ID(),
        Name:      u.Name(),
        Status:    string(u.Status()),
        Role:      string(u.Role()),
        UpdatedAt: u.UpdatedAt(),
    })
    if err != nil {
        return fmt.Errorf("updating user %s: %w", u.ID(), err)
    }
    return nil
}

func (r *UserRepo) Delete(ctx context.Context, id uuid.UUID) error {
    err := r.queries.DeleteUser(ctx, id)
    if err != nil {
        return fmt.Errorf("deleting user %s: %w", id, err)
    }
    return nil
}

func (r *UserRepo) ListActive(ctx context.Context, limit, offset int) ([]*user.User, error) {
    rows, err := r.queries.ListActiveUsers(ctx, sqlcgen.ListActiveUsersParams{
        Limit:  int32(limit),
        Offset: int32(offset),
    })
    if err != nil {
        return nil, fmt.Errorf("listing active users: %w", err)
    }

    users := make([]*user.User, len(rows))
    for i, row := range rows {
        users[i] = reconstitute(row)
    }
    return users, nil
}

// reconstitute maps a sqlc row to a domain entity
func reconstitute(row sqlcgen.User) *user.User {
    status, _ := user.ParseStatus(row.Status)
    role := user.Role(row.Role)
    return user.Reconstitute(row.ID, row.Email, row.Name, status, role, row.CreatedAt, row.UpdatedAt)
}
```

### **Key Pattern: Infrastructure Error Translation**

Repositories translate infrastructure errors into domain errors:

| pgx / PostgreSQL Error | Domain Error |
| --- | --- |
| `pgx.ErrNoRows` | `user.ErrNotFound` |
| `pgconn.PgError` code `23505` (unique violation) | `user.ErrAlreadyExists` |
| Other database errors | Wrapped with `fmt.Errorf` context |

---

## **Closure-Based Transactions**

### **The Pattern**

The closure-based transaction pattern keeps `BEGIN`/`COMMIT`/`ROLLBACK` invisible to the domain and application layers. The repository interface accepts an update function:

```go
// internal/domain/order/repository.go (interface)
type Repository interface {
    // ...
    UpdateInTx(ctx context.Context, id uuid.UUID, fn func(*Order) error) error
}
```

### **Implementation**

```go
// internal/adapters/postgres/order_repo.go
func (r *OrderRepo) UpdateInTx(ctx context.Context, id uuid.UUID, fn func(*order.Order) error) error {
    tx, err := r.pool.Begin(ctx)
    if err != nil {
        return fmt.Errorf("beginning transaction: %w", err)
    }
    defer tx.Rollback(ctx)

    qtx := r.queries.WithTx(tx)

    // SELECT ... FOR UPDATE inside the transaction
    row, err := qtx.GetOrderByIDForUpdate(ctx, id)
    if err != nil {
        if errors.Is(err, pgx.ErrNoRows) {
            return order.ErrNotFound
        }
        return fmt.Errorf("selecting order for update: %w", err)
    }

    o := reconstitute(row)

    // Execute pure domain logic
    if err := fn(o); err != nil {
        return err
    }

    // Persist changes
    err = qtx.UpdateOrderStatus(ctx, sqlcgen.UpdateOrderStatusParams{
        ID:        o.ID(),
        Status:    string(o.Status()),
        UpdatedAt: o.UpdatedAt(),
    })
    if err != nil {
        return fmt.Errorf("updating order: %w", err)
    }

    return tx.Commit(ctx)
}
```

### **Usage in Service**

```go
// Application layer — no transaction awareness
func (s *OrderService) CancelOrder(ctx context.Context, orderID uuid.UUID) error {
    return s.orders.UpdateInTx(ctx, orderID, func(o *order.Order) error {
        return o.Cancel()
    })
}
```

### **Cross-Repository Transactions**

For operations spanning multiple repositories, use a transaction provider:

```go
// internal/adapters/postgres/txmanager.go
package postgres

import (
    "context"
    "fmt"

    "github.com/jackc/pgx/v5/pgxpool"
)

type TxManager struct {
    pool *pgxpool.Pool
}

func NewTxManager(pool *pgxpool.Pool) *TxManager {
    return &TxManager{pool: pool}
}

func (m *TxManager) RunInTx(ctx context.Context, fn func(ctx context.Context, tx pgx.Tx) error) error {
    tx, err := m.pool.Begin(ctx)
    if err != nil {
        return fmt.Errorf("beginning transaction: %w", err)
    }
    defer tx.Rollback(ctx)

    if err := fn(ctx, tx); err != nil {
        return err
    }
    return tx.Commit(ctx)
}
```

---

## **Connection Pooling**

### **Pool Configuration**

Create **one `pgxpool.Pool` per application** and pass it to all repository constructors:

```go
// cmd/server/main.go (excerpt)
func newPool(ctx context.Context, cfg config.Database) (*pgxpool.Pool, error) {
    poolCfg, err := pgxpool.ParseConfig(cfg.URL)
    if err != nil {
        return nil, fmt.Errorf("parsing pool config: %w", err)
    }

    poolCfg.MaxConns = int32(cfg.MaxConns)
    poolCfg.MinConns = int32(cfg.MinConns)
    poolCfg.MaxConnLifetime = time.Hour
    poolCfg.MaxConnIdleTime = 30 * time.Minute
    poolCfg.HealthCheckPeriod = time.Minute

    pool, err := pgxpool.NewWithConfig(ctx, poolCfg)
    if err != nil {
        return nil, fmt.Errorf("creating pool: %w", err)
    }

    if err := pool.Ping(ctx); err != nil {
        return nil, fmt.Errorf("pinging database: %w", err)
    }

    return pool, nil
}
```

### **Pool Sizing**

- Set `MaxConns` to `(database max_connections) / (number of app instances)`
- Start with 10-25 for most services
- Monitor with `pool.Stat()` and adjust

---

## **Migrations**

### **goose with Embedded SQL**

Embed migration files in the binary for production deployment:

```go
// internal/adapters/postgres/migrations/embed.go
package migrations

import "embed"

//go:embed *.sql
var FS embed.FS
```

```sql
-- internal/adapters/postgres/migrations/001_create_users.sql

-- +goose Up
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_status ON users (status);

-- +goose Down
DROP TABLE IF EXISTS users;
```

### **Run Migrations on Startup**

```go
import (
    "github.com/pressly/goose/v3"
    "myservice/internal/adapters/postgres/migrations"
)

func runMigrations(dbURL string) error {
    db, err := sql.Open("pgx", dbURL)
    if err != nil {
        return err
    }
    defer db.Close()

    goose.SetBaseFS(migrations.FS)
    return goose.Up(db, ".")
}
```

---

## **Best Practices**

### **1. Always Translate Errors**

```go
// ✅ GOOD: Translate pgx errors to domain errors
if errors.Is(err, pgx.ErrNoRows) {
    return nil, user.ErrNotFound
}

// ❌ BAD: Expose pgx errors to domain
return nil, err
```

### **2. Use Reconstitute for Entity Rebuilding**

```go
// ✅ GOOD: Use Reconstitute (no validation on read)
return user.Reconstitute(row.ID, row.Email, ...)

// ❌ BAD: Use NewUser (re-validates, may reject historical data)
return user.NewUser(row.Email, row.Name)
```

### **3. Never Expose sqlc Types**

```go
// ✅ GOOD: Return domain entities
func (r *UserRepo) GetByID(...) (*user.User, error)

// ❌ BAD: Return sqlc-generated types
func (r *UserRepo) GetByID(...) (*sqlcgen.User, error)
```

### **4. Prefer sqlc Over Raw pgx Queries**

```go
// ✅ GOOD: sqlc-generated, type-safe
row, err := r.queries.GetUserByID(ctx, id)

// ❌ BAD: Raw query string
err := r.pool.QueryRow(ctx, "SELECT * FROM users WHERE id = $1", id).Scan(...)
```

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./clean-architecture.md` - Architecture overview
- `./domain-layer.md` - Domain interfaces
- `./application-layer.md` - Using repositories in services
- `./error-handling.md` - Error translation patterns
