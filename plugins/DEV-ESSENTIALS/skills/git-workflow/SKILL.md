---
name: git-workflow
description: Git workflow patterns including branching strategies, commit conventions, merge vs rebase, conflict resolution, PR workflow, and release management. Use when setting up git workflow, writing commit messages, creating PRs, resolving conflicts, or managing releases.
---

# Git Workflow Patterns

Best practices for Git version control, branching strategies, and collaborative development.

## When to Activate

- Setting up Git workflow for a new project
- Deciding on branching strategy (GitFlow, trunk-based, GitHub flow)
- Writing commit messages and PR descriptions
- Resolving merge conflicts
- Managing releases and version tags

## Branching Strategies

### GitHub Flow (Simple, Recommended for Most)

Best for continuous deployment and small-to-medium teams.

```
main (protected, always deployable)
  │
  ├── feature/user-auth      → PR → merge to main
  ├── feature/payment-flow   → PR → merge to main
  └── fix/login-bug          → PR → merge to main
```

**Rules:**
- `main` is always deployable
- Create feature branches from `main`
- Open Pull Request when ready for review
- After approval and CI passes, merge to `main`
- Deploy immediately after merge

### Trunk-Based Development (High-Velocity Teams)

Best for teams with strong CI/CD and feature flags.

```
main (trunk)
  │
  ├── short-lived feature (1-2 days max)
  ├── short-lived feature
  └── short-lived feature
```

**Rules:**
- Everyone commits to `main` or very short-lived branches
- Feature flags hide incomplete work
- CI must pass before merge
- Deploy multiple times per day

### GitFlow (Complex, Release-Cycle Driven)

Best for scheduled releases and enterprise projects.

```
main (production releases)
  │
  └── develop (integration branch)
        │
        ├── feature/user-auth
        ├── release/1.0.0    → merge to main and develop
        └── hotfix/critical  → merge to main and develop
```

### When to Use Which

| Strategy | Team Size | Release Cadence | Best For |
|----------|-----------|-----------------|----------|
| GitHub Flow | Any | Continuous | SaaS, web apps, startups |
| Trunk-Based | 5+ experienced | Multiple/day | High-velocity teams, feature flags |
| GitFlow | 10+ | Scheduled | Enterprise, regulated industries |

## Commit Messages

### Conventional Commits Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

| Type | Use For | Example |
|------|---------|---------|
| `feat` | New feature | `feat(auth): add OAuth2 login` |
| `fix` | Bug fix | `fix(api): handle null response in user endpoint` |
| `docs` | Documentation | `docs(readme): update installation instructions` |
| `style` | Formatting, no code change | `style: fix indentation in login component` |
| `refactor` | Code refactoring | `refactor(db): extract connection pool to module` |
| `test` | Adding/updating tests | `test(auth): add unit tests for token validation` |
| `chore` | Maintenance tasks | `chore(deps): update dependencies` |
| `perf` | Performance improvement | `perf(query): add index to users table` |
| `ci` | CI/CD changes | `ci: add PostgreSQL service to test workflow` |
| `revert` | Revert previous commit | `revert: revert "feat(auth): add OAuth2 login"` |

### Good vs Bad Examples

```bash
# BAD: Vague, no context
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "WIP"

# GOOD: Clear, specific, explains why
git commit -m "fix(api): retry requests on 503 Service Unavailable

The external API occasionally returns 503 errors during peak hours.
Added exponential backoff retry logic with max 3 attempts.

Closes #123"
```

## Pull Request Workflow

### PR Title Format

```
<type>(<scope>): <description>

Examples:
feat(auth): add SSO support for enterprise users
fix(api): resolve race condition in order processing
```

### PR Description Template

```markdown
## What
Brief description of what this PR does.

## Why
Explain the motivation and context.

## How
Key implementation details worth highlighting.

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] No new warnings introduced
- [ ] Tests pass locally
- [ ] Related issues linked

Closes #123
```

### Code Review Checklist

**For Reviewers:**
- [ ] Does the code solve the stated problem?
- [ ] Are there edge cases not handled?
- [ ] Is the code readable and maintainable?
- [ ] Are there sufficient tests?
- [ ] Are there security concerns?

**For Authors:**
- [ ] Self-review completed before requesting review
- [ ] CI passes (tests, lint, typecheck)
- [ ] PR size is reasonable (<500 lines ideal)
- [ ] Related to a single feature/fix

## Merge vs Rebase

### When to Merge

- Merging feature branches into `main`
- You want to preserve exact history
- Multiple people worked on the branch
- The branch has been pushed and others may have based work on it

### When to Rebase

- Updating your local feature branch with latest `main`
- You want a linear, clean history
- The branch is local-only (not pushed)
- You're the only one working on the branch

### When NOT to Rebase

Never rebase branches that:
- Have been pushed to a shared repository
- Other people have based work on
- Are protected branches (main, develop)
- Are already merged

Rebase rewrites history, breaking others' work.

## Conflict Resolution

```bash
# See conflicted files
git status

# Option 1: Manual resolution - edit files, remove conflict markers
# Option 2: Use merge tool
git mergetool

# Option 3: Accept one side
git checkout --ours path/to/file    # Keep main version
git checkout --theirs path/to/file  # Keep feature version

# After resolving
git add path/to/file
git commit
```

### Prevention Strategies

- Keep feature branches small and short-lived
- Rebase frequently onto main
- Communicate with team about touching shared files
- Use feature flags instead of long-lived branches
- Review and merge PRs promptly

## Branch Naming Conventions

```
feature/user-authentication
feature/JIRA-123-payment-integration
fix/login-redirect-loop
fix/456-null-pointer-exception
hotfix/critical-security-patch
release/1.2.0
experiment/new-caching-strategy
```

## Release Management

### Semantic Versioning

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes
MINOR: New features, backward compatible
PATCH: Bug fixes, backward compatible
```

### Creating Releases

```bash
# Create annotated tag
git tag -a v1.2.0 -m "Release v1.2.0: features and fixes summary"

# Push tag to remote
git push origin v1.2.0
```

## Anti-Patterns

- Committing directly to main without PRs
- Committing secrets (.env, API keys, passwords)
- Giant PRs (1000+ lines) -- break into smaller, focused PRs
- Vague commit messages ("update", "fix", "WIP")
- Rewriting public history (`git push --force` on shared branches)
- Long-lived feature branches (weeks/months)
- Committing generated files (dist/, node_modules/, __pycache__/)

## Quick Reference

| Task | Command |
|------|---------|
| Create branch | `git checkout -b feature/name` |
| Switch branch | `git checkout branch-name` |
| Delete branch | `git branch -d branch-name` |
| Merge branch | `git merge branch-name` |
| Rebase branch | `git rebase main` |
| View history | `git log --oneline --graph` |
| Stage changes | `git add .` or `git add -p` |
| Commit | `git commit -m "message"` |
| Push | `git push origin branch-name` |
| Stash | `git stash push -m "message"` |
| Undo last commit | `git reset --soft HEAD~1` |
| Revert commit | `git revert HEAD` |
