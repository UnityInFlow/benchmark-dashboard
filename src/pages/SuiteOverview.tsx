import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { BenchmarkSummary } from '../types/benchmark'
import { loadAllResults, getGradeColor } from '../data/loader'

export function SuiteOverview() {
  const [benchmarks, setBenchmarks] = useState<BenchmarkSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllResults().then(results => {
      setBenchmarks(results)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-500">Loading benchmarks...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Benchmark Suite</h1>
      <p className="text-gray-500 mb-8">12 benchmarks, 15+ technologies, ~300 tests</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {benchmarks.map(b => (
          <Link
            key={b.id}
            to={`/benchmark/${b.id}`}
            className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-xs font-mono text-gray-400">{b.id}</span>
                <h3 className="text-lg font-semibold text-gray-900">{b.name}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(b.avgGrade)}`}>
                {b.avgGrade}
              </span>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <div>{b.scenarioCount} scenarios</div>
              {b.lastRun && <div>Last run: {new Date(b.lastRun).toLocaleDateString()}</div>}
              <div>{b.keyMetric}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
