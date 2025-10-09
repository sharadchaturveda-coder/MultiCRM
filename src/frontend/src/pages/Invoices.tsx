import React from 'react'
import { useTenant } from '../context/TenantContext'

const Invoices: React.FC = () => {
  const { currentTenant } = useTenant()

  if (!currentTenant) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoices</h2>
        <p className="text-gray-600">Please select a tenant to manage invoices.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h1>
        <p className="text-gray-600">Create and manage customer invoices</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice Management Coming Soon</h3>
        <p className="text-gray-600">This page will allow you to create, send, and track invoice payments.</p>
      </div>
    </div>
  )
}

export default Invoices
