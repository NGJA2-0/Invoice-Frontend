import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { api } from '../services/api'

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
    id: invoice.invoiceNumber,
    buyer:
      invoice.data?.buyerInformation?.buyerName ||
      invoice.data?.buyerInformation?.buyerAddress ||
      'N/A',
    date: invoice.createdAt
      ? new Date(invoice.createdAt).toISOString().slice(0, 10)
      : 'N/A',
    status: invoice.status || 'draft',
    template: invoice.templateKey || 'N/A',
    totalUsd: invoice.data?.valuation?.totalUsd || 0,
  }))

export const AppProvider = ({ children }) => {
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY))
  const [user, setUser] = useState(readStoredUser)
  const [userStatus, setUserStatus] = useState(user?.status || 'not_verified')
  const [registrations, setRegistrations] = useState([])
  const [invoices, setInvoices] = useState([])
  const [users, setUsers] = useState([])
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

  const refreshInvoices = useCallback(async (userId) => {
    if (!userId) return
    const data = await api.get(`/users/${userId}/invoices`)
    setInvoices(mapInvoiceRows(data || []))
  }, [])

  const refreshUserProfile = useCallback(async (userId) => {
    if (!userId) return
    const profile = await api.get(`/users/${userId}`)
    setUser((prev) => {
      const merged = { ...profile, licenseWarning: prev?.licenseWarning || profile.licenseWarning }
      localStorage.setItem(USER_KEY, JSON.stringify(merged))
      return merged
    })
    setUserStatus(profile.status || 'not_verified')
  }, [])

  const refreshAdminData = useCallback(async () => {
    const [usersData, pendingData] = await Promise.all([
      api.get('/admin/users'),
      api.get('/admin/registrations/pending'),
    ])

    const normalizedUsers = usersData || []
    setUsers(normalizedUsers)

    const userMap = new Map(normalizedUsers.map((item) => [item.id, item]))
    const normalizedRegistrations = (Array.isArray(pendingData) ? pendingData : []).map((item) => {
      const profile = userMap.get(item.userId) || {}
      return {
        id: item.id,
        userId: item.userId,
        dealerName: profile.fullName || 'Dealer',
        nic: profile.nic || 'N/A',
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
      }
    })

    setRegistrations(normalizedRegistrations)
  }, [])

  const refreshPendingUsers = useCallback(async (page = 1, limit = 10) => {
    if (role === 'superadmin') {
      const data = await api.get(`/admin/registrations/pending-users?page=${page}&limit=${limit}`)
      return data
    } else {
      const data = await api.get(`/admin/registrations/assigned?page=${page}&limit=${limit}`, {
        headers: { 'X-User-Id': user?.id }
      })
      return {
        registrations: data?.registrations || [],
        totalPages: data?.pagination?.totalPages || 1,
        total: data?.pagination?.totalItems || data?.registrations?.length || 0
      }
    }
  }, [role, user?.id])

  const approvePendingUser = useCallback(async (userId, approvalNotes = '') => {
    if (!user?.id) return
    const data = await api.put(`/admin/registrations/${userId}/approve`, {
      approvedBy: user.id,
      approvalNotes,
    })
    return data
  }, [user?.id])

  const rejectPendingUser = useCallback(async (userId, rejectionNotes = '') => {
    if (!user?.id) return
    const data = await api.put(`/admin/registrations/${userId}/reject`, {
      rejectedBy: user.id,
      rejectionNotes,
    })
    return data
  }, [user?.id])

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
    // Persist licenseWarning alongside the user data so UI can read it
    storeUser(data)
    if (data.id) {
      await refreshUserProfile(data.id)
      // After refreshUserProfile overwrites the stored user, re-apply licenseWarning
      if (data.licenseWarning) {
        setUser((prev) => prev ? { ...prev, licenseWarning: data.licenseWarning } : prev)
      }
    } else {
      setUserStatus(data.status || 'not_verified')
    }
    await refreshInvoices(data.id)
    return data
  }

  // Admin login
  const adminLogin = async (username, password) => {
    const data = await api.post('/auth/admin-login', { username, password })
    const nextRole = data.role || 'admin'
    setRole(nextRole)
    localStorage.setItem(ROLE_KEY, nextRole)
    storeUser(data)
    setUserStatus('verified')
    await refreshAdminData()
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
    if (!user?.id) throw new Error('User not authenticated')
    const data = await api.submitLicenseRenewal(user.id, {
      newLicenseId,
      submittedExpiryDate,
    })
    return data
  }

  const submitRegistration = async ({ userId, tin, vat, documents }) => {
    const formData = new FormData()
    formData.append('userId', userId)
    if (tin) formData.append('tin', tin)
    if (vat) formData.append('vat', vat)
    formData.append('gemDealerLicense', documents.gemDealer)
    formData.append('jewelleryLicense', documents.jewellery)
    formData.append('customsExporterLicense', documents.customs)

    const verification = await api.postForm('/verifications/submit', formData)
    setUserStatus(verification.status || 'pending')
    await refreshUserProfile(userId)
    return verification
  }

  const updateProfile = async (userId, payload) => {
    await api.put(`/users/${userId}`, payload)
    await refreshUserProfile(userId)
  }

  const updateRegistrationStatus = async (userId, status) => {
    if (!user?.id) return
    const action = status === 'approved' ? 'approve' : 'reject'
    await api.put(`/admin/dealers/${userId}/${action}`, {
      reviewedBy: user.id,
    })
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
      invoices,
      users,
      notifications,
      toasts,
      selectRole,
      login,
      userLogin,
      adminLogin,
      verifyUsername,
      signUp,
      submitLicenseRenewal,
      logout,
      setUserStatus,
      refreshInvoices,
      refreshUserProfile,
      refreshAdminData,
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
    }),
    [
      role,
      user,
      userStatus,
      registrations,
      invoices,
      users,
      notifications,
      toasts,
    ],
  )

  useEffect(() => {
    if (user?.id) {
      if (role === 'admin' || role === 'superadmin') {
        refreshAdminData()
      } else {
        refreshUserProfile(user.id)
        refreshInvoices(user.id)
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
