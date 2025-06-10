"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

const AttendanceParser = dynamic(() => import("../../components/AttendanceParser"), {
  ssr: false,
})

export default function AttendancePage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading attendance tracker...</span>
          </div>
        }
      >
        <AttendanceParser />
      </Suspense>
    </main>
  )
}
