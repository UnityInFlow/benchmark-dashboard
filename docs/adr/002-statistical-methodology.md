# ADR-002: Statistical Methodology

## Status
Accepted

## Context
Benchmark results need statistical rigor to be meaningful. Raw latency numbers without context can be misleading.

## Decision
- Each scenario runs a configurable number of iterations (default 100)
- Warmup iterations are excluded from measurements
- Metrics include p50, p95, p99 percentiles, throughput, and error rate
- v2.0 adds: standard deviation, coefficient of variation, 95% confidence intervals, outlier detection
- Grading system: A (excellent), B (good), C (acceptable), D (poor) based on CV and error rate
- Outliers detected using IQR method (1.5x interquartile range)

## Consequences
- Results are reproducible and statistically sound
- Grades provide quick assessment without diving into raw numbers
- Confidence intervals communicate measurement uncertainty
- Outlier detection prevents skewed results from affecting conclusions
