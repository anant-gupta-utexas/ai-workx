# Scale Decision

Determines how many parallel research threads to run based on query complexity. The goal is to match effort to the question — a narrow factual question doesn't need 6 parallel researchers, and a broad multi-domain survey shouldn't be squeezed through a single search thread.

## Complexity Classification

Assess the query against these four levels:

| Level | Description | Indicators | Examples |
| --- | --- | --- | --- |
| **Narrow** | Single fact or tightly scoped question | 1 domain, 1 concept, clear answer exists | "What is the context window of GPT-4o?" |
| **Comparative** | Direct comparison of 2-3 alternatives | "vs", "compare", "which is better", clear alternatives | "Redis vs Memcached for session storage" |
| **Broad survey** | Map the landscape of a topic | "what are the approaches to", "state of the art", "overview" | "Current approaches to LLM alignment" |
| **Multi-domain** | Complex question spanning multiple fields or requiring synthesis across domains | Multiple disciplines, no single authoritative source | "How do scaling laws interact with data quality in multilingual models?" |

## Execution Strategy

| Complexity | Research threads | Tool calls (approx) | Strategy |
| --- | --- | --- | --- |
| **Narrow** | 1 (lead researcher) | 3-10 | Search directly, no subagents needed |
| **Comparative** | 2 parallel | 10-20 | One subagent per alternative, merge findings |
| **Broad survey** | 3-4 parallel | 20-40 | Partition topic into subtopics, one subagent each |
| **Multi-domain** | 4-6 parallel | 30-60+ | Partition by domain, dedicated synthesis pass |

## How to Decide

Use these heuristics when classification isn't obvious:

1. **Keyword count:** How many distinct concepts does the query mention? More concepts = higher complexity.
2. **Domain span:** Does the answer live in one field or span multiple? Cross-domain = higher.
3. **Source diversity:** Would one authoritative source suffice, or do you need triangulation from many? Many = higher.
4. **Expected controversy:** Is there likely to be disagreement among sources? Controversy = higher (need multiple perspectives).

When in doubt, lean one level higher than your initial assessment. It's better to over-research and filter than to under-research and miss critical context.

## Practical Mapping to Claude Code

### Parallel execution via Task tool

For comparative and above, use the `Task` tool with `subagent_type: "explore"` (for read-only research) or `subagent_type: "generalPurpose"` (when writing intermediate artifacts):

```
Thread 1: "Research <subtopic-A>. Search for <specific queries>. Write findings to outputs/research/.drafts/<slug>-thread-1.md"
Thread 2: "Research <subtopic-B>. Search for <specific queries>. Write findings to outputs/research/.drafts/<slug>-thread-2.md"
```

Launch all threads in a single message to maximize parallelism.

### Sequential fallback

If parallel execution isn't available or the topic is narrow, run searches sequentially. Still use multiple query variations (5-10 per subtopic) to ensure broad coverage.

### Thread handoff format

Each research thread should produce a working file with this structure:

```markdown
# Research Thread: <subtopic>

## Sources Found
| # | Title | URL | Relevance | Key claim |
| --- | --- | --- | --- | --- |
| 1 | ... | ... | High/Medium/Low | ... |

## Findings
<narrative synthesis of what was found, with [N] references to sources above>

## Gaps
- <what couldn't be found or verified>

## Contradictions
- <source X says A, source Y says B>
```

## Re-assessment

After the first round of searches, re-assess the scale decision:

- **Upgrade** if initial results reveal unexpected complexity or major disagreements
- **Downgrade** if the topic turns out to be narrower than expected (well-documented, strong consensus)

Any upgrade requires notifying the user before spawning additional research threads.
