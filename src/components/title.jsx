const NAVY = '#052346'

export function Title() {
  return (
    <div className="glass h-full flex flex-col items-center justify-center px-6">
      <h1
        className="text-[30px] leading-none whitespace-nowrap"
        style={{ fontFamily: 'Cormorant SC, serif', fontWeight: 500, color: NAVY }}
      >
        Gonzaga Through Time
      </h1>
      <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        A campus history map
      </p>
    </div>
  )
}
