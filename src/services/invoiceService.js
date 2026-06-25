import { api } from './api'

export const invoiceService = {
  getCategories: async (options = {}) => {
    const response = await api.get('/invoices/categories', options)
    return response
  },

  getSubCategories: async (category, options = {}) => {
    const response = await api.get(
      `/invoices/categories/${encodeURIComponent(category)}/subcategories`,
      options
    )
    return response
  },

  resolveTemplate: async ({ category, subCategory }, options = {}) => {
    const response = await api.post('/invoices/resolve-template', {
      category,
      subCategory,
    }, options)
    return response
  },

  getTemplate: async (templateKey, options = {}) => {
    const response = await api.get(`/templates/${templateKey}`, options)
    return response
  },

  getConfiguration: async ({ category, subCategory }) => {
    const query = new URLSearchParams({ category })
    if (subCategory) {
      query.append('subCategory', subCategory)
    }
    const response = await api.get(`/invoices/configuration?${query.toString()}`)
    return response
  },

  create: async (invoiceData) => {
    const response = await api.post('/invoices', invoiceData)
    return response
  },

  preview: async ({ category, subCategory, invoiceData }, options = {}) => {
    const response = await api.post('/invoices/preview', {
      category,
      subCategory,
      invoiceData,
    }, options)
    return response
  },

  uploadLogo: async (file, options = {}) => {
    const formData = new FormData()
    formData.append('logo', file)
    const response = await api.postForm('/invoices/upload-logo', formData, options)
    return response
  },

  getById: async (invoiceId) => {
    const response = await api.get(`/invoices/${invoiceId}`)
    return response
  },

  updateDraft: async (invoiceId, data) => {
    const response = await api.put(`/invoices/${invoiceId}`, data)
    return response
  },

  delete: async (invoiceId) => {
    const response = await api.delete(`/invoices/${invoiceId}`)
    return response
  },

  generateNumber: async (options = {}) => {
    const response = await api.get('/invoices/generate-number', options)
    return response
  },

  generatePdfPayload: async (invoiceId) => {
    const response = await api.post(`/invoices/${invoiceId}/pdf`, {})
    return response
  },

  getByUser: async (userId) => {
    const response = await api.get(`/users/${userId}/invoices`)
    return response
  },

  getTerms: async () => {
    const response = await api.get('/terms')
    return response
  },

  getBusinessProfile: async (userId) => {
    const response = await api.get(`/users/${userId}/business-profile`)
    return response
  },
}
