import { ThemeToggle } from "./theme-toggle"
import { Clock } from "lucide-react"
import { getTimeZoneAbbr } from "@/utils/date-utils"

export function Header() {
  const currentTimeZone = getTimeZoneAbbr(new Date())

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Clock className="h-5 w-5" />
          <span>Attendance Tracker</span>
          <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium">{currentTimeZone}</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
