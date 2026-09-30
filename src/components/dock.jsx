import { Minus, Plus, LocateFixed, PanelLeft } from 'lucide-react'

const NAVY = '#052346'

function DockButton({ label, active = false, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active || undefined}
      title={label}
      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
        active ? 'text-white' : 'hover:bg-white/80'
      }`}
      style={active ? { backgroundColor: NAVY } : { color: NAVY }}
    >
      {children}
    </button>
  )
}

export function Dock({ onZoomIn, onZoomOut, onRecenter, panelOpen, onTogglePanel }) {
  return (
    <div className="glass flex items-center gap-1 p-1.5">
      <DockButton label={panelOpen ? 'Hide places' : 'Show places'} active={panelOpen} onClick={onTogglePanel}>
        <PanelLeft size={19} />
      </DockButton>
      <div className="w-px h-6 mx-1 bg-current opacity-15" style={{ color: NAVY }} />
      <DockButton label="Zoom out" onClick={onZoomOut}>
        <Minus size={19} />
      </DockButton>
      <DockButton label="Zoom in" onClick={onZoomIn}>
        <Plus size={19} />
      </DockButton>
      <DockButton label="Recenter on campus" onClick={onRecenter}>
        <LocateFixed size={19} />
      </DockButton>
    </div>
  )
}
