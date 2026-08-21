import { useState, useEffect } from 'react'
import api from '../api'

export default function ParentDashboard() {
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [childData, setChildData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingChild, setLoadingChild] = useState(false)

  useEffect(() => {
    fetchChildren()
  }, [])

  const fetchChildren = async () => {
    try {
      const res = await api.get('/accounts/parent-students/')
      const data = (res.data?.results || res.data || []).map(ps => ({
        id: ps.student,
        first_name: ps.student_name?.split(' ')[0] || '',
        last_name: ps.student_name?.split(' ').slice(1).join(' ') || '',
        name: ps.student_name,
        student_id: ps.student,
      }))
      setChildren(data)
      if (data.length > 0) {
        selectChild(data[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const selectChild = async (child) => {
    setSelectedChild(child)
    setLoadingChild(true)
    try {
      const [attRes, quizRes, hwRes] = await Promise.all([
        api.get(`/academy/attendances/?student=${child.student_id}`).catch(() => ({ data: { results: [] } })),
        api.get(`/quiz/results/?student=${child.student_id}`).catch(() => ({ data: { results: [] } })),
        api.get(`/academy/submissions/?student=${child.student_id}`).catch(() => ({ data: { results: [] } })),
      ])
      setChildData({
        attendance: attRes.data?.results || attRes.data || [],
        quizResults: quizRes.data?.results || quizRes.data || [],
        homework: hwRes.data?.results || hwRes.data || [],
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingChild(false)
    }
  }

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
        <h1 className="page-title glow-text">👨‍👩‍👧 Bolalarim paneli</h1>
        <p className="page-subtitle">Farzandlaringizning ta'limi haqida ma'lumot</p>
      </div>

      {children.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👨‍👩‍👧</div>
          <h3>Bolalar topilmadi</h3>
          <p>Bog'langan bolalar mavjud emas</p>
        </div>
      ) : (
        <>
          <div className="children-selector">
            {children.map(child => (
              <button
                key={child.id}
                className={`child-tab ${selectedChild?.id === child.id ? 'active' : ''}`}
                onClick={() => selectChild(child)}
              >
                <span className="child-avatar">{child.first_name?.[0] || '?'}</span>
                <span>{child.first_name} {child.last_name}</span>
              </button>
            ))}
          </div>

          {loadingChild ? (
            <div className="page-loading"><div className="loading-spinner"></div><p>Ma'lumotlar yuklanmoqda...</p></div>
          ) : childData && (
            <>
              <div className="stats-grid">
                <div className="stat-card stat-card-primary">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <span className="stat-number">
                      {childData.attendance.length > 0
                        ? Math.round((childData.attendance.filter(a => a.present).length / childData.attendance.length) * 100)
                        : 0}%
                    </span>
                    <span className="stat-label">Davomat</span>
                  </div>
                </div>
                <div className="stat-card stat-card-accent">
                  <div className="stat-icon">📝</div>
                  <div className="stat-info">
                    <span className="stat-number">{childData.quizResults.length}</span>
                    <span className="stat-label">Testlar</span>
                  </div>
                </div>
                <div className="stat-card stat-card-success">
                  <div className="stat-icon">📋</div>
                  <div className="stat-info">
                    <span className="stat-number">{childData.homework.length}</span>
                    <span className="stat-label">Uy vazifalari</span>
                  </div>
                </div>
              </div>

              {childData.quizResults.length > 0 && (
                <div className="section">
                  <h2 className="section-title">📝 Test natijalari</h2>
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
                        {childData.quizResults.map((r, idx) => (
                          <tr key={r.id || idx}>
                            <td>{r.quiz_title || r.quiz?.title || 'Test'}</td>
                            <td><span className="badge badge-success">{r.score || 0}%</span></td>
                            <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {childData.homework.length > 0 && (
                <div className="section">
                  <h2 className="section-title">📋 Uy vazifalari</h2>
                  <div className="cards-grid">
                    {childData.homework.map((hw, idx) => (
                      <div key={hw.id || idx} className="manga-card">
                        <h4>{hw.title || 'Uy vazifasi'}</h4>
                        <p className="text-muted">{hw.description || ''}</p>
                        <span className={`badge ${hw.submitted ? 'badge-success' : 'badge-warning'}`}>
                          {hw.submitted ? '✅ Topshirildi' : '⏳ Kutilmoqda'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {childData.attendance.length > 0 && (
                <div className="section">
                  <h2 className="section-title">✅ Davomat</h2>
                  <div className="attendance-chart">
                    <div className="chart-bar">
                      <div
                        className="chart-fill"
                        style={{ width: `${Math.round((childData.attendance.filter(a => a.present).length / childData.attendance.length) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="chart-label">
                      {childData.attendance.filter(a => a.present).length}/{childData.attendance.length} kun
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
