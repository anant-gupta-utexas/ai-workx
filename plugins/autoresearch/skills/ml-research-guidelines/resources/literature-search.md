# Literature Search

Using Semantic Scholar and web research to check novelty, find related work, and build citation lists for manuscripts.

## Overview

Literature search serves two purposes in the research pipeline:

1. **Novelty checking** (Phase 1: Ideation) — Ensure proposed ideas don't duplicate existing work
2. **Citation building** (Phase 3: Manuscript) — Situate findings within the broader literature

## Semantic Scholar MCP

The recommended approach is to use a Semantic Scholar MCP server, which provides:

- Paper search by title, abstract, or keyword
- Citation graph traversal
- Author and venue filtering
- Semantic similarity between papers

### Expected MCP Tool Interface

```
search_papers(query: string, limit: number) -> Paper[]
get_paper(paper_id: string) -> Paper
get_citations(paper_id: string) -> Paper[]
get_references(paper_id: string) -> Paper[]
```

Where `Paper` includes: `title`, `abstract`, `authors`, `year`, `venue`, `citationCount`, `paperId`, `url`.

### Setup

Configure the Semantic Scholar MCP server in Claude Code settings. The plugin README documents the recommended MCP configuration.

## Novelty Checking Protocol

During ideation, for each proposed research direction:

### Step 1: Generate Search Queries

Create 5-10 query variations targeting different aspects of the idea:

- Core technique name
- Problem being solved
- Method category + domain
- Key components or algorithms
- Alternative phrasings

### Step 2: Search and Filter

For each query:
1. Search Semantic Scholar with limit=20
2. Filter results by relevance (year > 2020, citation count > 5)
3. Read abstracts of top-5 results

### Step 3: Assess Similarity

For each relevant paper found:
- Does it address the same problem?
- Does it use the same method?
- Does it reach the same conclusions?

**Discard the idea** if a paper matches on all three. **Refine the idea** if partial overlap exists. **Proceed** if no close matches.

### Step 4: Iterate

Repeat for up to 10 rounds, refining search queries based on what was found. The system should be thorough — a false negative (missing a relevant paper) is worse than extra search time.

## Citation Building Protocol

During manuscript writing, build the related work section:

### Step 1: Identify Citation Needs

For each section of the manuscript:
- What claims need supporting citations?
- What prior work is being built upon?
- What alternative approaches should be mentioned?

### Step 2: Search for Each Citation

For each needed citation:
1. Search Semantic Scholar with targeted queries
2. Select the most relevant paper
3. Generate a textual justification for including this citation
4. Record the paper ID, title, authors, year, and the justification

### Step 3: Integrate Citations

Over 20 rounds:
1. Query Semantic Scholar for relevant literature
2. Compare findings against the current manuscript
3. Add citations where they strengthen the argument
4. Remove citations that don't contribute

### Step 4: Validate

Check that:
- All factual claims have citations
- No citation is used more than necessary
- Related work section covers the key prior art
- Year range is appropriate (recent + seminal older works)

## Fallback: Web Research

When Semantic Scholar MCP is not available, use web search:

- Google Scholar queries via web search tool
- arXiv search for recent preprints
- GitHub repository search for implementations
- Conference proceedings (NeurIPS, ICML, ICLR) for accepted papers

## Output Format

Citation entries for the manuscript:

```json
{
  "citation_key": "lu2026aiscientist",
  "title": "Towards end-to-end automation of AI research",
  "authors": ["Chris Lu", "Cong Lu", "Robert Tjarko Lange", "..."],
  "year": 2026,
  "venue": "Nature",
  "paperId": "abc123",
  "url": "https://doi.org/10.1038/s41586-026-10265-5",
  "justification": "Foundational work on automated scientific research pipelines"
}
```

## HuggingFace Hub Integration

For dataset discovery, use the HuggingFace Hub MCP server:

- Search datasets by task, domain, or keyword
- Get dataset metadata (size, splits, features)
- Generate data-loading code snippets

This is used during the experimentation phase when the agent needs to select or switch datasets.
