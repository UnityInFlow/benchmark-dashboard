export function RunHistory() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Run History</h1>
      <p className="text-gray-500 mb-6">Track benchmark results over time and detect regressions</p>
      <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
        <p className="text-lg mb-2">Coming Soon</p>
        <p className="text-sm">Run history requires multiple benchmark runs committed to results/ directories.<br/>
        Connect to the benchmark-validator REST API for historical data.</p>
      </div>
    </div>
  )
}
