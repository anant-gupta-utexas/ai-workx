---
name: frontend-dev-guidelines
description: Frontend development guidelines for React/TypeScript applications. Modern patterns including Suspense, lazy loading, useSuspenseQuery, file organization with features directory, MUI v7 styling, TanStack Router, performance optimization, and TypeScript best practices. Use when creating components, pages, features, fetching data, styling, routing, or working with frontend code.
---

# **Frontend Development Guidelines**

## **Purpose**

Comprehensive guide for modern React development with TanStack Router, emphasizing Suspense-based data fetching, lazy loading, proper file organization, and performance optimization with an SSR-ready architecture.

## **When to Use This Skill**

- Creating new components or pages
- Building new features
- Fetching data with TanStack Query
- Setting up routing with TanStack Router/Router
- Styling components with Tailwind CSS + shadcn/ui
- Building forms with TanStack Form
- Performance optimization
- Organizing frontend code
- TypeScript best practices

---

## **Quick Start**

### **New Component Checklist**

Creating a component? Follow this checklist:

- [ ]  Use `React.FC<Props>` pattern with TypeScript
- [ ]  Lazy load if heavy component: `React.lazy(() => import())`
- [ ]  Wrap in `<SuspenseLoader>` for loading states
- [ ]  Use `useSuspenseQuery` for data fetching
- [ ]  Import aliases: `@/`, `~types`, `~components`, `~features`
- [ ]  Styles: Tailwind utility classes
- [ ]  Use `useCallback` for event handlers passed to children
- [ ]  Default export at bottom
- [ ]  No early returns with loading spinners
- [ ]  Use Sonner `toast` for user notifications

### **New Feature Checklist**

Creating a feature? Set up this structure:

- [ ]  Create `features/{feature-name}/` directory
- [ ]  Create subdirectories: `api/`, `components/`, `hooks/`, `helpers/`, `types/`
- [ ]  Create API service file: `api/{feature}Api.ts`
- [ ]  Set up TypeScript types in `types/`
- [ ]  Create route in `src/routes/{feature-name}/index.tsx`
- [ ]  Lazy load feature components
- [ ]  Use Suspense boundaries
- [ ]  Export public API from feature `index.ts`

---

## **Import Aliases Quick Reference**

| Alias | Resolves To | Example |
| --- | --- | --- |
| `@/` | `src/` | `import { apiClient } from '@/lib/apiClient'` |
| `~types` | `src/types` | `import type { User } from '~types/user'` |
| `~components` | `src/components` | `import { SuspenseLoader } from '~components/SuspenseLoader'` |
| `~features` | `src/features` | `import { authApi } from '~features/auth'` |

Defined in: TanStack Router configuration (tsconfig.json or vite.config.ts)

---

## **Common Imports Cheatsheet**

```tsx
// React & Lazy Loadingimport React, { useState, useCallback, useMemo } from 'react';
const Heavy = React.lazy(() => import('./Heavy'));

// shadcn/ui Componentsimport { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// TanStack Query (Suspense)import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';

// TanStack Routerimport { createFileRoute } from '@tanstack/react-router';

// TanStack Formimport { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';

// Validationimport { z } from 'zod';

// Notificationsimport { toast } from 'sonner';

// Project Componentsimport { SuspenseLoader } from '~components/SuspenseLoader';

// Hooksimport { useAuth } from '@/hooks/useAuth';

// Typesimport type { Post } from '~types/post';

// Utilsimport { cn } from '@/lib/utils';

```

---

## **Topic Guides**

| Topic | Key Points | Guide |
| --- | --- | --- |
| **Component Patterns** | React.FC, lazy loading, Suspense boundaries, component structure | `./resources/component-patterns.md` |
| **Data Fetching** | useSuspenseQuery, cache-first, API service layer, SSR-ready | `./resources/data-fetching.md` |
| **File Organization** | features/ vs components/, subdirectories, route structure | `./resources/file-organization.md` |
| **Styling** | Tailwind utilities, shadcn/ui components, dark mode, theming | `./resources/styling-and-theming.md` |
| **Routing** | File-based routing, lazy loading, SSR-ready patterns | `./resources/routing-guide.md` |
| **Forms** | TanStack Form, Zod validation, shadcn/ui form components | `./resources/forms-and-validation.md` |
| **Loading & Errors** | No early returns, Suspense, Sonner toasts, error boundaries | `./resources/loading-and-error-states.md` |
| **Performance** | useMemo, useCallback, React.memo, debouncing, cleanup | `./resources/performance.md` |
| **TypeScript** | Strict mode, explicit types, type imports, prop interfaces | `./resources/typescript-standards.md` |
| **UI Components** | shadcn/ui catalog, buttons, dialogs, tables, notifications | `./resources/ui-components.md` |
| **Examples** | Complete working examples for all patterns | `./resources/complete-examples.md` |

---

## **Core Principles**

1. **Lazy Load Everything Heavy**: Routes, DataGrid, charts, editors
2. **Suspense for Loading**: Use SuspenseLoader, not early returns
3. **useSuspenseQuery**: Primary data fetching pattern for new code
4. **Features are Organized**: api/, components/, hooks/, helpers/ subdirs
5. **Tailwind for Styles**: Utility classes, responsive, dark mode
6. **shadcn/ui Components**: Copy, customize, own the code
7. **TanStack Form**: Type-safe forms with Zod validation
8. **Import Aliases**: Use @/, ~types, ~components, ~features
9. **No Early Returns**: Prevents layout shift
10. **Sonner Toasts**: For all user notifications
11. **SSR-Ready**: Client-first, designed for future SSR

---

## **Tech Stack Reference**

| Category | Technology |
| --- | --- |
| Framework | TanStack Router |
| Router | TanStack Router |
| UI Library | shadcn/ui |
| Styling | Tailwind CSS |
| Forms | TanStack Form + Zod |
| Data Fetching | TanStack Query |
| Notifications | Sonner |
| API Client | Axios |
| Language | TypeScript (strict) |

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

## **External Resources**

- [TanStack Router Documentation](https://tanstack.com/start/latest)
- [TanStack Router Documentation](https://tanstack.com/router/latest)
- [TanStack Form Documentation](https://tanstack.com/form/latest)
- [shadcn/ui Documentation](https://ui.shadcn.com/llms.txt)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---
