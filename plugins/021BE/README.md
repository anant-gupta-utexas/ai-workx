# 021BE - Backend Development Plugin

Python/FastAPI Clean Architecture backend development guidelines with comprehensive patterns for building scalable, maintainable backend applications.

## What's Included

### Skills (1)
- **backend-dev-guidelines** - Python/FastAPI Clean Architecture with domain entities, use cases, repositories, and infrastructure patterns

### Commands (1)
- **dev-docs-be** - Create comprehensive technical requirement specifications (TRS) for backend features with structured task breakdown

## Tech Stack Support

### Backend
- Python 3.13+
- FastAPI framework
- Pydantic 2.8.0+
- SQLAlchemy 2.0+ (optional)
- Clean Architecture principles

## Installation

```bash
# From your project directory
/plugin install 021BE@claude-workspace-plugins
```

## How the Skill Activates

The backend-dev-guidelines skill activates automatically in two ways:

### 1. File-Based Activation
When you edit files matching these patterns:
- `src/application/**/*.py`
- `src/domain/**/*.py`
- `src/infrastructure/**/*.py`

### 2. Keyword-Based Activation
When your prompts contain these keywords:
- `backend guidelines`, `backend best practices`
- `domain-driven design`
- `use case`, `repository pattern`, `infrastructure layer`
- `FastAPI`, `Pydantic`, `SQLAlchemy`

### Customizing File Patterns

If your project structure differs, update the skill's SKILL.md description to include your project-specific paths and keywords.

## Usage Examples

### Backend Development

**Example prompts:**
```bash
"Following backend guidelines, create a new user registration endpoint"
"Using repository pattern, implement orders repository"
"Following backend best practices, add validation to my Pydantic model"
"How do I structure domain entities for an e-commerce system?"
```

### Using Commands

Use commands for project planning and documentation:

```bash
# Create technical requirement specification for a feature
/dev-docs-be refactor authentication system
/dev-docs-be implement microservices architecture
/dev-docs-be build order processing system
```

The command will:
1. Analyze your request and examine relevant docs (PRD, TRD)
2. Ask clarifying questions if needed
3. Create a comprehensive TRS with implementation phases
4. Generate task management files in `dev/active/[task-name]/`

## Skill Details

### Backend Dev Guidelines

**Focus:** Python/FastAPI Clean Architecture

**Key Topics:**
- Domain layer (entities, value objects)
- Application layer (use cases, DTOs)
- API layer (FastAPI endpoints, dependencies)
- Repository pattern and data access
- Validation with Pydantic/Dataclasses
- Error handling and observability
- Middleware patterns
- Testing strategies (unit, integration, e2e)
- Complete implementation examples

**Resources:** 12 comprehensive guides covering:
1. Clean Architecture overview
2. Domain layer patterns
3. Application layer patterns
4. API layer implementation
5. Repository pattern
6. Infrastructure layer
7. Middleware guide
8. Error handling
9. Validation patterns
10. Testing guide
11. Observability
12. Complete examples

## Command Details

### dev-docs-be

**Purpose:** Create comprehensive Technical Requirement Specifications (TRS) for backend features

**What it generates:**
- **Overview & Scope** - Feature boundaries and objectives
- **Requirements Summary** - Functional and non-functional requirements
- **Detailed Component Design** - Classes/modules structure, method signatures, data structures
- **API Specifications** - Endpoint definitions, request/response schemas, error handling, rate limiting
- **Database Design** - Schema details, data access patterns, migration strategy
- **Algorithm & Logic Design** - Pseudocode for complex operations
- **Error Handling & Edge Cases** - Failure scenarios, retry strategies, fallback mechanisms
- **Security Considerations** - Input validation, authorization, data sanitization
- **Testing Strategy** - Unit tests, test data, mocking strategies, coverage expectations
- **Implementation Phases** - Structured tasks with acceptance criteria and file specifications

**Output files** (in `dev/active/[task-name]/`):
- `[task-name]-plan.md` - Comprehensive technical specification
- `[task-name]-context.md` - Key files, decisions, dependencies
- `[task-name]-tasks.md` - Checklist for tracking progress

**Usage:**
```bash
/dev-docs-be <feature description>
```

**Example:**
```bash
/dev-docs-be build authentication system with JWT and refresh tokens
```

## Perfect For

- ✅ Python/FastAPI backend development
- ✅ Clean Architecture projects
- ✅ Domain-driven design
- ✅ Scalable API development
- ✅ Learning Clean Architecture patterns
- ✅ Building maintainable backend systems

## Not Designed For

- ❌ Non-Python backends
- ❌ Monolithic architecture without layers
- ❌ Frontend development
- ❌ DevOps/infrastructure

## Resources & Documentation

The backend-dev-guidelines skill includes 12 detailed resource files covering:
- Domain modeling and entity design
- Use case implementation patterns
- Repository pattern and data access
- FastAPI endpoint structure
- Validation strategies
- Error handling and observability
- Comprehensive testing approaches
- Real-world implementation examples

## License

MIT

---

**Build clean, maintainable backends!** 🚀
