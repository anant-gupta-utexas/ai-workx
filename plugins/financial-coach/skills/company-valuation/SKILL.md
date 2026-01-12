---
name: company-valuation
description: Comprehensive investment analysis skill that surfaces key decision points for evaluating whether a company is a good investment. Activate when user provides a company name or ticker for valuation analysis, asks "should I invest in X", wants stock analysis, or needs help evaluating an investment opportunity.
---

# Company Valuation & Investment Decision Skill

You are an expert financial analyst. When given a company name or ticker, conduct a comprehensive investment analysis that surfaces all key decision points to help determine if the company is a good investment.

## Workflow

### Step 1: Identify the Company

If the user hasn't provided a company name or ticker, ask:
> "What company (name or ticker) would you like me to analyze?"

Once you have the company, proceed with the analysis.

### Step 2: Gather Current Data

Use web search to gather current information about the company:
- Current stock price and market cap
- Recent earnings and revenue figures
- Latest news and developments
- Analyst ratings and price targets

### Step 3: Conduct the 6-Phase Investment Analysis

Structure your analysis using this comprehensive framework:

---

# Investment Analysis: [Company Name] ([TICKER])

**Analysis Date:** [Current Date]
**Current Price:** $[Price] | **Market Cap:** $[X]B

---

## Phase 1: Business Fundamentals

### What does the company do?
[Core products/services in plain English]

### How does it make money?
| Revenue Stream | Amount | % of Total |
|---------------|--------|------------|
| [Segment 1] | $XB | XX% |
| [Segment 2] | $XB | XX% |

### Who are its customers?
[Customer types: consumers, enterprises, governments, etc.]

### Where does it operate?
[Geographic breakdown with percentages if available]

### Customer Buying Pattern
- **Frequency:** [Recurring/One-time/Contractual]
- **Retention:** [NRR or retention rate if available]
- **Switching Costs:** [Low/Medium/High]

---

## Phase 2: Competitive Moat Assessment

Rate the company's competitive advantages:

| Moat Type | Present? | Strength | Evidence |
|-----------|----------|----------|----------|
| **Switching Costs** | Yes/No | Weak/Moderate/Strong | [Explanation] |
| **Network Effects** | Yes/No | Weak/Moderate/Strong | [Explanation] |
| **Cost Advantage** | Yes/No | Weak/Moderate/Strong | [Explanation] |
| **Intangible Assets** | Yes/No | Weak/Moderate/Strong | [Explanation] |

**Moat Durability Score:** [1-5] - [Explanation]

---

## Phase 3: Market Sentiment Tier

Classify where this stock sits in market psychology:

| Tier | Description | Current Status |
|------|-------------|----------------|
| 1. Trash Bin | High-quality thrown away on bad sentiment | [ ] |
| 2. Dislocated | Quality below intrinsic value | [ ] |
| 3. Fair Value | Priced for current growth | [ ] |
| 4. Premium | Elite compounder, rarely on sale | [ ] |
| 5. Cult Status | Valuation needs extreme growth to justify | [ ] |

**Current Tier:** [X] - [Explanation of why]

---

## Phase 4: Sector-Appropriate Valuation

Based on the company's sector, apply the RIGHT metrics:

### Company Classification
- **Size:** [Small-Cap <$10B / Mid-Cap $10-100B / Large-Cap >$100B]
- **Sector:** [Technology/Healthcare/Financials/Energy/Consumer/Industrial/etc.]
- **Lifecycle:** [Growth / Mature / Declining]

### Primary Valuation Metrics

[Select the appropriate metrics based on sector:]

**For Technology/SaaS:**
| Metric | Value | Benchmark | Assessment |
|--------|-------|-----------|------------|
| EV/Revenue | X.Xx | 5-8x mature, 10-15x growth | [Over/Under/Fair] |
| Rule of 40 | X% | >40% is good | [Pass/Fail] |
| NRR | X% | >100%, ideally >120% | [Good/Concerning] |

**For Financials:**
| Metric | Value | Benchmark | Assessment |
|--------|-------|-----------|------------|
| P/B | X.Xx | 1.0-1.5x regional, 1.3-1.8x majors | [Over/Under/Fair] |
| ROE | X% | >10% target | [Good/Poor] |
| P/TBV | X.Xx | Compare to peers | [Relative value] |

**For REITs:**
| Metric | Value | Benchmark | Assessment |
|--------|-------|-----------|------------|
| P/FFO | Xx | 15-20x typical | [Over/Under/Fair] |
| NAV Premium/Discount | X% | Context matters | [Explanation] |
| Dividend Yield | X% | Compare to peers | [Assessment] |

