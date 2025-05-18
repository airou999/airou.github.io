import type React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatToUKDisplayDate, parseISODate } from "@/utils/date-utils"

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

interface AttendanceSummary {
  [key: string]: number
}

interface WeeklySummary {
  name: string
  [key: string]: string | number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

const AttendanceChart: React.FC<AttendanceChartProps> = ({ parsedAttendance, legend }) => {
  if (!parsedAttendance || parsedAttendance.length === 0) {
    return null
  }

  // Calculate attendance summary with special handling for attendance patterns
  const attendanceSummary: AttendanceSummary = {
    "Full Day Present": 0,
    "Morning Only": 0,
    "Afternoon Only": 0,
    "School Closed": 0,
    Other: 0,
  }

  let totalSessions = 0
  let totalDays = 0

  parsedAttendance.forEach((week) => {
    // Process each day (2 sessions per day)
    for (let i = 0; i < week.weekMarks.length; i += 2) {
      const morningMark = week.weekMarks[i]
      const afternoonMark = week.weekMarks[i + 1]

      if (!morningMark && !afternoonMark) continue

      totalDays++
      totalSessions += (morningMark ? 1 : 0) + (afternoonMark ? 1 : 0)

      // School closed
      if (morningMark === "#" && afternoonMark === "#") {
        attendanceSummary["School Closed"]++
      }
      // Full day present
      else if (morningMark === "/" && afternoonMark === "\\") {
        attendanceSummary["Full Day Present"]++
      }
      // Morning only
      else if (morningMark === "/" && afternoonMark !== "\\") {
        attendanceSummary["Morning Only"]++
      }
      // Afternoon only
      else if (morningMark !== "/" && afternoonMark === "\\") {
        attendanceSummary["Afternoon Only"]++
      }
      // Other patterns
      else {
        attendanceSummary["Other"]++
      }
    }
  })

  // Prepare data for pie chart
  const pieData = Object.entries(attendanceSummary)
    .filter(([_, value]) => value > 0) // Only include non-zero values
    .map(([key, value], index) => ({
      name: key,
      value,
      color: COLORS[index % COLORS.length],
    }))

  // Prepare data for weekly summary bar chart
  const weeklySummary: WeeklySummary[] = parsedAttendance.map((week) => {
    const summary: WeeklySummary = {
      name: formatToUKDisplayDate(parseISODate(week.weekStart)),
      "Full Day Present": 0,
      "Morning Only": 0,
      "Afternoon Only": 0,
      "School Closed": 0,
      Other: 0,
    }

    // Process each day in the week
    for (let i = 0; i < week.weekMarks.length; i += 2) {
      const morningMark = week.weekMarks[i]
      const afternoonMark = week.weekMarks[i + 1]

      if (!morningMark && !afternoonMark) continue

      // School closed
      if (morningMark === "#" && afternoonMark === "#") {
        summary["School Closed"] = (summary["School Closed"] as number) + 1
      }
      // Full day present
      else if (morningMark === "/" && afternoonMark === "\\") {
        summary["Full Day Present"] = (summary["Full Day Present"] as number) + 1
      }
      // Morning only
      else if (morningMark === "/" && afternoonMark !== "\\") {
        summary["Morning Only"] = (summary["Morning Only"] as number) + 1
      }
      // Afternoon only
      else if (morningMark !== "/" && afternoonMark === "\\") {
        summary["Afternoon Only"] = (summary["Afternoon Only"] as number) + 1
      }
      // Other patterns
      else {
        summary["Other"] = (summary["Other"] as number) + 1
      }
    }

    return summary
  })

  // Get attendance categories for bar chart
  const attendanceCategories = ["Full Day Present", "Morning Only", "Afternoon Only", "School Closed", "Other"]

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle>Attendance Analytics</CardTitle>
        <CardDescription>Visual breakdown of attendance patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="mb-4 w-full max-w-md">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Attendance Distribution</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} days`, "Count"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Attendance Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span>Total Days:</span>
                    <span className="font-medium">{totalDays}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span>Total Sessions:</span>
                    <span className="font-medium">{totalSessions}</span>
                  </div>
                  {Object.entries(attendanceSummary)
                    .filter(([_, value]) => value > 0) // Only show non-zero values
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>{key}:</span>
                        <span className="font-medium">
                          {value} ({((value / totalDays) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weekly">
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Weekly Attendance Breakdown</h3>
              <div className="h-[450px]">
                <ChartContainer
                  config={Object.fromEntries(
                    attendanceCategories.map((type, index) => [
                      type,
                      {
                        label: type,
                        color: `hsl(var(--chart-${(index % 9) + 1}))`,
                      },
                    ]),
                  )}
                  className="w-full h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklySummary} margin={{ top: 20, right: 30, left: 20, bottom: 90 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={90} tick={{ fontSize: 12 }} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                      {attendanceCategories.map((type, index) => (
                        <Bar key={type} dataKey={type} stackId="a" fill={COLORS[index % COLORS.length]} name={type} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default AttendanceChart
