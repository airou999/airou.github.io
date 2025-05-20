/**
 * Utility functions for PDF generation
 */

import type { jsPDF } from "jspdf"
import { formatToUKDisplayDate } from "@/utils/date-utils"

// Map Tailwind color classes to RGB values for PDF
export const getTailwindColorForPDF = (colorClass: string): number[] => {
  // Default color (light gray)
  let color = [240, 240, 240]

  // Green variants
  if (colorClass.includes("green-100")) color = [232, 245, 233]
  else if (colorClass.includes("green-200")) color = [200, 230, 201]
  else if (colorClass.includes("emerald-100")) color = [220, 237, 222]
  // Red variants
  else if (colorClass.includes("red-100")) color = [255, 235, 238]
  else if (colorClass.includes("red-200")) color = [255, 205, 210]
  else if (colorClass.includes("rose-100")) color = [255, 228, 230]
  // Blue variants
  else if (colorClass.includes("blue-100")) color = [227, 242, 253]
  else if (colorClass.includes("blue-200")) color = [187, 222, 251]
  else if (colorClass.includes("sky-100")) color = [225, 245, 254]
  else if (colorClass.includes("cyan-100")) color = [224, 247, 250]
  // Yellow/Orange variants
  else if (colorClass.includes("yellow-100")) color = [255, 249, 196]
  else if (colorClass.includes("yellow-200")) color = [255, 245, 157]
  else if (colorClass.includes("amber-100")) color = [255, 236, 179]
  else if (colorClass.includes("orange-100")) color = [255, 224, 178]
  // Purple variants
  else if (colorClass.includes("purple-100")) color = [237, 231, 246]
  else if (colorClass.includes("purple-200")) color = [225, 190, 231]
  else if (colorClass.includes("violet-100")) color = [237, 231, 246]
  else if (colorClass.includes("fuchsia-100")) color = [240, 219, 240]
  // Gray variants
  else if (colorClass.includes("gray-100")) color = [245, 245, 245]
  else if (colorClass.includes("gray-200")) color = [238, 238, 238]
  else if (colorClass.includes("slate-100")) color = [241, 245, 249]
  else if (colorClass.includes("zinc-100")) color = [244, 244, 245]
  else if (colorClass.includes("stone-100")) color = [245, 245, 244]

  return color
}

// Create a styled header for the PDF
export const addPDFHeader = (doc: jsPDF, title: string, subtitle?: string) => {
  // Add title
  doc.setFontSize(18)
  doc.setTextColor(44, 62, 80)
  doc.text(title, 14, 15)

  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.text(subtitle, 14, 22)
  }

  // Add a subtle divider line
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(14, 24, doc.internal.pageSize.width - 14, 24)

  return 28 // Return the Y position after the header
}

// Add a section title to the PDF
export const addPDFSectionTitle = (doc: jsPDF, title: string, yPosition: number) => {
  doc.setFontSize(14)
  doc.setTextColor(44, 62, 80)
  doc.text(title, 14, yPosition)

  return yPosition + 3 // Return the Y position after the title
}

// Add a footer to all pages of the PDF
export const addPDFFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    const today = new Date().toLocaleDateString("en-GB")
    doc.text(`Generated on ${today} | Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10)
  }
}

// Format attendance data for PDF export
export const formatAttendanceDataForPDF = (
  parsedAttendance: any[],
  legend: Record<string, { label: string; color: string }>,
) => {
  // Prepare table headers
  const headers = [
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

  // Prepare table data
  const tableData = parsedAttendance.map((week) => {
    return [formatToUKDisplayDate(new Date(week.weekStart)), ...week.weekMarks]
  })

  return { headers, tableData }
}
