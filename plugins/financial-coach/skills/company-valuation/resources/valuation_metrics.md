# Complete Guide to Valuation Metrics

Choosing the right valuation metric requires matching it to the company's sector, lifecycle stage, and capital structure. There is no universal ratio—**banks require P/B ratios, growth tech companies demand revenue multiples, and mature industrials rely on EV/EBITDA**.

The core insight that separates sophisticated investors from beginners: understanding *why* certain metrics fail in specific contexts. A low P/E at an energy company during peak oil prices is often a sell signal, not a buy signal. A biotech trading at 50x sales may be cheap if its drug pipeline justifies the premium.

---

## Part 1: Fundamental Concepts

### Equity Value vs. Enterprise Value

**The House Analogy:** Imagine a property listed at $500,000. This is the Equity Value—what the buyer pays the seller. But if the house has a $300,000 mortgage the buyer must assume, the true cost is $800,000. If there's $50,000 cash in a safe, the effective cost decreases.

**Equity Value (Market Cap):** Value belonging to shareholders after debts are paid.
```
Equity Value = Share Price × Shares Outstanding
```

**Enterprise Value (EV):** Total value to all financiers (debt + equity holders). The theoretical acquisition price.
```
EV = Market Cap + Total Debt + Preferred Stock + Minority Interest − Cash
```

**Critical Matching Rule:**
- **Equity metrics** (P/E): Net Income goes to shareholders only → compare to Market Cap
- **Enterprise metrics** (EV/EBITDA): EBITDA goes to all stakeholders → compare to Enterprise Value

Mixing these (e.g., EV ÷ Net Income) produces nonsensical results.

### Interest Rates as Gravity

Warren Buffett compares interest rates to gravity. As rates rise, all financial assets must fall to remain competitive with risk-free bonds. A P/E of 20x (5% earnings yield) looks attractive when bonds yield 1%, but expensive when bonds yield 5%.

**Implication:** A P/E of 20x in 2025 is "more expensive" than the same P/E in 2020 because the risk-free alternative is higher.

---

## Part 2: The Six Core Valuation Metrics

### 1. Price-to-Earnings (P/E) Ratio

**Formula:** Stock Price ÷ Earnings Per Share

*Think of P/E like buying a rental property.* If a house costs $200,000 and generates $20,000 annual net income, the P/E is 10x—you're paying 10 times annual income. Lower multiple = more income for your money.

**Types:**
- **Trailing P/E (TTM):** Last 12 months actual earnings. Factual but backward-looking.
- **Forward P/E:** Analyst estimates for next 12 months. Forward-looking but introduces estimation risk.
- **CAPE (Shiller P/E):** Inflation-adjusted price ÷ 10-year average real earnings. Smooths business cycle volatility.

**Benchmarks:**
- S&P 500 historical average: 15-17x
- Tech stocks typically: 25-40x
- Utilities typically: 15-20x
- High P/E (>25x): Strong growth expectations or overvaluation
- Low P/E (<12x): Undervaluation or fundamental problems

### 2. Price-to-Sales (P/S) Ratio

**Formula:** Market Cap ÷ Revenue

*Like valuing a restaurant by food sales.* If a restaurant sells $500,000 annually and sells for $1,000,000, P/S is 2x. Works when the business isn't yet profitable but has strong sales growth.

**Best for:** High-growth tech, biotech (80% of Nasdaq Biotech has no earnings), cyclical businesses with temporarily depressed earnings.

**Limitation:** Ignores profitability entirely. A company could have billions in sales while losing money on every transaction.

### 3. Price-to-Book (P/B) Ratio

**Formula:** Market Price ÷ Book Value Per Share

*Like buying a used car.* If Kelley Blue Book says $10,000 but seller wants $15,000, you're paying 1.5x book—perhaps justified for a rare model. At $8,000 (0.8x), either it's a bargain or something's wrong.

**Interpretation:**
- P/B < 1.0x: Trading below net asset value (opportunity or distress signal)
- P/B > 1.0x: Market expects returns exceeding cost of capital

**Essential for:** Banks and financials (assets marked to market)
**Fails for:** Tech companies (intangible value not on balance sheet)

Warren Buffett: "Book value is meaningless as an indicator of value" for capital-light businesses.

### 4. Enterprise Value-to-EBITDA (EV/EBITDA)

**EBITDA:** Earnings Before Interest, Taxes, Depreciation, and Amortization

*Like comparing houses with different mortgages.* Two houses with $300,000 equity look the same, but one has a $100,000 mortgage (EV = $390,000) while another has $50,000 cash (EV = $250,000).

**Why use it:**
- **Capital structure neutral:** Removes interest expense differences
- **Depreciation neutral:** Removes non-cash accounting differences
- **M&A standard:** Primary metric for acquisition pricing

