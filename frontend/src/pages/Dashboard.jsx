import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentData, setRecentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError('')
    try {
      const endpoints = []
      if (user?.role === 'admin') {
        endpoints.push(
          api.get('/accounts/users/'),
          api.get('/academy/groups/'),
          api.get('/quiz/quizzes/'),
        )
        const [users, groups, quizzes] = await Promise.all(endpoints)
        setStats({
          totalUsers: users.data?.length || users.data?.count || 0,
          totalGroups: groups.data?.length || groups.data?.count || 0,
          totalQuizzes: quizzes.data?.length || quizzes.data?.count || 0,
        })
      } else if (user?.role === 'ustoz') {
        endpoints.push(api.get('/academy/groups/'))
        const [groups] = await Promise.all(endpoints)
        setStats({
          myGroups: groups.data?.length || groups.data?.count || 0,
        })
        setRecentData({ groups: groups.data?.results || groups.data || [] })
      } else if (user?.role === 'oquvchi') {
        endpoints.push(api.get('/academy/groups/'), api.get('/quiz/results/'))
        const [groups, results] = await Promise.all(endpoints)
        setStats({
          myGroups: groups.data?.length || groups.data?.count || 0,
          coins: user?.coin_balance || 0,
          quizResults: results.data?.length || results.data?.count || 0,
        })
        setRecentData({
          groups: groups.data?.results || groups.data || [],
          results: results.data?.results || results.data || [],
        })
      } else {
        endpoints.push(api.get('/academy/groups/'))
        const [groups] = await Promise.all(endpoints)
        setStats({ myGroups: groups.data?.length || groups.data?.count || 0 })
        setRecentData({ groups: groups.data?.results || groups.data || [] })
      }
    } catch (err) {
      console.error('Dashboard error:', err)
      setError('Ma\'lumotlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Dashboard yuklanmoqda...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-error">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchDashboardData}>Qaytadan yuklash</button>
      </div>
    )
  }

  const getWelcomeText = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '🌅 Xayrli ertalab'
    if (hour < 17) return '☀️ Xayrli kun'
    return '🌙 Xayrli kech'
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title glow-text">{getWelcomeText()}, {user?.first_name || user?.username}!</h1>
        <p className="page-subtitle">Sizning shaxsiy dashboard</p>
      </div>

      <div className="stats-grid">
        {user?.role === 'admin' && (
          <>
            <div className="stat-card stat-card-primary">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <span className="stat-number">{stats?.totalUsers || 0}</span>
                <span className="stat-label">Foydalanuvchilar</span>
              </div>
            </div>
            <div className="stat-card stat-card-secondary">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <span className="stat-number">{stats?.totalGroups || 0}</span>
                <span className="stat-label">Guruhlar</span>
              </div>
            </div>
            <div className="stat-card stat-card-accent">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <span className="stat-number">{stats?.totalQuizzes || 0}</span>
                <span className="stat-label">Testlar</span>
              </div>
            </div>
            <div className="stat-card stat-card-success">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <span className="stat-number">Active</span>
                <span className="stat-label">Tizim holati</span>
              </div>
            </div>
          </>
        )}

        {user?.role === 'oquvchi' && (
          <>
            <div className="stat-card stat-card-primary">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <span className="stat-number">{stats?.myGroups || 0}</span>
                <span className="stat-label">Guruhlarim</span>
              </div>
            </div>
            <div className="stat-card stat-card-accent">
              <div className="stat-icon">🪙</div>
              <div className="stat-info">
                <span className="stat-number">{stats?.coins || 0}</span>
                <span className="stat-label">Coinlarim</span>
              </div>
            </div>
            <div className="stat-card stat-card-success">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <span className="stat-number">{stats?.quizResults || 0}</span>
                <span className="stat-label">Test natijalari</span>
              </div>
            </div>
            <div className="stat-card stat-card-secondary">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-number">—</span>
                <span className="stat-label">Davomat %</span>
              </div>
            </div>
          </>
        )}

        {user?.role === 'ustoz' && (
          <>
            <div className="stat-card stat-card-primary">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <span className="stat-number">{stats?.myGroups || 0}</span>
                <span className="stat-label">Guruhlarim</span>
              </div>
            </div>
            <div className="stat-card stat-card-accent">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <span className="stat-number">—</span>
                <span className="stat-label">Bugungi darslar</span>
              </div>
            </div>
            <div className="stat-card stat-card-success">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <span className="stat-number">—</span>
                <span className="stat-label">Tekshirilmagan</span>
              </div>
            </div>
          </>
        )}

        {user?.role === 'ota_ona' && (
          <>
            <div className="stat-card stat-card-primary">
              <div className="stat-icon">👨‍👩‍👧</div>
              <div className="stat-info">
                <span className="stat-number">—</span>
                <span className="stat-label">Bolalarim</span>
              </div>
            </div>
            <div className="stat-card stat-card-accent">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-number">—</span>
                <span className="stat-label">Davomat</span>
              </div>
            </div>
            <div className="stat-card stat-card-success">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <span className="stat-number">—</span>
                <span className="stat-label">Test natijalari</span>
              </div>
            </div>
          </>
        )}

        {user?.role === 'kurator' && (
          <>
            <div className="stat-card stat-card-primary">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <span className="stat-number">{stats?.myGroups || 0}</span>
                <span className="stat-label">Guruhlarim</span>
              </div>
            </div>
            <div className="stat-card stat-card-accent">
              <div className="stat-icon">📷</div>
              <div className="stat-info">
                <span className="stat-number">—</span>
                <span className="stat-label">Suratlar</span>
              </div>
            </div>
          </>
        )}

        {user?.role === 'intern' && (
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">🔰</div>
            <div className="stat-info">
              <span className="stat-number">—</span>
              <span className="stat-label">Kuzatish</span>
            </div>
          </div>
        )}

        {user?.role === 'qowimcha_ustoz' && (
          <>
            <div className="stat-card stat-card-primary">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <span className="stat-number">—</span>
                <span className="stat-label">O'quvchilarim</span>
              </div>
            </div>
            <div className="stat-card stat-card-accent">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-number">—</span>
                <span className="stat-label">Davomat</span>
              </div>
            </div>
          </>
        )}
      </div>

      {recentData?.groups && recentData.groups.length > 0 && (
        <div className="section">
          <h2 className="section-title">📋 Guruhlar</h2>
          <div className="cards-grid">
            {recentData.groups.map(group => (
              <div key={group.id} className="manga-card">
                <div className="manga-card-header">
                  <span className="card-emoji">📋</span>
                  <h3>{group.name}</h3>
                </div>
                <div className="manga-card-body">
                  <p>{group.subject || 'Fan belgilanmagan'}</p>
                  {group.schedule && <p className="text-muted">📅 {group.schedule}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentData?.results && recentData.results.length > 0 && (
        <div className="section">
          <h2 className="section-title">📝 So'nggi test natijalari</h2>
          <div className="table-container">
            <table className="manga-table">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Baho</th>
                  <th>Sana</th>
                </tr>
              </thead>
              <tbody>
                {recentData.results.slice(0, 5).map((result, idx) => (
                  <tr key={result.id || idx}>
                    <td>{result.quiz_title || result.quiz?.title || 'Test'}</td>
                    <td><span className="badge badge-success">{result.score || 0}%</span></td>
                    <td>{result.created_at ? new Date(result.created_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!recentData?.groups?.length && !recentData?.results?.length && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Hozircha ma'lumot yo'q</h3>
          <p>Tez orada yangi ma'lumotlar paydo bo'ladi</p>
        </div>
      )}
    </div>
  )
}
