import { useEffect, useState, useCallback } from 'react'
import type { BenchmarkResult } from '../types/benchmark'
import { getGradeColor } from '../data/loader'
import { exportToPdf, exportToMarkdown } from '../utils/export'

interface TechScore {
  technology: string
  benchmarks: string[]
  avgP50: number
  avgP99: number
  avgThroughput: number
  avgGrade: string
  scenarioCount: number
}

export function DecisionMatrix() {
  const [scores, setScores] = useState<TechScore[]>([])
  const [sortBy, setSortBy] = useState<keyof TechScore>('avgP50')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const ids = ['B01','B02','B03','B04','B05','B06','B07','B08','B09','B10','B11','B12']
    Promise.all(ids.map(id => fetch(`/data/${id}.json`).then(r => r.ok ? r.json() : null).catch(() => null)))
      .then((data: (BenchmarkResult | null)[]) => {
        const techMap = new Map<string, { p50s: number[]; p99s: number[]; throughputs: number[]; grades: string[]; benchmarks: Set<string> }>()

        for (const r of data.filter(Boolean) as BenchmarkResult[]) {
          for (const s of r.scenarios) {
            const tech = s.database
            if (tech === 'N/A') continue
            if (!techMap.has(tech)) techMap.set(tech, { p50s: [], p99s: [], throughputs: [], grades: [], benchmarks: new Set() })
            const entry = techMap.get(tech)!
            entry.p50s.push(s.metrics.p50Ms)
            entry.p99s.push(s.metrics.p99Ms)
            entry.throughputs.push(s.metrics.throughputOpsPerSec)
            if (s.metrics.grade) entry.grades.push(s.metrics.grade)
            entry.benchmarks.add(r.benchmarkId)
          }
        }

        const gradeValues: Record<string, number> = { A: 4, B: 3, C: 2, D: 1 }
        const result: TechScore[] = []
        for (const [tech, techData] of techMap) {
          const avgGradeNum = techData.grades.length > 0
            ? techData.grades.reduce((s, g) => s + (gradeValues[g] || 0), 0) / techData.grades.length
            : 0
          result.push({
            technology: tech,
            benchmarks: [...techData.benchmarks],
            avgP50: techData.p50s.reduce((a, b) => a + b, 0) / techData.p50s.length,
            avgP99: techData.p99s.reduce((a, b) => a + b, 0) / techData.p99s.length,
            avgThroughput: techData.throughputs.reduce((a, b) => a + b, 0) / techData.throughputs.length,
            avgGrade: avgGradeNum >= 3.5 ? 'A' : avgGradeNum >= 2.5 ? 'B' : avgGradeNum >= 1.5 ? 'C' : 'D',
            scenarioCount: techData.p50s.length,
          })
        }
        setScores(result)
      })
  }, [])

  const sorted = [...scores].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    if (typeof aVal === 'number' && typeof bVal === 'number') return aVal - bVal
    return String(aVal).localeCompare(String(bVal))
  })

  const showToast = useCallback((message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const handleExportMarkdown = useCallback(() => {
    const headers = ['Technology', 'Scenarios', 'Avg p50 (ms)', 'Avg p99 (ms)', 'Avg Throughput', 'Grade', 'Benchmarks']
    const rows = sorted.map(s => [
      s.technology,
      String(s.scenarioCount),
      s.avgP50.toFixed(3),
      s.avgP99.toFixed(3),
      s.avgThroughput.toFixed(0),
      s.avgGrade,
      s.benchmarks.join(', '),
    ])
    const markdown = exportToMarkdown(headers, rows)
    navigator.clipboard.writeText(markdown).then(() => {
      showToast('Copied to clipboard')
    }).catch(() => {
      showToast('Failed to copy to clipboard')
    })
  }, [sorted, showToast])

  const handleExportPdf = useCallback(async () => {
    showToast('Generating PDF...')
    await exportToPdf('decision-matrix-table', 'decision-matrix.pdf')
    showToast('PDF downloaded')
  }, [showToast])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Decision Matrix</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportMarkdown}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Copy Markdown
          </button>
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Export PDF
          </button>
        </div>
      </div>
      <p className="text-gray-500 mb-6">Technology comparison across all benchmarks — click headers to sort</p>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 animate-fade-in">
          {toast}
        </div>
      )}

      <div id="decision-matrix-table" className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-6 py-3 cursor-pointer hover:text-gray-900" onClick={() => setSortBy('technology')}>Technology</th>
              <th className="px-6 py-3 text-right cursor-pointer hover:text-gray-900" onClick={() => setSortBy('scenarioCount')}>Scenarios</th>
              <th className="px-6 py-3 text-right cursor-pointer hover:text-gray-900" onClick={() => setSortBy('avgP50')}>Avg p50 (ms)</th>
              <th className="px-6 py-3 text-right cursor-pointer hover:text-gray-900" onClick={() => setSortBy('avgP99')}>Avg p99 (ms)</th>
              <th className="px-6 py-3 text-right cursor-pointer hover:text-gray-900" onClick={() => setSortBy('avgThroughput')}>Avg Throughput</th>
              <th className="px-6 py-3 text-center cursor-pointer hover:text-gray-900" onClick={() => setSortBy('avgGrade')}>Grade</th>
              <th className="px-6 py-3">Benchmarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map(s => (
              <tr key={s.technology} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-semibold">{s.technology}</td>
                <td className="px-6 py-3 text-right">{s.scenarioCount}</td>
                <td className="px-6 py-3 text-right font-mono">{s.avgP50.toFixed(3)}</td>
                <td className="px-6 py-3 text-right font-mono">{s.avgP99.toFixed(3)}</td>
                <td className="px-6 py-3 text-right font-mono">{s.avgThroughput.toFixed(0)}</td>
                <td className="px-6 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${getGradeColor(s.avgGrade)}`}>{s.avgGrade}</span>
                </td>
                <td className="px-6 py-3 text-xs text-gray-400">{s.benchmarks.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
