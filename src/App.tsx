import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Language } from './i18n'
import { useGameEngine } from './hooks/useGameEngine'
import type { ModeId } from './core/game/modes'
import StartScreen from './components/StartScreen'
import GameScreen from './components/GameScreen'
import ResultScreen from './components/ResultScreen'

function App() {
  const { i18n } = useTranslation()
  const [language, setLanguage] = useState<Language>(i18n.language as Language)
  const [selectedMode, setSelectedMode] = useState<ModeId>('syllable')
  const gameEngine = useGameEngine()

  const toggleLanguage = () => {
    const next: Language = language === 'ja' ? 'ko' : 'ja'
    setLanguage(next)
    i18n.changeLanguage(next)
    const url = new URL(window.location.href)
    url.searchParams.set('lang', next)
    window.history.replaceState(null, '', url)
  }

  function handleStart(modeId: ModeId) {
    setSelectedMode(modeId)
    gameEngine.start(modeId)
  }

  if (gameEngine.phase === 'playing') {
    return (
      <GameScreen
        currentPrompt={gameEngine.currentPrompt}
        charStatuses={gameEngine.charStatuses}
        composing={gameEngine.composing}
        composingState={gameEngine.composingState}
        statsSnapshot={gameEngine.statsSnapshot}
        timer={gameEngine.timer}
        score={gameEngine.score}
        combo={gameEngine.combo}
        isWrong={gameEngine.isWrong}
        nextKeyCode={gameEngine.nextKeyCode}
        nextKeyShift={gameEngine.nextKeyShift}
        selectedMode={selectedMode}
      />
    )
  }

  if (gameEngine.phase === 'finished') {
    return (
      <ResultScreen
        statsSnapshot={gameEngine.statsSnapshot}
        score={gameEngine.score}
        maxCombo={gameEngine.maxCombo}
        onRetry={() => gameEngine.start(selectedMode)}
        onBackToMenu={gameEngine.reset}
      />
    )
  }

  return (
    <StartScreen
      onStart={handleStart}
      language={language}
      onToggleLanguage={toggleLanguage}
    />
  )
}

export default App
