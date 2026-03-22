# ADR-001: Benchmark Suite Architecture

## Status
Accepted

## Context
The UnityInFlow benchmark suite consists of 12 independent repositories, each comparing technologies in a specific domain.

## Decision
- Each benchmark is an independent git repo under the UnityInFlow GitHub org
- Shared code lives in `shared-benchmark-schema` (Kotlin library, Gradle composite build)
- Dashboard is a separate React app that consumes JSON result files
- Results are JSON files conforming to the `BenchmarkResult` schema (v2.0)

## Consequences
- Benchmarks can be developed, tested, and deployed independently
- Dashboard aggregates results from all benchmarks
- Schema changes require coordination via the shared module
