import { BrowserRouter } from 'react-router-dom'
import ToastStack from './components/common/ToastStack'
import { useApp } from './context/AppContext'
import AppRoutes from './routes/AppRoutes'

const AppShell = () => {
  const { toasts, dismissToast } = useApp()

  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </BrowserRouter>
  )
}

export default AppShell
