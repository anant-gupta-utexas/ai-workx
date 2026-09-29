# Analytics traps

Structural mistakes that make an analysis's output wrong or misleading, independent of the specific SQL dialect or stats test used. Referenced by `feasibility-check`, `analyst-peer-review`, and `data-profile`.

## Traps that produce wrong numbers

**Join fan-out.** A join where the "many" side isn't unique on the join key silently multiplies rows. An order joined to a `refunds` table where an order can have multiple partial refunds will inflate every metric downstream unless the analyst rolls refunds up first. Check: is the join key unique on at least one side? If not, what is the intended cardinality, and does the query enforce it?

**Grain mismatch.** A metric computed at the wrong granularity before being rolled up. Example: computing an average price per order when the real unit of analysis is per line item, so a `GROUP BY order_id` collapses rows that shouldn't be combined. Check: what grain does the raw data have, and what grain does the metric need? If they differ, is the rollup direction (fine to coarse) correct, and does it use the right aggregation (sum vs. average vs. count-distinct)?

**NULL handling.** `COUNT(*)` counts NULLs, `COUNT(column)` doesn't. `SUM`/`AVG` skip NULLs silently, which changes the denominator. A `WHERE column = value` clause excludes NULL rows without a warning. Check: does a NULL in a key column mean "zero," "unknown," or "not applicable" here — and does the query treat it that way?

**DISTINCT masking duplication.** Slapping `DISTINCT` on a query that has an upstream duplication problem (usually a join fan-out) hides the bug instead of fixing it — and can silently drop legitimate near-duplicate rows too.

**Temporal boundary errors.** Off-by-one in date ranges (`>= start AND < end` vs. `<= end`), an incomplete period at the edge of the data (today's partial day counted like a full day), and look-ahead bias (a "predictor" computed using data that wouldn't have been available yet).

**Denominator drift.** A rate's denominator changes population over the period being compared (e.g., "conversion rate" where the population definition changed mid-quarter), making the trend meaningless even if each period's math is correct.

## Traps that produce misleading conclusions on correct numbers

**Survivorship bias.** Looking only at users, accounts, or cohorts that are still around, missing everyone who churned, closed, or was filtered out earlier in the pipeline. A retention analysis on "active users as of today" over-samples the users who stuck around.

**Simpson's paradox / mix shift.** An aggregate metric moves one direction while every meaningful subgroup moves the other direction (or stays flat), because the mix of subgroups shifted. Always check whether a topline number holds when broken out by the segments most likely to have shifted in size (channel, region, plan tier, cohort age).

**Confounding.** A correlation is attributed to the wrong cause because a third factor drives both. Before claiming "A caused B," ask what else changed at the same time that could explain both.

**Excluded segments, silently.** A `WHERE` clause or a join condition drops a population segment (e.g., internal accounts, trial users, a specific region) without that exclusion being visible in the output or communicated to the audience.

## A quick pre/post-join sanity habit

Before trusting a joined result, compare row counts:
1. Count rows in the base table alone.
2. Count rows after the join.
3. If (2) > (1) and it shouldn't be, one side of the join isn't unique on the key — find it before reading any further numbers.
