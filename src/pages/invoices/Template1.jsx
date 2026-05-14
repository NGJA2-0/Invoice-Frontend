import { useEffect, useMemo, useState } from 'react'
import { Eye, Plus, Printer, Save, Trash2 } from 'lucide-react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import Badge from '../../components/common/Badge'
import FileUpload from '../../components/forms/FileUpload'
import ConfirmModal from '../../components/modals/ConfirmModal'
import { useApp } from '../../context/AppContext'
import { formatInvoiceStatus } from '../../utils/status'

const Template1 = () => {
  const { user, createInvoice, generateInvoiceNumber, pushToast } = useApp()
  const [previewMode, setPreviewMode] = useState(false)
  const [status, setStatus] = useState('draft')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [exchangeRate, setExchangeRate] = useState(302.5)
  const [rows, setRows] = useState([
    {
      id: 1,
      itemNo: '01',
      stoneType: 'Sapphire',
      description: 'Oval cut',
      weight: '2.4',
      quantity: 1,
      unitPrice: 1200,
    },
  ])
  const [logo, setLogo] = useState(null)
  const [exporterDetails, setExporterDetails] = useState({
    companyName: '',
    registrationNumber: '',
    address: '',
    contactNumber: '',
    email: '',
  })
  const [invoiceSetup, setInvoiceSetup] = useState({
    category: 'Gemstones',
    subcategory: 'Sapphire',
    date: '',
    templateType: 'template-1',
  })
  const [shipmentDetails, setShipmentDetails] = useState({
    fromCountry: '',
    fromCity: '',
    fromAddress: '',
    toCountry: '',
    toCity: '',
    toAddress: '',
  })
  const [transportDetails, setTransportDetails] = useState({
    mode: 'Hand Carry',
    passengerName: '',
    passportNumber: '',
    nationality: '',
    nic: '',
    contactNumber: '',
    flightNumber: '',
    airline: '',
    departureDate: '',
    destinationCountry: '',
  })
  const [buyerDetails, setBuyerDetails] = useState({
    buyerName: '',
    company: '',
    country: '',
    contactNumber: '',
    address: '',
  })
  const [notes, setNotes] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const loadNumber = async () => {
      try {
        const nextNumber = await generateInvoiceNumber()
        if (nextNumber) {
          setInvoiceNumber(nextNumber)
        }
      } catch (error) {
        setInvoiceNumber('')
      }
    }
    loadNumber()
  }, [generateInvoiceNumber])

  const totals = useMemo(() => {
    const totalUsd = rows.reduce((acc, row) => {
      const qty = Number(row.quantity || 0)
      const price = Number(row.unitPrice || 0)
      return acc + qty * price
    }, 0)
    const totalLkr = totalUsd * Number(exchangeRate || 0)
    return { totalUsd, totalLkr }
  }, [rows, exchangeRate])

  const buildPayload = (nextStatus) => {
    const valuationItems = rows.map((row) => {
      const quantity = Number(row.quantity || 0)
      const unitPrice = Number(row.unitPrice || 0)
      return {
        itemName: row.stoneType || `Item ${row.itemNo}`,
        description: row.description,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
        currency: 'USD',
        weight: Number(row.weight || 0),
      }
    })

    return {
      templateType: invoiceSetup.templateType,
      exporterDetails: {
        ...exporterDetails,
        logoName: logo?.name || '',
        invoiceMeta: {
          ...invoiceSetup,
          invoiceNumber,
        },
      },
      shipmentDetails,
      transportDetails,
      buyerDetails,
      valuationItems,
      exchangeRate: Number(exchangeRate || 0),
      totalUsd: totals.totalUsd,
      totalLkr: totals.totalLkr,
      status: nextStatus,
      createdBy: user?.id || '',
      notes,
    }
  }

  const updateRow = (id, field, value) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        itemNo: String(prev.length + 1).padStart(2, '0'),
        stoneType: '',
        description: '',
        weight: '',
        quantity: 1,
        unitPrice: 0,
      },
    ])
  }

  const removeRow = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id))
  }

  const handleSaveDraft = async () => {
    if (!user?.id) {
      pushToast({
        title: 'Missing user profile',
        message: 'Please login again to save drafts.',
        tone: 'danger',
      })
      return
    }

    try {
      await createInvoice(buildPayload('draft'))
      setStatus('draft')
      pushToast({
        title: 'Draft saved',
        message: 'Invoice saved to drafts.',
        tone: 'success',
      })
    } catch (error) {
      pushToast({
        title: 'Save failed',
        message: error.message || 'Unable to save draft.',
        tone: 'danger',
      })
    }
  }

  const handleGenerate = () => {
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    setShowConfirm(false)
    if (!user?.id) {
      pushToast({
        title: 'Missing user profile',
        message: 'Please login again to submit invoices.',
        tone: 'danger',
      })
      return
    }

    try {
      await createInvoice(buildPayload('submitted'))
      setStatus('submitted')
      pushToast({
        title: 'Invoice generated',
        message: 'Invoice submitted for review.',
        tone: 'success',
      })
    } catch (error) {
      pushToast({
        title: 'Submission failed',
        message: error.message || 'Unable to submit invoice.',
        tone: 'danger',
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-6 py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
            Template 1
          </p>
          <h3 className="mt-2 text-xl font-semibold text-ink-900">
            Export Invoice Workspace
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={status === 'Draft' ? 'warning' : 'info'}>{status}</Badge>
          <Button variant="secondary" onClick={() => setPreviewMode((prev) => !prev)}>
            <Eye className="h-4 w-4" />
            {previewMode ? 'Exit Preview' : 'Preview Mode'}
          </Button>
          <Button variant="secondary" onClick={() => setPreviewMode(true)}>
            <Printer className="h-4 w-4" />
            Print Preview
          </Button>
          <Button variant="secondary" onClick={handleSaveDraft}>
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={handleGenerate}>Generate Invoice</Button>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="surface-card rounded-2xl p-6">
          <h4 className="section-title">Exporter Details</h4>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <FileUpload
              label="Company Logo Upload"
              value={logo}
              onChange={setLogo}
              accept="image/*"
              helper="PNG or JPG"
            />
            <Input label="Company Name" placeholder="NGJA Exporters" />
            <Input label="Export Registration Number" placeholder="EX-2026-4421" />
            <Input label="Address" placeholder="No. 15, Galle Road, Colombo" />
            <Input label="Contact Number" placeholder="+94 11 222 3344" />
            <Input label="Email" placeholder="exports@ngja.lk" />
          </div>
        </div>

        <div className="surface-card rounded-2xl p-6">
          <h4 className="section-title">Invoice Setup</h4>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Select label="Category">
              <option>Gemstones</option>
              <option>Jewellery</option>
              <option>Mixed Export</option>
            </Select>
            <Select label="Subcategory">
              <option>Sapphire</option>
              <option>Ruby</option>
              <option>Diamond</option>
            </Select>
            <Input label="Auto Invoice Number" value={invoiceNumber} readOnly />
            <Input label="Date" type="date" />
            <Select label="Template Selector">
              <option>Template 1</option>
              <option>Template 2</option>
              <option>Template 3</option>
              <option>Template 4</option>
            </Select>
          </div>
        </div>

        <div className="surface-card rounded-2xl p-6">
          <h4 className="section-title">Delivery Information</h4>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Input label="From Country" placeholder="Sri Lanka" />
            <Input label="From City" placeholder="Colombo" />
            <Input label="From Address" placeholder="No. 15, Galle Road" />
            <Input label="To Country" placeholder="Germany" />
            <Input label="To City" placeholder="Frankfurt" />
            <Input label="To Address" placeholder="Hauptstrasse 22" />
          </div>
        </div>

        <div className="surface-card rounded-2xl p-6">
          <h4 className="section-title">Transport Mode</h4>
          <div className="mt-4 max-w-sm">
            <Select label="Mode">
              <option>Hand Carry</option>
              <option>Cargo</option>
              <option>Courier</option>
            </Select>
          </div>
        </div>

        <div className="surface-card rounded-2xl p-6">
          <h4 className="section-title">Passenger / Carrier Details</h4>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Input label="Full Name" placeholder="Ayesha Perera" />
            <Input label="Passport Number" placeholder="N 7894561" />
            <Input label="Nationality" placeholder="Sri Lankan" />
            <Input label="NIC Number" placeholder="199012345V" />
            <Input label="Contact Number" placeholder="+94 77 123 4567" />
            <Input label="Flight Number" placeholder="UL 563" />
            <Input label="Airline" placeholder="SriLankan Airlines" />
            <Input label="Departure Date" type="date" />
            <Input label="Destination Country" placeholder="Germany" />
          </div>
        </div>

        <div className="surface-card rounded-2xl p-6">
          <h4 className="section-title">Buyer Details</h4>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Input label="Buyer Name" placeholder="Citrine House" />
            <Input label="Company" placeholder="Citrine House GmbH" />
            <Input label="Country" placeholder="Germany" />
            <Input label="Contact Number" placeholder="+49 555 1200" />
            <Input label="Address" placeholder="Hauptstrasse 22" />
          </div>
        </div>

        <div className="surface-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h4 className="section-title">Valuation Table</h4>
            <Button variant="secondary" onClick={addRow}>
              <Plus className="h-4 w-4" />
              Add Row
            </Button>
          </div>
          <div className="mt-4 overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-cloud-50 text-xs uppercase tracking-[0.14em] text-ink-500">
                <tr>
                  <th className="px-3 py-2">Item No</th>
                  <th className="px-3 py-2">Stone Type</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Weight</th>
                  <th className="px-3 py-2">Quantity</th>
                  <th className="px-3 py-2">Unit Price USD</th>
                  <th className="px-3 py-2">Auto Total USD</th>
                  <th className="px-3 py-2">Auto Total LKR</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud-100">
                {rows.map((row) => {
                  const totalUsd = Number(row.quantity || 0) * Number(row.unitPrice || 0)
                  const totalLkr = totalUsd * Number(exchangeRate || 0)
                  return (
                    <tr key={row.id} className="text-xs text-ink-600">
                      <td className="px-3 py-2">
                        <input
                          className="input-base"
                          value={row.itemNo}
                          onChange={(event) =>
                            updateRow(row.id, 'itemNo', event.target.value)
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          className="input-base"
                          value={row.stoneType}
                          onChange={(event) =>
                            updateRow(row.id, 'stoneType', event.target.value)
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          className="input-base"
                          value={row.description}
                          onChange={(event) =>
                            updateRow(row.id, 'description', event.target.value)
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          className="input-base"
                          value={row.weight}
                          onChange={(event) =>
                            updateRow(row.id, 'weight', event.target.value)
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          className="input-base"
                          type="number"
                          value={row.quantity}
                          onChange={(event) =>
                            updateRow(row.id, 'quantity', event.target.value)
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          className="input-base"
                          type="number"
                          value={row.unitPrice}
                          onChange={(event) =>
                            updateRow(row.id, 'unitPrice', event.target.value)
                          }
                        />
                      </td>
                      <td className="px-3 py-2 font-semibold text-ink-800">
                        ${totalUsd.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 font-semibold text-ink-800">
                        LKR {totalLkr.toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className="rounded-full border border-cloud-200 p-2 text-ink-500"
                          onClick={() => removeRow(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="surface-card rounded-2xl p-6">
          <h4 className="section-title">Exchange Rate</h4>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Input
              label="USD to LKR"
              type="number"
              value={exchangeRate}
              onChange={(event) => setExchangeRate(event.target.value)}
            />
            <div className="rounded-2xl bg-cloud-50 px-4 py-3">
              <p className="text-xs text-ink-500">Grand Total USD</p>
              <p className="text-lg font-semibold text-ink-900">
                ${totals.totalUsd.toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl bg-cloud-50 px-4 py-3">
              <p className="text-xs text-ink-500">Grand Total LKR</p>
              <p className="text-lg font-semibold text-ink-900">
                LKR {totals.totalLkr.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="surface-card rounded-2xl p-6">
          <h4 className="section-title">Notes</h4>
          <Textarea placeholder="Add export notes or special instructions." />
        </div>
      </div>

      {previewMode ? (
        <div className="glass-card rounded-2xl border px-6 py-8">
          <h4 className="section-title">Print Preview Layout</h4>
          <div className="mt-4 rounded-2xl border border-dashed border-cloud-200 bg-white px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
                  NGJA Export Invoice
                </p>
                <p className="text-lg font-semibold text-ink-900">
                  {invoiceNumber}
                </p>
              </div>
              <Badge tone="info">Preview</Badge>
            </div>
            <div className="mt-6 grid gap-4 text-sm text-ink-600 md:grid-cols-2">
              <div>
                <p className="text-xs text-ink-500">Exporter</p>
                <p className="font-semibold text-ink-900">NGJA Exporters</p>
                <p>Colombo, Sri Lanka</p>
              </div>
              <div>
                <p className="text-xs text-ink-500">Buyer</p>
                <p className="font-semibold text-ink-900">Citrine House GmbH</p>
                <p>Frankfurt, Germany</p>
              </div>
            </div>
            <div className="mt-6 text-sm text-ink-600">
              <p>Grand Total USD: ${totals.totalUsd.toFixed(2)}</p>
              <p>Grand Total LKR: {totals.totalLkr.toFixed(2)}</p>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={showConfirm}
        title="Generate Invoice"
        description="Are you ready to submit this invoice for export approval?"
        onConfirm={handleConfirm}
        onClose={() => setShowConfirm(false)}
      />
    </div>
  )
}

export default Template1
