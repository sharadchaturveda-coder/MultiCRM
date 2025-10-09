import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import apiService from '../services/api'
import { Tenant } from '../types'

interface TenantContextType {
  currentTenant: Tenant | null
  tenants: Tenant[]
  setCurrentTenant: (tenant: Tenant | null) => void
  loading: boolean
  error: string | null
  refreshTenants: () => Promise<void>
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export const useTenant = () => {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

interface TenantProviderProps {
  children: ReactNode
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshTenants = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getTenants()
      if (response.success && response.data) {
        setTenants(response.data.data || [])
      } else {
        setError('Failed to load tenants')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const setCurrentTenant = (tenant: Tenant | null) => {
    setCurrentTenantState(tenant)
    // Update API service with tenant ID for future requests
    apiService.setTenantId(tenant?.id || null)
    // Could save to localStorage here if needed
    if (tenant) {
      localStorage.setItem('currentTenantId', tenant.id)
    } else {
      localStorage.removeItem('currentTenantId')
    }
  }

  // Initialize on mount
  useEffect(() => {
    refreshTenants()

    // Restore tenant from localStorage if available
    const savedTenantId = localStorage.getItem('currentTenantId')
    if (savedTenantId) {
      // We'll set it after tenants are loaded
      // For now, just set the API service tenant ID
      apiService.setTenantId(savedTenantId)
    }
  }, [])

  // Set current tenant when tenants are loaded and we have a saved ID
  useEffect(() => {
    if (tenants.length > 0) {
      const savedTenantId = localStorage.getItem('currentTenantId')
      if (savedTenantId) {
        const savedTenant = tenants.find(t => t.id === savedTenantId)
        if (savedTenant) {
          setCurrentTenantState(savedTenant)
        }
      }
    }
  }, [tenants])

  const value: TenantContextType = {
    currentTenant,
    tenants,
    setCurrentTenant,
    loading,
    error,
    refreshTenants,
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

export const TenantSelector: React.FC = () => {
  const { currentTenant, tenants, setCurrentTenant, loading, error } = useTenant()

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">MultiCRM</h1>
            <div className="text-sm text-gray-500">Loading tenants...</div>
          </div>
        </div>
      </header>
    )
  }

  if (error) {
    return (
      <header className="bg-white shadow-sm border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">MultiCRM</h1>
            <div className="text-sm text-red-600">Error: {error}</div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">MultiCRM</h1>
          {currentTenant ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Tenant:</span>
              <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm font-medium">
                {currentTenant.name}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">No tenant selected</span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={currentTenant?.id || ''}
            onChange={(e) => {
              const tenantId = e.target.value
              const tenant = tenants.find(t => t.id === tenantId) || null
              setCurrentTenant(tenant)
            }}
            className="text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Tenant</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name} ({tenant.domain})
              </option>
            ))}
          </select>

          <nav className="flex items-center space-x-6">
            <a href="/" className="text-gray-500 hover:text-gray-700 text-sm font-medium">Dashboard</a>
            <a href="/contacts" className="text-gray-500 hover:text-gray-700 text-sm font-medium">Contacts</a>
            <a href="/tasks" className="text-gray-500 hover:text-gray-700 text-sm font-medium">Tasks</a>
            <a href="/invoices" className="text-gray-500 hover:text-gray-700 text-sm font-medium">Invoices</a>
            <a href="/pipeline" className="text-gray-500 hover:text-gray-700 text-sm font-medium">Pipeline</a>
          </nav>
        </div>
      </div>
    </header>
  )
}
