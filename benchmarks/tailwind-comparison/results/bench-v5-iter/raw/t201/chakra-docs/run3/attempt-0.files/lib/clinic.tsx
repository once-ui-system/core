"use client"

import * as React from "react"
import {
  APPOINTMENTS,
  CLOSE_MIN,
  START_NOW_MIN,
  findClash,
  getPatient,
  minToHHMM,
  toMin,
  type Appointment,
  type Status,
} from "./data"

export interface BookingInput {
  patient: string
  vet: string
  start: string
  minutes: number
  reason: string
  urgent: boolean
}

export type BookResult = { ok: true; appointment: Appointment } | { ok: false; error: string }

interface ClinicState {
  appointments: Appointment[]
  nowMin: number
  highlightId: string | null
  bookingOpen: boolean
  bookingPatient: string | undefined
  checkIn: (id: string) => void
  setStatus: (id: string, status: Status) => void
  book: (input: BookingInput) => BookResult
  openBooking: (patientId?: string) => void
  closeBooking: () => void
}

const ClinicContext = React.createContext<ClinicState | null>(null)

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = React.useState<Appointment[]>(APPOINTMENTS)
  const [nowMin, setNowMin] = React.useState(START_NOW_MIN)
  const [highlightId, setHighlightId] = React.useState<string | null>(null)
  const [bookingOpen, setBookingOpen] = React.useState(false)
  const [bookingPatient, setBookingPatient] = React.useState<string | undefined>(undefined)
  const nowRef = React.useRef(nowMin)
  const apptsRef = React.useRef(appointments)

  React.useEffect(() => {
    nowRef.current = nowMin
  }, [nowMin])
  React.useEffect(() => {
    apptsRef.current = appointments
  }, [appointments])

  // The desk clock runs one clinic minute per real minute from 9:40 AM.
  React.useEffect(() => {
    const t = window.setInterval(() => setNowMin((n) => n + 1), 60000)
    return () => window.clearInterval(t)
  }, [])

  React.useEffect(() => {
    if (!highlightId) return
    const t = window.setTimeout(() => setHighlightId(null), 6000)
    return () => window.clearTimeout(t)
  }, [highlightId])

  const checkIn = React.useCallback((id: string) => {
    setAppointments((list) =>
      list.map((a) =>
        a.id === id && a.status === "booked"
          ? { ...a, status: "checked_in" as Status, checkedInAt: nowRef.current }
          : a,
      ),
    )
  }, [])

  const setStatus = React.useCallback((id: string, status: Status) => {
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, status } : a)))
  }, [])

  const book = React.useCallback((input: BookingInput): BookResult => {
    const patient = getPatient(input.patient)
    if (!patient) return { ok: false, error: "Pick a patient first." }
    const startM = toMin(input.start)
    if (startM + input.minutes > CLOSE_MIN) {
      return { ok: false, error: "That visit would run past closing time." }
    }
    const clash = findClash(apptsRef.current, input.vet, startM, input.minutes)
    if (clash) {
      return { ok: false, error: "That vet already has a booking in this time." }
    }
    const appointment: Appointment = {
      id: `a-${String(apptsRef.current.length + 1).padStart(2, "0")}`,
      patient: input.patient,
      vet: input.vet,
      start: minToHHMM(startM),
      minutes: input.minutes,
      reason: input.reason.trim(),
      status: "booked",
      ...(input.urgent ? { urgent: true } : {}),
    }
    apptsRef.current = [...apptsRef.current, appointment]
    setAppointments(apptsRef.current)
    setHighlightId(appointment.id)
    return { ok: true, appointment }
  }, [])

  const openBooking = React.useCallback((patientId?: string) => {
    setBookingPatient(patientId)
    setBookingOpen(true)
  }, [])
  const closeBooking = React.useCallback(() => setBookingOpen(false), [])

  const value = React.useMemo<ClinicState>(
    () => ({
      appointments,
      nowMin,
      highlightId,
      bookingOpen,
      bookingPatient,
      checkIn,
      setStatus,
      book,
      openBooking,
      closeBooking,
    }),
    [appointments, nowMin, highlightId, bookingOpen, bookingPatient, checkIn, setStatus, book, openBooking, closeBooking],
  )

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>
}

export function useClinic(): ClinicState {
  const ctx = React.useContext(ClinicContext)
  if (!ctx) throw new Error("useClinic must be used inside ClinicProvider")
  return ctx
}
