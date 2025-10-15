# Frontend Developer Guide (2025)

## 🎯 Overview

Complete React + TypeScript frontend for the MultiCRM multi-tenant platform, built with modern tooling.

## 📁 Project Structure

```
src/frontend/
├── src/
│   ├── App.tsx                 # Root component + routing
│   ├── main.tsx                # React entry point
│   ├── index.css               # Global Tailwind styles
│   ├── App.css                 # App-specific styles
│   ├── context/
│   │   └── TenantContext.tsx   # Multi-tenant state management
│   ├── services/
│   │   └── api.ts              # Axios service + tenant headers
│   ├── types/
│   │   └── index.ts            # Shared type imports
│   ├── utils/                  # Helper functions
│   ├── pages/                  # Route components
│   │   ├── Dashboard.tsx       # Analytics dashboard
│   │   ├── Contacts.tsx        # Contact management
│   │   ├── Tasks.tsx           # Task management
│   │   ├── Invoices.tsx        # Billing interface
│   │   └── Pipeline.tsx        # Sales pipeline view
│   ├── components/             # Reusable UI components (planned)
│   ├── hooks/                  # Custom React hooks
│   └── assets/                 # Static assets
├── package.json                # Frontend dependencies
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind customization
├── vite.config.ts              # Vite build configuration
└── index.html                  # Root HTML template
```

## 🚀 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | React 18 + TypeScript | Component-based UI with type safety |
| **Build Tool** | Vite 4 | Fast development + optimized production builds |
| **Styling** | Tailwind CSS 3 | Utility-first responsive design |
| **State Management** | React Query + Context | Server state + app state management |
| **Routing** | React Router DOM 6 | Client-side navigation |
| **HTTP Client** | Axios 1.x | API communication with interceptors |
| **Charts** | Recharts 2.x | Dashboard visualizations |
| **Icons** | Lucide Icons | Consistent iconography (planned) |
| **Forms** | React Hook Form (planned) | Form state management |
| **UI Components** | shadcn/ui (planned) | Headless component library |

## 🔧 Key Features Implemented

### Multi-Tenant State Management
```typescript
// src/context/TenantContext.tsx
interface TenantContextType {
  currentTenant: Tenant | null
  tenants: Tenant[]
  setCurrentTenant: (tenant: Tenant | null) => void
  loading: boolean
  error: string | null
}
```
- Automatic tenant header injection (`x-tenant-id`)
- Persistent tenant selection (localStorage)
- Error handling & loading states

### API Service Layer
```typescript
// src/services/api.ts
class ApiService {
  private tenantId: string | null = null

  setTenantId(tenantId: string | null) {
    this.tenantId = tenantId
  }

  // CRUD methods with automatic header injection
  async get<T>(url: string): Promise<ApiResponse<T>>
  async post<T>(url: string, data: any): Promise<ApiResponse<T>>
}
```
- Axios interceptors for tenant isolation
- Type-safe API responses
- Error handling with user-friendly messages

### Professional Dashboard UI
```typescript
// src/pages/Dashboard.tsx
const Dashboard: React.FC = () => {
  const { currentTenant } = useTenant()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Revenue Chart */} <LineChart data={revenueData} />
      {/* Task Completion */} <PieChart data={taskCompletionData} />
      {/* Recent Activity */} <div className="space-y-3">...</div>
    </div>
  )
}
```
- Real-time metrics cards
- Interactive charts (Recharts integration)
- Responsive grid layouts
- Loading & error states

## 🛠️ Development Commands

```bash
# Start development server (hot reload)
cd src/frontend
npm run dev           # http://localhost:5173 (Vite default)

# Build for production
npm run build         # Outputs to dist/

# Preview production build
npm run preview       # Test production build locally

# Lint code
npm run lint          # ESLint + TypeScript checking
```

## 🌐 Environment Configuration

### Environment Variables
```bash
# .env file in frontend root
VITE_API_URL=https://multicrm.onrender.com  # Backend API URL
NODE_ENV=development                        # Environment mode
```

>Note: Vite requires `VITE_` prefix for client-side exposure

### Build Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',        // Allow network access
    port: 5173               // Default Vite port
  },
  build: {
    outDir: 'dist',          // Production output
    sourcemap: true          // Debug production builds
  }
})
```

## 📱 Responsive Design System

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#f0f9ff', 500: '#3b82f6', 600: '#2563eb' },
        success: { 500: '#10b981' },
        danger: { 500: '#ef4444' }
      },
      spacing: {
        '18': '4.5rem',      // Custom spacing scale
        '88': '22rem'
      }
    }
  }
}
```

### Responsive Patterns Used
```html
<!-- Mobile-first grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- Responsive card sizing -->
</div>

<!-- Conditional visibility -->
<p class="hidden md:block">Desktop only text</p>
<p class="block md:hidden">Mobile only text</p>

<!-- Responsive navigation -->
<nav class="flex flex-col md:flex-row space-y-4 md:space-y-0">
  <!-- Vertical on mobile, horizontal on desktop -->
</nav>
```

## 🔄 Data Flow Architecture

### React Query Integration
```typescript
// Optimized server state management
const { data: contacts, isLoading, error } = useQuery({
  queryKey: ['contacts', currentTenant?.id],
  queryFn: () => apiService.getContacts(),
  enabled: !!currentTenant,        // Only fetch when tenant selected
  staleTime: 5 * 60 * 1000,       // Cache for 5 minutes
  cacheTime: 10 * 60 * 1000       // Keep in cache for 10 minutes
})
```

