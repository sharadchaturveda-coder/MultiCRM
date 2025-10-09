import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { ApiResponse, PaginatedResponse } from '../types'

class ApiService {
  private api: AxiosInstance
  private tenantId: string | null = null

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3001/api', // Backend API URL
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add tenant header to all requests
    this.api.interceptors.request.use((config) => {
      if (this.tenantId) {
        config.headers['x-tenant-id'] = this.tenantId
      }
      return config
    })
  }

  setTenantId(tenantId: string | null) {
    this.tenantId = tenantId
  }

  getTenantId(): string | null {
    return this.tenantId
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Tenant endpoints
  async getTenants(params?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<any>>> {
    return this.get('/tenants', { params })
  }

  async createTenant(data: { name: string; domain: string }) {
    return this.post('/tenants', data)
  }

  async getTenant(tenantId: string) {
    return this.get(`/tenants/${tenantId}`)
  }

  // Contact endpoints
  async getContacts(params?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<any>>> {
    return this.get('/contacts', { params })
  }

  async createContact(data: any) {
    return this.post('/contacts', data)
  }

  async updateContact(contactId: string, data: any) {
    return this.put(`/contacts/${contactId}`, data)
  }

  async deleteContact(contactId: string) {
    return this.delete(`/contacts/${contactId}`)
  }

  // Other entity endpoints would be added here...
  // Leads, Pipelines, Tasks, Invoices, etc.

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'Server error'
      return new Error(`${error.response.status}: ${message}`)
    } else if (error.request) {
      // Request was made but no response
      return new Error('Network error - no response from server')
    } else {
      // Something else happened
      return new Error(error.message || 'Unknown error occurred')
    }
  }
}

// Create singleton instance
const apiService = new ApiService()

export default apiService
export { ApiService }
