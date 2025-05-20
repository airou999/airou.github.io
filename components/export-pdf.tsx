"use client"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { formatToUKDisplayDate } from "@/utils/date-utils"
import {
  getTailwindColorForPDF,
  addPDFHeader,
  addPDFSectionTitle,
  addPDFFooter,
  formatAttendanceDataForPDF,
} from "./pdf-utils"
import { getCodesByCategory } from "@/utils/attendance-code-utils"

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

interface AttendanceStats {
  totalDays: number
  fullDaysPresent: number
  halfDaysPresent: number
  schoolClosedDays: number
  attendanceDays: number
  attendanceRate: string
}

interface ExportPDFProps {
  parsedAttendance: WeekData[]
  legend: Legend
  startDate: string
  endDate: string
  stats: AttendanceStats | null
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export const exportToPDF = ({
  parsedAttendance,
  legend,
  startDate,
  endDate,
  stats,
  onSuccess,
  onError,
}: ExportPDFProps) => {
  try {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })

    // Add title and date range
    let yPos = addPDFHeader(
      doc,
      "Attendance Report",
      `Period: ${formatToUKDisplayDate(new Date(startDate))} to ${formatToUKDisplayDate(new Date(endDate))}`,
    )

    // Add attendance statistics if available
    if (stats) {
      yPos = addPDFSectionTitle(doc, "Attendance Summary", yPos + 4)

      // Create a statistics table
      const statsData = [
        ["Attendance Rate", `${stats.attendanceRate}%`],
        ["Full Days Present", stats.fullDaysPresent.toString()],
        ["Half Days Present", stats.halfDaysPresent.toString()],
        ["School Closed Days", stats.schoolClosedDays.toString()],
        ["Total Attendance Days", stats.attendanceDays.toString()],
      ]

      autoTable(doc, {
        startY: yPos + 2,
        head: [["Metric", "Value"]],
        body: statsData,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 10 },
      })

      yPos = doc.lastAutoTable?.finalY || yPos + 30
    }

    // Add comprehensive legend with categories
    yPos = addPDFSectionTitle(doc, "Attendance Code Reference", yPos + 8)

    // Get all used codes in the attendance data
    const usedCodes = new Set<string>()
    parsedAttendance.forEach((week) => {
      week.weekMarks.forEach((mark) => {
        if (mark) usedCodes.add(mark)
      })
    })

    // Group codes by category
    const codesByCategory = getCodesByCategory()

    // Add each category as a separate table
    const categories = Object.keys(codesByCategory)
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i]
      const codes = codesByCategory[category]

      // Filter to only include codes that are used in the data
      const relevantCodes = Object.entries(codes).filter(([code]) => usedCodes.has(code))

      // Skip empty categories
      if (relevantCodes.length === 0) continue

      // Add category title
      if (i > 0) {
        yPos += 5
      }

      // Create legend data for this category
      const legendData = relevantCodes.map(([code, description]) => {
        const customLabel = legend[code]?.label || description
        return [code, customLabel, description !== customLabel ? description : ""]
      })

      // Add the legend table
      autoTable(doc, {
        startY: i === 0 ? yPos + 2 : undefined,
        head: [[category, "Custom Label", "Standard Description"]],
        body: legendData,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        willDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 0) {
            const code = data.cell.raw as string
            if (legend[code]) {
              const color = getTailwindColorForPDF(legend[code].color)
              doc.setFillColor(...color)
            }
          }
        },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 9 },
      })

      // Update yPos for next table
      yPos = doc.lastAutoTable?.finalY || yPos

      // Add page break if needed
      if (i < categories.length - 1 && yPos > doc.internal.pageSize.height - 40) {
        doc.addPage()
        yPos = 20
      }
    }

    // Add attendance data table
    yPos = addPDFSectionTitle(doc, "Attendance Data", yPos + 8)

    // Format attendance data for PDF
    const { headers, tableData } = formatAttendanceDataForPDF(parsedAttendance, legend)

    // Generate the attendance table with colored cells
    autoTable(doc, {
      startY: yPos + 2,
      head: [headers],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      willDrawCell: (data) => {
        if (data.section === "body" && data.column.index > 0) {
          const value = data.cell.raw as string
          if (value && legend[value]) {
            const color = getTailwindColorForPDF(legend[value].color)
            doc.setFillColor(...color)
          }
        }
      },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9, cellPadding: 2 },
    })

    // Add footer with date
    addPDFFooter(doc)

    // Save the PDF
    doc.save("attendance_report.pdf")

    // Call success callback if provided
    if (onSuccess) onSuccess()
  } catch (error) {
    console.error("Error exporting to PDF:", error)
    if (onError) onError(error instanceof Error ? error : new Error("Failed to export data to PDF"))
  }
}
