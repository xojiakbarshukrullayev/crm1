import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function QuizPage() {
  const { user } = useAuth()
  const [quizzes, setQuizzes] = useState([])
  const [myResults, setMyResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('quizzes')
  const [showCreate, setShowCreate] = useState(false)
  const [newQuiz, setNewQuiz] = useState({
    title: '', subject: '', time_limit: 30, passing_score: 60, description: '',
    questions: [{ text: '', options: ['', '', '', ''], correct: 0 }]
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchQuizzes()
    if (user?.role === 'oquvchi') fetchMyResults()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/quiz/quizzes/')
      setQuizzes(res.data?.results || res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyResults = async () => {
    try {
      const res = await api.get('/quiz/results/?my=true')
      setMyResults(res.data?.results || res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const addQuestion = () => {
    setNewQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', options: ['', '', '', ''], correct: 0 }]
    }))
  }

  const updateQuestion = (idx, field, value) => {
    setNewQuiz(prev => {
      const questions = [...prev.questions]
      questions[idx] = { ...questions[idx], [field]: value }
      return { ...prev, questions }
    })
  }

  const updateOption = (qIdx, oIdx, value) => {
    setNewQuiz(prev => {
      const questions = [...prev.questions]
      const options = [...questions[qIdx].options]
      options[oIdx] = value
      questions[qIdx] = { ...questions[qIdx], options }
      return { ...prev, questions }
    })
  }

  const removeQuestion = (idx) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx)
    }))
  }

  const handleCreateQuiz = async () => {
    setSaving(true)
    try {
      await api.post('/quiz/quizzes/', newQuiz)
      setShowCreate(false)
      fetchQuizzes()
      setNewQuiz({
        title: '', subject: '', time_limit: 30, passing_score: 60, description: '',
        questions: [{ text: '', options: ['', '', '', ''], correct: 0 }]
      })
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Testlar yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title glow-text">📝 Testlar</h1>
        <p className="page-subtitle">Bilim sinovlari</p>
        {user?.role === 'ustoz' && (
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? '✖ Bekor' : '➕ Yangi test yaratish'}
          </button>
        )}
      </div>

      {user?.role === 'oquvchi' && (
        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`} onClick={() => setActiveTab('quizzes')}>📝 Testlar</button>
          <button className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>📊 Natijalarim</button>
        </div>
      )}

      {showCreate && (
        <div className="manga-card create-quiz-card">
          <h3 className="manga-card-title">➕ Yangi test yaratish</h3>
          <div className="form-group">
            <label>Sarlavha</label>
            <input type="text" className="manga-input" value={newQuiz.title} onChange={e => setNewQuiz(p => ({ ...p, title: e.target.value }))} placeholder="Test nomi" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fan</label>
              <input type="text" className="manga-input" value={newQuiz.subject} onChange={e => setNewQuiz(p => ({ ...p, subject: e.target.value }))} placeholder="Matematika, Fizika..." />
            </div>
            <div className="form-group">
              <label>Vaqt (daqiqa)</label>
              <input type="number" className="manga-input" value={newQuiz.time_limit} onChange={e => setNewQuiz(p => ({ ...p, time_limit: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="form-group">
              <label>O'tish bali</label>
              <input type="number" className="manga-input" value={newQuiz.passing_score} onChange={e => setNewQuiz(p => ({ ...p, passing_score: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="form-group">
            <label>Tavsif</label>
            <textarea className="manga-input" rows="2" value={newQuiz.description} onChange={e => setNewQuiz(p => ({ ...p, description: e.target.value }))}></textarea>
          </div>
          <h4 className="mt-2">Savollar</h4>
          {newQuiz.questions.map((q, qi) => (
            <div key={qi} className="question-editor">
              <div className="question-editor-header">
                <strong>Savol {qi + 1}</strong>
                {newQuiz.questions.length > 1 && (
                  <button className="btn btn-sm btn-danger" onClick={() => removeQuestion(qi)}>🗑️</button>
                )}
              </div>
              <input type="text" className="manga-input mb-1" placeholder="Savol matni..." value={q.text} onChange={e => updateQuestion(qi, 'text', e.target.value)} />
              <div className="options-grid">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="option-input">
                    <input type="radio" name={`correct-${qi}`} checked={q.correct === oi} onChange={() => updateQuestion(qi, 'correct', oi)} />
                    <input type="text" className="manga-input" placeholder={`Variant ${oi + 1}`} value={opt} onChange={e => updateOption(qi, oi, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button className="btn btn-secondary mt-1" onClick={addQuestion}>➕ Savol qo'shish</button>
          <div className="mt-2">
            <button className="btn btn-primary" onClick={handleCreateQuiz} disabled={saving}>
              {saving ? 'Yaratilmoqda...' : '💾 Testni saqlash'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'quizzes' && (
        <>
          {quizzes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>Hozircha testlar yo'q</h3>
            </div>
          ) : (
            <div className="cards-grid">
              {quizzes.map(quiz => (
                <div key={quiz.id} className="manga-card quiz-card">
                  <div className="quiz-card-header">
                    <span className="quiz-subject">{quiz.subject || 'Umumiy'}</span>
                  </div>
                  <h3 className="quiz-title">{quiz.title}</h3>
                  <p className="quiz-desc">{quiz.description || "Tavsif yo'q"}</p>
                  <div className="quiz-meta">
                    <span>⏱️ {quiz.time_limit || 30} daqiqa</span>
                    <span>❓ {quiz.questions_count || quiz.questions?.length || '?'} savol</span>
                    <span>🎯 {quiz.passing_score || 60}% o'tish</span>
                  </div>
                  {user?.role === 'oquvchi' && (
                    <Link to={`/quizzes/${quiz.id}/take`} className="btn btn-primary btn-full mt-1">
                      🚀 Testni boshlash
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'results' && (
        <>
          {myResults.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>Siz hali test topshirmagansiz</h3>
            </div>
          ) : (
            <div className="table-container">
              <table className="manga-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Baho</th>
                    <th>Holat</th>
                    <th>Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {myResults.map((r, idx) => (
                    <tr key={r.id || idx}>
                      <td>{r.quiz_title || r.quiz?.title || 'Test'}</td>
                      <td><span className="badge badge-primary">{r.score || 0}%</span></td>
                      <td>
                        <span className={`badge ${(r.score || 0) >= 60 ? 'badge-success' : 'badge-danger'}`}>
                          {(r.score || 0) >= 60 ? '✅ O\'tdi' : '❌ O\'tmadi'}
                        </span>
                      </td>
                      <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
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
