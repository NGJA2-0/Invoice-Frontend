import { motion } from 'framer-motion'
import { User, UserCog } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import { useApp } from '../../context/AppContext'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (index) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.1, duration: 0.6 },
  }),
}

const RoleSelect = () => {
  const navigate = useNavigate()
  const { selectRole } = useApp()

  const handleSelect = (role) => {
    selectRole(role)
    navigate('/auth/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-azure-600">
            NGJA Export System
          </p>
          <h1 className="mt-4 font-display text-4xl text-ink-900">
            Choose your workspace
          </h1>
          <p className="mt-3 text-sm text-ink-600">
            Select the role to access the premium invoice dashboard.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[
            {
              title: 'Admin Console',
              description: 'Verify registrations and monitor invoice submissions.',
              icon: UserCog,
              role: 'admin',
            },
            {
              title: 'User Workspace',
              description: 'Create export invoices and track approvals.',
              icon: User,
              role: 'user',
            },
          ].map((card, index) => (
            <motion.div
              key={card.role}
              custom={index}
              initial="hidden"
              animate="show"
              variants={cardVariants}
              className="glass-card flex flex-col gap-5 rounded-2xl border px-6 py-7"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-azure-50 text-azure-600">
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-ink-900">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm text-ink-600">{card.description}</p>
              </div>
              <Button onClick={() => handleSelect(card.role)}>
                Continue
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RoleSelect
