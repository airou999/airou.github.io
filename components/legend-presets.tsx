"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export interface LegendItem {
  label: string
  color: string
}

export interface Legend {
  [key: string]: LegendItem
}

interface LegendPreset {
  name: string
  description: string
  legend: Legend
}

const presets: LegendPreset[] = [
  {
    name: "Standard Attendance",
    description: "Basic attendance tracking with present, absent, and half-day",
    legend: {
      P: { label: "Present", color: "bg-green-100" },
      A: { label: "Absent", color: "bg-red-100" },
      H: { label: "Half Day", color: "bg-yellow-100" },
      L: { label: "Late", color: "bg-orange-100" },
      E: { label: "Excused", color: "bg-blue-100" },
    },
  },
  {
    name: "AM/PM Tracking",
    description: "Track morning and afternoon attendance separately",
    legend: {
      "#": { label: "School Closed", color: "bg-gray-100" },
      "/": { label: "Morning Present", color: "bg-yellow-100" },
      "\\": { label: "Afternoon Present", color: "bg-blue-100" },
    },
  },
  {
    name: "Detailed Status",
    description: "Comprehensive tracking with multiple attendance states",
    legend: {
      P: { label: "Present", color: "bg-green-100" },
      A: { label: "Absent", color: "bg-red-100" },
      L: { label: "Late", color: "bg-orange-100" },
      E: { label: "Excused", color: "bg-blue-100" },
      S: { label: "Sick", color: "bg-purple-100" },
      V: { label: "Virtual", color: "bg-cyan-100" },
      H: { label: "Holiday", color: "bg-gray-100" },
      F: { label: "Field Trip", color: "bg-emerald-100" },
    },
  },
  {
    name: "Simple Numeric",
    description: "Numeric codes for attendance status",
    legend: {
      "0": { label: "Absent", color: "bg-red-100" },
      "1": { label: "Present", color: "bg-green-100" },
      "2": { label: "Late", color: "bg-yellow-100" },
      "3": { label: "Excused", color: "bg-blue-100" },
      "9": { label: "Holiday", color: "bg-gray-100" },
    },
  },
]

interface LegendPresetsProps {
  onSelectPreset: (legend: Legend) => void
}

export function LegendPresets({ onSelectPreset }: LegendPresetsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Load Preset</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Legend Presets</DialogTitle>
          <DialogDescription>Choose a preset legend configuration or create your own custom legend.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="presets" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 gap-4">
                {presets.map((preset) => (
                  <Card key={preset.name} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle>{preset.name}</CardTitle>
                      <CardDescription>{preset.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(preset.legend).map(([symbol, item]) => (
                          <div
                            key={symbol}
                            className={`px-3 py-1.5 rounded-md border ${item.color} dark:bg-opacity-20 flex items-center gap-1.5`}
                          >
                            <Badge variant="outline" className="font-mono">
                              {symbol}
                            </Badge>
                            <span className="text-sm">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => onSelectPreset(preset.legend)}>
                        Use This Preset
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="custom" className="mt-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Custom legend presets will be available in a future update.</p>
              <p className="text-muted-foreground mt-2">
                For now, you can create and customize your legend in the settings tab.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" className="w-full sm:w-auto">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