**The "Tooth Fairy" Critique (Buffett):** "Does management think the tooth fairy pays for capital expenditures?" Depreciation represents real wear and tear. EBITDA overstates profitability of asset-heavy businesses.

**Benchmarks:**
| Sector | Typical EV/EBITDA |
|--------|-------------------|
| Utilities | 6-8x |
| Telecoms | 5-7x |
| Industrials | 7-10x |
| S&P 500 average | 13-17x |

### 5. PEG Ratio

**Formula:** P/E Ratio ÷ Expected Annual EPS Growth Rate

A company at 30x P/E growing 30% (PEG = 1.0) is "cheaper" than one at 15x P/E growing 10% (PEG = 1.5).

**Interpretation:**
- PEG < 1.0: Potentially undervalued
- PEG 1.0-1.5: Fair value
- PEG > 2.0: Potentially overvalued

**Critical limitation:** Growth estimates are inherently unreliable. CFA Institute research found PEG "almost never provides consistent buying opportunities" at the traditional 1.0 threshold.

### 6. Free Cash Flow Yield

**Formula:** (Operating Cash Flow − CapEx) ÷ Market Cap

*Like cash-on-cash return from a rental after repairs.* Buy rental for $200,000, have $10,000 actual cash at year-end = 5% FCF yield. This is real money, not accounting profit.

**Why it matters:** Earnings can be manipulated through accounting; cash is cash.

**Benchmarks:**
- High yield (>8%): Potential undervaluation, strong cash generation
- Low yield (<3%): Potential overvaluation or heavy reinvestment

---

## Part 3: Sector-Specific Applications

### Banks & Financial Services

**Why P/B is essential:** Interest IS the core business. "Earnings before interest" ignores what banks do. Bank assets (loans, securities) are marked to market, making book value approximate fair value.

**Never use:** EV/EBITDA (meaningless for financials)

**P/B Ranges:**
| Sub-Sector | P/B Range | Notes |
|------------|-----------|-------|
| Premium Banks (JPM) | 1.5-2.5x | Strong ROE, asset quality |
| Healthy Average | 1.0-1.5x | Normal operations |
| Troubled Banks | 0.3-0.9x | Non-performing asset concerns |
| Regional Banks (2025) | 1.0-1.25x | CRE risk discounts |
| Money Center Banks | 1.3-1.8x | "Too Big to Fail" premium |
| P&C Insurance | 1.5-2.0x | Underwriting margin driven |

**Key insight:** P/B and ROE have a linear relationship. A bank earning 15% ROE deserves higher P/B than one earning 8%.

### Technology & SaaS

**Why revenue multiples:** 80% of biotech has no earnings. SaaS companies are *intentionally* unprofitable, reinvesting in growth. Revenue demonstrates product-market fit.

**Key Metrics:**
- **EV/Revenue (or EV/ARR):** Primary metric
- **Rule of 40:** Revenue Growth % + EBITDA Margin % ≥ 40
- **Net Revenue Retention (NRR):** >100% (ideally >120%)
- **LTV/CAC:** >3x is gold standard

**2025 SaaS Benchmarks:**
| Growth Profile | EV/Revenue |
|----------------|------------|
| Hyper Growth (>50%) | 12-20x |
| High Growth (30-50%) | 8-12x |
| Moderate Growth (15-30%) | 5-8x |
| Mature (<15%) | 3-5x |

**Efficiency premium:** Every 10-point improvement in Rule of 40 expands multiple by ~1.5x.

### REITs (Real Estate Investment Trusts)

**Why FFO, not P/E:** Buildings *appreciate*, but GAAP forces depreciation over 27-39 years, artificially lowering Net Income.

**Key Metrics:**
- **FFO:** Net Income + Depreciation − Gains on Sales
- **AFFO:** FFO − Maintenance CapEx (true distributable cash)
- **NAV:** Market value of properties minus debt

**2025 P/FFO Benchmarks:**
| REIT Type | P/FFO | Notes |
|-----------|-------|-------|
| Data Centers | 20-25x | AI demand premium, +15-20% NAV premium |
| Industrial/Logistics | 18-22x | E-commerce tailwinds |
| Residential | 15-20x | Housing shortage |
| Retail | 12-17x | Stabilized |
| Office | 8-10x | Work-from-home structural discount, -30 to -50% NAV |

### Energy (Oil & Gas)

**Why traditional metrics fail:** Commodity price volatility. At $100 oil, companies show massive earnings and "cheap" P/Es—right before earnings collapse. At trough prices, P/Es are infinite or negative—right before recovery.

**Specialized Metrics:**
- **EV/2P Reserves:** Value per barrel in the ground
- **EV/Production:** $ per BOE/day ($30,000-60,000 typical)
- **EV/DACF:** Debt-adjusted cash flow (handles leverage differences)
- **Reserve Replacement Ratio:** >100% = growing resource base

