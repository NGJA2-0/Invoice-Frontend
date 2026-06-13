import { useState } from 'react'
import { Coins, FileCheck, FileCheck2, LayoutGrid, ListChecks, Layers, RefreshCw, ShieldCheck, ShieldX, Users, Package } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import Sidebar from '../components/layout/Sidebar'
import TopNav from '../components/layout/TopNav'
import { useApp } from '../context/AppContext'

const adminNavItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutGrid },
  {
    label: 'Pending Registrations',
    path: '/admin/pending-registrations',
    icon: ListChecks,
  },
  { label: 'Approved Dealers', path: '/admin/approved-dealers', icon: ShieldCheck },
  { label: 'Rejected Dealers', path: '/admin/rejected-dealers', icon: ShieldX },
  {
    label: 'Invoice Management',
    path: '/admin/invoice-management',
    icon: FileCheck,
  },
  { label: 'Users', path: '/admin/users', icon: Users },
]

// Super admin exclusive nav items
const superAdminNavItems = [
  { label: 'Currencies', path: '/admin/currencies', icon: Coins },
  { label: 'Bulk Rate Update', path: '/admin/currencies/bulk-update', icon: RefreshCw },
  { label: 'Items', path: '/admin/items', icon: Package },
  { label: 'Stock Values', path: '/admin/stock-values', icon: Layers },
  { label: 'License Renewals', path: '/admin/license-renewals', icon: FileCheck2 },
]

const pageLabels = {
  '/admin/dashboard': 'Dashboard',
  '/admin/pending-registrations': 'Pending Registrations',
  '/admin/approved-dealers': 'Approved Dealers',
  '/admin/rejected-dealers': 'Rejected Dealers',
  '/admin/invoice-management': 'Invoice Management',
  '/admin/users': 'Users',
  '/admin/currencies': 'Currencies',
  '/admin/currencies/new': 'New Currency',
  '/admin/currencies/bulk-update': 'Bulk Rate Update',
  '/admin/items': 'Items',
  '/admin/stock-values': 'Stock Values',
  '/admin/license-renewals': 'License Renewals',
}

const AdminLayout = () => {
  const location = useLocation()
  const { user } = useApp()
  const isSuperAdmin = user?.role === 'superadmin'

  // Build nav: super admin gets all items; regular admin gets standard items only
  const navItems = isSuperAdmin
    ? [
        ...adminNavItems,
        { type: 'divider', label: 'Super Admin' },
        ...superAdminNavItems,
      ]
    : adminNavItems

  // Resolve label — check exact match first, then prefix-match for dynamic routes
  const label =
    pageLabels[location.pathname] ||
    (location.pathname.startsWith('/admin/currencies/')
      ? 'Currency Detail'
      : 'Dashboard')

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[280px_1fr] bg-page-gradient">
      <Sidebar
        title="NGJA Export"
        subtitle={isSuperAdmin ? 'Super Admin Console' : 'Admin Console'}
        items={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex flex-col gap-6 p-4 sm:p-6">
        <Breadcrumbs
          items={[
            { label: 'Admin', active: false },
            { label, active: true },
          ]}
        />
        <TopNav
          title={label}
          subtitle={isSuperAdmin ? 'Super Admin Oversight' : 'Verification Oversight'}
          status="Active"
          avatar={user?.avatar || 'A'}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <section className="page-shell">
          <Outlet />
        </section>
      </main>
    </div>
  )
}

export default AdminLayout