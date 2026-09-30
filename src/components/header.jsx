import { Timeline } from '@/components/timeline'

const HEADER_BG = 'oklch(var(--sidebar-background))'

// Full-width navy band: title above the sidebar column, era timeline above
// the map. The timeline's tape forms the bottom edge over the map.
export function Header({ selectedPeriodIndex, setPeriod }) {
  return (
    <header
      className="flex-shrink-0 flex relative z-[1000] shadow-[0_2px_8px_rgba(5,35,70,0.35)]"
      style={{ backgroundColor: HEADER_BG }}
    >
      <div className="w-[500px] flex-shrink-0 flex items-center justify-center px-8 py-4 border-r border-white/10">
        <h1
          className="text-5xl text-center text-white"
          style={{ fontFamily: 'Cormorant SC, serif', fontWeight: 400, lineHeight: 0.9 }}
        >
          Gonzaga<br />Through Time
        </h1>
      </div>

      <Timeline selectedPeriodIndex={selectedPeriodIndex} setPeriod={setPeriod} />
    </header>
  )
}
