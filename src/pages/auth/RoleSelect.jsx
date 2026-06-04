import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const RoleSelect = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to the new unified login
    navigate('/auth/login')
  }, [navigate])

  return null
}

export default RoleSelect
