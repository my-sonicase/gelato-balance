import { AuthProvider } from './lib/authContext'
import BalancerApp from './components/balancer/BalancerApp'

export default function App() {
  return (
    <AuthProvider>
      <BalancerApp />
    </AuthProvider>
  )
}
