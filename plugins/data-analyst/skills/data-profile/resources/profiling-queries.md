# Profiling queries

SQL templates and Python/duckdb snippets for the checks in `data-profile`. Substitute `<table>`, `<key_col>`, `<date_col>`, and `<value_col>` for the real names. All queries are read-only.

## Grain and key uniqueness

```sql
select
  count(*) as total_rows,
  count(distinct <key_col>) as distinct_keys,
  count(*) - count(distinct <key_col>) as duplicate_rows
from <table>;
```

If `<key_col>` is a composite key (e.g., user + date), concatenate or group on both:

```sql
select <key_col>, <date_col>, count(*) as row_count
from <table>
group by <key_col>, <date_col>
having count(*) > 1
limit 20;
```

## Row counts over time (gaps, spikes, partial latest period)

```sql
select
  date_trunc('day', <date_col>) as day,
  count(*) as row_count
from <table>
where <date_col> >= current_date - interval '90' day
group by 1
order by 1;
```

Look at the last 1-2 rows specifically: if the most recent day/week is well below the trailing 7-day average, treat it as a partial load until confirmed otherwise.

```sql
select
  avg(row_count) as trailing_avg,
  max(day) as latest_day
from (
  select date_trunc('day', <date_col>) as day, count(*) as row_count
  from <table>
  where <date_col> >= current_date - interval '8' day
    and <date_col> < current_date
  group by 1
) recent;
```

## Freshness

```sql
select
  max(<date_col>) as latest_timestamp,
  current_timestamp - max(<date_col>) as staleness
from <table>;
```

## Null rate and cardinality per column

```sql
select
  count(*) as total_rows,
  count(<value_col>) as non_null_rows,
  count(*) - count(<value_col>) as null_rows,
  count(distinct <value_col>) as distinct_values
from <table>;
```

## Sentinel and placeholder values

```sql
select <value_col>, count(*) as occurrences
from <table>
where <value_col> in (-1, 0, 9999, 99999)
   or <value_col>::text in ('1970-01-01', '9999-12-31', '', 'N/A', 'NULL', 'null')
group by 1
order by 2 desc
limit 20;
```

## Outliers on a numeric column

```sql
select
  min(<value_col>) as min_val,
  percentile_cont(0.01) within group (order by <value_col>) as p01,
  percentile_cont(0.50) within group (order by <value_col>) as median,
  percentile_cont(0.99) within group (order by <value_col>) as p99,
  max(<value_col>) as max_val,
  avg(<value_col>) as mean
from <table>;
```

A large gap between `p99` and `max_val` (or `p01` and `min_val`) relative to the median-to-p99 spread flags extreme tail values worth inspecting individually.

## Join integrity (orphan rate and fan-out)

```sql
-- Orphan rate: rows on the left with no match on the right
select
  count(*) as left_rows,
  count(r.<key_col>) as matched_rows,
  count(*) - count(r.<key_col>) as orphan_rows
from <left_table> l
left join <right_table> r on l.<key_col> = r.<key_col>;

-- Fan-out: does the right side have more than one row per key?
select <key_col>, count(*) as matches
from <right_table>
group by <key_col>
having count(*) > 1
limit 20;
```

## Test / internal account detection

```sql
select <key_col>, count(*) as event_count
from <table>
where <key_col> in (/* known internal/test IDs, if any */)
   or <value_col> ilike '%@yourcompany.com'
   or <value_col> ilike '%test%'
group by 1
order by 2 desc
limit 20;
```

## Local files with duckdb (no import step needed)

```bash
duckdb -c "
  select
    count(*) as total_rows,
    count(distinct key_col) as distinct_keys
  from read_csv_auto('path/to/file.csv');
"

duckdb -c "
  select date_trunc('day', date_col) as day, count(*)
  from read_parquet('path/to/file.parquet')
  group by 1 order by 1;
"
```

## Local files with pandas (fallback if duckdb isn't installed)

```python
import pandas as pd

df = pd.read_csv("path/to/file.csv")  # or pd.read_parquet(...)

print("rows:", len(df), "distinct keys:", df["key_col"].nunique())
print(df.isna().mean().sort_values(ascending=False))  # null rate per column
print(df.groupby(df["date_col"].str[:10]).size())      # row counts per day
print(df["value_col"].describe(percentiles=[0.01, 0.5, 0.99]))  # outlier check
```
