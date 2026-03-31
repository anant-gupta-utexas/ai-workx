# 021FE - Frontend Development Plugin

TanStack Start/React/TypeScript frontend development guidelines with modern patterns for building SSR-ready applications using Suspense, lazy loading, and shadcn/ui.

## What's Included

### Skills (1)
- **frontend-dev-guidelines** - TanStack Start/React/TypeScript patterns with Suspense, lazy loading, shadcn/ui, and SSR-ready architecture

### Agents (2)
- **frontend-error-fixer** - Debug and fix frontend errors (build and runtime)
- **uiux-specialist** - UI/UX design and specialist guidance for product interfaces

### Commands (1)
- **dev-docs-fe** - Create comprehensive technical requirement specifications (TRS) for frontend features with structured task breakdown

## Tech Stack Support

### Frontend
- TanStack Start (framework)
- React 18+
- TypeScript
- TanStack Router (file-based routing)
- TanStack Query (data fetching with Suspense)
- TanStack Form (type-safe forms)
- shadcn/ui (UI components)
- Tailwind CSS (styling)
- Zod (validation)
- Sonner (toast notifications)

## Installation

```bash
# From your project directory
/plugin install 021FE@claude-workspace-plugins
```

## How the Skill Activates

The frontend-dev-guidelines skill activates automatically in two ways:

### 1. File-Based Activation
When you edit files matching these patterns:
- `src/**/*.tsx`
- `src/**/*.ts` (frontend files)

### 2. Keyword-Based Activation
When your prompts contain these keywords:
- `frontend guidelines`, `react best practices`
- `tanstack patterns`, `ui component`
- `TanStack Start`, `SSR-ready`
- `shadcn/ui`, `Tailwind CSS`
- `tanstack query`, `data fetching`
- `useSuspenseQuery`, `lazy loading`

### Customizing File Patterns

If your project structure differs, update the skill's SKILL.md description to include your project-specific paths and keywords.

## Usage Examples

### Frontend Development

**Example prompts:**
```bash
"Following frontend guidelines, create a new dashboard component"
"Using react best practices, add a data table with sorting"
"Following tanstack patterns, implement SSR-ready data fetching"
"How do I fetch data using useSuspenseQuery?"
"Create a form using TanStack Form and shadcn/ui components"
"Style this component with Tailwind CSS"
```

### Using Agents Directly

Invoke agents for specialized tasks:

```bash
# Fix frontend errors
"Use the frontend-error-fixer agent to debug this console error"
"Use the frontend-error-fixer agent to fix this TypeScript build error"

# UI/UX guidance
"Use the uiux-specialist agent to review my checkout flow"
"Use the uiux-specialist agent to design the user onboarding screens"
```

### Using Commands

Use commands for project planning and documentation:

```bash
# Create technical requirement specification for a feature
/dev-docs-fe build user dashboard with data tables
/dev-docs-fe implement form validation for checkout flow
/dev-docs-fe create authentication flow with SSO
```

The command will:
1. Analyze your request and examine relevant docs (PRD, TRD)
2. Ask clarifying questions if needed
3. Create a comprehensive TRS with implementation phases
4. Generate task management files in `dev/active/[task-name]/`

## Skill Details

### Frontend Dev Guidelines

**Focus:** TanStack Start/React/TypeScript

**Key Topics:**
- Component patterns (Suspense, lazy loading)
- SSR-ready architecture
- File-based routing with TanStack Router
- Data fetching with TanStack Query (useSuspenseQuery)
- Type-safe forms with TanStack Form + Zod
- shadcn/ui component library
- Styling with Tailwind CSS
- Performance optimization
- TypeScript standards
- File organization (features directory)

**Resources:** 10 comprehensive guides covering:
1. Component patterns (Suspense, lazy loading)
2. Data fetching strategies (useSuspenseQuery)
3. File organization (features directory)
4. Forms and validation (TanStack Form + Zod)
5. Loading and error states
6. Performance optimization
7. Routing guide (file-based routing)
8. Styling and theming (Tailwind CSS)
9. TypeScript standards
10. UI components (shadcn/ui)
11. Complete examples

## Agent Details

### Frontend Error Fixer

**Specializes in:**
- Build errors (TypeScript, bundling, linting)
- Runtime errors (browser console, React errors)
- Network issues and API errors
- Debugging with browser tools

