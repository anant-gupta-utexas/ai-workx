---
description: Run comprehensive verification on current codebase state before committing or creating a PR
argument-hint: quick | full | pre-commit | pre-pr
---

Run comprehensive verification on the current codebase state.

Execute verification in this exact order:

1. **Build Check**
   - Run the build command for this project (detect from package.json, Makefile, pyproject.toml, go.mod)
   - If it fails, report errors and STOP

2. **Type Check**
   - Run TypeScript/type checker if applicable (tsc --noEmit, mypy, go vet)
   - Report all errors with file:line

3. **Lint Check**
   - Run linter (eslint, ruff, golangci-lint -- detect from project config)
   - Report warnings and errors

4. **Test Suite**
   - Run all tests (npm test, pytest, go test ./...)
   - Report pass/fail count
   - Report coverage percentage if available

5. **Secret Scan**
   - Search for hardcoded secrets in source files (API keys, passwords, tokens)
   - Patterns: sk-, ghp_, AKIA, api_key=, password=, secret=

6. **Console.log Audit**
   - Search for console.log / print() / fmt.Println() debug statements in source files (not test files)
   - Report locations

7. **Git Status**
   - Show uncommitted changes
   - Show files modified since last commit

## Output

Produce a concise verification report:

```
VERIFICATION: [PASS/FAIL]

Build:    [OK/FAIL]
Types:    [OK/X errors]
Lint:     [OK/X issues]
Tests:    [X/Y passed, Z% coverage]
Secrets:  [OK/X found]
Logs:     [OK/X debug statements]

Ready for PR: [YES/NO]
```

If any critical issues, list them with fix suggestions.

## Arguments

$ARGUMENTS can be:
- `quick` - Only build + types
- `full` - All checks (default)
- `pre-commit` - Build + types + lint + secrets
- `pre-pr` - Full checks plus security scan of all changed files since branch diverged
