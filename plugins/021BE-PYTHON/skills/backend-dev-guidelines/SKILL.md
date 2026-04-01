---
name: backend-python-dev-guidelines
description: Comprehensive backend development guide for Python/FastAPI Clean Architecture projects. Use when working with domain entities, use cases, repositories, API routes, or implementing Clean Architecture layers. Covers Domain-Application-Infrastructure separation, dependency injection, async patterns, OpenTelemetry observability, Pydantic validation, and modern Python testing with pytest.
---

# **Backend Python Development Guidelines**

## **Purpose**

Establish consistency and best practices for Python/FastAPI applications following **Clean Architecture** principles.

## **When to Use This Skill**

Automatically activates when working on:

- Creating domain entities, value objects, or domain services
- Implementing use cases and application services
- Building repositories and infrastructure adapters
- Creating or modifying API routes and endpoints
- Implementing middleware (logging, context, error handling)
- Database operations with SQLAlchemy
- Observability with OpenTelemetry
- Input validation with Pydantic (API layer)
- Configuration management with Pydantic Settings
- Backend testing with pytest

---

## **Quick Start**

### **New Feature Checklist**

- [ ]  **Domain Entity**: Pure business logic, no dependencies
- [ ]  **Domain Interface**: Abstract repository/gateway contract
- [ ]  **Use Case**: Orchestrate domain logic
- [ ]  **DTO**: Application boundary data transfer (dataclass)
- [ ]  **Repository**: Implement domain interface
- [ ]  **API Route**: FastAPI endpoint with Pydantic validation
- [ ]  **Tests**: Unit (domain) + Use Case + Integration tests
- [ ]  **Config**: Use Pydantic Settings

### **New Project Checklist**

- [ ]  Directory structure (see `./resources/clean-architecture.md`)
- [ ]  `uv` for dependency management with dependency groups
- [ ]  Pydantic Settings for configuration
- [ ]  OpenTelemetry setup for observability
- [ ]  Base repository pattern with generics
- [ ]  Middleware stack (logging, context, errors)
- [ ]  pytest framework with custom markers

---

## **Architecture at a Glance**

**Clean Architecture** with 3 layers (Dependency Rule: inward flow)

```
Infrastructure → Application → Domain
```

- **Domain**: Pure business logic, zero external dependencies
- **Application**: Use cases, services, dataclass DTOs
- **Infrastructure**: API routes (FastAPI), repositories, adapters

See `./resources/clean-architecture.md` for structure and naming conventions.

---

## **Core Principles (7 Rules)**

1. **Domain has zero dependencies** - Pure business logic only
2. **Dataclasses for DTOs** - Application layer data transfer objects
3. **Pydantic for API validation** - Infrastructure layer request/response models
4. **OpenTelemetry for observability** - Tracing, logging, metrics
5. **Pydantic Settings, never os.environ** - Centralized configuration
6. **Dependency injection always** - FastAPI Depends(), not global state
7. **Generic base repository pattern** - Reusable async database access

See resource files for code examples and implementation details.

---

## **Tech Stack**

| Category | Technology |
| --- | --- |
| Framework | FastAPI |
| Language | Python 3.13+ (type syntax: `str \| None`) |
| Database | SQLAlchemy 2.0+ (async) |
| Validation | Pydantic 2.8+ |
| Config | Pydantic Settings |
| Observability | OpenTelemetry |
| Testing | pytest + pytest-asyncio |
| Package Manager | uv |

See `./resources/configuration.md` for setup details and dependency groups.

---

## **Anti-Patterns to Avoid**

- ❌ Domain layer importing from Application or Infrastructure
- ❌ Direct os.environ usage (use Pydantic Settings)
- ❌ Business logic in API routes
- ❌ Pydantic models in Application layer (use dataclasses)
- ❌ Missing error handling and logging
- ❌ No type hints
- ❌ Synchronous database operations
- ❌ Using Sentry (use OpenTelemetry)
- ❌ Not using generic base repository
- ❌ Tests without pytest markers
- ❌ Using Pydantic V1
- ⚠️ Prefer `str | None` over `Optional[str]` (both work, modern syntax preferred)

---

## **Documentation Standards**

When completing a frontend feature or task, maintain documentation in `/dev/` using only:

| File | Purpose |
| --- | --- |
| `README.md` | Project index, overview, setup, handoff notes for next developer |
| `[feature-name]-plan.md` | Implementation strategy and approach |
| `[feature-name]-task.md` | Task checklist with completed/pending items |
| `[feature-name]-context.md` | Current state, decisions, blockers, next steps |
| `session-log.md` | Session notes and progress updates |

**Guidelines:**
- Update after session completion
- Keep concise—document decisions, not obvious details
- Update `[feature-name]-context.md` with current implementation state and blockers
- Mark tasks complete in `[feature-name]-task.md` immediately upon completion
- Update `README.md` with handoff notes for next developer

---

## **Resource Navigation**

| Need to... | Read this |
| --- | --- |
| Understand architecture & structure | `./resources/clean-architecture.md` |
| Build domain entities & services | `./resources/domain-layer.md` |
| Implement use cases & application layer | `./resources/application-layer.md` |
| Create API routes & endpoints | `./resources/api-layer.md` |
| Design repositories & database access | `./resources/repository-pattern.md` |
| Validate data (Pydantic & domain) | `./resources/validation-patterns.md` |
| Add tracing & logging | `./resources/observability.md` |
| Setup config & dependencies | `./resources/configuration.md` |
| Handle async, errors, exceptions | `./resources/async-and-errors.md` |
| Write tests with pytest | `./resources/testing-guide.md` |
| See full feature examples | `./resources/complete-examples.md` |

---
