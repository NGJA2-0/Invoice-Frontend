import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import UserLayout from '../layouts/UserLayout'
import Login from '../pages/auth/Login'
import RoleSelect from '../pages/auth/RoleSelect'
import Signup from '../pages/auth/Signup'
import AdminDashboard from '../pages/admin/Dashboard'
import ApprovedDealers from '../pages/admin/ApprovedDealers'
import InvoiceManagement from '../pages/admin/InvoiceManagement'
import PendingRegistrations from '../pages/admin/PendingRegistrations'
import RejectedDealers from '../pages/admin/RejectedDealers'
import Users from '../pages/admin/Users'
import DealerRegistration from '../pages/user/DealerRegistration'
import EditProfile from '../pages/user/EditProfile'
import CreateInvoice from '../pages/user/CreateInvoice'
import Dashboard from '../pages/user/Dashboard'
import MyInvoices from '../pages/user/MyInvoices'
import ProcedureFlow from '../pages/user/ProcedureFlow'
import Template1 from '../pages/invoices/Template1'
import Template2 from '../pages/invoices/Template2'
import Template3 from '../pages/invoices/Template3'
import Template4 from '../pages/invoices/Template4'

const AppRoutes = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RoleSelect />} />
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
          <Route path="invoices/template-1" element={<Template1 />} />
          <Route path="invoices/template-2" element={<Template2 />} />
          <Route path="invoices/template-3" element={<Template3 />} />
          <Route path="invoices/template-4" element={<Template4 />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="pending-registrations" element={<PendingRegistrations />} />
          <Route path="approved-dealers" element={<ApprovedDealers />} />
          <Route path="rejected-dealers" element={<RejectedDealers />} />
          <Route path="invoice-management" element={<InvoiceManagement />} />
          <Route path="users" element={<Users />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default AppRoutes
