"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, AlertTriangle, Clock, X, Info } from "lucide-react"

const AttendanceCodeReference = () => {
  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle>Attendance Code Reference</CardTitle>
        <CardDescription>Standard UK school attendance codes and their meanings</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="present" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full">
            <TabsTrigger value="present" className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>Present</span>
            </TabsTrigger>
            <TabsTrigger value="authorised" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-green-500" />
              <span>Authorised</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span>Approved</span>
            </TabsTrigger>
            <TabsTrigger value="unauthorised" className="flex items-center gap-1">
              <X className="h-4 w-4 text-red-500" />
              <span>Unauthorised</span>
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center gap-1">
              <Info className="h-4 w-4 text-blue-500" />
              <span>Other</span>
            </TabsTrigger>
            <TabsTrigger value="unable" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>Unable</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="present">
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                    <Check className="h-3 w-3 mr-1" />
                    Present
                  </Badge>
                  Present Marks
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono font-bold">/</TableCell>
                    <TableCell>Present AM</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">\</TableCell>
                    <TableCell>Present PM</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">L</TableCell>
                    <TableCell>Late (before registers closed) marked as present</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="authorised">
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Authorised
                  </Badge>
                  Authorised Absences
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono font-bold">C</TableCell>
                    <TableCell>Absent due to other authorised circumstances</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">C1</TableCell>
                    <TableCell>Leave for a regulated performance or employment abroad</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">C2</TableCell>
                    <TableCell>Leave for part-time timetable (compulsory school age pupil)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">E</TableCell>
                    <TableCell>Excluded with no alternative provision made</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">I</TableCell>
                    <TableCell>Illness (NOT appointments)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">J1</TableCell>
                    <TableCell>Attending interview for employment or another educational institution</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">M</TableCell>
                    <TableCell>Medical/dental appointments</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">R</TableCell>
                    <TableCell>Religious observance</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">S</TableCell>
                    <TableCell>Study leave</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">T</TableCell>
                    <TableCell>Traveller absence</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="approved">
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    <Clock className="h-3 w-3 mr-1" />
                    Approved
                  </Badge>
                  Approved Education Activities
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono font-bold">B</TableCell>
                    <TableCell>Educated off site (NOT dual registration)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">K</TableCell>
                    <TableCell>Attending education provision arranged by the local authority</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">P</TableCell>
                    <TableCell>Attending an approved sporting activity</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">V</TableCell>
                    <TableCell>Away on an educational visit or trip</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">W</TableCell>
                    <TableCell>Attending work experience</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="unauthorised">
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                    <X className="h-3 w-3 mr-1" />
                    Unauthorised
                  </Badge>
                  Unauthorised Absences
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono font-bold">G</TableCell>
                    <TableCell>Family holiday not agreed or days taken in excess</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">N</TableCell>
                    <TableCell>Missed sessions for a reason not yet provided</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">O</TableCell>
                    <TableCell>Unauthorised absence not covered by any other code</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">U</TableCell>
                    <TableCell>Arrived after registers closed</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="other">
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    <Info className="h-3 w-3 mr-1" />
                    Other
                  </Badge>
                  Other Codes (Not counted in attendance stats)
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono font-bold">D</TableCell>
                    <TableCell>Dual registered (at another establishment)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">X</TableCell>
                    <TableCell>Not required to be in school (non-compulsory school age)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">Y</TableCell>
                    <TableCell>Unable to attend due to exceptional circumstances</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">Z</TableCell>
                    <TableCell>Pupil not yet on roll</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">#</TableCell>
                    <TableCell>Planned whole or partial school closure</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="unable">
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Unable
                  </Badge>
                  Specific 'Unable to Attend' Reasons
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono font-bold">Q</TableCell>
                    <TableCell>No access arrangements available</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">Y1</TableCell>
                    <TableCell>Transport normally provided not available</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">Y2</TableCell>
                    <TableCell>Widespread disruption to travel</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">Y3</TableCell>
                    <TableCell>Part of the school premises closed</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">Y4</TableCell>
                    <TableCell>Whole school site unexpectedly closed</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">Y5</TableCell>
                    <TableCell>In criminal justice detention</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">Y6</TableCell>
                    <TableCell>In accordance with public health guidance or law</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold">Y7</TableCell>
                    <TableCell>Any other unavoidable cause</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default AttendanceCodeReference
