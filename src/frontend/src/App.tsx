import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TenantProvider, TenantSelector } from './context/TenantContext'
import Dashboard from './pages/Dashboard'
import Contacts from './pages/Contacts'
import Tasks from './pages/Tasks'
import Invoices from './pages/Invoices'
import Pipeline from './pages/Pipeline'
import './App.css'

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
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/pipeline" element={<Pipeline />} />
              </Routes>
            </main>
          </div>
        </Router>
      </TenantProvider>
    </QueryClientProvider>
  )
}

export default App
