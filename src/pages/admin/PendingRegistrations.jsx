import { useEffect, useState } from 'react'
import RegistrationCard from '../../components/cards/RegistrationCard'
import ConfirmModal from '../../components/modals/ConfirmModal'
import { useApp } from '../../context/AppContext'

const PendingRegistrations = () => {
  const { registrations, updateRegistrationStatus, pushToast, refreshAdminData } = useApp()
  const pending = registrations.filter((item) => item.status === 'pending')
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState(null)

  useEffect(() => {
    refreshAdminData()
  }, [refreshAdminData])

  const openModal = (item, nextAction) => {
    setSelected(item)
    setAction(nextAction)
  }

  const closeModal = () => {
    setSelected(null)
    setAction(null)
  }

  const handleConfirm = () => {
    if (!selected || !action) return
    const nextStatus = action === 'Approved' ? 'approved' : 'rejected'
    updateRegistrationStatus(selected.userId, nextStatus)
    pushToast({
      title: `Registration ${action.toLowerCase()}`,
      message: `${selected.dealerName} is now ${action}.`,
      tone: action === 'Approved' ? 'success' : 'danger',
    })
    closeModal()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl border px-6 py-6">
        <h3 className="text-xl font-semibold text-ink-900">
          Pending Registrations
        </h3>
        <p className="mt-2 text-sm text-ink-600">
          Review dealer documents and approve or reject submissions.
        </p>
      </div>
      <div className="grid gap-6">
        {pending.map((item) => (
          <RegistrationCard
            key={item.id}
            data={item}
            onView={() => setSelected(item)}
            onApprove={() => openModal(item, 'Approved')}
            onReject={() => openModal(item, 'Rejected')}
          />
        ))}
      </div>

      <ConfirmModal
        open={!!action}
        title={`Confirm ${action}`}
        description={`Are you sure you want to mark ${selected?.dealerName} as ${action}?`}
        onConfirm={handleConfirm}
        onClose={closeModal}
      />

      {selected && !action ? (
        <ConfirmModal
          open={!!selected}
          title="Submission Details"
          description={`Gem Dealer: ${selected.documents.gemDealer}, Jewellery: ${
            selected.documents.jewellery
          }, Customs: ${selected.documents.customs}. TIN: ${
            selected.tin
          }, VAT: ${selected.vat}.`}
          onConfirm={closeModal}
          onClose={closeModal}
          confirmLabel="Close"
          showCancel={false}
        />
      ) : null}
    </div>
  )
}

export default PendingRegistrations
