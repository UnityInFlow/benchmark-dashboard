export interface BenchmarkResult {
  benchmarkId: string
  benchmarkName: string
  version: string
  runAt: string
  environment: Environment
  scenarios: ScenarioResult[]
}

export interface Environment {
  hostCpuCores: number
  hostMemoryGb: number
  dockerVersion: string
  jvmVersion: string
  kotlinVersion: string
}

export interface ScenarioResult {
  name: string
  database: string
  iterations: number
  concurrency: number
  metrics: Metrics
  rawLatenciesMs?: number[]
}

export interface Metrics {
  p50Ms: number
  p95Ms: number
  p99Ms: number
  throughputOpsPerSec: number
  errorRatePct: number
  totalDurationMs: number
  // Statistical fields (v2.0)
  standardDeviation?: number
  coefficientOfVariation?: number
  confidenceInterval95Lower?: number
  confidenceInterval95Upper?: number
  sampleSize?: number
  outlierCount?: number
  outlierPercentage?: number
  grade?: string
}

export interface BenchmarkSummary {
  id: string
  name: string
  lastRun?: string
  scenarioCount: number
  avgGrade: string
  keyMetric: string
  result?: BenchmarkResult
}
