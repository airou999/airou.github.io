"use client"

import type React from "react"
import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatToUKDisplayDate, parseISODate } from "@/utils/date-utils"
import { motion } from "framer-motion"
import { getCodeDescription } from "@/utils/attendance-code-utils"

interface LegendItem {
  label: string
  color: string
}

interface Legend {
  [key: string]: LegendItem
}

interface WeekData {
  weekStart: string
  weekMarks: string[]
}

interface AttendanceCalendarProps {
  parsedAttendance: WeekData[]
  legend: Legend
  startDate: string
  endDate: string
}

// Remove the Card wrapper from the component since we're now wrapping it in a Card in the parent component
const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ parsedAttendance, legend, startDate, endDate }) => {
  // Generate calendar data from parsed attendance
  const calendarData = useMemo(() => {
    if (!parsedAttendance.length) return []

    // Find the first and last dates with attendance data
    let firstDate: Date | null = null
    let lastDate: Date | null = null

    parsedAttendance.forEach((week) => {
      for (let i = 0; i < week.weekMarks.length; i += 2) {
        const morningMark = week.weekMarks[i]
        const afternoonMark = week.weekMarks[i + 1]

        if (morningMark || afternoonMark) {
          const dayIndex = Math.floor(i / 2)
          const weekStartDate = parseISODate(week.weekStart)
          const currentDate = new Date(weekStartDate)
          currentDate.setDate(currentDate.getDate() + dayIndex)

          if (!firstDate || currentDate < firstDate) {
            firstDate = new Date(currentDate)
          }

          if (!lastDate || currentDate > lastDate) {
            lastDate = new Date(currentDate)
          }
        }
      }
    })

    // If no attendance data found, use the provided start/end dates
    if (!firstDate || !lastDate) {
      firstDate = parseISODate(startDate)
      lastDate = parseISODate(endDate)
    }

    // Create an array of all dates in the range
    const dates: {
      date: Date
      isoDate: string
      display: string
      dayOfWeek: number
      morningMark: string
      afternoonMark: string
    }[] = []

    const currentDate = new Date(firstDate)
    while (currentDate <= lastDate) {
      dates.push({
        date: new Date(currentDate),
        isoDate: currentDate.toISOString().split("T")[0],
        display: formatToUKDisplayDate(currentDate),
        dayOfWeek: currentDate.getDay(),
        morningMark: "",
        afternoonMark: "",
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Fill in attendance data
    parsedAttendance.forEach((week) => {
      const weekStart = parseISODate(week.weekStart)
      const mondayOffset = (weekStart.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(weekStart)
        dayDate.setDate(dayDate.getDate() + i)
        const dayIsoDate = dayDate.toISOString().split("T")[0]

        const dateIndex = dates.findIndex((d) => d.isoDate === dayIsoDate)
        if (dateIndex >= 0) {
          const morningIndex = i * 2
          const afternoonIndex = i * 2 + 1

          if (morningIndex < week.weekMarks.length) {
            dates[dateIndex].morningMark = week.weekMarks[morningIndex]
          }

          if (afternoonIndex < week.weekMarks.length) {
            dates[dateIndex].afternoonMark = week.weekMarks[afternoonIndex]
          }
        }
      }
    })

    return dates
  }, [parsedAttendance, startDate, endDate])

  // Group dates by month for better visualization
  const calendarByMonth = useMemo(() => {
    const months: {
      monthName: string
      dates: typeof calendarData
    }[] = []

    calendarData.forEach((date) => {
      const monthYear = date.date.toLocaleString("en-GB", { month: "long", year: "numeric" })
      let month = months.find((m) => m.monthName === monthYear)

      if (!month) {
        month = { monthName: monthYear, dates: [] }
        months.push(month)
      }

      month.dates.push(date)
    })

    return months
  }, [calendarData])

  // Get day name abbreviations
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  // Helper to get status color
  const getStatusColor = (mark: string) => {
    return legend[mark]?.color || ""
  }

  // Helper to get status label
  const getStatusLabel = (mark: string) => {
    return legend[mark]?.label || mark
  }

  // Helper to determine day status
  const getDayStatus = (morningMark: string, afternoonMark: string) => {
    if (!morningMark && !afternoonMark) return "No Data"
    if (morningMark === "#" && afternoonMark === "#") return "School Closed"
    if (morningMark === "/" && afternoonMark === "\\") return "Full Day Present"
    if (morningMark === "/" && afternoonMark !== "\\") return "Morning Only"
    if (morningMark !== "/" && afternoonMark === "\\") return "Afternoon Only"
    return "Mixed Status"
  }

  // Get full description for a code
  const getFullDescription = (mark: string) => {
    const standardDescription = getCodeDescription(mark)
    const customDescription = legend[mark]?.label

    if (standardDescription && customDescription && standardDescription !== customDescription) {
      return `${customDescription} (${standardDescription})`
    }

    return standardDescription || customDescription || mark
  }

  return (
    <div className="space-y-8">
      {calendarByMonth.map((month, monthIndex) => (
        <motion.div
          key={month.monthName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: monthIndex * 0.1 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-semibold">{month.monthName}</h3>

          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {dayNames.map((day) => (
              <div key={day} className="text-center font-medium text-sm py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for proper alignment */}
            {month.dates[0] &&
              Array.from({ length: (month.dates[0].date.getDay() + 6) % 7 }).map((_, i) => (
                <div key={`empty-start-${i}`} className="aspect-square"></div>
              ))}

            {/* Calendar days */}
            {month.dates.map((date, i) => {
              const dayStatus = getDayStatus(date.morningMark, date.afternoonMark)
              const isWeekend = date.dayOfWeek === 0 || date.dayOfWeek === 6

              return (
                <TooltipProvider key={date.isoDate}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`
                          aspect-square border rounded-md flex flex-col items-center justify-center p-1
                          ${isWeekend ? "bg-muted/50" : ""}
                          hover:bg-muted/80 transition-colors
                        `}
                      >
                        <div className="text-sm font-medium">{date.date.getDate()}</div>

                        {/* Morning/Afternoon indicators */}
                        {(date.morningMark || date.afternoonMark) && (
                          <div className="flex gap-1 mt-1">
                            {date.morningMark && (
                              <div
                                className={`w-3 h-3 rounded-full ${getStatusColor(date.morningMark)}`}
                                aria-label={`Morning: ${getStatusLabel(date.morningMark)}`}
                              ></div>
                            )}
                            {date.afternoonMark && (
                              <div
                                className={`w-3 h-3 rounded-full ${getStatusColor(date.afternoonMark)}`}
                                aria-label={`Afternoon: ${getStatusLabel(date.afternoonMark)}`}
                              ></div>
                            )}
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-2">
                        <p className="font-medium">{date.display}</p>
                        <div className="space-y-1">
                          {date.morningMark && (
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(date.morningMark)}`}></div>
                              <span>
                                <span className="font-mono font-bold">{date.morningMark}</span> - Morning:{" "}
                                {getFullDescription(date.morningMark)}
                              </span>
                            </div>
                          )}
                          {date.afternoonMark && (
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(date.afternoonMark)}`}></div>
                              <span>
                                <span className="font-mono font-bold">{date.afternoonMark}</span> - Afternoon:{" "}
                                {getFullDescription(date.afternoonMark)}
                              </span>
                            </div>
                          )}
                          {!date.morningMark && !date.afternoonMark && (
                            <p className="text-muted-foreground">No attendance data</p>
                          )}
                        </div>
                        <Badge variant="outline">{dayStatus}</Badge>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}

            {/* Empty cells at the end for proper alignment */}
            {month.dates.length > 0 &&
              Array.from({ length: (7 - ((month.dates[month.dates.length - 1].dayOfWeek + 1) % 7)) % 7 }).map(
                (_, i) => <div key={`empty-end-${i}`} className="aspect-square"></div>,
              )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default AttendanceCalendar
