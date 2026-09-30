import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TIME_PERIODS } from '@/config'

const NAVY = '#052346'

// The tape runs from the first period's start to the current year, so the
// open-ended final period ("present") ends at today rather than its endYear.
const TAPE_START = TIME_PERIODS[0].startYear
const TAPE_END = Math.max(new Date().getFullYear(), TIME_PERIODS[TIME_PERIODS.length - 1].startYear)
const TAPE_SPAN = TAPE_END - TAPE_START + 1

const TICK_YEARS = Array.from({ length: TAPE_SPAN }, (_, i) => TAPE_START + i)

function yearToPercent(year) {
  return ((year - TAPE_START) / TAPE_SPAN) * 100
}

function periodSpan(period) {
  const end = Math.min(period.endYear, TAPE_END)
  const left = yearToPercent(period.startYear)
  const width = yearToPercent(end + 1) - left
  return { left, width }
}

function tickHeight(year) {
  if (year % 10 === 0) return 14
  if (year % 5 === 0) return 9
  return 5
}

function StepButton({ onClick, label, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md hover:brightness-125 transition cursor-pointer"
      style={{ backgroundColor: NAVY }}
    >
      {children}
    </button>
  )
}

export function Timeline({ selectedPeriodIndex, setPeriod }) {
  const position = TIME_PERIODS.findIndex(p => p.index === selectedPeriodIndex)
  const current = TIME_PERIODS[position]
  const prev = position > 0 ? TIME_PERIODS[position - 1] : null
  const next = position < TIME_PERIODS.length - 1 ? TIME_PERIODS[position + 1] : null

  const currentSpan = current ? periodSpan(current) : null
  const currentCenter = currentSpan ? currentSpan.left + currentSpan.width / 2 : 50

  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] flex items-start gap-3 pointer-events-none">
      <div className="pt-3 pointer-events-auto">
        {prev ? (
          <StepButton onClick={() => setPeriod(prev.index)} label={`Previous period: ${prev.name}`}>
            <ChevronLeft size={22} />
          </StepButton>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Tape */}
        <div
          className="relative h-16 bg-white rounded-md border shadow-md overflow-hidden pointer-events-auto"
          style={{ borderColor: NAVY }}
        >
          {TIME_PERIODS.map(period => {
            const { left, width } = periodSpan(period)
            const isCurrent = period.index === selectedPeriodIndex
            return (
              <button
                key={period.index}
                onClick={() => setPeriod(period.index)}
                aria-label={`${period.name}, ${period.years}`}
                aria-current={isCurrent ? 'true' : undefined}
                className={`absolute top-0 bottom-0 flex items-end justify-center pb-1.5 px-1 cursor-pointer transition-colors ${
                  isCurrent ? '' : 'hover:bg-slate-100'
                }`}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  backgroundColor: isCurrent ? 'rgba(5, 35, 70, 0.12)' : undefined,
                  borderLeft: `1px solid ${NAVY}`
                }}
              >
                <span
                  className={`text-[11px] uppercase tracking-wider truncate ${
                    isCurrent ? 'font-bold' : 'text-slate-500'
                  }`}
                  style={isCurrent ? { color: NAVY } : undefined}
                >
                  {period.name}
                </span>
              </button>
            )
          })}

          {/* Ticks and decade labels */}
          <div className="absolute inset-0 pointer-events-none">
            {TICK_YEARS.map(year => (
              <div
                key={year}
                className="absolute top-0"
                style={{ left: `${yearToPercent(year)}%` }}
              >
                <div style={{ width: 1, height: tickHeight(year), backgroundColor: NAVY }} />
                {year % 10 === 0 && (
                  <span
                    className="absolute top-3.5 -translate-x-1/2 text-[10px] tabular-nums"
                    style={{ color: NAVY }}
                  >
                    {year}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Current-period bracket along the top edge */}
          {currentSpan && (
            <div
              className="absolute top-0 h-1 pointer-events-none transition-all duration-300"
              style={{
                left: `${currentSpan.left}%`,
                width: `${currentSpan.width}%`,
                backgroundColor: NAVY
              }}
            />
          )}
        </div>

        {/* Current-period tag, pointing up at its segment */}
        {current && (
          <div className="relative h-16 pointer-events-none">
            <div
              className="absolute top-2 -translate-x-1/2 transition-all duration-300"
              style={{ left: `clamp(9rem, ${currentCenter}%, calc(100% - 9rem))` }}
            >
              <div
                className="rounded-md shadow-md px-4 py-1.5 text-center text-white whitespace-nowrap"
                style={{ backgroundColor: NAVY }}
              >
                <p
                  className="text-2xl leading-7"
                  style={{ fontFamily: 'Cormorant SC, serif', fontWeight: 400 }}
                >
                  {current.name}
                </p>
                <p className="text-xs text-white/70 tabular-nums">{current.years}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 pointer-events-auto">
        {next ? (
          <StepButton onClick={() => setPeriod(next.index)} label={`Next period: ${next.name}`}>
            <ChevronRight size={22} />
          </StepButton>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>
    </div>
  )
}
