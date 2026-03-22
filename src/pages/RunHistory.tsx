import { useEffect, useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { BenchmarkResult } from '../types/benchmark'

const BENCHMARK_IDS = ['B01','B02','B03','B04','B05','B06','B07','B08','B09','B10','B11','B12']

const BENCHMARK_NAMES: Record<string, string> = {
  B01: 'Database Workload',
  B02: 'Data Warehouse',
  B03: 'Caching Strategies',
  B04: 'Serialization Formats',
  B05: 'Search Engine',
  B06: 'Connection Pool',
  B07: 'Distributed Locking',
  B08: 'Message Queue',
  B09: 'Rate Limiting',
  B10: 'Reactive vs Blocking',
  B11: 'DB Index Strategies',
  B12: 'Event Sourcing',
}

const LINE_COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed',
  '#0891b2', '#be185d', '#65a30d', '#ea580c', '#4f46e5',
  '#0d9488', '#c026d3',
]

interface RunData {
  benchmarkId: string
  runs: BenchmarkResult[]
}

interface Regression {
  scenario: string
  previousP99: number
  currentP99: number
  changePercent: number
  runDate: string
}

// --- Sub-components ---

function RunSelector({
  selectedId,
  onSelect,
  availableIds,
}: {
  selectedId: string
  onSelect: (id: string) => void
  availableIds: string[]
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <label htmlFor="benchmark-select" className="text-sm font-medium text-gray-700">
        Benchmark:
      </label>
      <select
        id="benchmark-select"
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {availableIds.map((id) => (
          <option key={id} value={id}>
            {id} - {BENCHMARK_NAMES[id] ?? id}
          </option>
        ))}
      </select>
    </div>
  )
}

