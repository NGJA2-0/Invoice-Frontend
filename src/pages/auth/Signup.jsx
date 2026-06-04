import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const Signup = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Redirect to login with signup mode
    // The new unified login component handles both login and signup
    navigate('/auth/login')
  }, [navigate])

  return null
}

export default Signup
