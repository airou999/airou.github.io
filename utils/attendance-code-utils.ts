/**
 * Utility functions for attendance codes
 */

// Standard UK attendance codes and their descriptions
const ATTENDANCE_CODES: Record<string, string> = {
  // Present Marks
  "/": "Present AM",
  "\\": "Present PM",
  L: "Late (before registers closed) marked as present",

  // Authorised Absences
  C: "Absent due to other authorised circumstances",
  C1: "Leave for a regulated performance or employment abroad",
  C2: "Leave for part-time timetable (compulsory school age pupil)",
  E: "Excluded with no alternative provision made",
  I: "Illness (NOT appointments)",
  J1: "Attending interview for employment or another educational institution",
  M: "Medical/dental appointments",
  R: "Religious observance",
  S: "Study leave",
  T: "Traveller absence",

  // Approved Education Activities
  B: "Educated off site (NOT dual registration)",
  K: "Attending education provision arranged by the local authority",
  P: "Attending an approved sporting activity",
  V: "Away on an educational visit or trip",
  W: "Attending work experience",

  // Unauthorised Absences
  G: "Family holiday not agreed or days taken in excess",
  N: "Missed sessions for a reason not yet provided",
  O: "Unauthorised absence not covered by any other code",
  U: "Arrived after registers closed",

  // Other Codes
  D: "Dual registered (at another establishment)",
  X: "Not required to be in school (non-compulsory school age)",
  Y: "Unable to attend due to exceptional circumstances",
  Z: "Pupil not yet on roll",
  "#": "Planned whole or partial school closure",

  // Specific 'Unable to Attend' Reasons
  Q: "No access arrangements available",
  Y1: "Transport normally provided not available",
  Y2: "Widespread disruption to travel",
  Y3: "Part of the school premises closed",
  Y4: "Whole school site unexpectedly closed",
  Y5: "In criminal justice detention",
  Y6: "In accordance with public health guidance or law",
  Y7: "Any other unavoidable cause",
}

// Get the standard description for an attendance code
export function getCodeDescription(code: string): string | undefined {
  return ATTENDANCE_CODES[code]
}

// Get the category for an attendance code
export function getCodeCategory(code: string): string {
  if (code === "/" || code === "\\" || code === "L") {
    return "Present"
  } else if (["C", "C1", "C2", "E", "I", "J1", "M", "R", "S", "T"].includes(code)) {
    return "Authorised Absence"
  } else if (["B", "K", "P", "V", "W"].includes(code)) {
    return "Approved Education Activity"
  } else if (["G", "N", "O", "U"].includes(code)) {
    return "Unauthorised Absence"
  } else if (["D", "X", "Y", "Z", "#"].includes(code)) {
    return "Other"
  } else if (["Q", "Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"].includes(code)) {
    return "Unable to Attend"
  } else {
    return "Custom"
  }
}

// Get color class for a code category
export function getCategoryColorClass(category: string): string {
  switch (category) {
    case "Present":
      return "bg-green-100"
    case "Authorised Absence":
      return "bg-blue-100"
    case "Approved Education Activity":
      return "bg-yellow-100"
    case "Unauthorised Absence":
      return "bg-red-100"
    case "Other":
      return "bg-gray-100"
    case "Unable to Attend":
      return "bg-orange-100"
    default:
      return "bg-purple-100"
  }
}

// Get suggested color for a code
export function getSuggestedColorForCode(code: string): string {
  const category = getCodeCategory(code)
  return getCategoryColorClass(category)
}

// Group codes by category
export function getCodesByCategory(): Record<string, Record<string, string>> {
  const categories: Record<string, Record<string, string>> = {
    Present: {},
    "Authorised Absence": {},
    "Approved Education Activity": {},
    "Unauthorised Absence": {},
    Other: {},
    "Unable to Attend": {},
  }

  Object.entries(ATTENDANCE_CODES).forEach(([code, description]) => {
    const category = getCodeCategory(code)
    categories[category][code] = description
  })

  return categories
}
