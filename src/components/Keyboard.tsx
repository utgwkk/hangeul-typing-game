import { useTranslation } from 'react-i18next'
import { DUBEOLSIK_MAP } from '../core/hangul/layout'

// Physical key rows in QWERTY order.
const ROW_1 = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP']
const ROW_2 = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL']
const ROW_3 = ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM']

const ROWS = [ROW_1, ROW_2, ROW_3]
// Tailwind left-padding to mimic QWERTY stagger.
const ROW_OFFSETS = ['pl-0', 'pl-4', 'pl-8']

interface KeyboardProps {
  /** Key code (e.g. "KeyA") to highlight as the next key to press. */
  highlightCode?: string | null
  /** Whether the highlighted key requires Shift. */
  highlightShift?: boolean
  /** Flash red to indicate a wrong keystroke. */
  isWrong?: boolean
  /** Show shifted (쌍자음 / ㅒㅖ) labels. */
  isShift?: boolean
}

interface KeyProps {
  code: string
  isHighlight: boolean
  isWrong: boolean
  isShift: boolean
}

function Key({ code, isHighlight, isWrong, isShift }: KeyProps) {
  const entry = DUBEOLSIK_MAP[code]
  if (!entry) return null
  const [normal, shifted] = entry
  const label = isShift && shifted ? shifted : normal
  const shiftLabel = shifted && !isShift ? shifted : null
  const alphaLabel = code.startsWith('Key') ? code.slice(3) : null

  let bg = 'bg-white border-gray-300 text-gray-800'
  if (isWrong) {
    bg = 'bg-red-200 border-red-400 text-red-800 animate-pulse'
  } else if (isHighlight) {
    bg = 'bg-blue-200 border-blue-500 text-blue-900'
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-10 h-10 rounded border-2 text-sm font-bold select-none ${bg} transition-colors duration-100`}
    >
      {shiftLabel && (
        <span className="absolute top-0.5 right-1 text-[9px] text-gray-400 font-normal">
          {shiftLabel}
        </span>
      )}
      {alphaLabel && (
        <span className="absolute bottom-0.5 left-1 text-[9px] text-gray-400 font-normal">
          {alphaLabel}
        </span>
      )}
      <span className="text-base leading-none">{label}</span>
    </div>
  )
}

export default function Keyboard({
  highlightCode = null,
  highlightShift = false,
  isWrong = false,
  isShift = false,
}: KeyboardProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-1 items-start">
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className={`flex gap-1 ${ROW_OFFSETS[rowIdx]}`}>
          {row.map(code => (
            <Key
              key={code}
              code={code}
              isHighlight={
                code === highlightCode &&
                (highlightShift ? isShift : !isShift || !DUBEOLSIK_MAP[code]?.[1])
              }
              isWrong={isWrong && code === highlightCode}
              isShift={isShift}
            />
          ))}
        </div>
      ))}
      <p className="text-xs text-gray-400 mt-1">{t('keyboard.shiftHint')}</p>
    </div>
  )
}
