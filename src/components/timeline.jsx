import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TIME_PERIODS } from '@/config'

const NAVY = '#052346'
const MUTED = '#8a97aa'
const CURRENT_YEAR = new Date().getFullYear()

// Share of the tape given to each neighboring era. Fixed so the selected era
// always sits between the same two points and nothing jumps between eras.
const CONTEXT = 0.1

// Label every Nth year: the smallest step that leaves room between labels.
const LABEL_STEPS = [1, 2, 5, 10, 20]
const MIN_LABEL_GAP = 52

// Minor ticks per year (months, quarters, halves) when there is room.
const SUBDIVISIONS = [12, 4, 2, 1]
const MIN_TICK_GAP = 7

// Keep year labels from being clipped at either end of the tape.
const EDGE_CLEARANCE = 20

const TAPE_HEIGHT = 44
const LABEL_Y = 36

function eraEnd(period) {
  return Math.min(period.endYear, CURRENT_YEAR)
}

function useWidth(ref) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
  return width
}

// Prev/next control. Always occupies its slot so the era title never shifts.
function EraStep({ period, direction, onClick }) {
  const isLeft = direction === 'left'
  // Narrow screens show the neighbor's years; wide screens its name.
  const slot = 'w-36 min-[1440px]:w-60 flex-shrink-0'
  if (!period) return <div className={slot} />
  return (
    <button
      onClick={onClick}
      aria-label={`${isLeft ? 'Previous' : 'Next'} era: ${period.name}`}
      className={`${slot} group flex items-center gap-3 cursor-pointer text-white/70 hover:text-white transition-colors ${
        isLeft ? 'flex-row text-left' : 'flex-row-reverse text-right'
      }`}
    >
      <span className="flex-shrink-0 w-8 h-8 rounded-full border border-white/30 group-hover:border-white group-hover:bg-white group-hover:text-[#052346] flex items-center justify-center transition-colors">
        {isLeft ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] uppercase tracking-[0.18em] text-white/45">
          {isLeft ? 'Earlier' : 'Later'}
        </span>
        <span className="hidden min-[1440px]:block text-[13px] leading-snug truncate">
          {period.name}
        </span>
        <span className="block min-[1440px]:hidden text-[13px] leading-snug tabular-nums whitespace-nowrap">
          {period.years}
        </span>
      </span>
    </button>
  )
}