**Counter-intuitive pattern:** When oil prices HIGH → EV/EBITDA LOW (mean reversion expected). When oil LOW → multiples HIGH (recovery expected).

**2025 Benchmarks:**
| Sub-Sector | EV/EBITDA |
|------------|-----------|
| Integrated Majors | 5-7x |
| E&P | 3-5x |
| Oilfield Services | 7-8x |

### Utilities

**The Logic:** Regulated monopolies, stable cash flows, "bond proxies."

**Key Metrics:** P/E (reliable due to stable earnings), Dividend Yield

**2025 Context:** Re-rated due to "AI Power" thesis—data centers require massive baseload power.
- Forward P/E: ~18.5x (historical average: 15x)
- IPPs seeing 25-30% earnings growth
- Target dividend yields: 3.5-4.5% for regulated electrics

---

## Part 4: Twenty Years of Valuation History

### 2008 Crisis: When Metrics Fail

Pre-crisis S&P 500 P/E: 17-23x (reasonable). Bank P/B: 2.4x weighted average.

Then: S&P 500 P/E **spiked to 70.91**—not because stocks were expensive, but because earnings collapsed. Trailing P/E indicated "expensive" precisely when stocks were cheapest.

Bank P/Bs collapsed below 1.0x. Some financials (AIG, Genworth) fell 90-97%.

**Lesson:** Defensive sectors (Staples, Healthcare, Utilities) consistently outperform during crises. Watch for P/B <1.0x as distress signal.

### 2009-2021: The Growth Premium

Fed's QE programs drove rates to historic lows. Lower discount rates make future cash flows more valuable → structural advantage for growth stocks.

**Growth outperformed value for 12+ consecutive years.** Tech P/S ratios expanded to 10-20x+ (historical norm: 3-5x). REITs and utilities became "bond proxies."

### COVID-19 (2020): Widest Sector Divergence Ever

S&P 500 dropped 34% in weeks. Recovery created **80 percentage point spread** between best and worst sectors.

- Technology: +47.5%
- Energy: -56%
- Tesla P/E exceeded 1,000x at points
- GameStop: $5 → $483 with negative earnings

Trailing P/E hit 38.3—only reached twice before (2001-02, 2008-09).

### 2022-23: Growth Premium Reverses

Fed raised rates 11 times to 5.25-5.50%—highest since 2002.

- MSCI World Growth: -30%
- MSCI World Value: -8.5%
- NASDAQ: -33%
- High-growth unprofitable companies: -70 to -90%

**Mechanism:** Higher discount rates reduce present value of future cash flows. Companies with profits 10 years away hit harder than dividend payers today.

---

## Part 5: Current Valuations (2024-2025)

### Sector Rankings by Historical Deviation

| Rank | Sector | Current P/E | vs 10Y Avg | Status |
|------|--------|-------------|------------|--------|
| 1 | Real Estate | 33.23 | -1.31σ | Relatively cheap |
| 2 | Communication Services | 18.13 | +0.06σ | Fair value |
| 3 | Energy | 17.37 | -0.13σ | Fair value |
| 4 | Consumer Staples | 22.44 | +1.12σ | Fair/Elevated |
| 5 | Consumer Discretionary | 29.81 | +1.49σ | Overvalued |
| 6 | Materials | 23.08 | +1.85σ | Overvalued |
| 7 | Healthcare | 26.13 | +1.90σ | Overvalued |
| 8 | Industrials | 25.98 | +1.99σ | Overvalued |
| 9 | Information Technology | 38.25 | +2.29σ | Expensive |
| 10 | Utilities | 22.26 | +2.63σ | Expensive |
| 11 | Financials | 18.08 | +2.80σ | Expensive |

**Overall S&P 500:** P/E 27-31x (trailing), ~22x (forward), +2.65σ above 10-year average.

### Technology Sub-Sector Detail

| Sub-Sector | P/S | P/B | EV/EBITDA |
|------------|-----|-----|-----------|
| Semiconductors | 14.26 | 11.12 | 34.48 |
| System Software | 11.20 | 10.73 | 27.98 |
| Internet Software | 7.01 | 8.72 | 28.08 |
| Computer Services | 1.16 | 4.55 | 14.29 |

---

## Part 6: Critical Limitations

### Debt Distorts P/E

Two companies with identical $100M operating income:
- Company A (no debt): $100M → ~$75M net income
- Company B ($500M debt at 8%): $60M → ~$45M net income

P/E 67% higher for identical operations. **Use EV/EBITDA for leverage comparisons.**

### Non-GAAP Proliferation

97% of S&P 500 companies use non-GAAP adjustments, which "almost always tell a more positive story." Companies exclude "non-recurring" costs that may actually recur.

**Rule:** If a company excludes "non-recurring" items every quarter, those items are recurring.

