import { CaretLeft } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { AVAILABLE_YEARS } from "@/config/spokane/years"

export function Sidebar({ selectedYear, setSelectedYear, onClose }) {
  const currentIndex = AVAILABLE_YEARS.indexOf(selectedYear)

  const handleSliderChange = (value) => {
    setSelectedYear(AVAILABLE_YEARS[value[0]])
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="text-lg font-semibold">TIMELINE</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <CaretLeft size={20} weight="duotone" />
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-8">
        <div className="space-y-4">
          <Slider
            value={[currentIndex]}
            onValueChange={handleSliderChange}
            min={0}
            max={AVAILABLE_YEARS.length - 1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{AVAILABLE_YEARS[0]}</span>
            <span>{AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1]}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {AVAILABLE_YEARS.map((year) => (
            <Button
              key={year}
              onClick={() => setSelectedYear(year)}
              variant={year === selectedYear ? "default" : "outline"}
              size="sm"
              className="w-full"
            >
              {year}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