**When to use:**
- "I'm getting a 'Cannot read property of undefined' error"
- "My build is failing with a TypeScript error"
- "I'm seeing errors in the browser console"

### UI/UX Specialist

**Specializes in:**
- Translating PRDs into UI/UX designs
- Creating high-fidelity mockup descriptions
- Interactive user workflows
- Design system compliance (Material, iOS)
- Accessibility standards (WCAG)

**When to use:**
- "I need designs for a new feature"
- "Review my dashboard layout"
- "Help me design the user onboarding flow"

## Command Details

### dev-docs-fe

**Purpose:** Create comprehensive Technical Requirement Specifications (TRS) for frontend features

**What it generates:**
- **Overview & Scope** - Feature boundaries and objectives
- **Requirements Summary** - Functional, non-functional, and UI/UX requirements
- **Design References** - Mockups, design tokens, shadcn/ui components, responsive breakpoints
- **Detailed UI Component Design** - Component hierarchy, props/state/data flow, event handling
- **API Integration** - Endpoints, TanStack Query hooks, cache strategy, loading/error states
- **State Management Design** - TanStack Query for server state, React Context for global state
- **Type Safety & Validation** - TypeScript interfaces, Zod schemas, type guards
- **Implementation Phases** - Structured tasks with acceptance criteria and file specifications

**Output files** (in `dev/active/[task-name]/`):
- `[task-name]-plan.md` - Comprehensive technical specification
- `[task-name]-context.md` - Key files, decisions, dependencies
- `[task-name]-tasks.md` - Checklist for tracking progress

**Usage:**
```bash
/dev-docs-fe <feature description>
```

**Example:**
```bash
/dev-docs-fe build user dashboard with real-time metrics and data export
```

## Core Principles

The frontend-dev-guidelines skill emphasizes:

1. **SSR-Ready Architecture** - Client-first, designed for future SSR
2. **Suspense for Data Fetching** - Use useSuspenseQuery for modern async patterns
3. **Lazy Loading** - Optimize performance with React.lazy
4. **Type Safety** - Strict TypeScript with explicit types
5. **shadcn/ui Components** - Copy, customize, own your UI components
6. **Tailwind Utility Classes** - Responsive, dark mode-ready styling
7. **TanStack Form** - Type-safe forms with Zod validation
8. **Features Directory** - Organized code with api/, components/, hooks/, helpers/
9. **No Early Returns** - Prevents layout shift with proper Suspense boundaries
10. **Sonner Toasts** - Consistent user notifications

## Perfect For

- ✅ TanStack Start applications
- ✅ React/TypeScript frontend development
- ✅ SSR-ready architecture
- ✅ Modern frontend patterns (Suspense, lazy loading)
- ✅ shadcn/ui + Tailwind CSS projects
- ✅ Learning React best practices
- ✅ Debugging frontend issues
- ✅ UI/UX design and implementation

## Not Designed For

- ❌ Non-React frameworks (Vue, Angular, Svelte, etc.)
- ❌ Backend development
- ❌ Mobile app development (React Native)
- ❌ Legacy React patterns (class components, render props)

## Resources & Documentation

### Frontend Dev Guidelines
11 detailed resource files covering:
- Modern component patterns with Suspense
- TanStack Query for data fetching (useSuspenseQuery)
- File organization and feature structure
- TanStack Form with Zod validation
- Performance optimization techniques
- shadcn/ui components and Tailwind CSS styling
- File-based routing with TanStack Router
- TypeScript best practices
- Complete implementation examples

### Agents
- **frontend-error-fixer**: Build and runtime error debugging
- **uiux-specialist**: PRD-to-design translation with mockups and workflows

## Troubleshooting

### Skills not activating?

**Check:**
1. You're editing `.tsx` or `.ts` frontend files
2. You're using trigger keywords in your prompts
3. The skill's SKILL.md description includes relevant keywords

### Need help with specific patterns?

**Solutions:**
1. Ask about specific TanStack Start patterns
2. Request examples for useSuspenseQuery, lazy loading, or forms
3. Check the comprehensive resource guides in the skill
4. Review complete examples in the documentation

## License

MIT

---

**Build modern, maintainable frontends!** 🚀
