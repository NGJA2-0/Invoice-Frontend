import { Lock, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useApp } from '../../context/AppContext'

const Login = () => {
  const navigate = useNavigate()
  const { role, login, pushToast } = useApp()
  const activeRole = role || 'user'

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const nic = form.get('nic')
    const password = form.get('password')

    try {
      const loggedIn = await login({ nic, password })
      pushToast({
        title: 'Login successful',
        message: 'Welcome to the NGJA export workspace.',
        tone: 'success',
      })

      if ((loggedIn?.role || activeRole) === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/user/dashboard')
      }
    } catch (error) {
      pushToast({
        title: 'Login failed',
        message: error.message || 'Unable to login. Please try again.',
        tone: 'danger',
      })
    }
  }

  const fillTestUser = () => {
    const form = document.querySelector('form')
    form.elements['nic'].value = '123456789V'
    form.elements['password'].value = 'test123'
  }

  const fillTestAdmin = () => {
    const form = document.querySelector('form')
    form.elements['nic'].value = '987654321V'
    form.elements['password'].value = 'admin123'
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-card w-full max-w-lg rounded-2xl border px-8 py-10">
        <h1 className="font-display text-3xl text-ink-900">Secure Login</h1>
        <p className="mt-2 text-sm text-ink-600">
          Use your NIC to access the export documentation console.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
            placeholder="Enter secure password"
            required
          />
          <div className="flex items-center justify-between text-xs text-ink-500">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {activeRole === 'admin' ? 'Admin' : 'User'} access
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Secure login
            </div>
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>

          {/* Development: Test Credentials */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-900 mb-2">🧪 Test Credentials:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={fillTestUser}
                className="w-full text-left text-xs p-2 rounded bg-white hover:bg-amber-100 transition"
              >
                <span className="font-semibold">User:</span> 123456789V / test123
              </button>
              <button
                type="button"
                onClick={fillTestAdmin}
                className="w-full text-left text-xs p-2 rounded bg-white hover:bg-amber-100 transition"
              >
                <span className="font-semibold">Admin:</span> 987654321V / admin123
              </button>
            </div>
          </div>

          <button
            type="button"
            className="w-full text-center text-xs font-semibold text-azure-600"
            onClick={() => navigate('/auth/signup')}
          >
            New here? Create an account
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
