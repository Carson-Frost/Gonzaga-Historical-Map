import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"
import { AVAILABLE_YEARS } from "@/config/spokane/years"

export function Timeline({ selectedYear, setSelectedYear, isExpanded = true, onToggle }) {
  const currentIndex = AVAILABLE_YEARS.indexOf(selectedYear)

  const handleSliderChange = (value) => {
    setSelectedYear(AVAILABLE_YEARS[value[0]])
  }

  const handleSelectChange = (value) => {
    setSelectedYear(parseInt(value))
  }

  // Compact mode: just the dropdown
  if (!isExpanded) {
    return (
      <Select value={selectedYear.toString()} onValueChange={handleSelectChange}>
        <SelectTrigger className="w-32 text-lg font-bold border-2 border-border bg-background/95 backdrop-blur-md shadow-lg">
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent>
          {[...AVAILABLE_YEARS].reverse().map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Expanded mode: dropdown + slider in panel
  return (
    <div className="bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg p-3 w-72 relative">
      {/* Close Button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute top-1 right-1 w-8 h-8 flex items-center justify-center rounded hover:bg-muted/50 transition-colors"
          aria-label="Collapse timeline"
        >
          <X size={18} className="text-foreground transition-opacity hover:opacity-70" strokeWidth={2.5} />
        </button>
      )}

      {/* Year Dropdown */}
      <div className="flex justify-center mb-[-0.25rem]">
        <Select value={selectedYear.toString()} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-28 text-base font-bold border-2 border-border">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {[...AVAILABLE_YEARS].reverse().map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Slider */}
      <div className="mt-[-0.25rem]">
        <div className="flex justify-between text-xs text-muted-foreground font-semibold mb-0.5">
          <span>{AVAILABLE_YEARS[0]}</span>
          <span>{AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1]}</span>
        </div>
        <Slider
          value={[currentIndex]}
          onValueChange={handleSliderChange}
          min={0}
          max={AVAILABLE_YEARS.length - 1}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  )
}