// White tape measure spanning the timeline column, zoomed to the selected
// era. Neighboring eras show as shaded ends; where there is no neighbor the
// tape simply ends (founding on the left, today on the right).
function Tape({ current, prev, next, setPeriod }) {
  const ref = useRef(null)
  const width = useWidth(ref)

  const start = current.startYear
  const end = eraEnd(current)
  const left = width * CONTEXT
  const right = width * (1 - CONTEXT)
  const perYear = (right - left) / (end - start)
  const x = year => left + (year - start) * perYear

  const firstYear = prev ? Math.ceil(start - left / perYear) : start
  const lastYear = next ? Math.floor(end + (width - right) / perYear) : end
  const labelStep = LABEL_STEPS.find(s => s * perYear >= MIN_LABEL_GAP) ?? 50
  const subdivisions = SUBDIVISIONS.find(n => perYear / n >= MIN_TICK_GAP) ?? 1

  const ticks = []
  const labels = []
  if (width > 0) {
    for (let year = firstYear; year <= lastYear; year++) {
      const inEra = year >= start && year <= end
      const color = inEra ? NAVY : MUTED
      const isBound = year === start || year === end
      const labeled = year % labelStep === 0
      const midStep = labelStep >= 10 && year % (labelStep / 2) === 0

      const height = isBound ? 22 : labeled ? 15 : midStep ? 11 : 8
      ticks.push({ key: year, x: x(year), height, color, weight: isBound ? 2 : 1 })

      for (let k = 1; k < subdivisions; k++) {
        const sub = year + k / subdivisions
        if (sub > lastYear) break
        const quarter = subdivisions === 12 && k % 3 === 0
        ticks.push({
          key: `${year}-${k}`,
          x: x(sub),
          height: quarter ? 6 : 4,
          color: sub >= start && sub <= end ? NAVY : MUTED,
          weight: 1
        })
      }

      const crowded =
        Math.abs(x(year) - x(start)) < MIN_LABEL_GAP ||
        Math.abs(x(year) - x(end)) < MIN_LABEL_GAP ||
        x(year) < EDGE_CLEARANCE ||
        x(year) > width - EDGE_CLEARANCE
      if (isBound || (labeled && !crowded)) {
        labels.push({ key: year, x: x(year), year, color, bold: isBound })
      }
    }
  }

  // Shaded ends. A neighboring era's end is a shortcut to that era; past the
  // founding or today the end is blank tape.
  const zone = period =>
    `absolute inset-y-0 bg-[#e9edf2] ${
      period ? 'cursor-pointer transition-colors hover:bg-[#dde3eb]' : ''
    }`

  return (
    <div ref={ref} className="relative bg-white" style={{ height: TAPE_HEIGHT }}>
      <div
        aria-hidden="true"
        title={prev ? `${prev.name}, ${prev.years}` : undefined}
        onClick={prev ? () => setPeriod(prev.index) : undefined}
        className={zone(prev)}
        style={{ left: 0, width: left }}
      />
      <div
        aria-hidden="true"
        title={next ? `${next.name}, ${next.years}` : undefined}
        onClick={next ? () => setPeriod(next.index) : undefined}
        className={zone(next)}
        style={{ left: right, right: 0 }}
      />

      {width > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none"
          width={width}
          height={TAPE_HEIGHT}
          aria-hidden="true"
        >
          {ticks.map(t => {
            const px = Math.round(t.x) + (t.weight === 1 ? 0.5 : 0)
            return (
              <line
                key={t.key}
                x1={px}
                x2={px}
                y1={0}
                y2={t.height}
                stroke={t.color}
                strokeWidth={t.weight}
              />
            )
          })}
          {[
            !prev && { key: 'founded', x: 10, anchor: 'start', text: 'Founded' },
            !next && { key: 'today', x: width - 10, anchor: 'end', text: 'Today' }
          ].filter(Boolean).map(end => (
            <text
              key={end.key}
              x={end.x}
              y={LABEL_Y}
              textAnchor={end.anchor}
              fill={MUTED}
              fontFamily="Georgia, serif"
              fontSize={11}
              fontStyle="italic"
            >
              {end.text}
            </text>
          ))}
          {labels.map(l => (
            <text
              key={l.key}
              x={l.x}
              y={LABEL_Y}
              textAnchor="middle"
              fill={l.color}
              fontFamily="Georgia, serif"
              fontSize={12}
              fontWeight={l.bold ? 700 : 400}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {l.year}
            </text>
          ))}
        </svg>
      )}
    </div>
  )
}

// Era timeline: title row with prev/next controls, tape measure below.
export function Timeline({ selectedPeriodIndex, setPeriod }) {
  const position = TIME_PERIODS.findIndex(p => p.index === selectedPeriodIndex)
  const current = TIME_PERIODS[position]
  if (!current) return null
  const prev = position > 0 ? TIME_PERIODS[position - 1] : null
  const next = position < TIME_PERIODS.length - 1 ? TIME_PERIODS[position + 1] : null

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="flex-1 flex items-center gap-6 px-6 text-white">
        <EraStep period={prev} direction="left" onClick={() => setPeriod(prev.index)} />

        <div className="flex-1 min-w-0 text-center">
          <div
            className="text-[30px] leading-none truncate"
            style={{ fontFamily: 'Cormorant SC, serif', fontWeight: 400 }}
          >
            {current.name}
          </div>
          <div className="mt-1.5 text-[11px] uppercase tracking-[0.2em] text-white/55 tabular-nums">
            {current.years}
          </div>
        </div>

        <EraStep period={next} direction="right" onClick={() => setPeriod(next.index)} />
      </div>

      <Tape current={current} prev={prev} next={next} setPeriod={setPeriod} />
    </div>
  )
}
