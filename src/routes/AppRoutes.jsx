import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import UserLayout from '../layouts/UserLayout'
import OfficerLayout from '../layouts/OfficerLayout'
import Stage2Dashboard from '../pages/officer2/Dashboard'
import Stage2InvoiceDetail from '../pages/officer2/InvoiceDetail'
import Stage2EditInvoice from '../pages/officer2/EditInvoice'
import Stage3Dashboard from '../pages/officer3/Dashboard'
import Stage3InvoiceDetail from '../pages/officer3/InvoiceDetail'
import Stage3EditInvoice from '../pages/officer3/EditInvoice'
import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Signup'
import AdminDashboard from '../pages/admin/Dashboard'
import ApprovedDealers from '../pages/admin/ApprovedDealers'
import InvoiceManagement from '../pages/admin/InvoiceManagement'
import PendingRegistrations from '../pages/admin/PendingRegistrations'
import RejectedDealers from '../pages/admin/RejectedDealers'
import Users from '../pages/admin/Users'
import Currencies from '../pages/admin/Currencies'
import CurrencyDetail from '../pages/admin/CurrencyDetail'
import CreateCurrency from '../pages/admin/CreateCurrency'
import BulkRateUpdate from '../pages/admin/BulkRateUpdate'
import DealerRegistration from '../pages/user/DealerRegistration'
import EditProfile from '../pages/user/EditProfile'
import CreateInvoice from '../pages/user/CreateInvoice'
import Dashboard from '../pages/user/Dashboard'
import MyInvoices from '../pages/user/MyInvoices'
import ProcedureFlow from '../pages/user/ProcedureFlow'
import { useApp } from '../context/AppContext'
import OfficerDashboard from '../pages/officer/Dashboard'
import OfficerInvoiceDetail from '../pages/officer/InvoiceDetail'
import OfficerEditInvoice from '../pages/officer/OfficerEditInvoice'
import Items from '../pages/admin/Items'
import StockValues from '../pages/admin/StockValues'
import LicenseRenewals from '../pages/admin/LicenseRenewals'
import Admins from '../pages/admin/Admins'
import AdminAssignedRegistrations from '../pages/admin/AdminAssignedRegistrations'
import CreateOfficer from '../pages/admin/CreateOfficer'

// Guard component: redirects to /admin/dashboard if the user is not a super admin
const SuperAdminRoute = ({ children }) => {
  const { user } = useApp()
  if (!user) return null
  if (user?.role !== 'superadmin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  return children
}

const AppRoutes = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />

        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-invoice" element={<CreateInvoice />} />
          <Route path="my-invoices" element={<MyInvoices />} />
          <Route path="procedure-flow" element={<ProcedureFlow />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="dealer-registration" element={<DealerRegistration />} />
        </Route>

        <Route path="/officer" element={<OfficerLayout />}>
          <Route index element={<Navigate to="/officer/dashboard" replace />} />
          <Route path="dashboard" element={<OfficerDashboard />} />
          <Route path="invoices/:invoiceId" element={<OfficerInvoiceDetail />} />
          <Route path="invoices/:invoiceId/edit" element={<OfficerEditInvoice />} />
        </Route>

        <Route path="/officer2" element={<OfficerLayout />}>
          <Route index element={<Navigate to="/officer2/dashboard" replace />} />
          <Route path="dashboard" element={<Stage2Dashboard />} />
          <Route path="invoices/:invoiceId" element={<Stage2InvoiceDetail />} />
          <Route path="invoices/:invoiceId/edit" element={<Stage2EditInvoice />} />
        </Route>

        <Route path="/officer3" element={<OfficerLayout />}>
          <Route index element={<Navigate to="/officer3/dashboard" replace />} />
          <Route path="dashboard" element={<Stage3Dashboard />} />
          <Route path="invoices/:invoiceId" element={<Stage3InvoiceDetail />} />
          <Route path="invoices/:invoiceId/edit" element={<Stage3EditInvoice />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="pending-registrations" element={<PendingRegistrations />} />
          <Route path="create-officer" element={<CreateOfficer />} />

          {/* Super Admin only routes */}
          <Route
            path="approved-dealers"
            element={
              <SuperAdminRoute>
                <ApprovedDealers />
              </SuperAdminRoute>
            }
          />
          <Route
            path="rejected-dealers"
            element={
              <SuperAdminRoute>
                <RejectedDealers />
              </SuperAdminRoute>
            }
          />
          <Route
            path="invoice-management"
            element={
              <SuperAdminRoute>
                <InvoiceManagement />
              </SuperAdminRoute>
            }
          />
          <Route
            path="users"
            element={
              <SuperAdminRoute>
                <Users />
              </SuperAdminRoute>
            }
          />
          <Route
            path="currencies"
            element={
              <SuperAdminRoute>
                <Currencies />
              </SuperAdminRoute>
            }
          />
          <Route
            path="currencies/new"
            element={
              <SuperAdminRoute>
                <CreateCurrency />
              </SuperAdminRoute>
            }
          />
          <Route
            path="currencies/bulk-update"
            element={
              <SuperAdminRoute>
                <BulkRateUpdate />
              </SuperAdminRoute>
            }
          />
          <Route
            path="currencies/:id"
            element={
              <SuperAdminRoute>
                <CurrencyDetail />
              </SuperAdminRoute>
            }
          />
          <Route
            path="items"
            element={
              <SuperAdminRoute>
                <Items />
              </SuperAdminRoute>
            }
          />
          <Route
            path="stock-values"
            element={
              <SuperAdminRoute>
                <StockValues />
              </SuperAdminRoute>
            }
          />
          <Route
            path="license-renewals"
            element={
              <SuperAdminRoute>
                <LicenseRenewals />
              </SuperAdminRoute>
            }
          />
          <Route
            path="admins"
            element={
              <SuperAdminRoute>
                <Admins />
              </SuperAdminRoute>
            }
          />
          <Route
            path="admins/:adminId/registrations"
            element={
              <SuperAdminRoute>
                <AdminAssignedRegistrations />
              </SuperAdminRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default AppRoutes