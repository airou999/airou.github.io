"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle, Info } from "lucide-react"
import { formatToUKDisplayDate, parseISODate } from "@/utils/date-utils"
import { motion } from "framer-motion"

export interface Anomaly {
  type: "error" | "warning" | "info"
  message: string
  details: string
  date?: string
  symbol?: string
  suggestion?: string
}

interface AnomalyReportProps {
  anomalies: Anomaly[]
}

const AnomalyReport: React.FC<AnomalyReportProps> = ({ anomalies }) => {
  if (!anomalies.length) {
    return (
      <Card className="w-full mb-8">
        <CardHeader>
          <CardTitle>Anomaly Report</CardTitle>
          <CardDescription>Analysis of potential issues in attendance data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-500/10 border-green-500/20">
            <Info className="h-4 w-4 text-green-500" />
            <AlertTitle>No anomalies detected</AlertTitle>
            <AlertDescription>
              Your attendance data appears to be consistent and free of common issues.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Count anomalies by type
  const errorCount = anomalies.filter((a) => a.type === "error").length
  const warningCount = anomalies.filter((a) => a.type === "warning").length
  const infoCount = anomalies.filter((a) => a.type === "info").length

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Anomaly Report</CardTitle>
            <CardDescription>Analysis of potential issues in attendance data</CardDescription>
          </div>
          <div className="flex gap-2">
            {errorCount > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errorCount} {errorCount === 1 ? "Error" : "Errors"}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="default" className="bg-yellow-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {warningCount} {warningCount === 1 ? "Warning" : "Warnings"}
              </Badge>
            )}
            {infoCount > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                {infoCount} {infoCount === 1 ? "Notice" : "Notices"}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {anomalies.map((anomaly, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Alert
              variant={anomaly.type === "error" ? "destructive" : anomaly.type === "warning" ? "default" : "outline"}
              className={
                anomaly.type === "warning"
                  ? "bg-yellow-500/10 border-yellow-500/20"
                  : anomaly.type === "info"
                    ? "bg-blue-500/10 border-blue-500/20"
                    : ""
              }
            >
              {anomaly.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : anomaly.type === "warning" ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <Info className="h-4 w-4 text-blue-500" />
              )}
              <AlertTitle>{anomaly.message}</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-2 text-sm">
                  <p>{anomaly.details}</p>
                  {anomaly.date && (
                    <p>
                      <span className="font-medium">Date:</span> {formatToUKDisplayDate(parseISODate(anomaly.date))}
                    </p>
                  )}
                  {anomaly.symbol && (
                    <p>
                      <span className="font-medium">Symbol:</span> {anomaly.symbol}
                    </p>
                  )}
                  {anomaly.suggestion && (
                    <p className="text-muted-foreground italic">Suggestion: {anomaly.suggestion}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

export default AnomalyReport
