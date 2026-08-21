import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roles = [
  { value: 'oquvchi', icon: '📚', label: "O'quvchi", desc: "Darslarni o'rganing" },
  { value: 'ota_ona', icon: '👨‍👩‍👧', label: 'Ota-ona', desc: "Farzandingizni kuzating" },
  { value: 'ustoz', icon: '🎓', label: "Ustoz", desc: "Dars bering" },
  { value: 'kurator', icon: '📷', label: 'Kurator', desc: "Suratga oling" },
  { value: 'intern', icon: '🔰', label: 'Stajyor', desc: "Kuzatib o'rganing" },
]

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    role: 'oquvchi',
    phone: '',
    date_of_birth: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (formData.password !== formData.password_confirm) {
      setError('Parollar mos kelmaydi!')
      return
    }
    setLoading(true)
    try {
      await register(formData)
      setSuccess('Muvaffaqiyatli ro\'yxatdan o\'tdingiz! Tizimga kiring.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const messages = Object.entries(data).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`).join('\n')
        setError(messages)
      } else {
        setError('Ro\'yxatdan o\'tish xatosi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container auth-container-wide">
        <div className="auth-right" style={{ width: '100%' }}>
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2 className="auth-form-title">📝 Ro'yxatdan o'tish</h2>
            {error && <div className="auth-error">⚠️ {error}</div>}
            {success && <div className="auth-success">✅ {success}</div>}

            <div className="role-selector">
              <label className="form-label">Rolni tanlang</label>
              <div className="role-cards">
                {roles.map(r => (
                  <div
                    key={r.value}
                    className={`role-card ${formData.role === r.value ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, role: r.value }))}
                  >
                    <span className="role-card-icon">{r.icon}</span>
                    <span className="role-card-label">{r.label}</span>
                    <span className="role-card-desc">{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">Foydalanuvchi nomi</label>
                <input type="text" id="username" name="username" className="manga-input" placeholder="Username" value={formData.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" className="manga-input" placeholder="email@example.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">Ism</label>
                <input type="text" id="first_name" name="first_name" className="manga-input" placeholder="Ism" value={formData.first_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Familiya</label>
                <input type="text" id="last_name" name="last_name" className="manga-input" placeholder="Familiya" value={formData.last_name} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Telefon</label>
                <input type="text" id="phone" name="phone" className="manga-input" placeholder="+998 XX XXX XX XX" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="date_of_birth">Tug'ilgan sana</label>
                <input type="date" id="date_of_birth" name="date_of_birth" className="manga-input" value={formData.date_of_birth} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Parol</label>
                <input type="password" id="password" name="password" className="manga-input" placeholder="Parol" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="password_confirm">Parolni tasdiqlang</label>
                <input type="password" id="password_confirm" name="password_confirm" className="manga-input" placeholder="Parolni qaytadan" value={formData.password_confirm} onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Yuklanmoqda...' : '🎮 Ro\'yxatdan o\'tish'}
            </button>
            <p className="auth-link">
              Hisobingiz bormi? <Link to="/login">Kirish</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