### Cyclical Industries Are Counter-Intuitive

**Low P/E ratios often signal peak earnings.** McKinsey: "Consensus earnings forecasts for cyclical companies appeared to ignore cyclicality entirely."

Pattern: P/E **compresses during profit upswings** (sell signal), **expands during downswings** (buy signal).

**Solution:** Use normalized P/E (7-10 year average) or P/B (more stable than earnings).

### FCF Can Be Manipulated

Companies can boost FCF by delaying necessary CapEx, stretching payables, or accelerating receivables.

**Critical distinction:** Maintenance CapEx vs. Growth CapEx (not disclosed, not audited).

**Rule:** Normalize FCF over 3-5 years. If CapEx < Depreciation for extended periods, company is underinvesting.

### Value Traps

Howard Marks: "'Carrying low valuation parameters' is far from synonymous with 'underpriced.'"

Companies facing secular headwinds may deserve low multiples forever. Newspapers at 5x earnings weren't cheap—they were correctly priced for decline.

**Rule:** Assess business quality before price. Never base thesis on valuation alone.

---

## Part 7: Decision Frameworks

### Match Metric to Lifecycle

| Stage | Primary Metrics | Avoid |
|-------|-----------------|-------|
| Pre-revenue | Price per user, EV/Revenue if sales exist | P/E, EV/EBITDA |
| High-growth (>20%) | EV/Revenue, Rule of 40, Forward P/E | Trailing P/E |
| Mature (<15% growth) | P/E, EV/EBITDA, DCF, Dividend Yield | P/S |
| Declining | Book Value, Liquidation Value | Growth-based metrics |

### Sector Override Rules

| Sector | Primary | Secondary | Never Use |
|--------|---------|-----------|-----------|
| Banks/Insurance | P/B, P/TBV | ROE | EV/EBITDA |
| REITs | P/FFO, P/AFFO | NAV, Div Yield | P/E |
| Energy E&P | EV/Reserves, EV/Production | Normalized EV/EBITDA | Trailing P/E |
| SaaS | EV/Revenue, ARR multiples | Rule of 40, NRR | P/B |
| Cyclicals | Normalized earnings | Mid-cycle EV/EBITDA | Peak-cycle P/E |

### Capital Structure Adjustment

- **High debt (D/E >1.5x):** Use EV-based metrics exclusively
- **Low/no debt:** Both equity and enterprise metrics work
- **Convertible securities:** Use fully diluted share counts

### Red Flags

- P/E >2x growth rate
- Debt/EBITDA >5x
- Negative FCF for 3+ consecutive years
- Revenue declining 2+ years
- Margin compression

---

## Part 8: Emerging Trends (2025)

### The AI CapEx Cycle

Big Tech spending tens of billions on AI infrastructure. EBITDA looks strong, but FCF suppressed by massive CapEx.

**Warning:** Investors using EV/EBITDA for AI stocks may be blindsided by cash drain. Always check FCF conversion.

### The Intangible Asset Anomaly

As economy becomes service-oriented, Book Value becomes less relevant. Market P/B has drifted higher for decades—not necessarily overvaluation, but accounting's failure to capture R&D and brand value as assets.

### Return of Cost of Capital

After a decade of near-zero rates justifying infinite growth multiples, rates have normalized. This compresses multiples for "Long Duration" assets (Biotech, unprofitable Tech) more than "Short Duration" (Energy, Cash Cows).

---

## Master Valuation Matrix

| Sector | Primary Metric | Secondary | Red Flag Metric | Rationale |
|--------|----------------|-----------|-----------------|-----------|
| Banking | P/TBV | ROE | EV/EBITDA | Interest is operating, not expense |
| SaaS/Tech | EV/Revenue | Rule of 40 | P/B | Intangible assets, negative earnings |
| REITs | P/AFFO | NAV Premium | P/E | Depreciation is non-cash |
| Industrials | EV/EBITDA | FCF Yield | P/E (cyclical) | Heavy depreciation, varied debt |
| Energy | EV/DACF | EV/Production | P/E | Depletion distorts earnings |
| Retail | P/E | Same-Store Sales | EV/Sales | Thin margins |
| Utilities | P/E | Dividend Yield | EV/Revenue | Stable regulation |

---

## Key Principles

1. **Context dominates absolute numbers.** P/E of 25x is expensive for a utility, cheap for high-growth tech.

2. **Cash is truth.** When in doubt, look at Free Cash Flow. Accounting profits can be massaged; cash cannot.

3. **Respect the cycle.** Low P/E in cyclicals often signals peak (sell). High P/E often signals trough (buy).

4. **Quality before price.** Assess business fundamentals before concluding low valuation = opportunity.

5. **Multiple metrics provide error-correction.** When P/E, EV/EBITDA, and FCF Yield converge, confidence increases. When they diverge, investigate.
