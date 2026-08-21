import { useState, useEffect } from 'react'
import api from '../api'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      if (activeTab === 'users') {
        const res = await api.get('/accounts/users/')
        setUsers(res.data?.results || res.data || [])
      } else if (activeTab === 'groups') {
        const res = await api.get('/groups/')
        setGroups(res.data?.results || res.data || [])
      }
    } catch (err) {
      setError("Ma'lumotlarni yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = (type) => {
    setModalType(type)
    setEditingItem(null)
    setFormData(type === 'user' ? {
      username: '', email: '', first_name: '', last_name: '', role: 'oquvchi', phone: '', password: '', password_confirm: ''
    } : {
      name: '', subject: '', schedule: '', description: ''
    })
    setShowModal(true)
  }

  const openEditModal = (type, item) => {
    setModalType(type)
    setEditingItem(item)
    setFormData({ ...item })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modalType === 'user') {
        if (editingItem) {
          await api.put(`/accounts/users/${editingItem.id}/`, formData)
        } else {
          await api.post('/accounts/register/', formData)
        }
      } else if (modalType === 'group') {
        if (editingItem) {
          await api.put(`/groups/${editingItem.id}/`, formData)
        } else {
          await api.post('/groups/', formData)
        }
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || "Saqlashda xatolik")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (type, id) => {
    if (!confirm("O'chirishga ishonchingiz komilmi?")) return
    try {
      if (type === 'user') await api.delete(`/accounts/users/${id}/`)
      else if (type === 'group') await api.delete(`/groups/${id}/`)
      fetchData()
    } catch (err) {
      setError("O'chirishda xatolik")
    }
  }

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredGroups = groups.filter(g =>
    g.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const tabs = [
    { id: 'users', label: '👥 Foydalanuvchilar', count: users.length },
    { id: 'groups', label: '📋 Guruhlar', count: groups.length },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title glow-text">⚙️ Admin Panel</h1>
        <p className="page-subtitle">Tizim boshqaruvi</p>
      </div>

      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setSearchQuery('') }}
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="admin-toolbar">
        <input
          type="text"
          className="manga-input search-input"
          placeholder="🔍 Qidirish..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={() => openCreateModal(activeTab === 'users' ? 'user' : 'group')}>
          ➕ Yangi qo'shish
        </button>
      </div>

      {error && <div className="auth-error">⚠️ {error}</div>}

      {loading ? (
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>Yuklanmoqda...</p>
        </div>
      ) : (
        <div className="table-container">
          {activeTab === 'users' && (
            <table className="manga-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Foydalanuvchi</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Telefon</th>
                  <th>Coin</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan="7" className="text-center">Foydalanuvchilar topilmadi</td></tr>
                ) : filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>
                      <div className="user-cell">
                        <div className="user-cell-avatar">{u.first_name?.[0] || u.username?.[0]}</div>
                        <span>{u.first_name} {u.last_name}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                    <td>{u.phone || '—'}</td>
                    <td><span className="coin-badge">🪙 {u.coins || 0}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-sm btn-secondary" onClick={() => openEditModal('user', u)}>✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete('user', u.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'groups' && (
            <table className="manga-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nomi</th>
                  <th>Fan</th>
                  <th>Jadval</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.length === 0 ? (
                  <tr><td colSpan="5" className="text-center">Guruhlar topilmadi</td></tr>
                ) : filteredGroups.map(g => (
                  <tr key={g.id}>
                    <td>{g.id}</td>
                    <td><strong>{g.name}</strong></td>
                    <td>{g.subject || '—'}</td>
                    <td>{g.schedule || '—'}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-sm btn-secondary" onClick={() => openEditModal('group', g)}>✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete('group', g.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? '✏️ Tahrirlash' : '➕ Yangi qo\'shish'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {modalType === 'user' ? (
                <>
                  <div className="form-group">
                    <label>Foydalanuvchi nomi</label>
                    <input type="text" className="manga-input" value={formData.username || ''} onChange={e => setFormData(p => ({ ...p, username: e.target.value }))} disabled={!!editingItem} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Ism</label>
                      <input type="text" className="manga-input" value={formData.first_name || ''} onChange={e => setFormData(p => ({ ...p, first_name: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Familiya</label>
                      <input type="text" className="manga-input" value={formData.last_name || ''} onChange={e => setFormData(p => ({ ...p, last_name: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" className="manga-input" value={formData.email || ''} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Rol</label>
                    <select className="manga-input" value={formData.role || 'oquvchi'} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}>
                      <option value="admin">Admin</option>
                      <option value="ustoz">Ustoz</option>
                      <option value="oquvchi">O'quvchi</option>
                      <option value="ota_ona">Ota-ona</option>
                      <option value="kurator">Kurator</option>
                      <option value="intern">Stajyor</option>
                      <option value="qowimcha_ustoz">Qo'shimcha Ustoz</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Telefon</label>
                    <input type="text" className="manga-input" value={formData.phone || ''} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  {!editingItem && (
                    <>
                      <div className="form-group">
                        <label>Parol</label>
                        <input type="password" className="manga-input" value={formData.password || ''} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label>Parolni tasdiqlang</label>
                        <input type="password" className="manga-input" value={formData.password_confirm || ''} onChange={e => setFormData(p => ({ ...p, password_confirm: e.target.value }))} />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Guruh nomi</label>
                    <input type="text" className="manga-input" value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Fan</label>
                    <input type="text" className="manga-input" value={formData.subject || ''} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Jadval</label>
                    <input type="text" className="manga-input" value={formData.schedule || ''} onChange={e => setFormData(p => ({ ...p, schedule: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Tavsif</label>
                    <textarea className="manga-input" rows="3" value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}></textarea>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Bekor qilish</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saqlanmoqda...' : '💾 Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
