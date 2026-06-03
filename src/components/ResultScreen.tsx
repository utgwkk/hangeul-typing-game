import { useTranslation } from 'react-i18next'
import type { StatsSnapshot } from '../core/game/stats'

interface ResultScreenProps {
  statsSnapshot: StatsSnapshot
  score: number
  maxCombo: number
  onRetry: () => void
  onBackToMenu: () => void
}

interface ResultRowProps {
  label: string
  value: string | number
  highlight?: boolean
}

function ResultRow({ label, value, highlight }: ResultRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-xl font-bold ${highlight ? 'text-blue-600' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  )
}

export default function ResultScreen({
  statsSnapshot,
  score,
  maxCombo,
  onRetry,
  onBackToMenu,
}: ResultScreenProps) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 gap-6 p-4">
      <h1 className="text-3xl font-bold text-gray-800">{t('result.title')}</h1>

      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-1 min-w-[280px]">
        <ResultRow label={t('result.cpm')} value={statsSnapshot.cpm} />
        <ResultRow label={t('result.wpm')} value={statsSnapshot.wpm} />
        <ResultRow label={t('result.accuracy')} value={`${statsSnapshot.accuracy}%`} />
        <ResultRow label={t('result.score')} value={score} highlight />
        <ResultRow label={t('result.maxCombo')} value={`×${maxCombo}`} />
      </div>

      <div className="flex gap-4">
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-colors"
        >
          {t('result.retry')}
        </button>
        <button
          onClick={onBackToMenu}
          className="px-6 py-3 rounded-lg bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors"
        >
          {t('result.backToMenu')}
        </button>
      </div>
    </div>
  )
}
