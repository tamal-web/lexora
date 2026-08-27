"use client"

import * as React from "react"
import { isSameDay, parseISO } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"

// 1. Define your structure for events
export interface CalendarEvent {
  id: string
  title: string
  date: string // Use ISO format string (YYYY-MM-DD)
  color?: "default" | "destructive" | "outline" | "secondary"
}

interface EventCalendarProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
}

export function EventCalendar({ events, onEventClick }: EventCalendarProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  // 2. Custom day renderer to display event dots
  const customComponents = {
    Day: (props: any) => {
      const { day } = props

      // Find events matching this day
      const dayEvents = events.filter((event) =>
        isSameDay(parseISO(event.date), day.date)
      )

      return (
        <div className="relative flex h-full w-full flex-col items-center justify-center">
          {/* Default Day Render button structure */}
          <button {...props} className={`${props.className} relative`} />

          {/* Render event indicator dots below/inside the date cell */}
          {dayEvents.length > 0 && (
            <div className="pointer-events-none absolute bottom-1 flex justify-center gap-0.5">
              {dayEvents.slice(0, 3).map((event) => (
                <span
                  key={event.id}
                  className={`h-1.5 w-1.5 rounded-full ${event.color === "destructive"
                    ? "bg-destructive"
                    : event.color === "secondary"
                      ? "bg-secondary-foreground"
                      : "bg-primary"
                    }`}
                />
              ))}
            </div>
          )}
        </div>
      )
    },
  }

  // 3. Extract events specifically for the actively selected date
  const selectedDayEvents = React.useMemo(() => {
    if (!date) return []
    return events.filter((event) => isSameDay(parseISO(event.date), date))
  }, [date, events])

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-xl border bg-background p-4 shadow-sm md:flex-row">
      {/* Calendar Area */}
      <div className="flex items-start justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border shadow"
          components={customComponents}
        />
      </div>

      {/* Side Agenda View */}
      <div className="flex-1 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Agenda</h3>
          <p className="text-sm text-muted-foreground">
            {date ? date.toDateString() : "Select a day"}
          </p>
        </div>

        <div className="max-h-[250px] space-y-2 overflow-y-auto pr-2">
          {selectedDayEvents.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground italic">
              No events scheduled for this day.
            </p>
          ) : (
            selectedDayEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className={`rounded-lg border p-3 text-sm transition-colors ${onEventClick ? "cursor-pointer hover:bg-accent" : ""
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">
                    {event.title}
                  </span>
                  {event.color && (
                    <Badge variant={event.color} className="capitalize">
                      {event.color}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
