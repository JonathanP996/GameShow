import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Scoreboard from '../components/Scoreboard'
import { useApp } from '../state/AppContext'
import { JeopardyQuestion } from '../types'

export default function Play() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { updateGameAndMarkUsed, updateGame, data } = useApp()
  // Get game directly from data.games - this ensures component re-renders when data changes
  const game = gameId ? data.games.find(g => g.id === gameId) : undefined
  const [editingTeams, setEditingTeams] = useState(false)
  const [teamAName, setTeamAName] = useState(game?.teams.teamA || 'Team A')
  const [teamBName, setTeamBName] = useState(game?.teams.teamB || 'Team B')
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [successPoints, setSuccessPoints] = useState(0)
  const [successTeam, setSuccessTeam] = useState('')
  const [showWrongAnimation, setShowWrongAnimation] = useState(false)
  const [wagerStage, setWagerStage] = useState<'wagering' | 'question' | 'scoring' | null>(null)
  const [teamAWager, setTeamAWager] = useState<number>(0)
  const [teamBWager, setTeamBWager] = useState<number>(0)
  const [wagerRevealed, setWagerRevealed] = useState(false)
  const [showWagerScores, setShowWagerScores] = useState(false)
  const [wagerComplete, setWagerComplete] = useState(false)

  const toggleFullscreen = () => {
    const el: any = document.fullscreenElement || (document as any).webkitFullscreenElement
    if (el) {
      if (document.exitFullscreen) document.exitFullscreen()
      // @ts-ignore
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
    } else {
      const root = document.documentElement as any
      if (root.requestFullscreen) root.requestFullscreen()
      // @ts-ignore
      else if (root.webkitRequestFullscreen) root.webkitRequestFullscreen()
    }
  }
  
  // Update local state when game changes
  useEffect(() => {
    if (game) {
      setTeamAName(game.teams.teamA)
      setTeamBName(game.teams.teamB)
    }
  }, [game?.teams.teamA, game?.teams.teamB])

  // Loading screen animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // 2 second loading screen
    return () => clearTimeout(timer)
  }, [])
  
  if (!game) return null

  // Show loading screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#060CE9] flex items-center justify-center z-50">
        <div className="text-center">
          <img 
            src="/jeopardy-logo.png" 
            alt="Jeopardy" 
            className="w-64 md:w-96 mx-auto animate-pulse mb-8"
            style={{
              animation: 'logoFloat 2s ease-in-out infinite'
            }}
          />
          <div className="text-yellow-400 text-2xl md:text-4xl font-bold animate-pulse">
            Loading Game...
          </div>
          <style>{`
            @keyframes logoFloat {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-20px) scale(1.05); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  const saveTeamNames = () => {
    if (!gameId) return
    const currentGame = data.games.find(g => g.id === gameId)
    if (currentGame) {
      updateGame({
        ...currentGame,
        teams: { teamA: teamAName, teamB: teamBName }
      })
    }
    setEditingTeams(false)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full mx-auto p-2 md:p-4 space-y-4">
        <div className="flex items-center justify-between mb-2 md:mb-4 text-white">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="px-3 md:px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <h1 className="text-xl md:text-2xl font-bold">{game.name}</h1>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            {editingTeams ? (
              <div className="flex items-center gap-2 bg-white rounded-lg border p-2 text-black">
                <input
                  type="text"
                  value={teamAName}
                  onChange={(e) => setTeamAName(e.target.value)}
                  className="px-2 py-1 border rounded text-sm w-28 md:w-32"
                  placeholder="Team A"
                />
                <span className="text-slate-500">vs</span>
                <input
                  type="text"
                  value={teamBName}
                  onChange={(e) => setTeamBName(e.target.value)}
                  className="px-2 py-1 border rounded text-sm w-28 md:w-32"
                  placeholder="Team B"
                />
                <button
                  onClick={saveTeamNames}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingTeams(false)
                    setTeamAName(game.teams.teamA)
                    setTeamBName(game.teams.teamB)
                  }}
                  className="px-3 py-1 border rounded text-sm hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <Scoreboard key={`${game.teams.teamA}-${game.teams.teamB}-${game.scores.teamA}-${game.scores.teamB}`} scores={game.scores} teamA={game.teams.teamA} teamB={game.teams.teamB} />
                <button
                  onClick={() => setEditingTeams(true)}
                  className="px-3 md:px-4 py-2 rounded-lg border border-white/30 text-sm hover:bg-white/10"
                  title="Edit Team Names"
                >
                  ✏️ Edit Teams
                </button>
              </>
            )}
            <button onClick={toggleFullscreen} className="px-3 md:px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10">Full Screen</button>
            <Link 
              to={`/editor/${gameId}`}
              className="px-3 md:px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10"
            >
              Edit Game
            </Link>
          </div>
        </div>

        {/* Success Animation Overlay */}
        {showSuccessAnimation && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 pointer-events-none">
            <div className="text-center">
              <div className="relative">
                {/* Animated checkmark */}
                <div className="text-green-400 text-8xl md:text-9xl font-bold mb-4" style={{
                  animation: 'checkmarkPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                }}>
                  ✓
                </div>
                {/* Confetti effect */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)],
                        animation: `confetti 1s ease-out ${i * 0.05}s forwards`,
                        opacity: 0
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="text-yellow-400 text-5xl md:text-7xl font-bold mb-2" style={{
                animation: 'scorePop 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s both'
              }}>
                +${successPoints.toLocaleString()}
              </div>
              <div className="text-white text-4xl md:text-6xl font-bold" style={{
                animation: 'textSlide 0.8s ease-out 0.4s both'
              }}>
                {successTeam} Got It!
              </div>
            </div>
            <style>{`
              @keyframes checkmarkPop {
                0% { transform: scale(0) rotate(-45deg); opacity: 0; }
                50% { transform: scale(1.2) rotate(10deg); }
                100% { transform: scale(1) rotate(0deg); opacity: 1; }
              }
              @keyframes scorePop {
                0% { transform: scale(0) translateY(50px); opacity: 0; }
                50% { transform: scale(1.1) translateY(-10px); }
                100% { transform: scale(1) translateY(0); opacity: 1; }
              }
              @keyframes textSlide {
                0% { transform: translateX(-100px); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
              }
              @keyframes confetti {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(-200px) rotate(720deg); opacity: 0; }
              }
            `}</style>
          </div>
        )}

        {/* Wrong Answer Animation Overlay */}
        {showWrongAnimation && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 pointer-events-none">
            <div className="text-center">
              <div className="relative">
                {/* Animated X mark */}
                <div className="text-red-500 text-8xl md:text-9xl font-bold mb-4" style={{
                  animation: 'xMarkShake 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                }}>
                  ✗
                </div>
                {/* Red particles effect */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(15)].map((_, i) => {
                    const angle = (i / 15) * Math.PI * 2
                    const distance = 150 + Math.random() * 100
                    const x = Math.cos(angle) * distance
                    const y = Math.sin(angle) * distance
                    return (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-red-500"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `translate(${x}px, ${y}px) scale(0)`,
                          animation: `wrongParticle 1.2s ease-out ${i * 0.03}s forwards`,
                          opacity: 0
                        }}
                      />
                    )
                  })}
                </div>
              </div>
              <div className="text-red-400 text-5xl md:text-7xl font-bold mb-2" style={{
                animation: 'wrongTextPop 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s both'
              }}>
                Wrong Answer
              </div>
              <div className="text-gray-300 text-3xl md:text-5xl font-bold" style={{
                animation: 'noPointsText 0.8s ease-out 0.4s both'
              }}>
                No Points
              </div>
            </div>
            <style>{`
              @keyframes xMarkShake {
                0% { transform: scale(0) rotate(-90deg); opacity: 0; }
                25% { transform: scale(1.3) rotate(-15deg); }
                50% { transform: scale(0.9) rotate(15deg); }
                75% { transform: scale(1.1) rotate(-5deg); }
                100% { transform: scale(1) rotate(0deg); opacity: 1; }
              }
              @keyframes wrongTextPop {
                0% { transform: scale(0) translateY(50px); opacity: 0; }
                50% { transform: scale(1.1) translateY(-10px); }
                100% { transform: scale(1) translateY(0); opacity: 1; }
              }
              @keyframes noPointsText {
                0% { transform: translateX(100px); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
              }
              @keyframes wrongParticle {
                0% { 
                  transform: translate(0, 0) scale(1); 
                  opacity: 1; 
                }
                100% { 
                  opacity: 0; 
                }
              }
            `}</style>
          </div>
        )}

        {/* Only show JepPlay board if questions remain and not in wager stage */}
        {game.modes.jeopardy.filter(q=>!q.used).length > 0 && !(wagerStage === 'question' && game.wagerQuestion) && (
          <JepPlay 
            questions={game.modes.jeopardy} 
            categories={game.modes.jeopardyCategories || ['', '', '', '', '', '']} 
            scores={[game.scores.teamA, game.scores.teamB]}
            teamA={game.teams.teamA}
            teamB={game.teams.teamB}
            timerSeconds={game.questionTimerSeconds ?? 0}
            onScores={(a,b,questionId,points,teamName,isWrong)=>{
              if (!gameId) return
              updateGameAndMarkUsed(gameId, { teamA: a, teamB: b }, questionId)
              // Show success animation for correct answers
              if (points > 0 && !isWrong) {
                setSuccessPoints(points)
                setSuccessTeam(teamName)
                setShowSuccessAnimation(true)
                setTimeout(() => setShowSuccessAnimation(false), 2000)
              }
              // Show wrong animation for incorrect answers
              if (isWrong) {
                setShowWrongAnimation(true)
                setTimeout(() => setShowWrongAnimation(false), 2000)
              }
            }} 
          />
        )}

        {/* Show wager question - replaces the board when wagerStage is 'question' */}
        {wagerStage === 'question' && game.wagerQuestion && (
          <div className="min-h-[70vh] md:min-h-[78vh] flex flex-col justify-between rounded-lg border-2 border-yellow-400 bg-[#060CE9] text-yellow-400 p-4 md:p-6">
            <div className="space-y-6">
              <div className="text-sm md:text-base font-semibold text-yellow-300 uppercase tracking-wide text-center">
                FINAL JEOPARDY
              </div>
              <div className="text-4xl md:text-6xl font-bold leading-tight text-center">
                {game.wagerQuestion.question}
              </div>
              {wagerRevealed ? (
                <div className="text-yellow-300 text-2xl md:text-4xl font-semibold text-center">Answer: {game.wagerQuestion.answer}</div>
              ) : (
                <div className="flex justify-center">
                  <button 
                    onClick={() => setWagerRevealed(true)} 
                    className="px-8 py-4 rounded-lg bg-yellow-400 text-black font-bold text-xl hover:bg-yellow-300 transition"
                  >
                    Reveal Answer
                  </button>
                </div>
              )}
            </div>

            {wagerRevealed && (
              <div className="space-y-3 pt-6">
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      // Team A correct - they win their wager, Team B wrong - they lose their wager
                      const newScoreA = game.scores.teamA + teamAWager
                      const newScoreB = Math.max(0, game.scores.teamB - teamBWager)
                      const currentGame = data.games.find(g => g.id === gameId)
                      if (currentGame) {
                        updateGame({ ...currentGame, scores: { teamA: newScoreA, teamB: newScoreB } })
                      }
                      setSuccessPoints(teamAWager)
                      setSuccessTeam(game.teams.teamA)
                      setShowSuccessAnimation(true)
                      setTimeout(() => {
                        setShowSuccessAnimation(false)
                        setShowWagerScores(true)
                        setTimeout(() => {
                          setShowWagerScores(false)
                          setWagerStage(null)
                          setWagerComplete(true)
                          setWagerRevealed(false)
                          setTeamAWager(0)
                          setTeamBWager(0)
                        }, 3000)
                      }, 2000)
                    }}
                    className="flex-1 px-6 py-4 rounded-lg bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition"
                  >
                    {game.teams.teamA} Correct (+${teamAWager.toLocaleString()})
                  </button>
                  <button 
                    onClick={() => {
                      // Team B correct - they win their wager, Team A wrong - they lose their wager
                      const newScoreA = Math.max(0, game.scores.teamA - teamAWager)
                      const newScoreB = game.scores.teamB + teamBWager
                      const currentGame = data.games.find(g => g.id === gameId)
                      if (currentGame) {
                        updateGame({ ...currentGame, scores: { teamA: newScoreA, teamB: newScoreB } })
                      }
                      setSuccessPoints(teamBWager)
                      setSuccessTeam(game.teams.teamB)
                      setShowSuccessAnimation(true)
                      setTimeout(() => {
                        setShowSuccessAnimation(false)
                        setShowWagerScores(true)
                        setTimeout(() => {
                          setShowWagerScores(false)
                          setWagerStage(null)
                          setWagerComplete(true)
                          setWagerRevealed(false)
                          setTeamAWager(0)
                          setTeamBWager(0)
                        }, 3000)
                      }, 2000)
                    }}
                    className="flex-1 px-6 py-4 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition"
                  >
                    {game.teams.teamB} Correct (+${teamBWager.toLocaleString()})
                  </button>
                </div>
                <button 
                  onClick={() => {
                    // Both wrong - they lose their wagers
                    const newScoreA = Math.max(0, game.scores.teamA - teamAWager)
                    const newScoreB = Math.max(0, game.scores.teamB - teamBWager)
                    const currentGame = data.games.find(g => g.id === gameId)
                    if (currentGame) {
                      updateGame({ ...currentGame, scores: { teamA: newScoreA, teamB: newScoreB } })
                    }
                    setShowWrongAnimation(true)
                    setTimeout(() => {
                      setShowWrongAnimation(false)
                      setShowWagerScores(true)
                      setTimeout(() => {
                        setShowWagerScores(false)
                        setWagerStage(null)
                        setWagerComplete(true)
                        setWagerRevealed(false)
                        setTeamAWager(0)
                        setTeamBWager(0)
                      }, 3000)
                    }, 2000)
                  }}
                  className="w-full px-6 py-4 rounded-lg bg-red-600 text-white font-bold text-lg hover:bg-red-700 transition"
                >
                  Both Wrong (Lose Wagers)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Check if all questions are done - show wager screen if question exists and not completed */}
        {game.modes.jeopardy.filter(q=>!q.used).length === 0 && game.wagerQuestion && !wagerComplete && wagerStage === null && !showWagerScores && (
          <div className="bg-gradient-to-br from-[#060CE9] via-[#0715E6] to-[#0a1dff] rounded-lg p-8">
            <div className="text-center text-yellow-400 max-w-4xl mx-auto">
              <div className="text-6xl md:text-8xl font-bold mb-8 animate-pulse">
                FINAL JEOPARDY
              </div>
              <div className="text-3xl md:text-4xl mb-8">
                {game.wagerQuestion.question}
              </div>
              <div className="text-2xl md:text-3xl mb-12">
                Place Your Wagers!
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white/10 rounded-lg p-6 border-2 border-yellow-400">
                  <div className="text-yellow-300 text-2xl font-bold mb-4">{game.teams.teamA}</div>
                  <div className="text-white text-xl mb-4">Current Score: ${game.scores.teamA.toLocaleString()}</div>
                  <input
                    type="number"
                    min="0"
                    max={game.scores.teamA}
                    value={teamAWager}
                    onChange={(e) => setTeamAWager(Math.max(0, Math.min(game.scores.teamA, parseInt(e.target.value) || 0)))}
                    className="w-full px-4 py-3 text-2xl text-center border-2 border-yellow-400 rounded bg-black text-yellow-400 font-bold"
                    placeholder="0"
                  />
                  <div className="text-yellow-300 text-sm mt-2">Wager: ${teamAWager.toLocaleString()}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-6 border-2 border-yellow-400">
                  <div className="text-yellow-300 text-2xl font-bold mb-4">{game.teams.teamB}</div>
                  <div className="text-white text-xl mb-4">Current Score: ${game.scores.teamB.toLocaleString()}</div>
                  <input
                    type="number"
                    min="0"
                    max={game.scores.teamB}
                    value={teamBWager}
                    onChange={(e) => setTeamBWager(Math.max(0, Math.min(game.scores.teamB, parseInt(e.target.value) || 0)))}
                    className="w-full px-4 py-3 text-2xl text-center border-2 border-yellow-400 rounded bg-black text-yellow-400 font-bold"
                    placeholder="0"
                  />
                  <div className="text-yellow-300 text-sm mt-2">Wager: ${teamBWager.toLocaleString()}</div>
                </div>
              </div>
              <button
                onClick={() => setWagerStage('question')}
                className="px-8 py-4 bg-yellow-400 text-black font-bold text-2xl rounded-lg hover:bg-yellow-300 transition"
              >
                Start Final Question
              </button>
            </div>
          </div>
        )}

        {/* Show wager scores before winner */}
        {showWagerScores && (() => {
          const currentGame = data.games.find(g => g.id === gameId)
          const finalScores = currentGame?.scores || game.scores
          return (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
              <div className="text-center text-white">
                <div className="text-5xl md:text-7xl font-bold mb-8 text-yellow-400 animate-pulse">Final Scores</div>
                <div className="text-4xl md:text-6xl mb-4" style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}>
                  {game.teams.teamA}: ${finalScores.teamA.toLocaleString()}
                </div>
                <div className="text-4xl md:text-6xl mb-8" style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both' }}>
                  {game.teams.teamB}: ${finalScores.teamB.toLocaleString()}
                </div>
              </div>
              <style>{`
                @keyframes fadeInUp {
                  0% { transform: translateY(30px); opacity: 0; }
                  100% { transform: translateY(0); opacity: 1; }
                }
              `}</style>
            </div>
          )
        })()}

        {/* Winner screen - only show if no wager question or wager is complete */}
        {game.modes.jeopardy.filter(q=>!q.used).length === 0 && (!game.wagerQuestion || wagerComplete) && !showWagerScores && (
          <div className="fixed inset-0 bg-gradient-to-br from-[#060CE9] via-[#0715E6] to-[#0a1dff] flex items-center justify-center z-50 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full opacity-20"
                  style={{
                    width: `${Math.random() * 200 + 50}px`,
                    height: `${Math.random() * 200 + 50}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: '#FFD700',
                    animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
                    animationDelay: `${Math.random() * 5}s`
                  }}
                />
              ))}
            </div>
            
            <div className="text-center relative z-10">
              {/* Trophy animation */}
              <div className="text-9xl md:text-[12rem] mb-8" style={{
                animation: 'trophyFloat 2s ease-in-out infinite, trophySpin 3s ease-in-out infinite'
              }}>
                🏆
              </div>
              
              {/* Winner text with cascade effect */}
              <div className="mb-6">
                <div className="text-yellow-400 text-6xl md:text-8xl font-bold mb-2" style={{
                  animation: 'winnerText 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6)'
                }}>
                  {game.scores.teamA > game.scores.teamB ? game.teams.teamA : game.scores.teamB > game.scores.teamA ? game.teams.teamB : 'Tie Game!'}
                </div>
                <div className="text-yellow-300 text-4xl md:text-6xl font-bold" style={{
                  animation: 'winsText 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s both'
                }}>
                  WINS!
                </div>
              </div>
              
              {/* Score display */}
              {game.scores.teamA === game.scores.teamB ? (
                <div className="text-yellow-200 text-2xl md:text-4xl mb-8" style={{
                  animation: 'fadeInUp 1s ease-out 0.6s both'
                }}>
                  Both teams scored {game.scores.teamA} points!
                </div>
              ) : (
                <div className="text-yellow-200 text-2xl md:text-4xl mb-8" style={{
                  animation: 'fadeInUp 1s ease-out 0.6s both'
                }}>
                  Final Score: {game.scores.teamA > game.scores.teamB ? `${game.teams.teamA}: ${game.scores.teamA}` : `${game.teams.teamB}: ${game.scores.teamB}`}
                </div>
              )}
              
              {/* Button */}
              <div className="mt-8" style={{
                animation: 'buttonPop 1s ease-out 1s both'
              }}>
                <button 
                  onClick={() => navigate('/')}
                  className="px-8 py-4 bg-yellow-400 text-black font-bold text-2xl rounded-lg hover:bg-yellow-300 transition transform hover:scale-105 shadow-lg"
                  style={{
                    boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)'
                  }}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
            
            <style>{`
              @keyframes trophyFloat {
                0%, 100% { transform: translateY(0px) rotate(-5deg); }
                50% { transform: translateY(-30px) rotate(5deg); }
              }
              @keyframes trophySpin {
                0%, 100% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)); }
                50% { filter: drop-shadow(0 0 40px rgba(255, 215, 0, 1)); }
              }
              @keyframes winnerText {
                0% { transform: scale(0) translateY(100px); opacity: 0; }
                60% { transform: scale(1.1) translateY(-10px); }
                100% { transform: scale(1) translateY(0); opacity: 1; }
              }
              @keyframes winsText {
                0% { transform: scale(0) translateY(100px); opacity: 0; }
                60% { transform: scale(1.1) translateY(-10px); }
                100% { transform: scale(1) translateY(0); opacity: 1; }
              }
              @keyframes fadeInUp {
                0% { transform: translateY(30px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
              }
              @keyframes buttonPop {
                0% { transform: scale(0); opacity: 0; }
                60% { transform: scale(1.1); }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes float {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                33% { transform: translate(30px, -30px) rotate(120deg); }
                66% { transform: translate(-20px, 20px) rotate(240deg); }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  )
}

function JepPlay({ questions, categories, scores, teamA, teamB, timerSeconds, onScores }: { questions: JeopardyQuestion[], categories: string[], scores:[number,number], teamA: string, teamB: string, timerSeconds: number, onScores:(a:number,b:number,questionId:string,points:number,teamName:string,isWrong:boolean)=>void }) {
  // Force component to use latest scores by using them directly
  const [selected, setSelected] = useState<JeopardyQuestion | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const points = [200, 400, 600, 800, 1000]

  // Initialize audio when component mounts
  useEffect(() => {
    const audio = new Audio('/jeopardy-themelq.mp3')
    audio.loop = true
    setAudioRef(audio)
    
    return () => {
      // Cleanup: stop audio when component unmounts
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [])
  
  // Play music when question is selected, stop when answered or cancelled
  useEffect(() => {
    if (selected && audioRef) {
      audioRef.play().catch(err => {
        // Handle autoplay restrictions
        console.log('Audio play failed:', err)
      })
    } else if (!selected && audioRef) {
      audioRef.pause()
      audioRef.currentTime = 0
    }
  }, [selected, audioRef])

  const getQuestion = (catIdx: number, rowIdx: number) => {
    return questions.find(q => q.categoryIndex === catIdx && q.rowIndex === rowIdx)
  }

  const select = (catIdx: number, rowIdx: number) => {
    const q = getQuestion(catIdx, rowIdx)
    if (!q || q.used) return
    setSelected(q)
    setRevealed(false)
    // Start timer if enabled
    if (timerSeconds > 0) {
      setTimeRemaining(timerSeconds)
    }
  }

  // Timer countdown effect
  useEffect(() => {
    if (!selected || timerSeconds === 0 || revealed) {
      if (!selected) {
        setTimeRemaining(0)
      }
      return
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1
        if (newTime <= 0) {
          // Timer reached 0 - auto-reveal answer
          setRevealed(true)
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [selected, timerSeconds, revealed])

  const award = (team: 0 | 1) => {
    if (!selected) return
    // Calculate new scores based on current scores prop
    const newScoreA = team === 0 ? scores[0] + selected.points : scores[0]
    const newScoreB = team === 1 ? scores[1] + selected.points : scores[1]
    const teamName = team === 0 ? teamA : teamB
    // Update scores and mark question as used in one call
    onScores(newScoreA, newScoreB, selected.id, selected.points, teamName, false)
    setSelected(null)
    setRevealed(false)
    setTimeRemaining(0)
  }

  const wrongAnswer = () => {
    if (!selected) return
    // Mark question as used without awarding points
    onScores(scores[0], scores[1], selected.id, 0, '', true)
    setSelected(null)
    setRevealed(false)
    setTimeRemaining(0)
  }

  return (
    <div className="w-full">
      {/* If no selection, show the board */}
      {!selected && (
        <div className="bg-black p-1 md:p-2">
          <div className="grid grid-cols-6 gap-1 md:gap-2 min-h-[70vh] md:min-h-[78vh]">
            {/* Category row */}
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-[#060CE9] border border-black px-2 md:px-3 py-3 md:py-4 text-center font-bold text-yellow-400 text-base md:text-lg leading-tight flex items-center justify-center min-h-[10vh]"
                style={{ fontFamily: 'sans-serif' }}
              >
                {cat || `Category ${idx + 1}`}
              </div>
            ))}

            {/* Question cards */}
            {points.map((point, rowIdx) => (
              categories.map((_, catIdx) => {
                const q = getQuestion(catIdx, rowIdx)
                const isUsed = q?.used || false
                return (
                  <button
                    key={`${catIdx}-${rowIdx}`}
                    disabled={!q || isUsed}
                    onClick={() => select(catIdx, rowIdx)}
                    className={`bg-[#060CE9] border border-black px-2 md:px-3 py-6 md:py-8 text-center font-bold text-yellow-400 text-2xl md:text-3xl transition min-h-[12vh] md:min-h-[14vh] flex items-center justify-center ${
                      !q ? 'opacity-30 cursor-not-allowed' : isUsed ? 'opacity-20 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer hover:bg-[#0715E6]'
                    }`}
                    style={{ fontFamily: 'sans-serif' }}
                  >
                    {!q ? '' : isUsed ? '' : `$${point.toLocaleString()}`}
                  </button>
                )
              })
            ))}
          </div>
        </div>
      )}

      {/* If a question is selected, show the full-screen question view */}
      {selected && (
        <div className="min-h-[70vh] md:min-h-[78vh] flex flex-col justify-between rounded-lg border-2 border-yellow-400 bg-[#060CE9] text-yellow-400 p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm md:text-base font-semibold text-yellow-300 uppercase tracking-wide">
                {selected.category} — ${selected.points.toLocaleString()}
              </div>
              {timerSeconds > 0 && !revealed && (
                <div className={`text-4xl md:text-5xl font-bold ${timeRemaining <= 5 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
                  {Math.max(0, timeRemaining)}
                </div>
              )}
            </div>
            <div className="text-4xl md:text-6xl font-bold leading-tight text-center">
              {selected.question}
            </div>
            {revealed ? (
              <div className="text-yellow-300 text-2xl md:text-4xl font-semibold text-center">Answer: {selected.answer}</div>
            ) : (
              <div className="flex justify-center">
                <button 
                  onClick={() => setRevealed(true)} 
                  className="px-8 py-4 rounded-lg bg-yellow-400 text-black font-bold text-xl hover:bg-yellow-300 transition"
                >
                  Reveal Answer
                </button>
              </div>
            )}
          </div>

          {revealed && (
            <div className="space-y-3 pt-6">
              <div className="flex gap-4">
                <button 
                  onClick={() => award(0)} 
                  className="flex-1 px-6 py-4 rounded-lg bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition"
                >
                  Award {teamA} (+${selected.points.toLocaleString()})
                </button>
                <button 
                  onClick={() => award(1)} 
                  className="flex-1 px-6 py-4 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition"
                >
                  Award {teamB} (+${selected.points.toLocaleString()})
                </button>
              </div>
              <button 
                onClick={wrongAnswer} 
                className="w-full px-6 py-4 rounded-lg bg-red-600 text-white font-bold text-lg hover:bg-red-700 transition"
              >
                Wrong Answer (No Points)
              </button>
            </div>
          )}

          <div className="pt-6 flex justify-center">
            <button onClick={() => { setSelected(null); setRevealed(false); setTimeRemaining(0) }} className="px-6 py-3 rounded border border-yellow-400 text-yellow-300 hover:bg-[#0715E6]">
              Back to Board
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


