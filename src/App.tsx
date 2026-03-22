import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { SuiteOverview } from './pages/SuiteOverview'
import { BenchmarkDetail } from './pages/BenchmarkDetail'
import { Compare } from './pages/Compare'
import { RunHistory } from './pages/RunHistory'
import { DecisionMatrix } from './pages/DecisionMatrix'

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation()
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-300 hover:text-white hover:bg-gray-700'
      }`}
    >
      {children}
    </Link>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link to="/" className="text-white font-bold text-lg mr-6">
            UnityInFlow Benchmarks
          </Link>
          <NavLink to="/">Overview</NavLink>
          <NavLink to="/compare">Compare</NavLink>
          <NavLink to="/history">History</NavLink>
          <NavLink to="/decisions">Decisions</NavLink>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<SuiteOverview />} />
          <Route path="/benchmark/:id" element={<BenchmarkDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/history" element={<RunHistory />} />
          <Route path="/decisions" element={<DecisionMatrix />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
