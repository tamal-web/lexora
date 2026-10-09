"use client"

import { useState, useEffect } from "react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

type ApiDeadline = {
  id: string
  title: string
  due_date: string
  status: string
  priority: string
  action_type: string
  matter_id: string
  description?: string
  matter_title?: string
  matter_number?: string
}

type Event = {
  id: string
  title: string
  date: Date
  color: string
  raw: ApiDeadline
}

function getEventColor(status: string, priority: string) {
  if (priority === "CRITICAL") return "bg-red-600"
  switch (status) {
    case "OVERDUE":
      return "bg-red-500"
    case "DUE_SOON":
      return "bg-amber-500"
    case "COMPLETED":
      return "bg-emerald-500"
    case "DOCKETED":
      return "bg-blue-500"
    default:
      return "bg-gray-400"
  }
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export default function EventCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [eventDetails, setEventDetails] = useState<ApiDeadline | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    async function fetchDeadlines() {
      try {
        setLoading(true)
        const res = await fetch("http://localhost:8000/api/deadlines", { cache: "no-store" })
        const data: ApiDeadline[] = await res.json()
        const mapped = data.map((d) => ({
          id: d.id,
          title: d.title,
          date: new Date(d.due_date),
          color: getEventColor(d.status, d.priority),
          raw: d,
        }))
        setEvents(mapped)
      } catch (err) {
        console.error("Failed to fetch deadlines:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDeadlines()
  }, [])

  const handleEventClick = async (event: Event) => {
    setSelectedEventId(event.id)
    setEventDetails(event.raw) // show initial immediately
    setLoadingDetails(true)
    try {
      const res = await fetch(`http://localhost:8000/api/deadlines/${event.id}`)
      if (res.ok) {
        const fullData = await res.json()
        setEventDetails(fullData)
      }
    } catch (err) {
      console.error("Failed to fetch deadline details:", err)
    } finally {
      setLoadingDetails(false)
    }
  }

  const selectedEvents = events.filter((event) =>
    isSameDay(event.date, selectedDate)
  )

  if (loading) {
    return (
      <div className="m-0 flex flex-col gap-6 rounded-xl border-none bg-background p-4 md:flex-row min-h-[500px] animate-pulse">
        <div className="flex-1 bg-muted rounded-xl"></div>
        <div className="w-full md:w-80 bg-muted rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="m-0 flex flex-col gap-6 rounded-xl border-none bg-background p-4 md:flex-row">
      {/* Calendar */}
      <div className="flex-1">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) setSelectedDate(date)
          }}
          className="w-ful border-collapse gap-y-0"
          components={{
            DayButton: ({ day, modifiers, ...props }) => {
              const dayEvents = events.filter((event) =>
                isSameDay(event.date, day.date)
              )

              return (
                <CalendarDayButton
                  day={day}
                  modifiers={modifiers}
                  {...props}
                  className={cn(
                    "py- h-full!- relative mt-0! flex h-24 w-26 flex-col items-center justify-between rounded-none border-t border-r border-border",
                    props.className
                  )}
                >
                  {
                    <div className="absolut bottom- flex flex-col gap-0.5 p-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="flex flex-row items-center rounded-[0.25rem] border p-[0.4rem]"
                        >
                          <h1 className="text-[0.6rem]">{event.title}</h1>
                        </div>
                      ))}
                    </div>
                  }
                  <div className="flex w-full flex-row items-center justify-end p-2">
                    <span className="">{day.date.getDate()}</span>
                  </div>
                </CalendarDayButton>
              )
            },
          }}
        />
      </div>

      {/* Events / Details Panel */}
      <div className="w-full border-t pt-4 md:w-80 md:border-t-0 md:border-l md:pt-0 md:pl-6 relative">
        {selectedEventId && eventDetails ? (
          <div className="flex flex-col h-full bg-background animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Event Details</h3>
              <button 
                onClick={() => setSelectedEventId(null)}
                className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold leading-tight">{eventDetails.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Due: {new Date(eventDetails.due_date).toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={cn(
                  "px-2.5 py-0.5 text-xs font-semibold text-white rounded-full", 
                  getEventColor(eventDetails.status, '')
                )}>
                  {eventDetails.status}
                </span>
                <span className={cn(
                  "px-2.5 py-0.5 text-xs font-semibold text-white rounded-full",
                  eventDetails.priority === "CRITICAL" ? "bg-red-600" : "bg-gray-500"
                )}>
                  {eventDetails.priority}
                </span>
              </div>

              <div className="text-sm space-y-2 pt-2">
                <p>
                  <span className="font-medium text-muted-foreground">Action Type:</span><br/>
                  {eventDetails.action_type}
                </p>
                <p>
                  <span className="font-medium text-muted-foreground">Matter:</span><br/>
                  {eventDetails.matter_title || eventDetails.matter_id}
                  {eventDetails.matter_number ? ` (${eventDetails.matter_number})` : ''}
                </p>
              </div>

              {eventDetails.description && (
                <div className="text-sm pt-2">
                  <p className="font-medium text-muted-foreground mb-1">Description:</p>
                  <p className="whitespace-pre-wrap">{eventDetails.description}</p>
                </div>
              )}
              
              {loadingDetails && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse mt-4 pt-4 border-t">
                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin"/>
                  Loading additional details...
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="font-semibold">
                {selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h2>

              <p className="text-sm text-muted-foreground">
                {selectedEvents.length}{" "}
                {selectedEvents.length === 1 ? "event" : "events"}
              </p>
            </div>

            <div className="space-y-3">
              {selectedEvents.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No events scheduled
                </div>
              ) : (
                selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                        event.color || "bg-primary"
                      )}
                    />

                    <div>
                      <p className="text-sm font-medium">{event.title}</p>

                      <p className="text-xs text-muted-foreground">
                        {event.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
