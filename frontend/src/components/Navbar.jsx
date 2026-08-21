import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function Navbar({ user }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">📚 Manga CRM</span>
      </div>
      <div className="navbar-actions">
        <div className="navbar-coins" title="Coinlar">
          <span className="coin-icon">🪙</span>
          <span className="coin-count">{user?.coins || 0}</span>
        </div>
        <div className="navbar-notifications" title="Bildirishnomalar">
          <span className="notif-icon">🔔</span>
          <span className="notif-badge">0</span>
        </div>
        <ThemeToggle />
        <div className="navbar-user" onClick={() => navigate('/profile')}>
          <div className="navbar-avatar">
            {user?.first_name?.[0] || user?.username?.[0] || '?'}
          </div>
          <span className="navbar-username">{user?.first_name || user?.username}</span>
        </div>
        <button className="btn btn-logout" onClick={handleLogout} title="Chiqish">
          🚪 Chiqish
        </button>
      </div>
    </nav>
  )
}
