"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  APPOINTMENTS,
  START_CLOCK,
  endTime,
  findConflict,
  formatClock,
  fromMinutes,
  patientById,
  toMinutes,
  vetById,
  type Appointment,
  type Status,
} from "@/lib/data"

export interface BookInput {
  patientId: string
  vetId: string
  start: string
  minutes: number
  reason: string
  urgent: boolean
}
export type BookResult = { ok: true; appointment: Appointment } | { ok: false; error: string }

interface ScheduleValue {
  appointments: Appointment[]
  /** Minutes since midnight on the front-desk clock. */
  now: number
  checkIn: (id: string) => void
  setStatus: (id: string, status: Status) => void
  book: (input: BookInput) => BookResult
}

const ScheduleContext = createContext<ScheduleValue | null>(null)

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS)
  const [now, setNow] = useState(() => toMinutes(START_CLOCK))

  useEffect(() => {
    const id = window.setInterval(() => setNow((n) => n + 1), 60000)
    return () => window.clearInterval(id)
  }, [])

  const setStatus = useCallback(
    (id: string, status: Status) => {
      setAppointments((list) =>
        list.map((a) =>
          a.id === id
            ? { ...a, status, checkedInAt: status === "checked_in" ? fromMinutes(now) : a.checkedInAt }
            : a,
        ),
      )
    },
    [now],
  )
  const checkIn = useCallback((id: string) => setStatus(id, "checked_in"), [setStatus])

  const book = useCallback(
    (input: BookInput): BookResult => {
      const start = toMinutes(input.start)
      const conflict = findConflict(appointments, input.vetId, start, input.minutes)
      if (conflict) {
        return {
          ok: false,
          error: `${vetById(input.vetId).name} is already booked ${formatClock(conflict.start)} to ${formatClock(endTime(conflict))} with ${patientById(conflict.patient).name}.`,
        }
      }
      const appointment: Appointment = {
        id: `a-${String(appointments.length + 1).padStart(2, "0")}`,
        patient: input.patientId,
        vet: input.vetId,
        start: input.start,
        minutes: input.minutes,
        reason: input.reason.trim(),
        status: "booked",
        urgent: input.urgent || undefined,
      }
      setAppointments((list) => [...list, appointment])
      return { ok: true, appointment }
    },
    [appointments],
  )

  const value = useMemo(
    () => ({ appointments, now, checkIn, setStatus, book }),
    [appointments, now, checkIn, setStatus, book],
  )
  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>
}

export function useSchedule(): ScheduleValue {
  const ctx = useContext(ScheduleContext)
  if (!ctx) throw new Error("useSchedule must be used inside ScheduleProvider")
  return ctx
}
