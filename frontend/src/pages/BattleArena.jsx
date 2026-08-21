import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

export default function BattleArena() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [battle, setBattle] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questionIdx, setQuestionIdx] = useState(0)
  const [myScore, setMyScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [answered, setAnswered] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [waiting, setWaiting] = useState(true)

  useEffect(() => {
    fetchBattle()
  }, [id])

  const fetchBattle = async () => {
    try {
      const res = await api.get(`/battle/battles/${id}/`)
      setBattle(res.data)
      setWaiting(res.data.status === 'pending')
      if (res.data.current_question) {
        setCurrentQuestion(res.data.current_question)
        setWaiting(false)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (waiting || !currentQuestion || answered) return
    setTimeLeft(15)
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleAnswer(-1)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [currentQuestion, answered, waiting])

  const handleAnswer = async (optionIdx) => {
    if (answered) return
    setAnswered(true)
    setSelectedOption(optionIdx)
    try {
      const res = await api.post(`/battle/battles/${id}/answer_battle/`, {
        question_idx: questionIdx,
        selected_option: optionIdx,
      })
      setMyScore(res.data.my_score || myScore)
      setOpponentScore(res.data.opponent_score || opponentScore)
      if (res.data.next_question) {
        setCurrentQuestion(res.data.next_question)
        setQuestionIdx(prev => prev + 1)
        setAnswered(false)
        setSelectedOption(null)
      }
      if (res.data.finished) {
        setResult(res.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Jang yuklanmoqda...</p>
      </div>
    )
  }

  if (result) {
    const won = result.winner === 'me'
    return (
      <div className="page">
        <div className="battle-result">
          <div className={`result-card ${won ? 'result-pass' : 'result-fail'}`}>
            <div className="battle-result-effect">
              {won ? '🏆' : result.draw ? '🤝' : '💀'}
            </div>
            <h1 className="glow-text battle-result-title">
              {won ? 'G\'ALABA!' : result.draw ? 'DURANG!' : "MAG'LUBIYAT"}
            </h1>
            <div className="battle-final-score">
              <div className="battle-score-side">
                <span className="score-big">{myScore}</span>
                <span className="score-label">Siz</span>
              </div>
              <span className="score-divider">—</span>
              <div className="battle-score-side">
                <span className="score-big">{opponentScore}</span>
                <span className="score-label">Raqib</span>
              </div>
            </div>
            {won && <p className="result-coins">🪙 +{result.coins_earned || 15} coin olindingiz!</p>}
            <div className="result-actions">
              <button className="btn btn-primary" onClick={() => navigate('/battles')}>⚔️ Janglar</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page battle-arena-page">
      <div className="battle-arena-header">
        <div className="battle-arena-players">
          <div className="battle-arena-player">
            <div className="avatar-large">👤</div>
            <span className="player-name">Siz</span>
            <span className="player-score glow-text">{myScore}</span>
          </div>
          <div className="battle-arena-vs">
            <span className="vs-text glow-text">VS</span>
          </div>
          <div className="battle-arena-player">
            <div className="avatar-large">👤</div>
            <span className="player-name">{battle?.opponent_name || 'Raqib'}</span>
            <span className="player-score glow-text">{opponentScore}</span>
          </div>
        </div>
      </div>

      {waiting ? (
        <div className="battle-waiting">
          <div className="loading-spinner"></div>
          <p>⏳ Raqib kutilmoqda...</p>
        </div>
      ) : currentQuestion ? (
        <>
          <div className="battle-timer-bar">
            <div className="battle-timer-fill" style={{ width: `${(timeLeft / 15) * 100}%` }}></div>
          </div>
          <div className={`battle-timer-text ${timeLeft < 5 ? 'timer-warning' : ''}`}>
            ⏱️ {timeLeft}s
          </div>

          <div className="battle-question">
            <h2 className="battle-question-text">{currentQuestion.text || currentQuestion.question}</h2>
          </div>

          <div className="battle-options">
            {(currentQuestion.options || []).map((opt, idx) => (
              <button
                key={idx}
                className={`battle-option ${answered ? (idx === currentQuestion.correct ? 'correct' : (selectedOption === idx ? 'wrong' : '')) : ''} ${selectedOption === idx ? 'selected' : ''}`}
                onClick={() => handleAnswer(idx)}
                disabled={answered}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="option-text">{opt}</span>
              </button>
            ))}
          </div>

          <div className="battle-progress">
            Savol {questionIdx + 1}
          </div>
        </>
      ) : (
        <div className="battle-waiting">
          <p>Jang tayyorlanmoqda...</p>
        </div>
      )}
    </div>
  )
}
