import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TIME_PERIODS } from '@/config'

const NAVY = '#052346'
const CURRENT_YEAR = new Date().getFullYear()

// Years of each neighboring era shown at the ends of the tape.
const NEIGHBOR_PAD = 3

function eraEnd(period) {
  return Math.min(period.endYear, CURRENT_YEAR)
}

function tickHeight(year) {
  if (year % 10 === 0) return 18
  if (year % 5 === 0) return 13
  return 8
}

// Fixed-width slot so the tape never shifts when a neighbor is missing.
function StepButton({ period, direction, onClick }) {
  const isLeft = direction === 'left'
  if (!period) return <div className="w-36 flex-shrink-0" />
  return (
    <button
      onClick={onClick}
      aria-label={`${isLeft ? 'Previous' : 'Next'} era: ${period.name}`}
      className={`w-36 flex-shrink-0 flex items-center gap-1.5 text-white/70 hover:text-white transition-colors cursor-pointer ${
        isLeft ? 'justify-start text-left' : 'justify-end text-right'
      }`}
    >
      {isLeft && <ChevronLeft size={28} className="flex-shrink-0" />}
      <span className="min-w-0">
        <span className="block text-[10px] uppercase tracking-wider text-white/50">
          {isLeft ? 'Previous' : 'Next'}
        </span>
        <span className="block text-sm leading-tight">{period.name}</span>
      </span>
      {!isLeft && <ChevronRight size={28} className="flex-shrink-0" />}
    </button>
  )
}

// Tape-measure view zoomed to the selected era, with a few years of the
// neighboring eras shaded at either end.
export function Timeline({ selectedPeriodIndex, setPeriod }) {
  const position = TIME_PERIODS.findIndex(p => p.index === selectedPeriodIndex)
  const current = TIME_PERIODS[position]
  if (!current) return null
  const prev = position > 0 ? TIME_PERIODS[position - 1] : null
  const next = position < TIME_PERIODS.length - 1 ? TIME_PERIODS[position + 1] : null

  const start = current.startYear - (prev ? NEIGHBOR_PAD : 0)
  const end = eraEnd(current) + (next ? NEIGHBOR_PAD : 0)
  const span = end - start
  const years = Array.from({ length: span + 1 }, (_, i) => start + i)
  const labelEvery = span > 40 ? 5 : span > 20 ? 2 : 1
  const pct = year => ((year - start) / span) * 100

  const inEra = year => year >= current.startYear && year <= eraEnd(current)
  const eraLeft = pct(current.startYear)
  const eraRight = pct(eraEnd(current))

  return (
    <div className="flex-1 min-w-0 flex items-center gap-4 px-8">
      <StepButton period={prev} direction="left" onClick={() => setPeriod(prev.index)} />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-center gap-3 mb-2 text-white">
          <span
            className="text-3xl leading-none truncate"
            style={{ fontFamily: 'Cormorant SC, serif', fontWeight: 400 }}
          >
            {current.name}
          </span>
          <span className="text-sm text-white/70 tabular-nums whitespace-nowrap">
            {current.years}
          </span>
        </div>

        {/* Tape */}
        <div className="relative h-12 bg-white rounded-sm shadow-inner overflow-hidden">
          <div className="absolute inset-y-0 left-4 right-4">
            {prev && (
              <div
                className="absolute inset-y-0 bg-slate-200/70"
                style={{ left: '-1rem', width: `calc(${eraLeft}% + 1rem)` }}
              />
            )}
            {next && (
              <div
                className="absolute inset-y-0 bg-slate-200/70"
                style={{ left: `${eraRight}%`, right: '-1rem' }}
              />
            )}

            {years.map(year => {
              const active = inEra(year)
              const color = active ? NAVY : '#94a3b8'
              return (
                <div key={year} className="absolute top-0" style={{ left: `${pct(year)}%` }}>
                  <div style={{ width: 1, height: tickHeight(year), backgroundColor: color }} />
                  {year % labelEvery === 0 && (
                    <span
                      className="absolute top-5 -translate-x-1/2 text-[10px] tabular-nums"
                      style={{ color, fontWeight: year % 10 === 0 ? 700 : 400 }}
                    >
                      {year}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <StepButton period={next} direction="right" onClick={() => setPeriod(next.index)} />
    </div>
  )
}
