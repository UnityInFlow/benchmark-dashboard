import type { BenchmarkResult, BenchmarkSummary } from '../types/benchmark'

const BENCHMARK_CONFIG: Record<string, { name: string; description: string }> = {
  B01: { name: 'Database Workload', description: 'PG, Mongo, OpenSearch, ClickHouse, Redis' },
  B02: { name: 'Data Warehouse', description: 'ClickHouse vs DuckDB' },
  B03: { name: 'Caching Strategies', description: 'Redis, Hazelcast, Caffeine' },
  B04: { name: 'Serialization Formats', description: 'JSON, Protobuf, Avro, MessagePack' },
  B05: { name: 'Search Engine', description: 'OpenSearch, Meilisearch, Typesense' },
  B06: { name: 'Connection Pool', description: 'HikariCP tuning' },
  B07: { name: 'Distributed Locking', description: 'Redis Redlock, ZooKeeper, PG advisory' },
  B08: { name: 'Message Queue', description: 'Kafka, RabbitMQ, Redis Streams' },
  B09: { name: 'Rate Limiting', description: 'Fixed/Sliding/Token/Leaky bucket' },
  B10: { name: 'Reactive vs Blocking', description: 'WebFlux vs MVC' },
  B11: { name: 'DB Index Strategies', description: 'B-tree, GIN, BRIN, partial' },
  B12: { name: 'Event Sourcing', description: 'Event Sourcing vs CRUD' },
}

export async function loadAllResults(): Promise<BenchmarkSummary[]> {
  const summaries: BenchmarkSummary[] = []

  for (const [id, config] of Object.entries(BENCHMARK_CONFIG)) {
    try {
      // Try to load from data/ directory (aggregated results)
      const response = await fetch(`/data/${id}.json`)
      if (response.ok) {
        const result: BenchmarkResult = await response.json()
        const grades = result.scenarios
          .map(s => s.metrics.grade)
          .filter((g): g is string => g !== undefined)
        const avgGrade = calculateAvgGrade(grades)

        summaries.push({
          id,
          name: config.name,
          lastRun: result.runAt,
          scenarioCount: result.scenarios.length,
          avgGrade,
          keyMetric: `${result.scenarios.length} scenarios`,
          result,
        })
      } else {
        summaries.push({
          id,
          name: config.name,
          scenarioCount: 0,
          avgGrade: '-',
          keyMetric: 'No data',
        })
      }
    } catch {
      summaries.push({
        id,
        name: config.name,
        scenarioCount: 0,
        avgGrade: '-',
        keyMetric: 'No data',
      })
    }
  }

  return summaries
}

function calculateAvgGrade(grades: string[]): string {
  if (grades.length === 0) return '-'
  const gradeValues: Record<string, number> = { A: 4, B: 3, C: 2, D: 1 }
  const avg = grades.reduce((sum, g) => sum + (gradeValues[g] || 0), 0) / grades.length
  if (avg >= 3.5) return 'A'
  if (avg >= 2.5) return 'B'
  if (avg >= 1.5) return 'C'
  return 'D'
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'text-green-600 bg-green-100'
    case 'B': return 'text-blue-600 bg-blue-100'
    case 'C': return 'text-yellow-600 bg-yellow-100'
    case 'D': return 'text-red-600 bg-red-100'
    default: return 'text-gray-400 bg-gray-100'
  }
}
