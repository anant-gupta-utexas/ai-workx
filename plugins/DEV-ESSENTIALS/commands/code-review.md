---
description: Run a security and quality review of uncommitted changes before committing
argument-hint: (no arguments needed)
---

Comprehensive security and quality review of uncommitted changes:

1. Get changed files: `git diff --name-only HEAD`

2. For each changed file, check for:

**Security Issues (CRITICAL):**
- Hardcoded credentials, API keys, tokens
- SQL injection vulnerabilities (string concatenation in queries)
- XSS vulnerabilities (unescaped user input)
- Missing input validation
- Path traversal risks (unsanitized file paths)
- Authentication/authorization bypasses

**Code Quality (HIGH):**
- Functions > 50 lines -- split into smaller, focused functions
- Files > 800 lines -- extract modules by responsibility
- Nesting depth > 4 levels -- use early returns, extract helpers
- Missing error handling -- unhandled exceptions, empty catch blocks
- console.log / print() / fmt.Println() debug statements
- TODO/FIXME comments without issue references

**Best Practices (MEDIUM):**
- Mutation patterns (prefer immutable operations)
- Missing tests for new code paths
- Dead code (commented-out code, unused imports)

3. Apply confidence-based filtering:
- Only report issues you are >80% confident about
- Consolidate similar issues (e.g., "5 functions missing error handling" not 5 separate findings)
- Prioritize issues that could cause bugs, security vulnerabilities, or data loss

4. Generate report with:
- Severity: CRITICAL, HIGH, MEDIUM, LOW
- File location and line numbers
- Issue description
- Suggested fix with code example

5. End with summary:

```
## Review Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0     | pass   |
| HIGH     | 2     | warn   |
| MEDIUM   | 3     | info   |
| LOW      | 1     | note   |

Verdict: [APPROVE / WARNING / BLOCK]
```

**Approval Criteria:**
- **Approve**: No CRITICAL or HIGH issues
- **Warning**: HIGH issues only (can merge with caution)
- **Block**: CRITICAL issues found -- must fix before merge

Never approve code with security vulnerabilities.
