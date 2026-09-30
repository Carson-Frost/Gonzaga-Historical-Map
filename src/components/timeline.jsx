import { useState, useRef, useLayoutEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TIME_PERIODS } from '@/config'

const NAVY = '#052346'
const CURRENT_YEAR = new Date().getFullYear()

// The tape is zoomed to the selected era. The open-ended final period ends at
// today rather than its endYear.
function tapeRange(period) {
  const end = Math.max(period.startYear, Math.min(period.endYear, CURRENT_YEAR))
  return { start: period.startYear, end, isOpen: period.endYear >= CURRENT_YEAR }
}

// A year label is about this wide, plus breathing room, in px.
const LABEL_SPACE = 40

// Labels every five or ten years, whichever fits the tape's width. Labels too
// close to the bold end labels are dropped so they never collide.
function buildTicks({ start, end }, width) {
  const span = end - start
  const pxPerYear = span === 0 ? width : width / span
  const step = pxPerYear * 5 >= LABEL_SPACE && span <= 30 ? 5 : 10
  const minGap = Math.max(2, Math.ceil(LABEL_SPACE / pxPerYear))
  const ticks = []
  for (let year = start; year <= end; year++) {
    const isEnd = year === start || year === end
    const isStep = year % step === 0
    const labelled = isEnd || (isStep && year - start >= minGap && end - year >= minGap)
    ticks.push({
      year,
      percent: span === 0 ? 50 : ((year - start) / span) * 100,
      height: isEnd || labelled ? 14 : year % 5 === 0 ? 9 : 5,
      labelled,
      isEnd
    })
  }
  return ticks
}

function Tape({ period }) {
  const range = tapeRange(period)
  const tickAreaRef = useRef(null)
  const [width, setWidth] = useState(600)

  useLayoutEffect(() => {
    const el = tickAreaRef.current
    if (!el) return
    const observer = new ResizeObserver(() => setWidth(el.offsetWidth))
    observer.observe(el)
    setWidth(el.offsetWidth)
    return () => observer.disconnect()
  }, [])

  const ticks = buildTicks(range, width)

  return (
    <div
      className="relative h-[34px] rounded-md bg-white overflow-hidden"
      style={{ boxShadow: `inset 0 0 0 1px ${NAVY}33, inset 0 2px 3px ${NAVY}14` }}
    >
      <div ref={tickAreaRef} className="absolute inset-y-0 left-7 right-7">
        {ticks.map(tick => (
          <div key={tick.year} className="absolute top-0" style={{ left: `${tick.percent}%` }}>
            <div
              style={{
                width: tick.isEnd ? 2 : 1,
                height: tick.height,
                marginLeft: tick.isEnd ? -1 : -0.5,
                backgroundColor: NAVY,
                opacity: tick.labelled ? 1 : 0.55
              }}
            />
            {tick.labelled && (
              <span
                className={`absolute top-[15px] -translate-x-1/2 text-[11px] leading-none tabular-nums whitespace-nowrap ${
                  tick.isEnd ? 'font-bold' : ''
                }`}
                style={{ color: NAVY }}
              >
                {tick.year === range.end && range.isOpen ? 'Today' : tick.year}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Fixed-width slot at each end so the tape never moves. At the first and last
// era there is no button, just a quiet marker for the end of the timeline.
function StepSlot({ period, direction, setPeriod }) {
  const isPrev = direction === 'prev'
  const base = 'w-44 flex-shrink-0 hidden xl:flex'

  if (!period) {
    return (
      <div
        className={`${base} items-center px-5 text-[10px] uppercase tracking-wider text-muted-foreground/70 ${
          isPrev ? 'justify-start' : 'justify-end text-right'
        }`}
      >
        {isPrev ? 'Start of timeline' : 'Present day'}
      </div>
    )
  }

  return (
    <button
      onClick={() => setPeriod(period.index)}
      aria-label={`${isPrev ? 'Previous' : 'Next'} era: ${period.name}`}
      className={`${base} items-center gap-2 px-3 cursor-pointer group transition-colors hover:bg-white/60 ${
        isPrev ? 'rounded-l-[13px] text-left' : 'rounded-r-[13px] text-right flex-row-reverse'
      }`}
    >
      <span
        className="w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center text-white shadow-sm transition group-hover:brightness-150"
        style={{ backgroundColor: NAVY }}
      >
        {isPrev ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
          {isPrev ? 'Earlier' : 'Later'}
        </span>
        <span className="block text-sm leading-tight text-foreground line-clamp-2">{period.name}</span>
      </span>
    </button>
  )
}

// Icon-only steppers for narrow screens, where the named slots are hidden.
function CompactStep({ period, direction, setPeriod }) {
  const isPrev = direction === 'prev'
  if (!period) return <div className="w-9 flex-shrink-0 xl:hidden" aria-hidden="true" />
  return (
    <button
      onClick={() => setPeriod(period.index)}
      aria-label={`${isPrev ? 'Previous' : 'Next'} era: ${period.name}`}
      className="xl:hidden w-9 h-9 self-center flex-shrink-0 rounded-full flex items-center justify-center text-white"
      style={{ backgroundColor: NAVY }}
    >
      {isPrev ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
    </button>
  )
}

function EraDots({ selectedPeriodIndex, setPeriod }) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Jump to era">
      {TIME_PERIODS.map(p => {
        const isCurrent = p.index === selectedPeriodIndex
        return (
          <button
            key={p.index}
            onClick={() => setPeriod(p.index)}
            aria-label={`${p.name}, ${p.years}`}
            aria-current={isCurrent ? 'true' : undefined}
            title={`${p.name}, ${p.years}`}
            className="h-4 flex items-center cursor-pointer group"
          >
            <span
              className={`block h-1.5 rounded-full transition-all ${isCurrent ? 'w-5' : 'w-1.5 group-hover:opacity-70'}`}
              style={{ backgroundColor: NAVY, opacity: isCurrent ? 1 : 0.3 }}
            />
          </button>
        )
      })}
    </div>
  )
}

export function Timeline({ selectedPeriodIndex, setPeriod }) {
  const position = TIME_PERIODS.findIndex(p => p.index === selectedPeriodIndex)
  const current = TIME_PERIODS[position]
  const prev = position > 0 ? TIME_PERIODS[position - 1] : null
  const next = position < TIME_PERIODS.length - 1 ? TIME_PERIODS[position + 1] : null

  if (!current) return null

  return (
    <nav aria-label="Eras" className="glass flex items-stretch h-full">
      <StepSlot period={prev} direction="prev" setPeriod={setPeriod} />

      <div className="flex-1 min-w-0 flex items-center gap-2 px-2 xl:px-0">
        <CompactStep period={prev} direction="prev" setPeriod={setPeriod} />

        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 py-2 lg:py-2.5 xl:border-x xl:px-5 glass-divider h-full">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <h2
              className="text-[19px] sm:text-[22px] lg:text-[26px] leading-none truncate"
              style={{ fontFamily: 'Cormorant SC, serif', fontWeight: 500, color: NAVY }}
            >
              {current.name}
            </h2>
            <div className="hidden sm:block flex-shrink-0">
              <EraDots selectedPeriodIndex={selectedPeriodIndex} setPeriod={setPeriod} />
            </div>
          </div>
          <Tape key={current.index} period={current} />
        </div>

        <CompactStep period={next} direction="next" setPeriod={setPeriod} />
      </div>

      <StepSlot period={next} direction="next" setPeriod={setPeriod} />
    </nav>
  )
}
