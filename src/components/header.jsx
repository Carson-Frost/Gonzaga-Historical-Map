import { Timeline } from '@/components/timeline'

const NAVY = '#052346'
const HEADER_BG = 'oklch(var(--sidebar-background) / 0.95)'

// Full-width navy band: title above the sidebar column, era timeline above
// the map. The wave edge overlaps the top of both.
export function Header({ selectedPeriodIndex, setPeriod }) {
  return (
    <header
      className="flex-shrink-0 flex backdrop-blur-md z-10 relative"
      style={{ backgroundColor: HEADER_BG }}
    >
      <div className="w-[500px] flex-shrink-0 px-8 pt-6 pb-5">
        <h1
          className="text-5xl text-center text-white"
          style={{ fontFamily: 'Cormorant SC, serif', fontWeight: 400, lineHeight: 0.9 }}
        >
          Gonzaga<br />Through Time
        </h1>
      </div>

      <Timeline selectedPeriodIndex={selectedPeriodIndex} setPeriod={setPeriod} />

      <svg
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        viewBox="0 0 500 20"
        preserveAspectRatio="none"
        style={{ height: '20px', transform: 'translateY(100%)' }}
      >
        <path d="M0,10 Q125,0 250,10 T500,10 L500,0 L0,0 Z" fill={NAVY} />
      </svg>
    </header>
  )
}
