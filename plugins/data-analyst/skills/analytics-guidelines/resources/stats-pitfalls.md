# Statistical pitfalls

Ways a statistically defensible-looking result can still mislead. Referenced by `analyst-peer-review` and `metric-design`.

## Sample size and significance

- A "statistically significant" result on a small sample can still be practically meaningless, and a large sample can make a trivial effect size "significant." Always report the effect size and a confidence interval next to any p-value, not the p-value alone.
- Thin samples (small N per segment, few days of data, a handful of events) produce noisy estimates that look precise because they're expressed as a percentage. A 2-of-5 conversion rate reported as "40%" implies far more precision than it has.
- Multiple comparisons: testing many segments, metrics, or time windows and reporting only the one that crossed a significance threshold overstates the finding. If several cuts were tried, say so and adjust expectations (or the threshold) accordingly.

## Distributions

- A mean can hide a bimodal or heavily skewed distribution. Two populations with very different behavior can average out to a number that describes neither. Check the distribution (histogram, percentiles) before reporting only the mean.
- Heavy-tailed metrics (revenue per user, session length, support ticket resolution time) are dominated by a small number of extreme values — a mean moves a lot when one outlier is added or removed. Consider median, trimmed mean, or reporting the outlier separately.
- Ratio metrics (a rate, a percentage) have their own variance behavior — a rate's confidence interval depends on the denominator size, not just the rate itself. A rate on a denominator of 20 is much noisier than the same rate on a denominator of 20,000.

## Causal reasoning

- Correlation is not causation. Before attributing a change in B to a change in A, ask what else moved at the same time.
- Base rate neglect: a filter or model that catches 95% of a rare event can still produce mostly false positives if the event's base rate is low enough. Always reason about precision, not just recall, when the population is imbalanced.
- Regression to the mean: an extreme observation (best week ever, worst performer) is likely to be less extreme next period even with no intervention — don't credit an intervention for what regression alone would predict.

## When reviewing someone else's stats claim

Ask: what's the sample size behind this number? Is a confidence interval or effect size reported, or only significance? Does the metric's distribution support using a mean? Were multiple cuts tried before this one was chosen? Is there a simpler explanation (seasonality, mix shift, regression to the mean) than the one being claimed?
