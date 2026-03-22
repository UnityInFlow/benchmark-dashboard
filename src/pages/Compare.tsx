import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { BenchmarkResult } from '../types/benchmark'

const TECHNOLOGIES = ['PostgreSQL', 'Redis', 'MongoDB', 'ClickHouse', 'OpenSearch', 'Kafka', 'RabbitMQ', 'Meilisearch', 'Typesense', 'DuckDB', 'Hazelcast', 'Caffeine', 'ZooKeeper']

export function Compare() {
  const [results, setResults] = useState<BenchmarkResult[]>([])
  const [selectedTech, setSelectedTech] = useState<string>('Redis')

  useEffect(() => {
    const ids = ['B01','B02','B03','B04','B05','B06','B07','B08','B09','B10','B11','B12']
    Promise.all(ids.map(id => fetch(`/data/${id}.json`).then(r => r.ok ? r.json() : null).catch(() => null)))
      .then(data => setResults(data.filter(Boolean)))
  }, [])

  const matchingScenarios = results.flatMap(r =>
    r.scenarios
      .filter((s: { database: string; name: string }) => s.database.toLowerCase().includes(selectedTech.toLowerCase()) || s.name.toLowerCase().includes(selectedTech.toLowerCase()))
      .map((s: { name: string; metrics: { p50Ms: number; p99Ms: number; throughputOpsPerSec: number; grade?: string } }) => ({ benchmark: r.benchmarkId, scenario: s.name, ...s.metrics }))
  )

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Cross-Benchmark Comparison</h1>
      <p className="text-gray-500 mb-6">Compare a technology across all benchmarks</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {TECHNOLOGIES.map(tech => (
          <button
            key={tech}
            onClick={() => setSelectedTech(tech)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedTech === tech
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {tech}
          </button>
        ))}
      </div>

      {matchingScenarios.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No results found for {selectedTech}</div>
      ) : (
        <>
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{selectedTech} — Latency Across Benchmarks</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={matchingScenarios} margin={{ bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scenario" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="p50Ms" fill="#3b82f6" name="p50" />
                <Bar dataKey="p99Ms" fill="#ef4444" name="p99" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-6 py-3">Benchmark</th>
                  <th className="px-6 py-3">Scenario</th>
                  <th className="px-6 py-3 text-right">p50 (ms)</th>
                  <th className="px-6 py-3 text-right">p99 (ms)</th>
                  <th className="px-6 py-3 text-right">Throughput</th>
                  <th className="px-6 py-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {matchingScenarios.map((s: Record<string, unknown>, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-xs">{s.benchmark as string}</td>
                    <td className="px-6 py-3">{s.scenario as string}</td>
                    <td className="px-6 py-3 text-right font-mono">{(s.p50Ms as number).toFixed(3)}</td>
                    <td className="px-6 py-3 text-right font-mono">{(s.p99Ms as number).toFixed(3)}</td>
                    <td className="px-6 py-3 text-right font-mono">{(s.throughputOpsPerSec as number).toFixed(0)}</td>
                    <td className="px-6 py-3 text-center text-xs font-bold">{(s.grade as string) || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
