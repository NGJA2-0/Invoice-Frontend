import { useState } from 'react'
import {
  FileCheck,
  LayoutGrid,
  ListChecks,
  ShieldCheck,
  ShieldX,
  Users,
} from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import Sidebar from '../components/layout/Sidebar'
import TopNav from '../components/layout/TopNav'
import { useApp } from '../context/AppContext'

const navItems = [
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

const pageLabels = {
  '/admin/dashboard': 'Dashboard',
  '/admin/pending-registrations': 'Pending Registrations',
  '/admin/approved-dealers': 'Approved Dealers',
  '/admin/rejected-dealers': 'Rejected Dealers',
  '/admin/invoice-management': 'Invoice Management',
  '/admin/users': 'Users',
}

const AdminLayout = () => {
  const location = useLocation()
  const { user } = useApp()
  const label = pageLabels[location.pathname] || 'Dashboard'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[280px_1fr] bg-page-gradient">
      <Sidebar
        title="NGJA Export"
        subtitle="Admin Console"
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
          subtitle="Verification Oversight"
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
