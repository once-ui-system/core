"use client"

import * as React from "react"
import {
  type Appointment,
  INITIAL_APPOINTMENTS,
  START_NOW,
  findClash,
} from "./data"

interface NewBooking {
  patient: string
  vet: string
  start: string
  minutes: number
  reason: string
  urgent?: boolean
}

interface ClinicStore {
  appointments: Appointment[]
  now: number
  checkIn: (id: string) => void
  book: (b: NewBooking) => { ok: true; id: string } | { ok: false; clashWith: Appointment }
}

const Ctx = React.createContext<ClinicStore | null>(null)

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = React.useState<Appointment[]>(INITIAL_APPOINTMENTS)
  const [now, setNow] = React.useState(START_NOW)

  // The desk clock advances a minute at a time so waiting times keep moving.
  React.useEffect(() => {
    const t = window.setInterval(() => setNow((n) => n + 1), 60_000)
    return () => window.clearInterval(t)
  }, [])

  const nowRef = React.useRef(now)
  nowRef.current = now
  const apptsRef = React.useRef(appointments)
  apptsRef.current = appointments

  const checkIn = React.useCallback((id: string) => {
    setAppointments((list) =>
      list.map((a) =>
        a.id === id && a.status === "booked"
          ? { ...a, status: "checked_in", checkedInAt: nowRef.current }
          : a,
      ),
    )
  }, [])

  const book = React.useCallback<ClinicStore["book"]>((b) => {
    const clash = findClash(apptsRef.current, b.vet, b.start, b.minutes)
    if (clash) return { ok: false, clashWith: clash }
    const id = `a-${String(apptsRef.current.length + 1).padStart(2, "0")}`
    setAppointments((list) => [...list, { id, ...b, status: "booked" }])
    return { ok: true, id }
  }, [])

  const value = React.useMemo(
    () => ({ appointments, now, checkIn, book }),
    [appointments, now, checkIn, book],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useClinic() {
  const v = React.useContext(Ctx)
  if (!v) throw new Error("useClinic must be used inside ClinicProvider")
  return v
}
