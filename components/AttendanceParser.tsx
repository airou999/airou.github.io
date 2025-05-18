"use client"

import React from "react"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Loader2, InfoIcon, Calendar, FileText, BarChart3, Settings, Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatToUKDisplayDate, parseISODate } from "@/utils/date-utils"
import { ColorPicker } from "@/components/ui/color-picker"
import { LegendPresets, type Legend as LegendType } from "@/components/legend-presets"
import AttendanceChart from "./AttendanceChart"
import { motion } from "framer-motion"

// Add React.memo to optimize rendering of table rows
// Add this at the top of the file after the imports:
const MemoizedTableRow = React.memo(
  ({ week, legend }: { week: WeekData; legend: Legend }) => (
    <TableRow>
      <TableCell className="font-medium">{week.weekStart}</TableCell>
      {week.weekMarks.map((mark, idx) => (
        <TableCell
          key={idx}
          className={`${legend[mark]?.color || ""} dark:bg-opacity-20 text-center`}
          title={legend[mark]?.label || mark}
        >
          {mark}
        </TableCell>
      ))}
    </TableRow>
  ),
  (prevProps, nextProps) => {
    // Only re-render if week data or legend for used marks changes
    return (
      prevProps.week.weekStart === nextProps.week.weekStart &&
      prevProps.week.weekMarks.join() === nextProps.week.weekMarks.join() &&
      JSON.stringify(prevProps.week.weekMarks.map((mark) => prevProps.legend[mark])) ===
        JSON.stringify(nextProps.week.weekMarks.map((mark) => nextProps.legend[mark]))
    )
  },
)

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

