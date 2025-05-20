"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatToUKDisplayDate, parseISODate } from "@/utils/date-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Info, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getCodeDescription } from "@/utils/attendance-code-utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface LegendItem {
  label: string
  color: string
}

interface LegendType {
  [key: string]: LegendItem
}

interface WeekData {
  weekStart: string
  weekMarks: string[]
}

interface AttendanceChartProps {
  parsedAttendance: WeekData[]
  legend: LegendType
}

// Define chart colors with better contrast and visual appeal
const CHART_COLORS = {
  "Full Day Present": "rgba(34, 197, 94, 0.8)", // green-500 with transparency
  "Morning Only": "rgba(234, 179, 8, 0.8)", // yellow-500 with transparency
  "Afternoon Only": "rgba(59, 130, 246, 0.8)", // blue-500 with transparency
  "School Closed": "rgba(148, 163, 184, 0.8)", // slate-400 with transparency
  Other: "rgba(239, 68, 68, 0.8)", // red-500 with transparency
}

// Define chart colors for dark mode
const DARK_CHART_COLORS = {
  "Full Day Present": "rgba(74, 222, 128, 0.8)", // green-400 with transparency
  "Morning Only": "rgba(250, 204, 21, 0.8)", // yellow-400 with transparency
  "Afternoon Only": "rgba(96, 165, 250, 0.8)", // blue-400 with transparency
  "School Closed": "rgba(148, 163, 184, 0.8)", // slate-400 with transparency
  Other: "rgba(248, 113, 113, 0.8)", // red-400 with transparency
}

