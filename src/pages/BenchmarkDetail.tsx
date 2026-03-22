import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { BenchmarkResult } from '../types/benchmark'
import { getGradeColor } from '../data/loader'

export function BenchmarkDetail() {
  const { id } = useParams<{ id: string }>()
  const [result, setResult] = useState<BenchmarkResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/data/${id}.json`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setResult(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>
  if (!result) return (
    <div className="text-center py-20">
      <p className="text-gray-500 mb-4">No data available for {id}</p>
      <Link to="/" className="text-blue-600 hover:underline">Back to overview</Link>
    </div>
  )

  const chartData = result.scenarios.map(s => ({
    name: s.name.length > 25 ? s.name.substring(0, 25) + '...' : s.name,
    fullName: s.name,
    p50: s.metrics.p50Ms,
    p95: s.metrics.p95Ms,
    p99: s.metrics.p99Ms,
    throughput: s.metrics.throughputOpsPerSec,
    grade: s.metrics.grade || '-',
    ciLower: s.metrics.confidenceInterval95Lower,
    ciUpper: s.metrics.confidenceInterval95Upper,
    cv: s.metrics.coefficientOfVariation,
    stdDev: s.metrics.standardDeviation,
    sampleSize: s.metrics.sampleSize,
    outlierCount: s.metrics.outlierCount,
  }))

  return (
    <div>
      <Link to="/" className="text-blue-600 hover:underline text-sm mb-4 inline-block">&larr; Back</Link>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{result.benchmarkName}</h1>
        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{result.benchmarkId}</span>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">v{result.version}</span>
      </div>

      <div className="bg-white rounded-xl border p-4 mb-6 text-sm text-gray-500">
        Run: {new Date(result.runAt).toLocaleString()} |
        CPU: {result.environment.hostCpuCores} cores |
        RAM: {result.environment.hostMemoryGb}GB |
        JVM: {result.environment.jvmVersion} |
        Kotlin: {result.environment.kotlinVersion}
      </div>

      {/* Latency Chart */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Latency Comparison (ms)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
            <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="p50" fill="#3b82f6" name="p50" />
            <Bar dataKey="p95" fill="#f59e0b" name="p95" />
            <Bar dataKey="p99" fill="#ef4444" name="p99" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scenario Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <h2 className="text-xl font-semibold p-6 pb-4">Scenario Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-6 py-3">Scenario</th>
                <th className="px-6 py-3">Database</th>
                <th className="px-6 py-3 text-right">p50 (ms)</th>
                <th className="px-6 py-3 text-right">p95 (ms)</th>
                <th className="px-6 py-3 text-right">p99 (ms)</th>
                <th className="px-6 py-3 text-right">Throughput</th>
                <th className="px-6 py-3 text-right">CV%</th>
                <th className="px-6 py-3 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.scenarios.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{s.name}</td>
                  <td className="px-6 py-3 text-gray-500">{s.database}</td>
                  <td className="px-6 py-3 text-right font-mono">{s.metrics.p50Ms.toFixed(3)}</td>
                  <td className="px-6 py-3 text-right font-mono">{s.metrics.p95Ms.toFixed(3)}</td>
                  <td className="px-6 py-3 text-right font-mono">{s.metrics.p99Ms.toFixed(3)}</td>
                  <td className="px-6 py-3 text-right font-mono">{s.metrics.throughputOpsPerSec.toFixed(0)}</td>
                  <td className="px-6 py-3 text-right font-mono">
                    {s.metrics.coefficientOfVariation?.toFixed(1) ?? '-'}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getGradeColor(s.metrics.grade || '-')}`}>
                      {s.metrics.grade || '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
