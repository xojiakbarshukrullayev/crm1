import { NavLink } from 'react-router-dom'

const roleMenus = {
  admin: [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin', icon: '⚙️', label: 'Admin Panel' },
    { path: '/groups', icon: '👥', label: 'Guruhlar' },
    { path: '/quizzes', icon: '📝', label: 'Testlar' },
    { path: '/posts', icon: '📰', label: 'Postlar' },
  ],
  ustoz: [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/groups', icon: '👥', label: 'Guruhlarim' },
    { path: '/attendance', icon: '✅', label: 'Davomat' },
    { path: '/quizzes', icon: '📝', label: 'Testlar' },
    { path: '/homework', icon: '📋', label: 'Uy vazifalari' },
    { path: '/posts', icon: '📰', label: 'Postlar' },
  ],
  oquvchi: [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/groups', icon: '👥', label: 'Guruhlarim' },
    { path: '/quizzes', icon: '📝', label: 'Testlar' },
    { path: '/battles', icon: '⚔️', label: 'Janglar' },
    { path: '/homework', icon: '📋', label: 'Uy vazifalari' },
    { path: '/coin-shop', icon: '🛒', label: "Coin Do'kon" },
    { path: '/posts', icon: '📰', label: 'Postlar' },
  ],
  ota_ona: [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/parent', icon: '👨‍👩‍👧', label: 'Bolalarim' },
    { path: '/groups', icon: '👥', label: 'Guruhlar' },
    { path: '/quizzes', icon: '📝', label: 'Testlar' },
    { path: '/posts', icon: '📰', label: 'Postlar' },
  ],
  kurator: [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/groups', icon: '👥', label: 'Guruhlarim' },
    { path: '/kurator', icon: '📷', label: 'Foto' },
    { path: '/posts', icon: '📰', label: 'Postlar' },
  ],
  intern: [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/groups', icon: '👥', label: 'Guruhlar' },
    { path: '/posts', icon: '📰', label: 'Postlar' },
  ],
  qowimcha_ustoz: [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/attendance', icon: '✅', label: 'Davomat' },
    { path: '/groups', icon: '👥', label: 'Guruhlar' },
    { path: '/posts', icon: '📰', label: 'Postlar' },
  ],
}

const roleLabels = {
  admin: '👑 Admin',
  ustoz: '🎓 Ustoz',
  oquvchi: '📚 O\'quvchi',
  ota_ona: '👨‍👩‍👧 Ota-ona',
  kurator: '📷 Kurator',
  intern: '🔰 Stajyor',
  qowimcha_ustoz: '🧑‍🏫 Qo\'shimcha Ustoz',
}

export default function Sidebar({ user }) {
  const menuItems = roleMenus[user?.role] || roleMenus.oquvchi

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">Manga CRM</span>
        </div>
        <span className={`role-badge role-${user?.role}`}>
          {roleLabels[user?.role] || user?.role}
        </span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">
            {user?.first_name?.[0] || user?.username?.[0] || '?'}
          </div>
          <div className="sidebar-user-details">
            <span className="sidebar-user-name">{user?.first_name} {user?.last_name}</span>
            <span className="sidebar-user-role">{roleLabels[user?.role]}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