const AttendanceChart = ({ parsedAttendance, legend }: AttendanceChartProps) => {
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState("summary")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Check for dark mode and screen size
  useEffect(() => {
    setIsClient(true)
    const isDark = document.documentElement.classList.contains("dark")
    setIsDarkMode(isDark)

    // Check if mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark")
      setIsDarkMode(isDark)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Get the appropriate color scheme based on dark/light mode
  const chartColors = isDarkMode ? DARK_CHART_COLORS : CHART_COLORS

  // Process attendance data
  const attendanceSummary = useMemo(() => {
    const summary = {
      "Full Day Present": 0,
      "Morning Only": 0,
      "Afternoon Only": 0,
      "School Closed": 0,
      Other: 0,
    }

    let totalDays = 0
    let totalSessions = 0
    let totalPresentSessions = 0

    // Process each week
    parsedAttendance.forEach((week) => {
      // Process each day (2 sessions per day)
      for (let i = 0; i < week.weekMarks.length; i += 2) {
        const morningMark = week.weekMarks[i]
        const afternoonMark = week.weekMarks[i + 1]

        if (!morningMark && !afternoonMark) continue

        totalDays++
        totalSessions += (morningMark ? 1 : 0) + (afternoonMark ? 1 : 0)

        // Count present sessions
        if (morningMark === "/" || morningMark === "L") totalPresentSessions++
        if (afternoonMark === "\\" || afternoonMark === "L") totalPresentSessions++

        // School closed
        if (morningMark === "#" && afternoonMark === "#") {
          summary["School Closed"]++
        }
        // Full day present
        else if ((morningMark === "/" || morningMark === "L") && (afternoonMark === "\\" || afternoonMark === "L")) {
          summary["Full Day Present"]++
        }
        // Morning only
        else if ((morningMark === "/" || morningMark === "L") && !(afternoonMark === "\\" || afternoonMark === "L")) {
          summary["Morning Only"]++
        }
        // Afternoon only
        else if (!(morningMark === "/" || morningMark === "L") && (afternoonMark === "\\" || afternoonMark === "L")) {
          summary["Afternoon Only"]++
        }
        // Other patterns
        else {
          summary["Other"]++
        }
      }
    })

    // Calculate overall attendance rate
    const attendanceRate = totalSessions > 0 ? ((totalPresentSessions / totalSessions) * 100).toFixed(1) : "N/A"

    return {
      summary,
      totalDays,
      totalSessions,
      totalPresentSessions,
      attendanceRate,
    }
  }, [parsedAttendance])

  // Prepare weekly data
  const weeklyData = useMemo(() => {
    return parsedAttendance.map((week) => {
      const weekStart = formatToUKDisplayDate(parseISODate(week.weekStart))
      let fullDays = 0
      let morningOnly = 0
      let afternoonOnly = 0
      let schoolClosed = 0
      let other = 0
      let presentSessions = 0
      let totalWeekSessions = 0

      // Process each day (2 sessions per day)
      for (let i = 0; i < week.weekMarks.length; i += 2) {
        const morningMark = week.weekMarks[i]
        const afternoonMark = week.weekMarks[i + 1]

        if (!morningMark && !afternoonMark) continue

        totalWeekSessions += (morningMark ? 1 : 0) + (afternoonMark ? 1 : 0)

        // Count present sessions
        if (morningMark === "/" || morningMark === "L") presentSessions++
        if (afternoonMark === "\\" || afternoonMark === "L") presentSessions++

        // School closed
        if (morningMark === "#" && afternoonMark === "#") {
          schoolClosed++
        }
        // Full day present
        else if ((morningMark === "/" || morningMark === "L") && (afternoonMark === "\\" || afternoonMark === "L")) {
          fullDays++
        }
        // Morning only
        else if ((morningMark === "/" || morningMark === "L") && !(afternoonMark === "\\" || afternoonMark === "L")) {
          morningOnly++
        }
        // Afternoon only
        else if (!(morningMark === "/" || morningMark === "L") && (afternoonMark === "\\" || afternoonMark === "L")) {
          afternoonOnly++
        }
        // Other patterns
        else {
          other++
        }
      }

      // Calculate attendance rate for the week
      const weekAttendanceRate = totalWeekSessions > 0 ? (presentSessions / totalWeekSessions) * 100 : 0

      return {
        name: weekStart,
        fullDays,
        morningOnly,
        afternoonOnly,
        schoolClosed,
        other,
        attendanceRate: Number.parseFloat(weekAttendanceRate.toFixed(1)),
      }
    })
  }, [parsedAttendance])

  // Calculate the maximum value for any category to set the scale
  const maxCategoryValue = useMemo(() => {
    return Math.max(
      ...Object.values(attendanceSummary.summary),
      ...weeklyData.map((week) =>
        Math.max(week.fullDays, week.morningOnly, week.afternoonOnly, week.schoolClosed, week.other),
      ),
    )
  }, [attendanceSummary.summary, weeklyData])

  // Calculate the total for pie chart percentages
  const totalForPie = useMemo(() => {
    return Object.values(attendanceSummary.summary).reduce((sum, val) => sum + val, 0)
  }, [attendanceSummary.summary])

  // Check if we have data to display
  if (!parsedAttendance || parsedAttendance.length === 0) {
    return (
      <Card className="w-full mb-8">
        <CardHeader>
          <CardTitle>Attendance Analytics</CardTitle>
          <CardDescription>Visual breakdown of attendance patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No attendance data available for analysis.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // If we're not on the client yet, show a loading message
  if (!isClient) {
    return (
      <Card className="w-full mb-8">
        <CardHeader>
          <CardTitle>Attendance Analytics</CardTitle>
          <CardDescription>Visual breakdown of attendance patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p>Loading analytics...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Create a modern, animated pie chart
  const renderPieChart = () => {
    const pieData = Object.entries(attendanceSummary.summary).filter(([_, value]) => value > 0) // Only include non-zero values

    if (pieData.length === 0) {
      return <div className="text-center p-4">No data available for pie chart</div>
    }

    // Calculate the circumference and radius
    const radius = 80
    const circumference = 2 * Math.PI * radius

    // Calculate the stroke-dasharray and stroke-dashoffset for each segment
    let currentOffset = 0
    const segments = pieData.map(([key, value], index) => {
      const percentage = (value / totalForPie) * 100
      const segmentLength = (percentage / 100) * circumference

      const segment = {
        key,
        value,
        percentage,
        dashArray: `${segmentLength} ${circumference - segmentLength}`,
        dashOffset: -currentOffset,
        color: chartColors[key as keyof typeof chartColors],
        isHovered: hoveredCategory === key,
      }

      currentOffset += segmentLength
      return segment
    })

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-64 h-64 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            {segments.map((segment, index) => (
              <motion.circle
                key={segment.key}
                cx="50%"
                cy="50%"
                r={radius}
                fill="none"
                strokeWidth={hoveredCategory === segment.key ? "40" : "30"}
                strokeDasharray={segment.dashArray}
                strokeDashoffset={segment.dashOffset}
                stroke={segment.color}
                className="transition-all duration-300"
                onMouseEnter={() => setHoveredCategory(segment.key)}
                onMouseLeave={() => setHoveredCategory(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              />
            ))}
            <circle cx="50%" cy="50%" r="60" fill="var(--background)" />

            {/* Center text showing total days */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-current text-lg font-bold"
            >
              {totalForPie}
            </text>
            <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" className="fill-current text-xs">
              Total Days
            </text>
          </svg>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mx-auto">
          {segments.map((segment) => (
            <motion.div
              key={segment.key}
              className={`flex items-center gap-2 p-2 rounded-md transition-all duration-200 ${
                hoveredCategory === segment.key ? "bg-muted" : ""
              }`}
              onMouseEnter={() => setHoveredCategory(segment.key)}
              onMouseLeave={() => setHoveredCategory(null)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: segment.color }}></div>
              <div>
                <div className="font-medium">{segment.key}</div>
                <div className="text-sm text-muted-foreground">
                  {segment.value} days ({segment.percentage.toFixed(1)}%)
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // Create a modern, animated bar chart for weekly breakdown
  const renderBarChart = () => {
    if (weeklyData.length === 0) {
      return <div className="text-center p-4">No data available for bar chart</div>
    }

    return (
      <div className="space-y-8 px-2">
        {weeklyData.map((week, index) => (
          <motion.div
            key={index}
            className={`space-y-2 p-3 rounded-lg transition-all duration-200 ${
              hoveredWeek === index ? "bg-muted" : ""
            }`}
            onMouseEnter={() => setHoveredWeek(index)}
            onMouseLeave={() => setHoveredWeek(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div className="font-medium">{week.name}</div>
              <Badge
                variant={week.attendanceRate >= 90 ? "default" : week.attendanceRate >= 80 ? "secondary" : "outline"}
              >
                {week.attendanceRate}% Attendance
              </Badge>
            </div>
            <div className="space-y-3">
              {Object.entries({
                "Full Day Present": week.fullDays,
                "Morning Only": week.morningOnly,
                "Afternoon Only": week.afternoonOnly,
                "School Closed": week.schoolClosed,
                Other: week.other,
              })
                .filter(([_, value]) => value > 0)
                .map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{key}</span>
                      <span>{value} days</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="h-2.5 rounded-full"
                        style={{
                          backgroundColor: chartColors[key as keyof typeof chartColors],
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(value / maxCategoryValue) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      ></motion.div>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  // Create a modern, animated line chart for attendance rate trends
  const renderLineChart = () => {
    if (weeklyData.length === 0) {
      return <div className="text-center p-4">No data available for trend chart</div>
    }

    const maxRate = 100 // Attendance rate is always 0-100%
    const chartHeight = 200
    const chartWidth = 100

    // Calculate points for the line
    const points = weeklyData.map((week, index) => {
      const x = (index / (weeklyData.length - 1)) * chartWidth
      const y = 100 - (week.attendanceRate / maxRate) * 100
      return { x, y, week }
    })

    // Create the SVG path
    const linePath = `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`

    // Create the area path (for the gradient fill)
    const areaPath = `${linePath} L ${chartWidth} 100 L 0 100 Z`

    return (
      <div className="mt-4 px-2">
        <div className="relative h-[300px] w-full">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
            <div>100%</div>
            <div>75%</div>
            <div>50%</div>
            <div>25%</div>
            <div>0%</div>
          </div>

          {/* Chart area */}
          <div className="absolute left-8 right-0 top-0 h-full border-l border-b">
            {/* Horizontal grid lines */}
            <div className="absolute w-full h-1/4 border-t border-dashed border-muted"></div>
            <div className="absolute w-full h-2/4 border-t border-dashed border-muted"></div>
            <div className="absolute w-full h-3/4 border-t border-dashed border-muted"></div>
            <div className="absolute w-full h-full border-t border-dashed border-muted"></div>

            {/* SVG for the chart */}
            <svg
              className="absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Gradient definition */}
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDarkMode ? "rgba(96, 165, 250, 0.6)" : "rgba(59, 130, 246, 0.6)"} />
                  <stop offset="100%" stopColor={isDarkMode ? "rgba(96, 165, 250, 0.1)" : "rgba(59, 130, 246, 0.1)"} />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <motion.path
                d={areaPath}
                fill="url(#areaGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />

              {/* Line */}
              <motion.path
                d={linePath}
                fill="none"
                stroke={isDarkMode ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)"}
                strokeWidth="0.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />

              {/* Data points */}
              {points.map((point, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.circle
                        cx={point.x}
                        cy={point.y}
                        r="1.5"
                        fill={isDarkMode ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)"}
                        stroke="var(--background)"
                        strokeWidth="0.5"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                        className="cursor-pointer hover:r-2"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <div className="font-medium">{point.week.name}</div>
                        <div>Attendance Rate: {point.week.attendanceRate}%</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {point.week.fullDays} full days, {point.week.morningOnly + point.week.afternoonOnly} half days
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </svg>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="ml-8 mt-2 grid grid-flow-col justify-between text-xs text-muted-foreground">
          {weeklyData.length <= 10
            ? // If we have 10 or fewer weeks, show all labels
              weeklyData.map((week, index) => (
                <div key={index} className="transform -rotate-45 origin-top-left truncate max-w-[80px]">
                  {week.name}
                </div>
              ))
            : // If we have more than 10 weeks, show only some labels to avoid overcrowding
              weeklyData
                .filter((_, i) => i % Math.ceil(weeklyData.length / 10) === 0 || i === weeklyData.length - 1)
                .map((week, index) => (
                  <div key={index} className="transform -rotate-45 origin-top-left truncate max-w-[80px]">
                    {week.name}
                  </div>
                ))}
        </div>

        {/* Legend */}
        <div className="mt-12 flex items-center justify-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: isDarkMode ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)" }}
          ></div>
          <span className="text-sm">Attendance Rate (%)</span>
        </div>
      </div>
    )
  }

  // Create a new code distribution chart
  const renderCodeDistributionChart = () => {
    // Count occurrences of each code
    const codeCounts: Record<string, number> = {}

    parsedAttendance.forEach((week) => {
      week.weekMarks.forEach((mark) => {
        if (mark) {
          codeCounts[mark] = (codeCounts[mark] || 0) + 1
        }
      })
    })

    // Sort codes by frequency
    const sortedCodes = Object.entries(codeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // Show top 10 codes

    // Calculate max count for scaling
    const maxCount = Math.max(...sortedCodes.map(([_, count]) => count))

    if (sortedCodes.length === 0) {
      return <div className="text-center p-4">No code distribution data available</div>
    }

    return (
      <div className="space-y-6 px-2">
        <h3 className="text-lg font-medium">Top Attendance Codes</h3>

        <div className="space-y-4">
          {sortedCodes.map(([code, count], index) => {
            const description = getCodeDescription(code) || legend[code]?.label || "Custom code"
            const percentage = ((count / Object.values(codeCounts).reduce((a, b) => a + b, 0)) * 100).toFixed(1)

            return (
              <motion.div
                key={code}
                className="space-y-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {code}
                    </Badge>
                    <span className="font-medium">{description}</span>
                  </div>
                  <div className="text-sm">
                    {count} ({percentage}%)
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className="h-2.5 rounded-full"
                    style={{
                      backgroundColor: legend[code]?.color
                        ? `var(--${legend[code].color.replace("bg-", "")})`
                        : isDarkMode
                          ? "rgba(96, 165, 250, 0.8)"
                          : "rgba(59, 130, 246, 0.8)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxCount) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  ></motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="p-4 bg-muted rounded-lg mt-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              This chart shows the distribution of attendance codes across all sessions. Hover over the bars to see more
              details about each code.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Mobile tab selector dropdown
  const renderMobileTabSelector = () => {
    const tabOptions = [
      { value: "summary", label: "Summary" },
      { value: "weekly", label: "Weekly Breakdown" },
      { value: "trends", label: "Attendance Trends" },
      { value: "codes", label: "Code Distribution" },
    ]

    const currentTab = tabOptions.find((tab) => tab.value === activeTab)

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full mb-4 justify-between">
            {currentTab?.label || "Select View"}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full">
          {tabOptions.map((tab) => (
            <DropdownMenuItem
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={activeTab === tab.value ? "bg-muted" : ""}
            >
              {tab.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle>Attendance Analytics</CardTitle>
        <CardDescription>Visual breakdown of attendance patterns</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {isMobile ? (
          // Mobile view with dropdown selector
          <>
            {renderMobileTabSelector()}
            <div className="mt-4">
              {activeTab === "summary" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                      <h3 className="text-lg font-medium mb-4 text-center">Attendance Distribution</h3>
                      {renderPieChart()}
                    </div>

                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                      <h3 className="text-lg font-medium mb-4">Attendance Statistics</h3>
                      <div className="space-y-4">
                        <motion.div
                          className="p-4 bg-primary/10 rounded-lg flex flex-wrap justify-between items-center gap-2"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <span className="font-medium">Overall Attendance Rate:</span>
                          <span className="text-2xl font-bold text-primary">{attendanceSummary.attendanceRate}%</span>
                        </motion.div>

                        <motion.div
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground">Total Days</div>
                            <div className="text-xl font-medium">{attendanceSummary.totalDays}</div>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground">Total Sessions</div>
                            <div className="text-xl font-medium">{attendanceSummary.totalSessions}</div>
                          </div>
                        </motion.div>

                        <motion.div
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                        >
                          <div className="p-3 bg-green-500/10 rounded-lg">
                            <div className="text-sm text-muted-foreground">Present Sessions</div>
                            <div className="text-xl font-medium">{attendanceSummary.totalPresentSessions}</div>
                          </div>
                          <div className="p-3 bg-red-500/10 rounded-lg">
                            <div className="text-sm text-muted-foreground">Missed Sessions</div>
                            <div className="text-xl font-medium">
                              {attendanceSummary.totalSessions - attendanceSummary.totalPresentSessions}
                            </div>
                          </div>
                        </motion.div>

                        <ScrollArea className="h-[200px] pr-4">
                          {Object.entries(attendanceSummary.summary)
                            .filter(([_, value]) => value > 0) // Only show non-zero values
                            .map(([key, value], index) => (
                              <motion.div
                                key={key}
                                className="flex justify-between p-3 bg-muted rounded-lg mb-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                              >
                                <span>{key}:</span>
                                <span className="font-medium">
                                  {value} ({((value / attendanceSummary.totalDays) * 100).toFixed(1)}%)
                                </span>
                              </motion.div>
                            ))}
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "weekly" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-card p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium mb-4">Weekly Attendance Breakdown</h3>
                    <ScrollArea className="h-[500px]">{renderBarChart()}</ScrollArea>
                  </div>
                </motion.div>
              )}

              {activeTab === "trends" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-card p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium mb-4">Attendance Rate Trends</h3>
                    <div className="overflow-x-auto">{renderLineChart()}</div>
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          This chart shows the attendance rate trend over time. The attendance rate is calculated as the
                          percentage of sessions (morning and afternoon) where the student was present out of the total
                          possible sessions, excluding school closed days. Hover over data points for details.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "codes" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-card p-6 rounded-lg border shadow-sm">
                    <ScrollArea className="h-[500px]">{renderCodeDistributionChart()}</ScrollArea>
                  </div>
                </motion.div>
              )}
            </div>
          </>
        ) : (
          // Desktop view with tabs
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="bg-background border-b border-border">
              <div className="container mx-auto">
                <TabsList className="h-10 w-full bg-transparent p-0 flex">
                  <TabsTrigger
                    value="summary"
                    className="flex-1 h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Summary
                  </TabsTrigger>
                  <TabsTrigger
                    value="weekly"
                    className="flex-1 h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Weekly Breakdown
                  </TabsTrigger>
                  <TabsTrigger
                    value="trends"
                    className="flex-1 h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Attendance Trends
                  </TabsTrigger>
                  <TabsTrigger
                    value="codes"
                    className="flex-1 h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Code Distribution
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <TabsContent value="summary" className="mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                      <h3 className="text-lg font-medium mb-4 text-center">Attendance Distribution</h3>
                      {renderPieChart()}
                    </div>

                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                      <h3 className="text-lg font-medium mb-4">Attendance Statistics</h3>
                      <div className="space-y-4">
                        <motion.div
                          className="p-4 bg-primary/10 rounded-lg flex flex-wrap justify-between items-center gap-2"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <span className="font-medium">Overall Attendance Rate:</span>
                          <span className="text-2xl font-bold text-primary">{attendanceSummary.attendanceRate}%</span>
                        </motion.div>

                        <motion.div
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground">Total Days</div>
                            <div className="text-xl font-medium">{attendanceSummary.totalDays}</div>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground">Total Sessions</div>
                            <div className="text-xl font-medium">{attendanceSummary.totalSessions}</div>
                          </div>
                        </motion.div>

                        <motion.div
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                        >
                          <div className="p-3 bg-green-500/10 rounded-lg">
                            <div className="text-sm text-muted-foreground">Present Sessions</div>
                            <div className="text-xl font-medium">{attendanceSummary.totalPresentSessions}</div>
                          </div>
                          <div className="p-3 bg-red-500/10 rounded-lg">
                            <div className="text-sm text-muted-foreground">Missed Sessions</div>
                            <div className="text-xl font-medium">
                              {attendanceSummary.totalSessions - attendanceSummary.totalPresentSessions}
                            </div>
                          </div>
                        </motion.div>

                        <ScrollArea className="h-[200px] pr-4">
                          {Object.entries(attendanceSummary.summary)
                            .filter(([_, value]) => value > 0) // Only show non-zero values
                            .map(([key, value], index) => (
                              <motion.div
                                key={key}
                                className="flex justify-between p-3 bg-muted rounded-lg mb-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                              >
                                <span>{key}:</span>
                                <span className="font-medium">
                                  {value} ({((value / attendanceSummary.totalDays) * 100).toFixed(1)}%)
                                </span>
                              </motion.div>
                            ))}
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="weekly" className="mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-card p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium mb-4">Weekly Attendance Breakdown</h3>
                    <ScrollArea className="h-[500px]">{renderBarChart()}</ScrollArea>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="trends" className="mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-card p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium mb-4">Attendance Rate Trends</h3>
                    <div className="overflow-x-auto">{renderLineChart()}</div>
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          This chart shows the attendance rate trend over time. The attendance rate is calculated as the
                          percentage of sessions (morning and afternoon) where the student was present out of the total
                          possible sessions, excluding school closed days. Hover over data points for details.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="codes" className="mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-card p-6 rounded-lg border shadow-sm">
                    <ScrollArea className="h-[500px]">{renderCodeDistributionChart()}</ScrollArea>
                  </div>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

export default AttendanceChart