### Context Pattern for App State
```typescript
// Tenant selection persists across navigation
const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null)

useEffect(() => {
  const savedTenantId = localStorage.getItem('currentTenantId')
  if (savedTenantId && tenants.length > 0) {
    const tenant = tenants.find(t => t.id === savedTenantId)
    setCurrentTenantState(tenant || null)
  }
}, [tenants])
```

## 🎨 Component Patterns

### Page Component Structure
```typescript
const Contacts: React.FC = () => {
  const { currentTenant } = useTenant()

  if (!currentTenant) return <TenantPrompt />

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <p className="text-gray-600">Manage customer relationships</p>
      </div>

      {/* Page content with loading/error states */}
    </div>
  )
}
```

### Tenant Selection Component
```typescript
const TenantSelector: React.FC = () => (
  <header className="bg-white shadow-sm border-b px-4 py-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">MultiCRM</h1>
        {currentTenant && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
            {currentTenant.name}
          </span>
        )}
      </div>

      <select
        value={currentTenant?.id || ''}
        onChange={(e) => setTenant(tenant)}
        className="border rounded px-3 py-2"
      >
        <option value="">Select Tenant</option>
        {tenants.map(tenant => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
    </div>
  </header>
)
```

## 🚀 Production Deployment

### Cloudflare Pages Configuration
```bash
# Build settings in Cloudflare dashboard
Build command: npm run build
Build output directory: dist
Root directory: src/frontend

# Environment variables
VITE_API_URL=https://multicrm.onrender.com
```

### Build Optimization
- Code splitting (lazy loading) for all route components
- Asset optimization (images, fonts)
- Bundle analysis for size monitoring
- Service worker for offline capabilities (planned)

## 🧪 Testing Approach

### Component Testing (Planned)
```typescript
// src/__tests__/components/TenantSelector.test.tsx
import { render, screen } from '@testing-library/react'
import TenantSelector from './TenantSelector'

// Test tenant selection and persistence
```

### Integration Testing (Planned)
```typescript
// Test complete tenant selection → API flow
test('Tenant selection persists and enables API calls', async () => {
  // Arrange
  render(<App />)

  // Act
  userEvent.click(screen.getByText('Select Tenant'))

  // Assert
  await waitFor(() => {
    expect(mockAxios).toHaveBeenCalledWith(
      expect.stringContaining('x-tenant-id')
    )
  })
})
```

## 🔮 Future Enhancements

### High Priority
- [ ] **Authentication UI**: Login/signup forms with JWT handling
- [ ] **CRUD Operations**: Full create/edit forms for all entities
- [ ] **Real-time Updates**: WebSocket integration for live data
- [ ] **Offline Support**: Service worker for data synchronization

### Medium Priority
- [ ] **Dark Mode**: Theme toggle with context persistence
- [ ] **Advanced Filtering**: Query builders for list views
- [ ] **Bulk Operations**: Multi-select actions
- [ ] **Export/Import**: CSV/PDF functionality

### Architecture Improvements
- [ ] **State Management**: Zustand for complex state (if needed)
- [ ] **Component Library**: shadcn/ui integration
- [ ] **Form Validation**: React Hook Form + Zod schemas
- [ ] **Error Boundaries**: Global error recovery

## 🧾 Developer Onboarding

### New Frontend Developer - 30 Minutes
1. Clone repository and `npm install`
2. Run `npm run dev` to see local UI
3. Review `src/context/TenantContext.tsx` for state management
4. Examine `src/services/api.ts` for API patterns
5. Look at `src/pages/Dashboard.tsx` for component structure
6. Try modifying a chart in Dashboard to see hot reload

### Understanding Data Flow
- **Tenant Selection** sets `x-tenant-id` header
- **API Service** automatically injects tenant context
- **React Query** caches responses per tenant
- **LocalStorage** persists tenant selection across sessions

### Key Files to Study First
- `src/context/TenantContext.tsx` - Multi-tenancy logic
- `src/services/api.ts` - HTTP client patterns
- `src/pages/Dashboard.tsx` - Data fetching & error handling
- `package.json` - Scripts and dependencies
- `vite.config.ts` - Build configuration

## 📞 Support & Troubleshooting

### Common Issues
**Vite dev server not starting**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Environment variables not loading**
```bash
# Vite requires VITE_ prefix
echo "VITE_API_URL=http://localhost:3001" > .env
```

**Tenant context not updating**
```bash
# Check localStorage cleared
localStorage.clear()
# Restart dev server
```

### Debug Commands
```bash
# Check TypeScript compilation
npm run type-check

# Lint code for issues
npm run lint

# Analyze bundle size
npm run build && npx vite-bundle-analyzer dist/static/js/*.js

# Test API connectivity
curl -H "x-tenant-id: test-uuid" http://localhost:3001/api/contacts
```

## 📈 Performance Monitoring

### Bundle Analysis
```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

viteConfig.plugins.push(
  visualizer({
    filename: 'dist/bundle-analysis.html',
    open: true
  })
)
```

### Lighthouse Scores (Targets)
- **Performance**: 90+ (Vite optimization + lazy loading)
- **Accessibility**: 95+ (Semantic HTML + ARIA support)
- **Best Practices**: 100 (Modern standards)
- **SEO**: 85+ (Server-side routing possible)

---

This guide provides the foundation for frontend development. Focus on the **Tenant Context** and **API Service** patterns when extending the application.