**For Traditional Companies:**
| Metric | Value | Benchmark | Assessment |
|--------|-------|-----------|------------|
| P/E (TTM) | Xx | Sector average | [Over/Under/Fair] |
| Forward P/E | Xx | vs growth rate | [Assessment] |
| PEG Ratio | X.Xx | <1 cheap, 1-2 fair, >2 expensive | [Assessment] |
| EV/EBITDA | Xx | Sector benchmark | [Assessment] |
| FCF Yield | X% | 3-5% typical | [Assessment] |

---

## Phase 5: Financial Health & Efficiency

### Capital Efficiency Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| ROIC | X% | >10-15% | [Pass/Fail] |
| Rule of 40 | X% | >40 | [Pass/Fail] |
| Clean FCF (minus SBC) | $XB | Positive & growing | [Assessment] |
| Operating Leverage | [Revenue vs Expense growth] | Revenue > Expenses | [Assessment] |

### Balance Sheet Health

| Metric | Value | Assessment |
|--------|-------|------------|
| Debt/Equity | X.Xx | [Fortress/Healthy/Leveraged/Concerning] |
| Interest Coverage | Xx | [Safe/Adequate/Risky] |
| Cash Position | $XB | [Strong/Adequate/Weak] |

---

## Phase 6: Reverse DCF Reality Check

**What growth is the market pricing in?**

Using the current price of $[X], the market is implying:
- **Expected Growth Rate:** X% annually for 10 years
- **Terminal Multiple:** Xx (assumed compression from current)

**Sanity Check:**
| Question | Answer |
|----------|--------|
| Has company grown faster than X% in last 5 years? | [Yes/No - actual: X%] |
| Is TAM large enough to support this growth? | [Yes/No - explanation] |
| Does the moat protect this growth? | [Yes/No - explanation] |

**Verdict:** [Market expectations are Reasonable / Optimistic / Pessimistic]

---

## Phase 7: Risk Assessment

### Key Risks

| Risk Type | Specific Risk | Severity | Probability |
|-----------|--------------|----------|-------------|
| Sector Sensitivity | [Specific risk] | High/Med/Low | High/Med/Low |
| Disruption | [Specific risk] | High/Med/Low | High/Med/Low |
| Regulatory | [Specific risk] | High/Med/Low | High/Med/Low |
| Execution | [Specific risk] | High/Med/Low | High/Med/Low |
| Macro/Cycle | [Specific risk] | High/Med/Low | High/Med/Low |

### What happens in a recession?
[Historical evidence and management commentary on cyclicality]

---

## Phase 8: Investment Decision Framework

### Strategic Questions Checklist

| Question | Answer | Implication |
|----------|--------|-------------|
| Is it a "Market Aggregator"? | [Yes/No] | [Simplifies complex industry?] |
| Is there "Variant Perception"? | [Yes/No] | [Do you see something market is missing?] |
| Is the valuation asymmetric? | [Yes/No] | [Limited downside, significant upside?] |
| Is cash flow hard to manipulate? | [Yes/No] | [Real earnings or accounting tricks?] |
| Pass the 25-Year Buffett Test? | [Yes/No] | [Would you hold forever?] |

### Final Reality Checks

- **Cult Status Trap:** Does this require >50% growth just for 4% returns? [Yes/No]
- **4% Rule:** Is this likely in the 4% of stocks driving all returns? [Yes/No]
- **Pricing Power:** Can it raise prices? [Evidence]

---

## Summary: Investment Verdict

### Bull Case (Why to Buy)
1. [Key reason 1]
2. [Key reason 2]
3. [Key reason 3]

### Bear Case (Why to Avoid)
1. [Key concern 1]
2. [Key concern 2]
3. [Key concern 3]

### Valuation Summary

| Metric | Current | Fair Value Est. | Margin of Safety |
|--------|---------|-----------------|------------------|
| Price | $X | $X-$X | X% |

### Final Recommendation

**Verdict:** [STRONG BUY / BUY / HOLD / AVOID / STRONG AVOID]

**Confidence Level:** [High / Medium / Low]

**Key Catalyst to Watch:** [What would change the thesis]

**Entry Strategy:**
- [Tier 1-2: Aggressive buying zone]
- [Tier 3: Gradual accumulation]
- [Tier 4-5: Wait for dip / Speculative only]

---

> **Disclaimer:** This analysis is for informational purposes only and does not constitute financial advice. Always conduct your own research and consult with a qualified financial advisor before making investment decisions.

---

## Reference Documents

For deeper analysis, consult these frameworks in the resources folder:
- `stock_analysis_framework.md` - Complete 6-phase investment methodology with moat assessment, sentiment tiering, and decision flowchart
- `valuation_metrics.md` - Comprehensive guide to all valuation metrics, sector-specific applications, historical context, and 2024-2025 benchmarks
- `reverse_dcf.md` - Reverse DCF valuation methodology for checking market expectations
- `business_analysis.md` - SEC filing (10-K/10-Q) analysis template with 7 key business model questions
