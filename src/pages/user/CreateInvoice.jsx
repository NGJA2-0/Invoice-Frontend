import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TemplateCard from '../../components/cards/TemplateCard'
import { useApp } from '../../context/AppContext'
import { templateCards } from '../../data/mockData'

const CreateInvoice = () => {
  const { userStatus } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    if (userStatus !== 'approved') {
      navigate('/user/dealer-registration')
    }
  }, [userStatus, navigate])

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl border px-6 py-6">
        <h3 className="text-xl font-semibold text-ink-900">Template Selection</h3>
        <p className="mt-2 text-sm text-ink-600">
          Choose a premium invoice template to begin your export documentation.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {templateCards.map((card) => (
          <TemplateCard
            key={card.id}
            title={card.title}
            description={card.description}
            status={card.status}
            onSelect={() => navigate('/user/invoices/template-1')}
          />
        ))}
      </div>
    </div>
  )
}

export default CreateInvoice
