import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TenantProvider, TenantSelector } from './context/TenantContext'
import './App.css'

// Lazy load page components
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Contacts = lazy(() => import('./pages/Contacts'))
const Tasks = lazy(() => import('./pages/Tasks'))
const Invoices = lazy(() => import('./pages/Invoices'))
const Pipeline = lazy(() => import('./pages/Pipeline'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <TenantSelector />
            <main className="container mx-auto py-6 px-4">
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/pipeline" element={<Pipeline />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </Router>
      </TenantProvider>
    </QueryClientProvider>
  )
}

export default App