const AttendanceParser: React.FC = () => {
  const [attendanceString, setAttendanceString] = useState<string>("#,#,#,#,#,#,/,\\,/,\\,/,\\,#,#,#,#")
  const [startDate, setStartDate] = useState<string>("2024-09-01")
  const [endDate, setEndDate] = useState<string>("2024-09-15")
  const [parsedAttendance, setParsedAttendance] = useState<WeekData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [displayedData, setDisplayedData] = useState<WeekData[]>([])
  const [activeTab, setActiveTab] = useState<string>("input")
  const [newSymbol, setNewSymbol] = useState<string>("")
  const [newLabel, setNewLabel] = useState<string>("")
  const [newColor, setNewColor] = useState<string>("bg-gray-100")
  // Replace this line:
  // const itemsPerPage = 4 // Number of weeks to display per page

  // With this dynamic calculation:
  const [itemsPerPage, setItemsPerPage] = useState<number>(4)

  // Updated legend with correct definitions
  const [legend, setLegend] = useState<Legend>({
    "#": { label: "School Closed", color: "bg-gray-100" },
    "/": { label: "Morning Present", color: "bg-yellow-100" },
    "\\": { label: "Afternoon Present", color: "bg-blue-100" },
  })

  // Add this function after the other useCallback functions
  const calculatePaginationNeeds = useCallback(() => {
    if (!parsedAttendance.length) return

    try {
      // Parse start and end dates
      const start = parseISODate(startDate)
      const end = parseISODate(endDate)

      // Calculate the difference in months (approximate)
      const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())

      // If period is 3 months or less, show all data on one page
      if (diffMonths <= 3) {
        setItemsPerPage(parsedAttendance.length)
        setCurrentPage(1)
      } else {
        // For longer periods, use pagination with 8 weeks per page
        setItemsPerPage(8)
      }
    } catch (error) {
      console.error("Error calculating pagination needs:", error)
      // Default to 8 weeks per page if there's an error
      setItemsPerPage(8)
    }
  }, [parsedAttendance.length, startDate, endDate])

  // Update displayed data when page changes or parsed data changes
  // Replace the existing useEffect with this:
  useEffect(() => {
    if (parsedAttendance.length > 0) {
      // Calculate if pagination is needed based on date range
      calculatePaginationNeeds()

      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = Math.min(startIndex + itemsPerPage, parsedAttendance.length)

      // Use a more efficient way to slice the array
      const slicedData = parsedAttendance.slice(startIndex, endIndex)
      setDisplayedData(slicedData)
      setTotalPages(Math.ceil(parsedAttendance.length / itemsPerPage))
    } else {
      setDisplayedData([])
      setTotalPages(1)
    }
  }, [currentPage, parsedAttendance, itemsPerPage, calculatePaginationNeeds])

  const handleLegendChange = useCallback((symbol: string, field: keyof LegendItem, value: string) => {
    setLegend((prev) => ({
      ...prev,
      [symbol]: {
        ...prev[symbol],
        [field]: value,
      },
    }))
  }, [])

  const addLegendItem = useCallback(() => {
    if (!newSymbol) {
      return
    }

    setLegend((prev) => ({
      ...prev,
      [newSymbol]: { label: newLabel || "Custom", color: newColor },
    }))

    // Reset form
    setNewSymbol("")
    setNewLabel("")
    setNewColor("bg-gray-100")
  }, [newSymbol, newLabel, newColor])

  const removeLegendItem = useCallback((symbol: string) => {
    setLegend((prev) => {
      const newLegend = { ...prev }
      delete newLegend[symbol]
      return newLegend
    })
  }, [])

  const updateLegendSymbol = useCallback((oldSymbol: string, newSymbol: string) => {
    if (newSymbol === oldSymbol) return
    setLegend((prev) => {
      const newLegend = { ...prev }
      delete Object.assign(newLegend, { [newSymbol]: newLegend[oldSymbol] })[oldSymbol]
      return newLegend
    })
  }, [])

  const handleLoadPreset = useCallback((presetLegend: LegendType) => {
    setLegend(presetLegend)
  }, [])

  const autoDetectLegend = useCallback(() => {
    if (!attendanceString) return

    // Extract unique symbols from the attendance string
    const marks = attendanceString.split(",")
    const uniqueSymbols = Array.from(new Set(marks)).filter((symbol) => symbol.trim() !== "")

    // Define standard symbols with correct meanings
    const standardSymbols: Record<string, { label: string; color: string }> = {
      "#": { label: "School Closed", color: "bg-gray-100" },
      "/": { label: "Morning Present", color: "bg-yellow-100" },
      "\\": { label: "Afternoon Present", color: "bg-blue-100" },
    }

    // Create a new legend with detected symbols
    const newLegend: Legend = {}

    uniqueSymbols.forEach((symbol) => {
      // If symbol already exists in legend, keep it
      if (legend[symbol]) {
        newLegend[symbol] = legend[symbol]
        return
      }

      // If it's a standard symbol, use the standard definition
      if (standardSymbols[symbol]) {
        newLegend[symbol] = standardSymbols[symbol]
        return
      }

      // Otherwise, assign a generic label and color
      newLegend[symbol] = {
        label: "Custom Mark",
        color: "bg-purple-100",
      }
    })

    setLegend(newLegend)
  }, [attendanceString, legend])

  const splitMarksIntoCalendarWeeks = useCallback((marks: string[], start_date: Date, end_date: Date): WeekData[] => {
    try {
      const weeks: WeekData[] = []
      const daysPerWeek = 7
      const sessionsPerDay = 2

      const daysToMonday = (start_date.getDay() + 6) % 7
      const weekStartDate = new Date(start_date.getTime() - daysToMonday * 24 * 60 * 60 * 1000)

      let currentDate = weekStartDate
      let currentMarkIndex = 0

      // Limit the number of weeks to prevent browser crashes (adjust as needed)
      const maxWeeks = 100
      let weekCount = 0

      while ((currentDate <= end_date || currentMarkIndex < marks.length) && weekCount < maxWeeks) {
        const weekMarks: string[] = Array(daysPerWeek * sessionsPerDay).fill("")
        const weekDates: string[] = []

        for (let i = 0; i < daysPerWeek; i++) {
          const currentDay = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000)
          weekDates.push(currentDay.toISOString().split("T")[0])

          for (let session = 0; session < sessionsPerDay; session++) {
            if (currentDay >= start_date && currentDay <= end_date && currentMarkIndex < marks.length) {
              weekMarks[i * sessionsPerDay + session] = marks[currentMarkIndex]
              currentMarkIndex++
            }
          }
        }

        weeks.push({
          weekStart: weekDates[0],
          weekMarks: weekMarks,
        })
        currentDate = new Date(currentDate.getTime() + daysPerWeek * 24 * 60 * 60 * 1000)
        weekCount++
      }

      return weeks
    } catch (error) {
      console.error("Error in splitMarksIntoCalendarWeeks:", error)
      throw new Error("Failed to process attendance data")
    }
  }, [])

  const handleParseAttendance = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setCurrentPage(1)

    try {
      // Use setTimeout to allow the UI to update before heavy processing
      setTimeout(() => {
        try {
          const marks = attendanceString.split(",")

          if (marks.length > 1000) {
            setError(`Warning: Processing ${marks.length} attendance marks. This may take a moment.`)
          }

          const start_date = parseISODate(startDate)
          const end_date = parseISODate(endDate)

          if (isNaN(start_date.getTime()) || isNaN(end_date.getTime())) {
            throw new Error("Invalid date format")
          }

          if (start_date > end_date) {
            throw new Error("Start date must be before end date")
          }

          const weeks = splitMarksIntoCalendarWeeks(marks, start_date, end_date)
          setParsedAttendance(weeks)

          // Add this line after it:
          calculatePaginationNeeds()

          // Auto-detect legend if we don't have entries for all symbols
          const uniqueSymbols = Array.from(new Set(marks)).filter((s) => s.trim() !== "")
          const missingSymbols = uniqueSymbols.some((symbol) => !legend[symbol])

          if (missingSymbols) {
            autoDetectLegend()
          }

          // Switch to the data tab after successful parsing
          setActiveTab("data")
          setIsLoading(false)
        } catch (error) {
          console.error("Error parsing attendance:", error)
          setError(error instanceof Error ? error.message : "An unknown error occurred")
          setParsedAttendance([])
          setIsLoading(false)
        }
      }, 50)
    } catch (error) {
      console.error("Error in handleParseAttendance:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      setParsedAttendance([])
      setIsLoading(false)
    }
  }, [
    attendanceString,
    startDate,
    endDate,
    splitMarksIntoCalendarWeeks,
    autoDetectLegend,
    legend,
    calculatePaginationNeeds,
  ])

  const exportToCSV = useCallback(() => {
    try {
      const header = [
        "Week Start Date",
        "Mon AM",
        "Mon PM",
        "Tue AM",
        "Tue PM",
        "Wed AM",
        "Wed PM",
        "Thu AM",
        "Thu PM",
        "Fri AM",
        "Fri PM",
        "Sat AM",
        "Sat PM",
        "Sun AM",
        "Sun PM",
      ]

      const rows = parsedAttendance.map((week) => {
        return [week.weekStart, ...week.weekMarks.map((mark) => legend[mark]?.label || mark)]
      })

      const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = "attendance_data.csv"
      link.click()
    } catch (error) {
      console.error("Error exporting to CSV:", error)
      setError("Failed to export data to CSV")
    }
  }, [parsedAttendance, legend])

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  // Calculate attendance statistics for the current view
  const calculateAttendanceStats = useCallback(() => {
    if (!parsedAttendance.length) return null

    let totalDays = 0
    let fullDaysPresent = 0
    let halfDaysPresent = 0
    let schoolClosedDays = 0

    // Process each week
    parsedAttendance.forEach((week) => {
      // Process each day (2 sessions per day)
      for (let i = 0; i < week.weekMarks.length; i += 2) {
        const morningMark = week.weekMarks[i]
        const afternoonMark = week.weekMarks[i + 1]

        if (!morningMark && !afternoonMark) continue

        totalDays++

        // School closed
        if (morningMark === "#" && afternoonMark === "#") {
          schoolClosedDays++
        }
        // Full day present
        else if (morningMark === "/" && afternoonMark === "\\") {
          fullDaysPresent++
        }
        // Half day present (either morning or afternoon)
        else if (morningMark === "/" || afternoonMark === "\\") {
          halfDaysPresent++
        }
      }
    })

    return {
      totalDays,
      fullDaysPresent,
      halfDaysPresent,
      schoolClosedDays,
      attendanceDays: totalDays - schoolClosedDays,
      attendanceRate:
        totalDays - schoolClosedDays > 0
          ? (((fullDaysPresent + halfDaysPresent * 0.5) / (totalDays - schoolClosedDays)) * 100).toFixed(1)
          : "N/A",
    }
  }, [parsedAttendance])

  const stats = calculateAttendanceStats()

  // Format the displayed date in UK format
  const formatDisplayDate = (isoDate: string) => {
    try {
      const date = new Date(isoDate)
      return formatToUKDisplayDate(date)
    } catch (e) {
      return isoDate
    }
  }

  return (
    <div className="container mx-auto p-4 pb-16">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Tracker</h1>
        <p className="text-muted-foreground mt-1">Track, analyze and visualize attendance patterns</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="input" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Input</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2" disabled={parsedAttendance.length === 0}>
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2" disabled={parsedAttendance.length === 0}>
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {parsedAttendance.length > 0 && (
            <Button variant="outline" onClick={exportToCSV} disabled={isLoading} className="hidden md:flex">
              Export to CSV
            </Button>
          )}
        </div>

        <TabsContent value="input" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Data Input</CardTitle>
              <CardDescription>Enter your attendance data and date range</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="attendance-string">Attendance String</Label>
                <Input
                  id="attendance-string"
                  value={attendanceString}
                  onChange={(e) => setAttendanceString(e.target.value)}
                  disabled={isLoading}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Enter comma-separated attendance marks (e.g., #,#,/,\,/,\)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    UK format (DD/MM/YYYY): {startDate ? formatDisplayDate(startDate) : ""}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    UK format (DD/MM/YYYY): {endDate ? formatDisplayDate(endDate) : ""}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handleParseAttendance} disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Parse Attendance"
                )}
              </Button>
            </CardFooter>
          </Card>

          {error && (
            <Alert variant={error.startsWith("Warning") ? "default" : "destructive"}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Symbol Guide
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>How to interpret attendance symbols</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-mono">
                      /
                    </Badge>
                    <span className="font-medium">Morning Present</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Student was present in the morning but left in the afternoon
                  </p>
                </div>

                <div className="p-3 bg-muted rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-mono">
                      \
                    </Badge>
                    <span className="font-medium">Afternoon Present</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Student was present in the afternoon but not in the morning
                  </p>
                </div>

                <div className="p-3 bg-muted rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-mono">
                      #
                    </Badge>
                    <span className="font-medium">School Closed</span>
                  </div>
                  <p className="text-xs text-muted-foreground">No attendance taken (weekends or holidays)</p>
                </div>

                <div className="p-3 bg-muted rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-mono">
                      / + \
                    </Badge>
                    <span className="font-medium">Full Day Present</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Student attended both morning and afternoon classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          {stats && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-primary/10 rounded-lg text-center border border-border">
                      <div className="text-3xl font-bold text-primary">{stats.attendanceRate}%</div>
                      <div className="text-sm text-muted-foreground">Attendance Rate</div>
                    </div>

                    <div className="p-4 bg-green-500/10 rounded-lg text-center border border-border">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {stats.fullDaysPresent}
                      </div>
                      <div className="text-sm text-muted-foreground">Full Days Present</div>
                    </div>

                    <div className="p-4 bg-yellow-500/10 rounded-lg text-center border border-border">
                      <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                        {stats.halfDaysPresent}
                      </div>
                      <div className="text-sm text-muted-foreground">Half Days Present</div>
                    </div>

                    <div className="p-4 bg-gray-500/10 rounded-lg text-center border border-border">
                      <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                        {stats.schoolClosedDays}
                      </div>
                      <div className="text-sm text-muted-foreground">School Closed Days</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {displayedData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Attendance Data</CardTitle>
                  {/* Replace the existing info text with this: */}
                  <div className="text-sm text-muted-foreground">
                    {totalPages > 1 ? (
                      <>
                        Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                        {Math.min(currentPage * itemsPerPage, parsedAttendance.length)} of {parsedAttendance.length}{" "}
                        weeks
                      </>
                    ) : (
                      <>
                        Showing {parsedAttendance.length} {parsedAttendance.length === 1 ? "week" : "weeks"}
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-medium">Week Start Date</TableHead>
                          <TableHead className="font-medium">Mon AM</TableHead>
                          <TableHead className="font-medium">Mon PM</TableHead>
                          <TableHead className="font-medium">Tue AM</TableHead>
                          <TableHead className="font-medium">Tue PM</TableHead>
                          <TableHead className="font-medium">Wed AM</TableHead>
                          <TableHead className="font-medium">Wed PM</TableHead>
                          <TableHead className="font-medium">Thu AM</TableHead>
                          <TableHead className="font-medium">Thu PM</TableHead>
                          <TableHead className="font-medium">Fri AM</TableHead>
                          <TableHead className="font-medium">Fri PM</TableHead>
                          <TableHead className="font-medium">Sat AM</TableHead>
                          <TableHead className="font-medium">Sat PM</TableHead>
                          <TableHead className="font-medium">Sun AM</TableHead>
                          <TableHead className="font-medium">Sun PM</TableHead>
                        </TableRow>
                      </TableHeader>
                      {/* Then update the table body to use the memoized component: */}
                      <TableBody>
                        {displayedData.map((week, index) => (
                          <MemoizedTableRow key={index} week={week} legend={legend} />
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Replace the pagination section with this: */}
                  {totalPages > 1 && (
                    <Pagination className="mt-4">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Show pages around current page
                          let pageToShow
                          if (totalPages <= 5) {
                            pageToShow = i + 1
                          } else if (currentPage <= 3) {
                            pageToShow = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageToShow = totalPages - 4 + i
                          } else {
                            pageToShow = currentPage - 2 + i
                          }

                          return (
                            <PaginationItem key={i}>
                              <PaginationLink
                                onClick={() => handlePageChange(pageToShow)}
                                isActive={currentPage === pageToShow}
                              >
                                {pageToShow}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" onClick={exportToCSV} disabled={isLoading} className="md:hidden">
                    Export to CSV
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {parsedAttendance.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <AttendanceChart parsedAttendance={parsedAttendance} legend={legend} />
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Legend</CardTitle>
              <CardDescription>Customize how attendance symbols are displayed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={autoDetectLegend} variant="secondary" disabled={isLoading}>
                    Auto-Detect Legend
                  </Button>
                  <LegendPresets onSelectPreset={handleLoadPreset} />
                </div>
              </div>

              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Add New Symbol</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="new-symbol" className="mb-2 block">
                        Symbol
                      </Label>
                      <Input
                        id="new-symbol"
                        value={newSymbol}
                        onChange={(e) => setNewSymbol(e.target.value.slice(0, 1))}
                        className="font-mono text-center"
                        maxLength={1}
                        placeholder="?"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="new-label" className="mb-2 block">
                        Label
                      </Label>
                      <Input
                        id="new-label"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="Custom Symbol"
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Color</Label>
                      <ColorPicker color={newColor} onChange={setNewColor} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={addLegendItem} disabled={!newSymbol} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Symbol
                  </Button>
                </CardFooter>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(legend).map(([symbol, value]) => (
                  <Card key={symbol} className={`border-l-4 ${value.color} dark:bg-opacity-5`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                          {symbol}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLegendItem(symbol)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor={`label-${symbol}`} className="mb-2 block text-xs">
                            Label
                          </Label>
                          <Input
                            id={`label-${symbol}`}
                            value={value.label}
                            onChange={(e) => handleLegendChange(symbol, "label", e.target.value)}
                            className="h-9"
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <Label className="mb-2 block text-xs">Color</Label>
                          <ColorPicker
                            color={value.color}
                            onChange={(color) => handleLegendChange(symbol, "color", color)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AttendanceParser
