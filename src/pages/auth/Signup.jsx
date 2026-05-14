import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useApp } from '../../context/AppContext'

const Signup = () => {
  const navigate = useNavigate()
  const { pushToast, signUp, role } = useApp()

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const fullName = form.get('fullName')
    const nic = form.get('nic')
    const password = form.get('password')

    try {
      await signUp({
        fullName,
        nic,
        password,
        role: role || 'user',
      })
      pushToast({
        title: 'Account created',
        message: 'You can now sign in with your NIC.',
        tone: 'success',
      })
      navigate('/auth/login')
    } catch (error) {
      pushToast({
        title: 'Signup failed',
        message: error.message || 'Unable to create account.',
        tone: 'danger',
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-card w-full max-w-lg rounded-2xl border px-8 py-10">
        <h1 className="font-display text-3xl text-ink-900">Create Account</h1>
        <p className="mt-2 text-sm text-ink-600">
          Register for NGJA export invoice access.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input
            name="fullName"
            label="Full Name"
            placeholder="Ayesha Perera"
            required
          />
          <Input
            name="nic"
            label="NIC Number"
            placeholder="199012345V"
            required
          />
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="Create secure password"
            required
          />
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
          <button
            type="button"
            className="w-full text-center text-xs font-semibold text-azure-600"
            onClick={() => navigate('/auth/login')}
          >
            Already registered? Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default Signup
