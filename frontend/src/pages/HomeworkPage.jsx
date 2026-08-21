import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function HomeworkPage() {
  const { user } = useAuth()
  const [homeworks, setHomeworks] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', group: '', deadline: '', attachment: null
  })
  const [submitData, setSubmitData] = useState({ homework: '', text: '', file: null })
  const [showSubmit, setShowSubmit] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchHomeworks()
    fetchGroups()
  }, [])

  const fetchHomeworks = async () => {
    try {
      const res = await api.get('/academy/homeworks/')
      setHomeworks(res.data?.results || res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchGroups = async () => {
    try {
      const res = await api.get('/academy/groups/')
      setGroups(res.data?.results || res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreate = async () => {
    setSaving(true)
    setMessage('')
    try {
      const fd = new FormData()
      fd.append('title', formData.title)
      fd.append('description', formData.description)
      fd.append('group', formData.group)
      fd.append('deadline', formData.deadline)
      if (formData.attachment) fd.append('attachment', formData.attachment)
      await api.post('/academy/homeworks/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setMessage('✅ Uy vazifasi yaratildi!')
      setShowCreate(false)
      setFormData({ title: '', description: '', group: '', deadline: '', attachment: null })
      fetchHomeworks()
    } catch (err) {
      setMessage("⚠️ Yaratishda xatolik")
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (homeworkId) => {
    setSaving(true)
    setMessage('')
    try {
      const fd = new FormData()
      fd.append('homework', homeworkId)
      fd.append('text', submitData.text)
      if (submitData.file) fd.append('file', submitData.file)
      await api.post('/academy/submissions/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setMessage('✅ Topshiriq yuborildi!')
      setShowSubmit(null)
      setSubmitData({ homework: '', text: '', file: null })
      fetchHomeworks()
    } catch (err) {
      setMessage("⚠️ Yuborishda xatolik")
    } finally {
      setSaving(false)
    }
  }

  const isTeacher = user?.role === 'ustoz'
  const filteredHomeworks = selectedGroup ? homeworks.filter(h => h.group?.toString() === selectedGroup || h.group === parseInt(selectedGroup)) : homeworks

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title glow-text">📋 Uy vazifalari</h1>
        <p className="page-subtitle">Topshiriqlar boshqaruvi</p>
        {isTeacher && (
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? '✖ Bekor' : '➕ Yangi topshiriq'}
          </button>
        )}
      </div>

      <div className="form-group" style={{ maxWidth: '300px' }}>
        <select className="manga-input" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
          <option value="">— Barcha guruhlar —</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      {message && <div className={message.startsWith('✅') ? 'auth-success' : 'auth-error'}>{message}</div>}

      {showCreate && isTeacher && (
        <div className="manga-card">
          <h3 className="manga-card-title">➕ Yangi topshiriq</h3>
          <div className="form-group">
            <label>Sarlavha</label>
            <input type="text" className="manga-input" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Tavsif</label>
            <textarea className="manga-input" rows="3" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}></textarea>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Guruh</label>
              <select className="manga-input" value={formData.group} onChange={e => setFormData(p => ({ ...p, group: e.target.value }))}>
                <option value="">— Tanlang —</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Muddat</label>
              <input type="datetime-local" className="manga-input" value={formData.deadline} onChange={e => setFormData(p => ({ ...p, deadline: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label>Ilova</label>
            <input type="file" className="manga-input" onChange={e => setFormData(p => ({ ...p, attachment: e.target.files[0] }))} />
          </div>
          <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
            {saving ? 'Yaratilmoqda...' : '💾 Saqlash'}
          </button>
        </div>
      )}

      {filteredHomeworks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Topshiriqlar topilmadi</h3>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredHomeworks.map(hw => (
            <div key={hw.id} className="manga-card homework-card">
              <div className="homework-header">
                <h3>{hw.title}</h3>
                {hw.deadline && (
                  <span className={`badge ${new Date(hw.deadline) < new Date() ? 'badge-danger' : 'badge-warning'}`}>
                    📅 {new Date(hw.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="homework-desc">{hw.description}</p>
              <p className="text-muted">📋 {hw.group_name || hw.group?.name || '—'}</p>
              {!isTeacher && (
                <>
                  {hw.submitted ? (
                    <div className="homework-submitted">
                      <span className="badge badge-success">✅ Topshirildi</span>
                      {hw.grade && <span className="badge badge-primary">📝 {hw.grade}</span>}
                    </div>
                  ) : (
                    <button className="btn btn-primary btn-full" onClick={() => setShowSubmit(hw.id)}>
                      📤 Topshirish
                    </button>
                  )}
                </>
              )}
              {isTeacher && hw.submissions_count !== undefined && (
                <p className="text-muted">📤 {hw.submissions_count} ta topshirildi</p>
              )}

              {showSubmit === hw.id && (
                <div className="homework-submit-form">
                  <div className="form-group">
                    <label>Javob matni</label>
                    <textarea className="manga-input" rows="3" value={submitData.text} onChange={e => setSubmitData(p => ({ ...p, text: e.target.value }))}></textarea>
                  </div>
                  <div className="form-group">
                    <label>Fayl</label>
                    <input type="file" className="manga-input" onChange={e => setSubmitData(p => ({ ...p, file: e.target.files[0] }))} />
                  </div>
                  <div className="action-btns">
                    <button className="btn btn-primary" onClick={() => handleSubmit(hw.id)} disabled={saving}>
                      {saving ? 'Yuborilmoqda...' : '📤 Yuborish'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowSubmit(null)}>Bekor</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
