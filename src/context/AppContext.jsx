import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { api } from '../services/api'
import { officerApi } from '../services/officerApi'
import { adminService } from '../services/adminService'

const AppContext = createContext(null)

const ROLE_KEY = 'ngja_role'
const USER_KEY = 'ngja_user'

// Monotonically incrementing counter guarantees unique toast IDs
// even when multiple toasts are pushed in the same millisecond.
let _toastCounter = 0
const nextToastId = () => `toast-${++_toastCounter}`

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    return null
  }
}

const normalizeInvoiceItems = (items) => {
  if (Array.isArray(items)) return items
  if (Array.isArray(items?.data)) return items.data
  if (Array.isArray(items?.invoices)) return items.invoices
  return []
}

const mapInvoiceRows = (items = []) =>
  normalizeInvoiceItems(items).map((invoice) => ({
    id: invoice.invoiceId,
    invoiceNumber: invoice.invoiceNumber || 'N/A',
    invoiceDate: invoice.invoiceDate || 'N/A',
    exportType: invoice.exportType || 'N/A',
    cifLkr: invoice.cifLkr ?? 0,
    receiverName: invoice.receiverName || 'N/A',
    status: invoice.status || 'draft',
  }))

const extractPagination = (res) => ({
  currentPage: res?.pagination?.currentPage || 1,
  pageSize: res?.pagination?.pageSize || 10,
  totalRecords: res?.pagination?.totalRecords || 0,
  totalPages: res?.pagination?.totalPages || 1,
  hasNextPage: res?.pagination?.hasNextPage || false,
  hasPreviousPage: res?.pagination?.hasPreviousPage || false,
})

