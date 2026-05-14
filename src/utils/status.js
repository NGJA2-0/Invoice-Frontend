export const userStatusLabels = {
  not_verified: 'Not Verified',
  pending: 'Pending Verification',
  approved: 'Approved',
  rejected: 'Rejected',
}

export const invoiceStatusLabels = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
}

export const formatUserStatus = (status) =>
  userStatusLabels[status] || 'Not Verified'

export const formatInvoiceStatus = (status) =>
  invoiceStatusLabels[status] || 'Draft'
