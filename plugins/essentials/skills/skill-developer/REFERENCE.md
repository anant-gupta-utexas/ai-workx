# Complete Reference Guide

Comprehensive configuration reference for Claude Code skills, trigger types, and ready-to-use patterns.

## Table of Contents

- [Trigger Types Guide](#trigger-types-guide)
  - [Keyword Triggers](#keyword-triggers-explicit)
  - [Intent Pattern Triggers](#intent-pattern-triggers-implicit)
  - [File Path Triggers](#file-path-triggers)
  - [Content Pattern Triggers](#content-pattern-triggers)
- [Pattern Library](#pattern-library)
  - [Intent Patterns (Regex)](#intent-patterns-regex)
  - [File Path Patterns (Glob)](#file-path-patterns-glob)
  - [Content Patterns (Regex)](#content-patterns-regex)
- [Testing Your Skills](#testing-your-skills)
  - [Test Commands](#test-commands)
  - [Best Practices](#best-practices-summary)

---

## Trigger Types Guide

Complete reference for configuring skill triggers in Claude Code's skill auto-activation system.

### Keyword Triggers (Explicit)

#### How It Works

Case-insensitive substring matching in user's prompt.

#### Use For

Topic-based activation where user explicitly mentions the subject.

#### Configuration

```json
"promptTriggers": {
  "keywords": ["layout", "grid", "toolbar", "submission"]
}
```

#### Example

- User prompt: "how does the **layout** system work?"
- Matches: "layout" keyword
- Activates: `project-catalog-developer`

#### Best Practices

- Use specific, unambiguous terms
- Include common variations ("layout", "layout system", "grid layout")
- Avoid overly generic words ("system", "work", "create")
- Test with real prompts

---

### Intent Pattern Triggers (Implicit)

#### How It Works

Regex pattern matching to detect user's intent even when they don't mention the topic explicitly.

#### Use For

Action-based activation where user describes what they want to do rather than the specific topic.

#### Configuration

```json
"promptTriggers": {
  "intentPatterns": [
    "(create|add|implement).*?(feature|endpoint)",
    "(how does|explain).*?(layout|workflow)"
  ]
}
```

#### Examples

**Database Work:**
- User prompt: "add user tracking feature"
- Matches: `(add).*?(feature)`
- Activates: `database-verification`, `error-tracking`

**Component Creation:**
- User prompt: "create a dashboard widget"
- Matches: `(create).*?(component)` (if component in pattern)
- Activates: `frontend-dev-guidelines`

#### Best Practices

- Capture common action verbs: `(create|add|modify|build|implement)`
- Include domain-specific nouns: `(feature|endpoint|component|workflow)`
- Use non-greedy matching: `.*?` instead of `.*`
- Test patterns thoroughly with regex tester (https://regex101.com/)
- Don't make patterns too broad (causes false positives)
- Don't make patterns too specific (causes false negatives)

---

### File Path Triggers

#### How It Works

Glob pattern matching against the file path being edited.

#### Use For

Domain/area-specific activation based on file location in the project.

#### Configuration

```json
"fileTriggers": {
  "pathPatterns": [
    "frontend/src/**/*.tsx",
    "form/src/**/*.ts"
  ],
  "pathExclusions": [
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

#### Glob Pattern Syntax

- `**` = Any number of directories (including zero)
- `*` = Any characters within a directory name
- Examples:
  - `frontend/src/**/*.tsx` = All .tsx files in frontend/src and subdirs
  - `**/schema.prisma` = schema.prisma anywhere in project
  - `form/src/**/*.ts` = All .ts files in form/src subdirs

#### Example

- File being edited: `frontend/src/components/Dashboard.tsx`
- Matches: `frontend/src/**/*.tsx`
- Activates: `frontend-dev-guidelines`

#### Best Practices

- Be specific to avoid false positives
- Use exclusions for test files: `**/*.test.ts`
- Consider subdirectory structure
- Test patterns with actual file paths
- Use narrower patterns when possible: `form/src/services/**` not `form/**`

---

### Content Pattern Triggers

#### How It Works

Regex pattern matching against the file's actual content (what's inside the file).

#### Use For

Technology-specific activation based on what the code imports or uses (Prisma, controllers, specific libraries).

#### Configuration

```json
"fileTriggers": {
  "contentPatterns": [
    "import.*[Pp]risma",
    "PrismaService",
    "\\.findMany\\(",
    "\\.create\\("
  ]
}
```

#### Examples

**Prisma Detection:**
- File contains: `import { PrismaService } from '@project/database'`
- Matches: `import.*[Pp]risma`
- Activates: `database-verification`

**Controller Detection:**
- File contains: `export class UserController {`
- Matches: `export class.*Controller`
- Activates: `error-tracking`

#### Best Practices

- Match imports: `import.*[Pp]risma` (case-insensitive with [Pp])
- Escape special regex chars: `\\.findMany\\(` not `.findMany(`
- Patterns use case-insensitive flag
- Test against real file content
- Make patterns specific enough to avoid false matches

---

## Pattern Library

Ready-to-use regex and glob patterns for skill triggers. Copy and customize for your skills.

### Intent Patterns (Regex)

#### Feature/Endpoint Creation
```regex
(add|create|implement|build).*?(feature|endpoint|route|service|controller)
```

#### Component Creation
```regex
(create|add|make|build).*?(component|UI|page|modal|dialog|form)
```

#### Database Work
```regex
(add|create|modify|update).*?(user|table|column|field|schema|migration)
(database|prisma).*?(change|update|query)
```

#### Error Handling
```regex
(fix|handle|catch|debug).*?(error|exception|bug)
(add|implement).*?(try|catch|error.*?handling)
```

#### Explanation Requests
```regex
(how does|how do|explain|what is|describe|tell me about).*?
```

#### Workflow Operations
```regex
(create|add|modify|update).*?(workflow|step|branch|condition)
(debug|troubleshoot|fix).*?workflow
```

#### Testing
```regex
(write|create|add).*?(test|spec|unit.*?test)
```

### File Path Patterns (Glob)

#### Frontend
```glob
frontend/src/**/*.tsx        # All React components
frontend/src/**/*.ts         # All TypeScript files
frontend/src/components/**   # Only components directory
```

#### Backend Services
```glob
form/src/**/*.ts            # Form service
email/src/**/*.ts           # Email service
users/src/**/*.ts           # Users service
projects/src/**/*.ts        # Projects service
```

#### Database
```glob
**/schema.prisma            # Prisma schema (anywhere)
**/migrations/**/*.sql      # Migration files
database/src/**/*.ts        # Database scripts
```

#### Workflows
```glob
form/src/workflow/**/*.ts              # Workflow engine
form/src/workflow-definitions/**/*.json # Workflow definitions
```

#### Test Exclusions
```glob
**/*.test.ts                # TypeScript tests
**/*.test.tsx               # React component tests
**/*.spec.ts                # Spec files
```

### Content Patterns (Regex)

#### Prisma/Database
```regex
import.*[Pp]risma                # Prisma imports
PrismaService                    # PrismaService usage
prisma\.                         # prisma.something
\.findMany\(                     # Prisma query methods
\.create\(
\.update\(
\.delete\(
```

#### Controllers/Routes
```regex
export class.*Controller         # Controller classes
router\.                         # Express router
app\.(get|post|put|delete|patch) # Express app routes
```

#### Error Handling
```regex
try\s*\{                        # Try blocks
catch\s*\(                      # Catch blocks
throw new                        # Throw statements
```

#### React/Components
```regex
export.*React\.FC               # React functional components
export default function.*       # Default function exports
useState|useEffect              # React hooks
```

---

## Testing Your Skills

### Test Commands

#### Test UserPromptSubmit (keyword/intent triggers)

```bash
echo '{"session_id":"test","prompt":"your test prompt here"}' | \
  npx tsx .claude/hooks/skill-activation-prompt.ts
```

Expected: Your skill should appear in the output if keywords or intent patterns match.

#### Test PreToolUse (file path/content triggers)

```bash
cat <<'EOF' | npx tsx .claude/hooks/skill-verification-guard.ts
{"session_id":"test","tool_name":"Edit","tool_input":{"file_path":"/path/to/test/file.ts"}}
EOF
echo "Exit code: $?"
```

Expected:
- Exit code 2 + stderr message if should block
- Exit code 0 + no output if should allow

### Best Practices Summary

#### DO:
✅ Use specific, unambiguous keywords
✅ Test all patterns with real examples
✅ Include common variations
✅ Use non-greedy regex: `.*?`
✅ Escape special characters in content patterns
✅ Add exclusions for test files
✅ Make file path patterns narrow and specific
✅ Validate JSON with `jq`
✅ Test regex patterns on https://regex101.com/

#### DON'T:
❌ Use overly generic keywords ("system", "work")
❌ Make intent patterns too broad (false positives)
❌ Make patterns too specific (false negatives)
❌ Forget to test with regex tester
❌ Use greedy regex: `.*` instead of `.*?`
❌ Match too broadly in file paths
❌ Use trailing commas in JSON
❌ Use single quotes in JSON (must be double quotes)

---

**Related Files:**
- [SKILL.md](SKILL.md) - Main skill guide and quick start
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Debugging skill activation issues
- [INTERNALS.md](INTERNALS.md) - Deep dive into hook mechanisms
