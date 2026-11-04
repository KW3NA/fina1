"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Briefcase, Plus, MapPin, Clock, Users } from "lucide-react"

type Participant = {
  id: string
  name: string
  email?: string
}

type EventItem = {
  id: string
  title: string
  date: string
  time?: string
  location: string
  description?: string
  participants: Participant[]
}

type JobItem = {
  id: string
  title: string
  company: string
  location: string
  type: "full-time" | "part-time" | "contract" | "internship"
  description?: string
  participants: Participant[]
}

export default function OpportunitiesPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [jobs, setJobs] = useState<JobItem[]>([])

  const [newEvent, setNewEvent] = useState<Partial<EventItem>>({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
  })

  const [newJob, setNewJob] = useState<Partial<JobItem>>({
    title: "",
    company: "",
    location: "",
    type: "full-time",
    description: "",
  })

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location) return
    setEvents(prev => [
      { id: Date.now().toString(), title: newEvent.title!, date: newEvent.date!, time: newEvent.time, location: newEvent.location!, description: newEvent.description, participants: [] },
      ...prev,
    ])
    setNewEvent({ title: "", date: "", time: "", location: "", description: "" })
  }

  const addJob = () => {
    if (!newJob.title || !newJob.company || !newJob.location) return
    setJobs(prev => [
      { id: Date.now().toString(), title: newJob.title!, company: newJob.company!, location: newJob.location!, type: newJob.type as any, description: newJob.description, participants: [] },
      ...prev,
    ])
    setNewJob({ title: "", company: "", location: "", type: "full-time", description: "" })
  }

  const removeEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id))
  const removeJob = (id: string) => setJobs(prev => prev.filter(j => j.id !== id))

  // Detail dialogs
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Opportunities</h1>
      </div>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="jobs">Job Offers</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Create Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={newEvent.title} onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))} placeholder="Event title" />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={newEvent.date} onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" value={newEvent.time} onChange={e => setNewEvent(prev => ({ ...prev, time: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={newEvent.location} onChange={e => setNewEvent(prev => ({ ...prev, location: e.target.value }))} placeholder="City, Venue or Online" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={newEvent.description} onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))} placeholder="What is this event about?" rows={3} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={addEvent} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Event
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(event => (
              <Card key={event.id} className="border cursor-pointer" onClick={() => setSelectedEvent(event)}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {event.title}
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {event.participants.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {event.date} {event.time && (<span className="ml-1">• {event.time}</span>)}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.location}</div>
                  {event.description && (<p className="text-muted-foreground line-clamp-3">{event.description}</p>)}
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => removeEvent(event.id)}>Remove</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" /> Create Job Offer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input value={newJob.title} onChange={e => setNewJob(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g., Frontend Developer" />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={newJob.company} onChange={e => setNewJob(prev => ({ ...prev, company: e.target.value }))} placeholder="Company name" />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={newJob.location} onChange={e => setNewJob(prev => ({ ...prev, location: e.target.value }))} placeholder="City / Remote" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    className="border rounded px-3 py-2 text-sm"
                    value={newJob.type}
                    onChange={e => setNewJob(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={newJob.description} onChange={e => setNewJob(prev => ({ ...prev, description: e.target.value }))} placeholder="Role responsibilities, requirements, etc." rows={3} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Apply Link</Label>
                  <Input value={newJob.applyLink} onChange={e => setNewJob(prev => ({ ...prev, applyLink: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={addJob} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Job
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map(job => (
              <Card key={job.id} className="border cursor-pointer" onClick={() => setSelectedJob(job)}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {job.title}
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {job.participants.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {job.company}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.location} • {job.type}</div>
                  {job.description && (<p className="text-muted-foreground line-clamp-3">{job.description}</p>)}
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => removeJob(job.id)}>Remove</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {selectedEvent?.title}
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {selectedEvent?.participants.length}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {selectedEvent?.date} {selectedEvent?.time && (<span className="ml-1">• {selectedEvent?.time}</span>)}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {selectedEvent?.location}</div>
            {selectedEvent?.description && (<p className="text-muted-foreground">{selectedEvent.description}</p>)}
            <div className="pt-3">
              <h3 className="font-semibold mb-2">Participants</h3>
              {selectedEvent && selectedEvent.participants.length === 0 && (
                <p className="text-muted-foreground">No participants yet.</p>
              )}
              <ul className="list-disc pl-5 space-y-1">
                {selectedEvent?.participants.map(p => (
                  <li key={p.id}>{p.name}{p.email ? ` • ${p.email}` : ''}</li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Details Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {selectedJob?.title}
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {selectedJob?.participants.length}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {selectedJob?.company}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {selectedJob?.location} • {selectedJob?.type}</div>
            {selectedJob?.description && (<p className="text-muted-foreground">{selectedJob.description}</p>)}
            <div className="pt-3">
              <h3 className="font-semibold mb-2">Applicants</h3>
              {selectedJob && selectedJob.participants.length === 0 && (
                <p className="text-muted-foreground">No applicants yet.</p>
              )}
              <ul className="list-disc pl-5 space-y-1">
                {selectedJob?.participants.map(p => (
                  <li key={p.id}>{p.name}{p.email ? ` • ${p.email}` : ''}</li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


