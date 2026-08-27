"use client"

import { useState } from "react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

type Event = {
  id: string
  title: string
  date: Date
  color?: string
}

const events: Event[] = [
  {
    id: "1",
    title: "Client Meeting",
    date: new Date(2026, 7, 18),
    color: "bg-blue-500",
  },
  {
    id: "2",
    title: "Court Deadline",
    date: new Date(2026, 7, 20),
    color: "bg-red-500",
  },
  {
    id: "3",
    title: "Document Review",
    date: new Date(2026, 7, 20),
    color: "bg-green-500",
  },
]

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export default function EventCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const selectedEvents = events.filter((event) =>
    isSameDay(event.date, selectedDate)
  )

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
                          <h1 className="text-[0.6rem]">{event.title}</h1>{" "}
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

      {/* Events */}
      <div className="w-full border-t pt-4 md:w-80 md:border-t-0 md:border-l md:pt-0 md:pl-6">
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
                className="flex items-start gap-3 rounded-lg border p-3"
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
      </div>
    </div>
  )
}
