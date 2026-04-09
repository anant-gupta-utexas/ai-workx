---
name: backend-go-dev-guidelines
description: Comprehensive backend development guide for Go/Chi Clean Architecture projects. Use when working with domain entities, services, repositories, HTTP handlers, or implementing Clean Architecture layers in Go. Covers Domain-Application-Ports-Adapters separation, constructor-based dependency injection, sqlc + pgx database access, koanf configuration, slog + OpenTelemetry observability, and testing with testify and mockery.
---

# **Backend Go Development Guidelines**

## **Purpose**

Establish consistency and best practices for Go applications following **Clean Architecture** principles with Chi router, sqlc + pgx, and idiomatic Go patterns.

## **When to Use This Skill**

Automatically activates when working on:

- Creating domain entities, value objects, or domain services in Go
- Implementing services and application logic
- Building repositories with sqlc + pgx
- Creating or modifying HTTP handlers and Chi routes
- Implementing middleware (logging, auth, recovery)
- Database operations with pgx and sqlc-generated code
- Observability with slog and OpenTelemetry
- Configuration management with koanf
- Backend testing with testify, mockery, and testcontainers-go
- gRPC services with buf and connect-go

---

## **Quick Start**

### **New Feature Checklist**

- [ ]  **Domain Entity**: Unexported fields, constructor with validation
- [ ]  **Domain Interface**: Repository interface defined where consumed
- [ ]  **Service**: Orchestrate domain logic, accept interfaces
- [ ]  **DTO Struct**: Plain structs for application boundary data transfer
- [ ]  **Repository**: Implement domain interface with sqlc + pgx
- [ ]  **HTTP Handler**: Chi route with JSON request/response encoding
- [ ]  **Tests**: Unit (domain) + Service (mocked) + Integration (testcontainers)
- [ ]  **Config**: koanf struct with validation

### **New Project Checklist**

- [ ]  Directory structure with `cmd/` + `internal/` (see `./resources/clean-architecture.md`)
- [ ]  Go modules with `tool` directive for dev tools (Go 1.24+)
- [ ]  Makefile with standard targets (build, test, lint, generate)
- [ ]  koanf configuration with YAML + env var overrides
- [ ]  slog + OpenTelemetry setup for observability
- [ ]  sqlc + pgx for type-safe database access
- [ ]  Chi router with middleware stack
- [ ]  golangci-lint v2 configuration
- [ ]  Multi-stage Dockerfile with distroless runtime
- [ ]  Graceful shutdown with `signal.NotifyContext`

---

## **Architecture at a Glance**

**Clean Architecture** with 4 packages inside `internal/` (Dependency Rule: inward flow)

```
Adapters → Ports → App → Domain
```

- **Domain** (`internal/domain/`): Pure business logic, zero external dependencies
- **App** (`internal/app/`): Services, DTOs, orchestration
- **Ports** (`internal/ports/`): Inbound adapters — HTTP handlers, gRPC servers
- **Adapters** (`internal/adapters/`): Outbound implementations — repositories, external clients

See `./resources/clean-architecture.md` for structure and naming conventions.

---

## **Core Principles (7 Rules)**

1. **Domain has zero dependencies** — Pure business logic, no imports from app/ports/adapters
2. **Unexported fields + constructors** — Enforce invariants via `New*()` functions, not exported struct fields
3. **Interfaces at the consumer** — Define repository interfaces in domain, implement in adapters
4. **sqlc for database access** — Type-safe SQL, no ORM magic
5. **koanf for configuration, never `os.Getenv`** — Structured config with YAML + env overrides
6. **Constructor injection always** — Pass dependencies via `New*()`, not package globals
7. **slog + OpenTelemetry for observability** — Structured logging with trace correlation

See resource files for code examples and implementation details.

---

## **Tech Stack**

| Category | Technology |
| --- | --- |
| Language | Go 1.24+ |
| Router | Chi v5 (stdlib `net/http` compatible) |
| Database | sqlc + pgx v5 (PostgreSQL) |
| Validation | Constructor functions + go-playground/validator |
| Config | koanf (YAML + env vars) |
| Observability | slog + OpenTelemetry |
| Testing | testify + mockery + testcontainers-go |
| Linting | golangci-lint v2 |
| Build | Makefile |
| DI | Manual constructor injection (Wire for advanced) |

See `./resources/configuration.md` for setup details and tool management.

---

## **Anti-Patterns to Avoid**

- ❌ Exported domain struct fields (use unexported + getters/constructors)
- ❌ Direct `os.Getenv()` usage (use koanf)
- ❌ Business logic in HTTP handlers
- ❌ `log.Fatal()` or `os.Exit()` outside `main()`
- ❌ Raw SQL strings without sqlc
- ❌ Package-level global state for dependencies
- ❌ Defining interfaces at the implementation side (define at consumer)
- ❌ Using GORM or other ORMs (prefer sqlc + pgx for explicit SQL)
- ❌ Using Viper for configuration (use koanf — smaller binary, respects casing)
- ❌ `panic()` for recoverable errors (only acceptable for invalid config at startup)
- ❌ Putting `*sql.Tx` in `context.Context` (use closure-based transactions)
- ❌ Committing `go.work` to version control
- ⚠️ Prefer `errors.Join()` over `multierr` for multi-error aggregation (stdlib, Go 1.20+)

---

## **Documentation Standards**

When completing a backend feature or task, maintain documentation in `/dev/` using only:

| File | Purpose |
| --- | --- |
| `README.md` | Project index, overview, setup, handoff notes for next developer |
| `[feature-name]-plan.md` | Implementation strategy and approach |
| `[feature-name]-task.md` | Task checklist with completed/pending items |
| `[feature-name]-context.md` | Current state, decisions, blockers, next steps |
| `session-log.md` | Session notes and progress updates |

**Guidelines:**
- Update after session completion
- Keep concise — document decisions, not obvious details
- Update `[feature-name]-context.md` with current implementation state and blockers
- Mark tasks complete in `[feature-name]-task.md` immediately upon completion
- Update `README.md` with handoff notes for next developer

---

## **Resource Navigation**

| Need to... | Read this |
| --- | --- |
| Understand architecture & project layout | `./resources/clean-architecture.md` |
| Build domain entities & services | `./resources/domain-layer.md` |
| Implement services & application layer | `./resources/application-layer.md` |
| Create HTTP handlers & Chi routes | `./resources/api-layer.md` |
| Design repositories with sqlc + pgx | `./resources/repository-pattern.md` |
| Validate data (domain & API) | `./resources/validation-patterns.md` |
| Add tracing & structured logging | `./resources/observability.md` |
| Setup config, tooling & dependencies | `./resources/configuration.md` |
| Handle errors idiomatically | `./resources/error-handling.md` |
| Write tests with testify & mockery | `./resources/testing-guide.md` |
| Build middleware (auth, logging, recovery) | `./resources/middleware-guide.md` |
| See full feature examples & deployment | `./resources/complete-examples.md` |
| Build gRPC services with buf | `./resources/grpc-guide.md` |

---
