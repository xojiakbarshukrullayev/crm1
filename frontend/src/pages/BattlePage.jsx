import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function BattlePage() {
  const [battles, setBattles] = useState([])
  const [myStats, setMyStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [createForm, setCreateForm] = useState({ subject: '', opponent: '' })
  const [creating, setCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    fetchBattles()
  }, [])

  const fetchBattles = async () => {
    try {
      const res = await api.get('/battle/battles/')
      const data = res.data?.results || res.data || []
      setBattles(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBattle = async () => {
    setCreating(true)
    try {
      await api.post('/battle/battles/', createForm)
      setShowCreate(false)
      fetchBattles()
      setCreateForm({ subject: '', opponent: '' })
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const activeBattles = battles.filter(b => b.status === 'active' || b.status === 'pending')
  const completedBattles = battles.filter(b => b.status === 'completed')

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Janglar yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title glow-text">⚔️ Janglar</h1>
        <p className="page-subtitle">Bilim janglari maydoni</p>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? '✖ Bekor' : '⚔️ Yangi jang'}
        </button>
      </div>

      {showCreate && (
        <div className="manga-card">
          <h3 className="manga-card-title">⚔️ Yangi jang yaratish</h3>
          <div className="form-group">
            <label>Fan</label>
            <input type="text" className="manga-input" placeholder="Matematika, Fizika..." value={createForm.subject} onChange={e => setCreateForm(p => ({ ...p, subject: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Raqib (username)</label>
            <input type="text" className="manga-input" placeholder="Raqib username" value={createForm.opponent} onChange={e => setCreateForm(p => ({ ...p, opponent: e.target.value }))} />
          </div>
          <button className="btn btn-primary" onClick={handleCreateBattle} disabled={creating}>
            {creating ? 'Yaratilmoqda...' : '⚔️ Jangni boshlash'}
          </button>
        </div>
      )}

      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
          ⚔️ Faol janglar ({activeBattles.length})
        </button>
        <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          📜 Tarix ({completedBattles.length})
        </button>
      </div>

      {activeTab === 'active' && (
        <>
          {activeBattles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⚔️</div>
              <h3>Faol janglar yo'q</h3>
              <p>Yangi jang yarating!</p>
            </div>
          ) : (
            <div className="cards-grid">
              {activeBattles.map(battle => (
                <div key={battle.id} className="manga-card battle-card">
                  <div className="battle-card-vs">
                    <span className="battle-player">{battle.player1_name || battle.player1?.first_name || 'Player 1'}</span>
                    <span className="battle-vs-text">VS</span>
                    <span className="battle-player">{battle.player2_name || battle.player2?.first_name || 'Player 2'}</span>
                  </div>
                  <div className="battle-card-info">
                    <span className="badge badge-primary">{battle.subject || 'Umumiy'}</span>
                    <span className={`badge ${battle.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {battle.status === 'active' ? '🔥 Faol' : '⏳ Kutishda'}
                    </span>
                  </div>
                  {(battle.status === 'active') && (
                    <Link to={`/battles/${battle.id}`} className="btn btn-primary btn-full mt-1">
                      ⚔️ Jangga kirish
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <>
          {completedBattles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📜</div>
              <h3>Jang tarixi bo'sh</h3>
            </div>
          ) : (
            <div className="table-container">
              <table className="manga-table">
                <thead>
                  <tr>
                    <th>Player 1</th>
                    <th>VS</th>
                    <th>Player 2</th>
                    <th>Score</th>
                    <th>G'olib</th>
                  </tr>
                </thead>
                <tbody>
                  {completedBattles.map(b => (
                    <tr key={b.id}>
                      <td>{b.player1_name || b.player1?.first_name}</td>
                      <td className="text-center">⚔️</td>
                      <td>{b.player2_name || b.player2?.first_name}</td>
                      <td>{b.player1_score || 0} - {b.player2_score || 0}</td>
                      <td><span className="badge badge-success">{b.winner_name || '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
