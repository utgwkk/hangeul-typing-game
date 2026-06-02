import { useTranslation } from 'react-i18next'
import type { StatsSnapshot } from '../core/game/stats'
import type { TimerSnapshot } from '../core/game/score'

interface StatsBarProps {
  stats: StatsSnapshot
  timer: TimerSnapshot
  score: number
  combo: number
  /** True when the mode uses a countdown timer (timeLimit). */
  hasTimeLimit: boolean
}

interface StatItemProps {
  label: string
  value: string | number
  highlight?: boolean
}

function StatItem({ label, value, highlight }: StatItemProps) {
  return (
    <div className="flex flex-col items-center min-w-[60px]">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className={`text-lg font-bold ${highlight ? 'text-blue-600' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  )
}

function formatTime(ms: number): string {
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  if (m > 0) return `${m}:${String(s).padStart(2, '0')}`
  return `${s}s`
}

export default function StatsBar({
  stats,
  timer,
  score,
  combo,
  hasTimeLimit,
}: StatsBarProps) {
  const { t } = useTranslation()

  const timeLabel = hasTimeLimit ? t('stats.time') : t('stats.elapsed')
  const timeValue = hasTimeLimit
    ? formatTime(timer.remainingMs ?? 0)
    : formatTime(timer.elapsedMs)

  const isTimeWarning = hasTimeLimit && (timer.remainingMs ?? Infinity) <= 10_000

  return (
    <div className="flex flex-wrap justify-center gap-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
      <StatItem label={t('stats.cpm')} value={stats.cpm} />
      <StatItem label={t('stats.wpm')} value={stats.wpm} />
      <StatItem label={t('stats.accuracy')} value={`${stats.accuracy}%`} />
      <StatItem label={t('stats.score')} value={score} highlight />
      <StatItem label={t('stats.combo')} value={`×${combo}`} highlight={combo >= 5} />
      <div className="flex flex-col items-center min-w-[60px]">
        <span className="text-xs text-gray-500 uppercase tracking-wide">{timeLabel}</span>
        <span
          className={`text-lg font-bold ${isTimeWarning ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}
        >
          {timeValue}
        </span>
      </div>
    </div>
  )
}
