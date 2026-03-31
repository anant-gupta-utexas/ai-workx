# 021BE-GO - Go Backend Development Plugin

Go/Chi Clean Architecture backend development guidelines with comprehensive patterns for building scalable, maintainable backend applications in Go.

## What's Included

### Skills (1)
- **backend-dev-guidelines** - Go/Chi Clean Architecture with domain entities, services, repositories, and infrastructure patterns (sqlc + pgx)

### Commands (0)
> Reuse the **dev-docs-be** command from the [021BE plugin](../021BE/) for creating technical requirement specifications.

## Tech Stack Support

### Backend
- Go 1.24+
- Chi router (stdlib-compatible)
- sqlc + pgx (type-safe SQL, native PostgreSQL driver)
- koanf (configuration management)
- slog + OpenTelemetry (observability)
- testify + mockery (testing)
- Clean Architecture / DDD principles

## Installation

```bash
# From your project directory
/plugin install 021BE-GO@claude-workspace-plugins
```

## How the Skill Activates

The backend-dev-guidelines skill activates automatically in two ways:

### 1. File-Based Activation
When you edit files matching these patterns:
- `internal/domain/**/*.go`
- `internal/app/**/*.go`
- `internal/ports/**/*.go`
- `internal/adapters/**/*.go`
- `cmd/**/*.go`

### 2. Keyword-Based Activation
When your prompts contain these keywords:
- `go backend guidelines`, `go backend best practices`
- `domain-driven design`, `clean architecture`
- `use case`, `repository pattern`, `infrastructure layer`
- `chi router`, `sqlc`, `pgx`, `koanf`
- `go service`, `go handler`

### Customizing File Patterns

If your project structure differs, edit `.claude/skills/skill-rules.json`:

```json
{
  "skills": {
    "backend-dev-guidelines": {
      "fileTriggers": {
        "pathPatterns": [
          "internal/**/*.go",
          "pkg/**/*.go"
        ]
      }
    }
  }
}
```

## Usage Examples

### Backend Development

**Example prompts:**
```bash
"Following go backend guidelines, create a new user registration endpoint"
"Using repository pattern with sqlc, implement orders repository"
"Following go backend best practices, add validation to my domain entity"
"How do I structure domain entities for an e-commerce system in Go?"
```

### Using Commands

Use the backend TRS command from the 021BE plugin:

```bash
# Create technical requirement specification for a feature
/dev-docs-be refactor authentication system
/dev-docs-be implement order processing microservice
/dev-docs-be build gRPC notification service
```

## Skill Details

### Backend Dev Guidelines

**Focus:** Go/Chi Clean Architecture with DDD

**Key Topics:**
- Domain layer (entities with unexported fields, value objects, interfaces)
- Application layer (services, DTOs, CQRS as advanced pattern)
- API layer (Chi router, HTTP handlers, middleware)
- Repository pattern with sqlc + pgx
- Closure-based transactions
- Validation (constructor functions, go-playground/validator)
- Error handling (domain errors, sentinel errors, boundary translation)
- Observability with slog + OpenTelemetry
- Configuration with koanf
- Middleware patterns (auth, logging, recovery)
- Testing (testify, mockery, testcontainers-go, table-driven tests)
- gRPC with buf and connect-go
- Docker (multi-stage distroless builds, graceful shutdown)

**Resources:** 13 comprehensive guides covering:
1. Clean Architecture overview (cmd/ + internal/ layout)
2. Domain layer patterns
3. Application layer patterns
4. API layer implementation (Chi)
5. Repository pattern (sqlc + pgx)
6. Validation patterns
7. Observability (slog + OpenTelemetry)
8. Configuration & tooling (koanf, Makefile, golangci-lint)
9. Error handling
10. Testing guide
11. Middleware guide
12. Complete examples (Dockerfile, graceful shutdown)
13. gRPC guide (buf, connect-go)

## Perfect For

- Go backend development
- Clean Architecture projects in Go
- Domain-driven design with Go idioms
- Scalable API development (HTTP + gRPC)
- Learning Go Clean Architecture patterns
- Building maintainable Go backend systems

## Not Designed For

- Non-Go backends
- Monolithic architecture without layers
- Frontend development
- DevOps/infrastructure

## Resources & Documentation

The backend-dev-guidelines skill includes 13 detailed resource files covering:
- Go project layout and Clean Architecture
- Domain modeling with unexported fields and constructors
- Service and use case implementation patterns
- Repository pattern with sqlc + pgx
- Chi router and HTTP handler structure
- Validation strategies (domain + API)
- Error handling and observability
- Comprehensive testing approaches
- gRPC service patterns
- Production deployment (Docker, graceful shutdown)

## License

MIT

---

**Build clean, maintainable Go backends!**
