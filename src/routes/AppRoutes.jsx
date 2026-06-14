import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import UserLayout from '../layouts/UserLayout'
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
import Items from '../pages/admin/Items'
import StockValues from '../pages/admin/StockValues'
import LicenseRenewals from '../pages/admin/LicenseRenewals'
import Terms from '../pages/admin/Terms'

// Guard component: redirects to /admin/dashboard if the user is not a super admin
const SuperAdminRoute = ({ children }) => {
  const { user } = useApp()
  if (user?.role !== 'superadmin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  return children
}

const AppRoutes = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
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

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="pending-registrations" element={<PendingRegistrations />} />
          <Route path="approved-dealers" element={<ApprovedDealers />} />
          <Route path="rejected-dealers" element={<RejectedDealers />} />
          <Route path="invoice-management" element={<InvoiceManagement />} />
          <Route path="users" element={<Users />} />

          {/* Super Admin only routes */}
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
            path="terms"
            element={
              <SuperAdminRoute>
                <Terms />
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