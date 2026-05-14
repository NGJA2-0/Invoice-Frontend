import {
  FileText,
  LayoutGrid,
  PencilLine,
  ScrollText,
  Send,
} from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import Sidebar from '../components/layout/Sidebar'
import TopNav from '../components/layout/TopNav'
import { useApp } from '../context/AppContext'

const navItems = [
  { label: 'Dashboard', path: '/user/dashboard', icon: LayoutGrid },
  { label: 'Create Invoice', path: '/user/create-invoice', icon: Send },
  { label: 'My Invoices', path: '/user/my-invoices', icon: FileText },
  { label: 'Procedure Flow', path: '/user/procedure-flow', icon: ScrollText },
  { label: 'Edit Profile', path: '/user/edit-profile', icon: PencilLine },
]

const pageLabels = {
  '/user/dashboard': 'Dashboard',
  '/user/create-invoice': 'Create Invoice',
  '/user/my-invoices': 'My Invoices',
  '/user/procedure-flow': 'Procedure Flow',
  '/user/edit-profile': 'Edit Profile',
  '/user/dealer-registration': 'Dealer Registration',
}

const statusTone = {
  'Not Verified': 'warning',
  'Pending Verification': 'info',
  Approved: 'success',
  Rejected: 'danger',
}

const UserLayout = () => {
  const location = useLocation()
  const { userStatus, user } = useApp()
  const label = pageLabels[location.pathname] || 'Dashboard'

  return (
    <div className="grid min-h-screen grid-cols-[280px_1fr] bg-page-gradient">
      <Sidebar title="NGJA Export" subtitle="User Workspace" items={navItems} />
      <main className="flex flex-col gap-6 p-6">
        <Breadcrumbs
          items={[
            { label: 'User', active: false },
            { label, active: true },
          ]}
        />
        <TopNav
          title={label}
          subtitle="Export Invoice System"
          status={userStatus}
          statusTone={statusTone[userStatus] || 'info'}
          avatar={user?.avatar || 'U'}
        />
        <section className="page-shell">
          <Outlet />
        </section>
      </main>
    </div>
  )
}

export default UserLayout
