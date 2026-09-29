# SQL pitfalls

Dialect-adjacent mechanics that make a query return the wrong answer even though it runs without error. Referenced by `feasibility-check`, `analyst-peer-review`, and `data-profile`.

## NULL semantics

- `NULL = NULL` is `NULL`, not `TRUE`. Use `IS NULL` / `IS NOT NULL`, or `IS DISTINCT FROM` where the dialect supports it.
- `NOT IN (subquery)` returns no rows at all if the subquery contains any NULL. Prefer `NOT EXISTS`.
- `COUNT(*)` counts every row including NULLs in other columns; `COUNT(column)` skips rows where `column` is NULL. These two often disagree and both are "correct" for different questions.
- Aggregates (`SUM`, `AVG`, `MIN`, `MAX`) ignore NULLs. `AVG(column)` over a column that's 40% NULL is an average over the 60% that isn't — confirm that's the intended denominator.

## Arithmetic

- Integer division truncates in most dialects: `5 / 2` can silently return `2` instead of `2.5`. Cast at least one operand to a float/decimal type.
- Division by zero either errors or returns NULL/inf depending on dialect — guard denominators that can legitimately be zero (e.g., a rate with no events in the period).

## Joins and filters

- `LEFT JOIN b ON a.id = b.a_id WHERE b.column = 'x'` silently becomes an inner join: rows where `b` has no match get `NULL` for `b.column`, which fails the `WHERE`. Move the condition into the `ON` clause if unmatched rows should be kept.
- A join condition on a nullable key drops rows where the key is NULL on either side, with no error and no warning.
- Filtering on a column computed by a `LEFT JOIN` after an aggregation can change which rows survive the join in ways that are easy to miss in a long query.

## Window functions

- `ROWS` vs `RANGE` frames handle ties differently — a `RANGE` frame with a non-unique `ORDER BY` column can include more peer rows than expected.
- The default frame for most window functions is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, not the whole partition — running totals work as expected, but `MAX()` or `AVG()` used as a "reference value" for the whole partition needs an explicit `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.
- `LAG`/`LEAD` return NULL at partition edges — decide up front whether that should become 0, be dropped, or stay NULL.

## Timezones and dates

- `CURRENT_DATE` / `CURRENT_TIMESTAMP` resolve in the database session's timezone, which may not match the timezone the business reports in. A "daily" cutoff computed in UTC can shift events into the wrong day for a US-timezone stakeholder.
- Casting a timestamp to a date truncates, it doesn't round — a `2024-01-01 23:59:59 UTC` event can land on a different local date than expected.
- Comparing a `DATE` column to a `TIMESTAMP` literal (or vice versa) can silently include or exclude a full day depending on implicit casting rules.

## Sanity queries to run before trusting a result

```sql
-- Row count sanity: base table vs. after each join
select count(*) from base_table;
select count(*) from base_table b left join other_table o on b.key = o.key;

-- Is the join key actually unique on the "one" side?
select key, count(*) from other_table group by key having count(*) > 1 limit 20;

-- NULL rate on a column driving a filter or a metric
select
  count(*) as total_rows,
  count(column) as non_null_rows,
  count(*) - count(column) as null_rows
from base_table;
```
