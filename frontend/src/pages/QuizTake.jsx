import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

export default function QuizTake() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuiz()
  }, [id])

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/quiz/quizzes/${id}/`)
      const quizData = res.data
      setQuiz(quizData)
      setQuestions(quizData.questions || [])
      setTimeLeft((quizData.time_limit || 30) * 60)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (submitted || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [submitted, timeLeft])

  const handleAnswer = (questionId, optionIdx) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIdx }))
  }

  const handleSubmit = useCallback(async () => {
    if (submitting || submitted) return
    setSubmitting(true)
    try {
      const answersArray = Object.entries(answers).map(([questionId, selected]) => ({
        question: parseInt(questionId),
        selected_option: selected,
      }))
      const res = await api.post(`/quiz/quizzes/${id}/submit_quiz/`, { answers: answersArray })
      setResult(res.data)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }, [answers, id, submitting, submitted])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Test yuklanmoqda...</p>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="page-error">
        <span className="error-icon">❌</span>
        <p>Test topilmadi</p>
        <button className="btn btn-primary" onClick={() => navigate('/quizzes')}>Orqaga</button>
      </div>
    )
  }

  if (submitted && result) {
    const score = result.score || 0
    const passed = score >= (quiz.passing_score || 60)
    return (
      <div className="page">
        <div className="quiz-result">
          <div className={`result-card ${passed ? 'result-pass' : 'result-fail'}`}>
            <div className="result-icon">{passed ? '🎉' : '😢'}</div>
            <h1 className="result-title glow-text">
              {passed ? 'Tabriklaymiz!' : 'Yana urinib ko\'ring!'}
            </h1>
            <div className="result-score">
              <span className="score-number">{score}%</span>
              <span className="score-label">Natija</span>
            </div>
            <p className="result-text">
              {result.correct_count || 0}/{result.total_count || questions.length} to'g'ri javob
            </p>
            {passed && <p className="result-coins">🪙 +{(result.coins_earned || 10)} coin olindingiz!</p>}
            <div className="result-actions">
              <button className="btn btn-primary" onClick={() => navigate('/quizzes')}>📝 Testlarga qaytish</button>
              <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIdx]

  return (
    <div className="page quiz-take-page">
      <div className="quiz-take-header">
        <div className="quiz-take-info">
          <h2>{quiz.title}</h2>
          <span>Savol {currentIdx + 1} / {questions.length}</span>
        </div>
        <div className={`quiz-timer ${timeLeft < 60 ? 'timer-warning' : ''}`}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
      </div>

      {currentQuestion && (
        <div className="quiz-question-card">
          <h3 className="question-text">{currentIdx + 1}. {currentQuestion.text || currentQuestion.question}</h3>
          <div className="quiz-options">
            {(currentQuestion.options || []).map((option, idx) => (
              <button
                key={idx}
                className={`quiz-option ${answers[currentQuestion.id] === idx ? 'selected' : ''}`}
                onClick={() => handleAnswer(currentQuestion.id, idx)}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="quiz-take-nav">
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
        >
          ⬅️ Oldingi
        </button>
        {currentIdx < questions.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setCurrentIdx(prev => prev + 1)}>
            Keyingi ➡️
          </button>
        ) : (
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Yuborilmoqda...' : '🏁 Yakunlash'}
          </button>
        )}
      </div>

      <div className="quiz-answers-grid">
        {questions.map((q, idx) => (
          <button
            key={q.id || idx}
            className={`answer-dot ${answers[q.id] !== undefined ? 'answered' : ''} ${idx === currentIdx ? 'current' : ''}`}
            onClick={() => setCurrentIdx(idx)}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
