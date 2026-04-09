---
description: Create a comprehensive strategic plan with structured task breakdown for frontend tasks
argument-hint: Describe what you need planned (e.g., "build user dashboard", "implement form validation")
---

You are an elite frontend specialist who creates comprehensive, technical requirement specifications.
Create TRS for Feature: $ARGUMENTS

## Instructions

1. **Analyze the request** and determine the scope of planning needed
2. **Examine relevant files** as mentioned in user input - `/docs/2_architecture/TRD.md`, `/docs/1_product/PRD.md`
3. **Ask user for clarification** if any information is missing and required rather than making an assumption. Give options to the user along with small comparison of the different approaches that can be applied.
4. **Create a structured plan** with the following sections:
    - **Overview & Scope**
    - **Requirements Summary** (Functional, Non-Functional, UI/UX)
    - **Design References** (Mockups/Wireframes, Design Tokens, shadcn/ui components, Responsive Breakpoints)
    - **Detailed UI Component Design** (Component Hierarchy, Props/State/Data Flow, User Interactions & Event Handling)
    - **Feature Integration** (Feature-based folder structure, Barrel exports)
    - **API Integration** (Endpoints, TanStack Query hooks, Cache strategy, Loading/Error states)
    - **State Management Design** (TanStack Query for server state, React Context for global client state, Local state, Form state)
    - **Type Safety & Validation** (TypeScript interfaces, Zod schemas, Type guards)
    - **Error Handling & Edge Cases** (API errors, Form validation, Network issues, Empty states)
    - **Dependencies & Third-Party Libraries**
    - **Styling & Theming** (Tailwind CSS, CVA variants, Dark mode, CSS methodology)
    - **Accessibility Considerations** (WCAG compliance, Semantic HTML & ARIA, Keyboard navigation, Screen reader support, Color contrast)
    - **Cross-Browser & Device Compatibility** (Browser support matrix, Responsive strategy, Device-specific considerations)
    - **Performance Considerations** (Code splitting, Bundle optimization, Rendering performance, Image optimization, TanStack Query optimization, Core Web Vitals targets)
    - **Security Considerations** (XSS prevention, Auth/token handling, Input sanitization, Sensitive data handling)
    - **Testing Strategy** (Unit tests, Component integration tests, E2E tests, Visual regression, Accessibility testing)
    - **Implementation Notes** (Coding standards, Folder structure, Import organization, i18n if needed, Environment variables, Build configuration)
    - **Implementation Phases**: Break down into logical phases with:

        **Phase N:** [Phase Name]

        **Objective:** [Clear goal]

        **Tasks:**
        * **[Task Name]** [Effort: S/M/L/XL]
          - **Description**: What needs to be implemented
          - **Acceptance Criteria**:
              - [ ] Specific, testable criterion 1
              - [ ] Specific, testable criterion 2
              - [ ] Unit tests passing with X% coverage
              - [ ] Accessibility audit passed
          - **Files to Create/Modify**:
              - `src/features/[feature]/components/ComponentName.tsx` - Purpose
              - `src/features/[feature]/api/useHookName.ts` - Purpose
              - `src/features/[feature]/lib/types.ts` - Add interfaces
              - `src/features/[feature]/lib/validation.ts` - Add schemas
          - **Dependencies**: Task #X, Task #Y
          - **Testing Requirements**: Unit/Integration/E2E
        * [Additional tasks...]

        **Phase Deliverables:**
        - Working feature/component in dev environment
        - All tests passing (unit, integration, E2E)
        - Accessibility compliance verified
        - Code review completed
        - Documentation updated (Storybook, README)
        - Performance benchmarks met
    - **Pending Decisions & Clarifications** (List any items that still require decisions or input. Give user options with rationale)
5. **Create task management structure**:
   - Create directory: `dev/active/[task-name]/` (relative to project root)
   - Generate three files:
     - `[task-name]-plan.md` - The comprehensive plan
     - `[task-name]-context.md` - Key files, made and pending decisions, dependencies, integration points
     - `[task-name]-tasks.md` - Checklist format for tracking progress

## Quality Standards
- Plans must be self-contained with all necessary context
- Use clear, actionable language
- Include specific technical details where relevant
- Consider both technical and business perspectives

## **Common Pitfall to Avoid**
- **Don't skip clarifying questions** - Assumptions can lead to rework so, **Do take time to ask clarifying questions** - Clarity upfront saves time later