function TrendChart({ runs }: { runs: BenchmarkResult[] }) {
  // Build chart data: one point per run, each scenario is a line
  const scenarioNames = useMemo(() => {
    const names = new Set<string>()
    for (const run of runs) {
      for (const s of run.scenarios) {
        names.add(s.name)
      }
    }
    return [...names]
  }, [runs])

  const chartDataP50 = useMemo(() => {
    return runs.map((run, idx) => {
      const point: Record<string, string | number> = {
        run: `Run ${idx + 1} (${new Date(run.runAt).toLocaleDateString()})`,
      }
      for (const s of run.scenarios) {
        point[s.name] = s.metrics.p50Ms
      }
      return point
    })
  }, [runs])

  const chartDataP99 = useMemo(() => {
    return runs.map((run, idx) => {
      const point: Record<string, string | number> = {
        run: `Run ${idx + 1} (${new Date(run.runAt).toLocaleDateString()})`,
      }
      for (const s of run.scenarios) {
        point[s.name] = s.metrics.p99Ms
      }
      return point
    })
  }, [runs])

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">p50 Latency Trend (ms)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartDataP50}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="run" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {scenarioNames.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">p99 Latency Trend (ms)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartDataP99}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="run" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {scenarioNames.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function RegressionAlert({ regressions }: { regressions: Regression[] }) {
  if (regressions.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-green-600 font-semibold text-sm">No regressions detected</span>
          <span className="text-green-500 text-sm">All scenarios within 10% p99 tolerance.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
      <h3 className="text-red-700 font-semibold mb-3">
        Regression Detected ({regressions.length} scenario{regressions.length > 1 ? 's' : ''})
      </h3>
      <div className="space-y-2">
        {regressions.map((r) => (
          <div
            key={r.scenario}
            className="flex items-center justify-between bg-white rounded-lg border border-red-100 px-4 py-2"
          >
            <span className="font-medium text-gray-900 text-sm">{r.scenario}</span>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">
                p99: {r.previousP99.toFixed(3)}ms &rarr; {r.currentP99.toFixed(3)}ms
              </span>
              <span className="text-red-600 font-bold">+{r.changePercent.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SingleRunSummary({ run }: { run: BenchmarkResult }) {
  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-blue-700 text-sm">
          <strong>Single run available.</strong> Multiple runs needed for trend data.
          Add timestamped result files (e.g., <code className="bg-blue-100 px-1 rounded">B04-1711234567.json</code>) to see trends.
        </p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-6 py-3">Scenario</th>
              <th className="px-6 py-3">Database</th>
              <th className="px-6 py-3 text-right">p50 (ms)</th>
              <th className="px-6 py-3 text-right">p95 (ms)</th>
              <th className="px-6 py-3 text-right">p99 (ms)</th>
              <th className="px-6 py-3 text-right">Throughput (ops/s)</th>
              <th className="px-6 py-3 text-right">Error %</th>
              <th className="px-6 py-3 text-center">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {run.scenarios.map((s) => (
              <tr key={s.name} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium">{s.name}</td>
                <td className="px-6 py-3 text-gray-500">{s.database}</td>
                <td className="px-6 py-3 text-right font-mono">{s.metrics.p50Ms.toFixed(3)}</td>
                <td className="px-6 py-3 text-right font-mono">{s.metrics.p95Ms.toFixed(3)}</td>
                <td className="px-6 py-3 text-right font-mono">{s.metrics.p99Ms.toFixed(3)}</td>
                <td className="px-6 py-3 text-right font-mono">{s.metrics.throughputOpsPerSec.toFixed(0)}</td>
                <td className="px-6 py-3 text-right font-mono">{s.metrics.errorRatePct.toFixed(1)}</td>
                <td className="px-6 py-3 text-center">
                  {s.metrics.grade ? (
                    <span className="px-2 py-0.5 rounded text-xs font-bold">
                      {s.metrics.grade}
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Run at: {new Date(run.runAt).toLocaleString()} | Version: {run.version} | Environment: {run.environment.jvmVersion} / Kotlin {run.environment.kotlinVersion}
      </div>
    </div>
  )
}

// --- Main page ---

export function RunHistory() {
  const [allRunData, setAllRunData] = useState<RunData[]>([])
  const [selectedId, setSelectedId] = useState<string>(BENCHMARK_IDS[0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAllRuns() {
      const runDataMap = new Map<string, BenchmarkResult[]>()

      // Load canonical files (B01.json through B12.json)
      const canonicalLoads = BENCHMARK_IDS.map(async (id) => {
        try {
          const response = await fetch(`/data/${id}.json`)
          if (response.ok) {
            const result: BenchmarkResult = await response.json()
            if (!runDataMap.has(id)) runDataMap.set(id, [])
            runDataMap.get(id)!.push(result)
          }
        } catch {
          // skip missing files
        }
      })

      await Promise.all(canonicalLoads)

      // Try to load timestamped files (B04-1711234567.json pattern)
      // We probe a few known patterns; in a real app this would come from an API
      const timestampProbes: Promise<void>[] = []
      for (const id of BENCHMARK_IDS) {
        // Probe for up to 10 timestamped runs per benchmark
        for (let i = 1; i <= 10; i++) {
          timestampProbes.push(
            (async () => {
              try {
                const response = await fetch(`/data/${id}-${i}.json`)
                if (response.ok) {
                  const result: BenchmarkResult = await response.json()
                  if (!runDataMap.has(id)) runDataMap.set(id, [])
                  runDataMap.get(id)!.push(result)
                }
              } catch {
                // skip
              }
            })()
          )
        }
      }

      await Promise.all(timestampProbes)

      // Sort runs by date for each benchmark
      const results: RunData[] = []
      for (const id of BENCHMARK_IDS) {
        const runs = runDataMap.get(id)
        if (runs && runs.length > 0) {
          runs.sort((a, b) => new Date(a.runAt).getTime() - new Date(b.runAt).getTime())
          results.push({ benchmarkId: id, runs })
        }
      }

      setAllRunData(results)
      // Select first benchmark that has data
      if (results.length > 0) {
        setSelectedId(results[0].benchmarkId)
      }
      setLoading(false)
    }

    loadAllRuns()
  }, [])

  const selectedRunData = useMemo(
    () => allRunData.find((rd) => rd.benchmarkId === selectedId),
    [allRunData, selectedId]
  )

  const regressions = useMemo<Regression[]>(() => {
    if (!selectedRunData || selectedRunData.runs.length < 2) return []

    const runs = selectedRunData.runs
    const prevRun = runs[runs.length - 2]
    const currRun = runs[runs.length - 1]
    const result: Regression[] = []

    for (const currScenario of currRun.scenarios) {
      const prevScenario = prevRun.scenarios.find((s) => s.name === currScenario.name)
      if (!prevScenario) continue

      const prevP99 = prevScenario.metrics.p99Ms
      const currP99 = currScenario.metrics.p99Ms
      if (prevP99 > 0) {
        const changePct = ((currP99 - prevP99) / prevP99) * 100
        if (changePct > 10) {
          result.push({
            scenario: currScenario.name,
            previousP99: prevP99,
            currentP99: currP99,
            changePercent: changePct,
            runDate: currRun.runAt,
          })
        }
      }
    }

    return result
  }, [selectedRunData])

  const availableIds = useMemo(
    () => allRunData.map((rd) => rd.benchmarkId),
    [allRunData]
  )

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading run history...</div>
  }

  if (allRunData.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Run History</h1>
        <p className="text-gray-500 mb-6">Track benchmark results over time and detect regressions</p>
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
          <p className="text-lg mb-2">No Data Available</p>
          <p className="text-sm">
            No benchmark result files found in <code>public/data/</code>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Run History</h1>
      <p className="text-gray-500 mb-6">Track benchmark results over time and detect regressions</p>

      <RunSelector
        selectedId={selectedId}
        onSelect={setSelectedId}
        availableIds={availableIds}
      />

      {selectedRunData && selectedRunData.runs.length > 1 && (
        <>
          <RegressionAlert regressions={regressions} />
          <TrendChart runs={selectedRunData.runs} />
        </>
      )}

      {selectedRunData && selectedRunData.runs.length === 1 && (
        <SingleRunSummary run={selectedRunData.runs[0]} />
      )}

      {!selectedRunData && (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
          <p>No data for selected benchmark.</p>
        </div>
      )}
    </div>
  )
}
