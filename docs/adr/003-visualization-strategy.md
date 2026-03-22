# ADR-003: Visualization Strategy

## Status
Accepted

## Context
Benchmark results need to be presented in a way that enables quick decision-making across 12 benchmarks and 15+ technologies.

## Decision
- Dashboard built with React 19 + TypeScript + Vite + Tailwind CSS 4
- Charts powered by Recharts (bar charts for latency comparisons, tables for detailed data)
- Five main views:
  1. **Suite Overview** — Card grid showing all 12 benchmarks with grades
  2. **Benchmark Detail** — Latency charts + full scenario table for a single benchmark
  3. **Cross-Benchmark Comparison** — Filter by technology, see it across all benchmarks
  4. **Run History** — Track results over time (future: regression detection)
  5. **Decision Matrix** — Sortable table of all technologies with aggregated metrics
- Data loaded from static JSON files in `public/data/`
- No backend required; results are committed to the repo

## Consequences
- Dashboard can be deployed as a static site (GitHub Pages, Vercel, Netlify)
- Adding new benchmark results requires copying JSON to `public/data/`
- Future: REST API integration for live results from benchmark-validator
