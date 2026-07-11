import { useState } from 'react'
import { Bell, Coins, FileCheck, FileCheck2, FileEdit, LayoutGrid, ListChecks, Layers, Menu, RefreshCw, Users, Package, UserCog, UsersRound } from 'lucide-react'
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
  { label: 'Officer Management', path: '/admin/create-officer', icon: UsersRound },
  { label: 'Edit Requests', path: '/admin/edit-requests', icon: FileEdit },
]

// Super admin exclusive nav items
const superAdminNavItems = [
  {
    label: 'Invoice Management',
    path: '/admin/invoice-management',
    icon: FileCheck,
  },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Currencies', path: '/admin/currencies', icon: Coins },
  { label: 'Bulk Rate Update', path: '/admin/currencies/bulk-update', icon: RefreshCw },
  { label: 'Items', path: '/admin/items', icon: Package },
  { label: 'Stock Values', path: '/admin/stock-values', icon: Layers },
  { label: 'License Renewals', path: '/admin/license-renewals', icon: FileCheck2 },
  { label: 'Admin Management', path: '/admin/admins', icon: UserCog },
]

const pageLabels = {
  '/admin/dashboard': 'Dashboard',
  '/admin/pending-registrations': 'Pending Registrations',
  '/admin/create-officer': 'Officer Management',
  '/admin/edit-requests': 'Edit Requests',
  '/admin/invoice-management': 'Invoice Management',
  '/admin/users': 'Users',
  '/admin/currencies': 'Currencies',
  '/admin/currencies/new': 'New Currency',
  '/admin/currencies/bulk-update': 'Bulk Rate Update',
  '/admin/items': 'Items',
  '/admin/stock-values': 'Stock Values',
  '/admin/license-renewals': 'License Renewals',
  '/admin/admins': 'Admin Management',
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

  // Invoice Management gets a collapsed-by-default sidebar that opens as an
  // overlay on top of the content, on every breakpoint — every other admin
  // page keeps the normal always-visible desktop sidebar untouched.
  const isInvoiceManagementPage = location.pathname === '/admin/invoice-management'

  return (
    <div
      className={`grid min-h-screen grid-cols-1 bg-page-gradient ${
        isInvoiceManagementPage ? '' : 'md:grid-cols-[280px_1fr]'
      }`}
    >
      <Sidebar
        title="NGJA Export"
        subtitle={isSuperAdmin ? 'Super Admin Console' : 'Admin Console'}
        items={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        forceOverlay={isInvoiceManagementPage}
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
          <Outlet context={{ sidebarOpen, setSidebarOpen, isInvoiceManagementPage }} />
        </section>
      </main>
    </div>
  )
}

export default AdminLayout