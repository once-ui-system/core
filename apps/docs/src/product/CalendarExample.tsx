"use client";

import { Button, Column, Dialog, Row, Tag, Text } from "@once-ui-system/core";
import { Calendar, type CalendarEvent, type CalendarView } from "@once-ui-system/core/calendar";
import { useMemo, useState } from "react";

// A fixed week of studio bookings, placed round today so the example always has something to show.
function demoEvents(today: Date): CalendarEvent[] {
  const day = (offset: number, hour: number, minute = 0) =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  return [
    {
      id: "1",
      title: "Brand workshop",
      start: day(0, 9),
      end: day(0, 11),
      description: "Studio A",
    },
    { id: "2", title: "Client call", start: day(0, 10), end: day(0, 10, 45), tone: "accent" },
    {
      id: "3",
      title: "Photo shoot",
      start: day(1, 13),
      end: day(1, 17),
      tone: "success",
      description: "Loft",
    },
    { id: "4", title: "Invoice run", start: day(2, 16), end: day(2, 16, 30), tone: "warning" },
    { id: "5", title: "Design review", start: day(-1, 14), end: day(-1, 15, 30) },
    { id: "6", title: "Offsite", start: day(3, 0), end: day(5, 0), allDay: true, tone: "info" },
    { id: "7", title: "Deadline", start: day(4, 17), end: day(4, 17, 15), tone: "danger" },
  ];
}

export function CalendarExample({ defaultView = "week" }: { defaultView?: CalendarView }) {
  const today = useMemo(() => new Date(), []);
  const [events, setEvents] = useState(() => demoEvents(today));
  const [open, setOpen] = useState<CalendarEvent | null>(null);

  return (
    <Column fillWidth gap="16">
      <Calendar
        events={events}
        defaultView={defaultView}
        dayStartHour={7}
        dayEndHour={21}
        scrollToHour={8}
        height="28rem"
        onEventSelect={setOpen}
        onSlotSelect={(slot) =>
          setEvents((list) => [
            ...list,
            {
              id: crypto.randomUUID(),
              title: "New booking",
              start: slot.start,
              end: slot.end,
              allDay: slot.allDay,
            },
          ])
        }
        onEventChange={({ event, start, end }) =>
          setEvents((list) =>
            list.map((item) => (item.id === event.id ? { ...item, start, end } : item)),
          )
        }
      />
      <Dialog open={Boolean(open)} onClose={() => setOpen(null)} title={open?.title ?? ""}>
        {open && (
          <Column gap="12">
            <Text onBackground="neutral-medium">
              {open.start.toLocaleString()} – {open.end.toLocaleTimeString()}
            </Text>
            {open.description && <Tag label={open.description} />}
            <Row horizontal="end">
              <Button
                variant="secondary"
                label="Remove"
                onClick={() => {
                  setEvents((list) => list.filter((item) => item.id !== open.id));
                  setOpen(null);
                }}
              />
            </Row>
          </Column>
        )}
      </Dialog>
    </Column>
  );
}
