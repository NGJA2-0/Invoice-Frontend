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
  completed: 'Completed',
  stage1_in_progress: 'Stage 1 In Progress',
  stage2_in_progress: 'Stage 2 In Progress',
  stage3_in_progress: 'Stage 3 In Progress',
}

export const formatUserStatus = (status) =>
  userStatusLabels[status] || 'Not Verified'

export const formatInvoiceStatus = (status) =>
  invoiceStatusLabels[status] || status || 'Draft'