export const AppProvider = ({ children }) => {
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY))
  const [user, setUser] = useState(readStoredUser)
  const [userStatus, setUserStatus] = useState(user?.status || 'not_verified')
  const [registrations, setRegistrations] = useState([])
  const [officerCapacitySummary, setOfficerCapacitySummary] = useState([])
  const [adminSlotsSummary, setAdminSlotsSummary] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [adminUserStats, setAdminUserStats] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [invoicePagination, setInvoicePagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [invoiceFilters, setInvoiceFilters] = useState({
    status: undefined,
    sort: 'date_desc',
  })
  const [users, setUsers] = useState([])
  const [usersSummary, setUsersSummary] = useState([])
  const [usersSummaryPagination, setUsersSummaryPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })
  const [usersSummaryFilters, setUsersSummaryFilters] = useState({ status: undefined })
  const [officerInvoices, setOfficerInvoices] = useState([])
  const [stage2OfficerInvoices, setStage2OfficerInvoices] = useState([])
  const [stage3OfficerInvoices, setStage3OfficerInvoices] = useState([])
  const [toasts, setToasts] = useState([])
  const [notifications, setNotifications] = useState([])

  const selectRole = (nextRole) => {
    setRole(nextRole)
    localStorage.setItem(ROLE_KEY, nextRole)
  }

  const storeUser = useCallback((nextUser) => {
    setUser(nextUser)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }, [])

  const refreshInvoices = useCallback(async (_userId, options = {}) => {
    const {
      page = 1,
      pageSize = 10,
      status,
      sort = 'date_desc',
    } = options

    const params = new URLSearchParams()
    params.set('page', page)
    params.set('pageSize', pageSize)
    if (status) params.set('status', status)
    if (sort) params.set('sort', sort)

    // Identity comes from the JWT Bearer token — no userId in URL
    const data = await api.get(`/invoices/my-invoices?${params.toString()}`, {
      raw: true,
    })

    setInvoices(mapInvoiceRows(data))
    setInvoicePagination(extractPagination(data))
    setInvoiceFilters({ status, sort })
    return data
  }, [])

  const refreshOfficerInvoices = useCallback(async () => {
    const res = await officerApi.getAssignedInvoices()
    const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
    setOfficerInvoices(list)
    return list
  }, [])

  const refreshStage2OfficerInvoices = useCallback(async () => {
    const res = await officerApi.getStage2AssignedInvoices()
    const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
    setStage2OfficerInvoices(list)
    return list
  }, [])

  const refreshStage3OfficerInvoices = useCallback(async () => {
    const res = await officerApi.getStage3AssignedInvoices()
    const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
    setStage3OfficerInvoices(list)
    return list
  }, [])

  const refreshUserProfile = useCallback(async () => {
    // Identity comes from the JWT Bearer token — no userId needed
    const profile = await api.get('/users/me')
    setUser((prev) => {
      const merged = { ...profile, licenseWarning: prev?.licenseWarning || profile.licenseWarning, token: prev?.token }
      localStorage.setItem(USER_KEY, JSON.stringify(merged))
      return merged
    })
    setUserStatus(profile.status || 'not_verified')
  }, [])

  const refreshAdminData = useCallback(async () => {
    const pendingData = await api.get('/admin/registrations/pending')

    const normalizedRegistrations = (Array.isArray(pendingData) ? pendingData : []).map((item) => ({
      id: item.id,
      userId: item.userId,
      dealerName: item.fullName || 'Dealer',
      nic: item.nic || 'N/A',
      submittedDate: item.submittedAt
        ? new Date(item.submittedAt).toISOString().slice(0, 10)
        : 'N/A',
      status: item.status,
      documents: {
        gemDealer: item.gemDealerLicense,
        jewellery: item.jewelleryLicense,
        customs: item.customsExporterLicense,
      },
      tin: item.tin,
      vat: item.vat,
    }))

    setRegistrations(normalizedRegistrations)
  }, [])

  // Superadmin-only: officer occupancy per verification stage
  const refreshOfficerCapacitySummary = useCallback(async () => {
    const data = await adminService.getOfficerCapacitySummary()
    setOfficerCapacitySummary(Array.isArray(data) ? data : [])
    return data
  }, [])

  // Superadmin-only: admin slot usage (occupied/remaining) for the dashboard gauge
  const refreshAdminSlotsSummary = useCallback(async () => {
    const data = await adminService.getAdminSlotsSummary()
    setAdminSlotsSummary(data || null)
    return data
  }, [])

  // Superadmin-only: aggregate user counts for dashboard stat cards
  const refreshUserStats = useCallback(async () => {
    const data = await adminService.getUserStats()
    setUserStats(data || null)
    return data
  }, [])

  // Plain admin-only: aggregate user counts scoped to that admin
  const refreshAdminUserStats = useCallback(async (adminId) => {
    if (!adminId) return
    const data = await adminService.getAdminUserStats(adminId)
    setAdminUserStats(data || null)
    return data
  }, [])

  const refreshUsersSummary = useCallback(async (options = {}) => {
    const { page = 1, limit = 10, status } = options
    const data = await adminService.getUsersSummary({ page, limit, status })

    const list = Array.isArray(data?.users) ? data.users : []
    setUsersSummary(list)
    setUsersSummaryPagination({
      page: data?.page || page,
      limit: data?.limit || limit,
      total: data?.total || 0,
      totalPages: data?.totalPages || 1,
    })
    setUsersSummaryFilters({ status })
    return data
  }, [])

  const refreshPendingUsers = useCallback(async (page = 1, limit = 10) => {
    if (role === 'superadmin') {
      // raw: true keeps `pagination` as a sibling of `data` instead of
      // letting parseResponse strip it away (same reason refreshInvoices uses raw: true)
      const data = await api.get(`/admin/registrations/pending-users?page=${page}&limit=${limit}`, {
        raw: true,
      })
      // Backend has returned this nested a couple of different ways during
      // development, so check the likely shapes defensively rather than
      // assuming data.data is always the array.
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.registrations)
          ? data.data.registrations
          : Array.isArray(data?.registrations)
            ? data.registrations
            : []
      return {
        registrations: list,
        totalPages: data?.pagination?.totalPages || 1,
        total: data?.pagination?.totalRecords || data?.pagination?.totalItems || list.length
      }
    } else {
      const data = await api.get(`/admin/registrations/assigned?page=${page}&limit=${limit}`)
      return {
        registrations: Array.isArray(data?.registrations) ? data.registrations : [],
        totalPages: data?.pagination?.totalPages || 1,
        total: data?.pagination?.totalItems || (Array.isArray(data?.registrations) ? data.registrations.length : 0)
      }
    }
  }, [role, user?.id])

  const approvePendingUser = useCallback(async (userId, approvalNotes = '') => {
    // Admin identity is derived from the JWT Bearer token — no approvedBy field needed
    const data = await api.put(`/admin/registrations/${userId}/approve`, {
      approvalNotes,
    })
    return data
  }, [])

  const rejectPendingUser = useCallback(async (userId, rejectionNotes = '') => {
    // Admin identity is derived from the JWT Bearer token — no rejectedBy field needed
    const data = await api.put(`/admin/registrations/${userId}/reject`, {
      rejectionNotes,
    })
    return data
  }, [])

  // Verify username
  const verifyUsername = async (username) => {
    const data = await api.post('/auth/verify-username', { username })
    return data
  }

  // User login
  const userLogin = async (username, password) => {
    const data = await api.post('/auth/user-login', { username, password })
    setRole('user')
    localStorage.setItem(ROLE_KEY, 'user')
    // Store token alongside user data so Bearer auth works on subsequent requests
    storeUser(data)
    if (data.token) {
      // refreshUserProfile/refreshInvoices read the token from ngja_user in localStorage
      await refreshUserProfile()
      // After refreshUserProfile overwrites the stored user, re-apply token + licenseWarning
      setUser((prev) => {
        const next = { ...prev, token: data.token }
        if (data.licenseWarning) next.licenseWarning = data.licenseWarning
        localStorage.setItem(USER_KEY, JSON.stringify(next))
        return next
      })
    } else {
      setUserStatus(data.status || 'not_verified')
    }
    await refreshInvoices()
    return data
  }

  // Admin login
  const adminLogin = async (username, password) => {
    const data = await api.post('/auth/admin-login', { username, password })
    const nextRole = data.role || 'admin'
    setRole(nextRole)
    localStorage.setItem(ROLE_KEY, nextRole)
    // Store token so Bearer auth works on all subsequent admin API calls
    storeUser(data)
    setUserStatus('verified')
    await refreshAdminData()
    return data
  }

 // Officer login (covers stage 1, stage 2 and stage 3 officers)
  const officerLogin = async (username, password) => {
    const data = await api.post('/auth/officer-login', { username, password })
    const nextRole = data.stage === 2 ? 'stage2officer' : data.stage === 3 ? 'stage3officer' : 'officer'
    setRole(nextRole)
    localStorage.setItem(ROLE_KEY, nextRole)
    storeUser(data)
    setUserStatus('verified')
    return data
  }

  // Stage 2 officer login
  const stage2OfficerLogin = async (username, password) => {
    const data = await api.post('/auth/stage2-officer-login', { username, password })
    setRole('stage2officer')
    localStorage.setItem(ROLE_KEY, 'stage2officer')
    storeUser(data)
    setUserStatus('verified')
    return data
  }

  // Legacy login method (kept for backward compatibility)
  const login = async ({ nic, password }) => {
    const data = await api.post('/auth/login', { nic, password })
    const nextRole = data.role || role || 'user'
    setRole(nextRole)
    localStorage.setItem(ROLE_KEY, nextRole)
    storeUser(data)
    if (nextRole === 'admin' || nextRole === 'superadmin') {
      setUserStatus('verified')
      await refreshAdminData()
    } else {
      if (data.id) {
        await refreshUserProfile(data.id)
      } else {
        setUserStatus(data.status || 'not_verified')
      }
      await refreshInvoices(data.id)
    }
    return data
  }

  const logout = () => {
    setRole(null)
    setUser(null)
    setUserStatus('not_verified')
    setRegistrations([])
    setInvoices([])
    setUsers([])
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const signUp = async (payload) => {
    const data = await api.post('/auth/signup', payload)
    return data
  }

  const submitLicenseRenewal = async ({ newLicenseId, submittedExpiryDate }) => {
    // Identity is read from the JWT Bearer token — no userId needed
    const data = await api.post('/license-renewals/submit', {
      newLicenseId,
      submittedExpiryDate,
    })
    return data
  }

  const submitRegistration = async ({ tin, vat, documents }) => {
    // userId removed — backend reads identity from JWT Bearer token
    const formData = new FormData()
    if (tin) formData.append('tin', tin)
    if (vat) formData.append('vat', vat)
    formData.append('gemDealerLicense', documents.gemDealer)
    formData.append('jewelleryLicense', documents.jewellery)
    formData.append('customsExporterLicense', documents.customs)

    const verification = await api.postForm('/verifications/submit', formData)
    setUserStatus(verification.status || 'pending')
    await refreshUserProfile()
    return verification
  }

  const updateProfile = async (_userId, payload) => {
    await api.put('/users/me/details', payload)
    await refreshUserProfile()
  }

  // Submits a regulated-field edit request (tin, stockValueId/Name, gemDealerFileNo).
  // On success the account is locked pending admin review, so we log the user out.
  const submitEditRequest = async (payload) => {
    const data = await api.post('/users/me/edit-requests', payload)
    logout()
    return data
  }

  const updateRegistrationStatus = async (userId, status) => {
    const action = status === 'approved' ? 'approve' : 'reject'
    // Admin identity is derived from the JWT Bearer token — no reviewedBy field needed
    await api.put(`/admin/dealers/${userId}/${action}`, {})
    await refreshAdminData()
  }

  const createInvoice = async (payload) => {
    const invoice = await api.post('/invoices', payload)
    setInvoices((prev) => [
      ...mapInvoiceRows([invoice]),
      ...prev,
    ])
    return invoice
  }

  const generateInvoiceNumber = async () => {
    const data = await api.get('/invoices/generate-number')
    return data?.invoiceNumber || ''
  }

  const pushToast = ({ title, message, tone = 'info', duration = 3200 }) => {
    const id = nextToastId()
    setToasts((prev) => [...prev, { id, title, message, tone }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, duration)
  }

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const value = useMemo(
    () => ({
      role,
      user,
      userStatus,
      registrations,
      officerCapacitySummary,
      adminSlotsSummary,
      userStats,
      adminUserStats,
      invoices,
      invoicePagination,
      invoiceFilters,
      users,
      usersSummary,
      usersSummaryPagination,
      usersSummaryFilters,
      officerInvoices,
      stage2OfficerInvoices,
      stage3OfficerInvoices,
      notifications,
      toasts,
      selectRole,
      login,
      userLogin,
      adminLogin,
      officerLogin,
      stage2OfficerLogin,
      verifyUsername,
      signUp,
      submitLicenseRenewal,
      logout,
      setUserStatus,
      refreshInvoices,
      refreshOfficerInvoices,
      refreshStage2OfficerInvoices,
      refreshStage3OfficerInvoices,
      refreshUserProfile,
      refreshAdminData,
      refreshUsersSummary,
      refreshOfficerCapacitySummary,
      refreshAdminSlotsSummary,
      refreshUserStats,
      refreshAdminUserStats,
      submitRegistration,
      updateRegistrationStatus,
      updateProfile,
      createInvoice,
      generateInvoiceNumber,
      pushToast,
      dismissToast,
      refreshPendingUsers,
      approvePendingUser,
      rejectPendingUser,
      submitEditRequest,
    }),
    [
      role,
      user,
      userStatus,
      registrations,
      officerCapacitySummary,
      adminSlotsSummary,
      userStats,
      adminUserStats,
      invoices,
      invoicePagination,
      invoiceFilters,
      users,
      usersSummary,
      usersSummaryPagination,
      usersSummaryFilters,
      officerInvoices,
      stage2OfficerInvoices,
      stage3OfficerInvoices,
      notifications,
      toasts,
    ],
  )

  useEffect(() => {
    if (user?.id) {
      if (role === 'admin' || role === 'superadmin') {
        refreshAdminData()
        if (role === 'superadmin') {
          refreshOfficerCapacitySummary()
          refreshAdminSlotsSummary()
          refreshUserStats()
        } else if (role === 'admin') {
          refreshAdminUserStats(user.id)
        }
      } else if (role === 'officer') {
        refreshOfficerInvoices(user.id)
      } else if (role === 'stage2officer') {
        refreshStage2OfficerInvoices(user.id)
      } else if (role === 'stage3officer') {
        refreshStage3OfficerInvoices(user.id)
      } else {
        refreshUserProfile()
        refreshInvoices()
      }
    }
  }, [user?.id, role])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
