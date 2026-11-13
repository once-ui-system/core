"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  APPOINTMENTS,
  NOW,
  OWNERS,
  PATIENTS,
  STATUS_LABEL,
  TODAY,
  VETS,
  endTime,
  findClash,
  longDate,
  ownerOf,
  patientOf,
  toMinutes,
  toTime,
  vetOf,
  type Appointment,
  type Status,
} from "@/lib/data";
import { AlertBadges, WarnIcon } from "./Alerts";

const TIMES: string[] = [];
for (let m = 8 * 60; m < 18 * 60; m += 15) TIMES.push(toTime(m));
const LENGTHS = [15, 20, 30, 45, 60, 90];

function waitMinutes(a: Appointment): number {
  return Math.max(0, toMinutes(NOW) - toMinutes(a.checkedInAt ?? NOW));
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`pp-badge pp-st-${status}`}>
      <span className="pp-dot" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(APPOINTMENTS);
  const [vetFilter, setVetFilter] = useState<string>("all");
  const [notice, setNotice] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Booking form
  const formId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [patientId, setPatientId] = useState(PATIENTS[0].id);
  const [vetId, setVetId] = useState(VETS[0].id);
  const [time, setTime] = useState("10:00");
  const [minutes, setMinutes] = useState(20);
  const [reason, setReason] = useState("Follow-up visit");
  const [error, setError] = useState("");

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const sorted = useMemo(
    () =>
      [...appts].sort(
        (a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet),
      ),
    [appts],
  );
  const visible = sorted.filter((a) => vetFilter === "all" || a.vet === vetFilter);
  const waiting = appts
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => toMinutes(a.checkedInAt ?? NOW) - toMinutes(b.checkedInAt ?? NOW));
  const inExam = appts.filter((a) => a.status === "in_exam").length;
  const toCome = appts.filter((a) => a.status === "booked").length;
  const done = appts.filter((a) => a.status === "done").length;
  const activeTotal = appts.filter((a) => a.status !== "cancelled").length;
  const longest = waiting.length ? waitMinutes(waiting[0]) : 0;
  const nextUp = sorted.find((a) => a.status === "booked");

  function setStatus(a: Appointment, status: Status) {
    setAppts((list) =>
      list.map((x) =>
        x.id === a.id ? { ...x, status, checkedInAt: status === "checked_in" ? NOW : x.checkedInAt } : x,
      ),
    );
    const p = patientOf(a.patient);
    const msg: Record<string, string> = {
      checked_in: `${p?.name} is checked in and added to the waiting list.`,
      in_exam: `${p?.name} is now in the exam room.`,
      done: `${p?.name}'s visit is marked done.`,
    };
    setNotice(msg[status] ?? "");
    setFlash(a.id);
  }

  const clash = findClash(appts, vetId, time, minutes);
  function nextFree(): string | null {
    for (let m = toMinutes(time); m + minutes <= 18 * 60; m += 15) {
      if (!findClash(appts, vetId, toTime(m), minutes)) return toTime(m);
    }
    return null;
  }

  function openDialog() {
    setError("");
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = findClash(appts, vetId, time, minutes);
    if (c) {
      const cp = patientOf(c.patient);
      setError(
        `${vetOf(vetId)?.name} is already booked ${c.start} to ${endTime(c.start, c.minutes)} (${cp?.name}, ${c.reason}).`,
      );
      return;
    }
    const id = `a-${String(appts.length + 1).padStart(2, "0")}-new`;
    setAppts((list) => [
      ...list,
      { id, patient: patientId, vet: vetId, start: time, minutes, reason: reason.trim() || "Visit", status: "booked" },
    ]);
    setNotice(`Booked ${patientOf(patientId)?.name} with ${vetOf(vetId)?.name} at ${time}.`);
    setFlash(id);
    setOpen(false);
  }

  const chosen = patientOf(patientId);
  const suggestion = clash ? nextFree() : null;

  return (
    <>
      <div className="pp-title-row">
        <div>
          <h1 className="pp-h1">Today’s schedule</h1>
          <p className="pp-sub">
            {longDate(TODAY)} · It is {NOW}
          </p>
        </div>
        <button type="button" className="pp-btn pp-btn-primary pp-btn-lg" onClick={openDialog}>
          <span aria-hidden="true">+</span> Book appointment
        </button>
      </div>

      <div className="pp-live" role="status" aria-live="polite">
        {notice && <p className="pp-notice">{notice}</p>}
      </div>

      <section className="pp-stats" aria-label="Clinic status">
        <div className="pp-stat">
          <span className="pp-stat-n">{inExam}</span>
          <span className="pp-stat-l">In exam</span>
        </div>
        <div className={`pp-stat${longest >= 30 ? " pp-stat-warn" : ""}`}>
          <span className="pp-stat-n">{waiting.length}</span>
          <span className="pp-stat-l">{waiting.length ? `Waiting, longest ${longest} min` : "Waiting"}</span>
        </div>
        <div className="pp-stat">
          <span className="pp-stat-n">{toCome}</span>
          <span className="pp-stat-l">
            Still to arrive{nextUp ? `, next ${nextUp.start}` : ""}
          </span>
        </div>
        <div className="pp-stat">
          <span className="pp-stat-n">
            {done}
            <small>/{activeTotal}</small>
          </span>
          <span className="pp-stat-l">Done today</span>
        </div>
      </section>

      <div className="pp-grid">
        <section aria-labelledby="sched-h" className="pp-card pp-sched">
          <div className="pp-card-head">
            <h2 id="sched-h" className="pp-h2">
              All appointments
            </h2>
            <div className="pp-chips" role="group" aria-label="Filter by vet">
              <button type="button" aria-pressed={vetFilter === "all"} onClick={() => setVetFilter("all")}>
                All vets
              </button>
              {VETS.map((v) => (
                <button key={v.id} type="button" aria-pressed={vetFilter === v.id} onClick={() => setVetFilter(v.id)}>
                  {v.name.replace("Dr. ", "")}
                </button>
              ))}
            </div>
          </div>
          <ul className="pp-list">
            {visible.map((a) => {
              const p = patientOf(a.patient);
              const o = p ? ownerOf(p.owner) : undefined;
              const v = vetOf(a.vet);
              if (!p) return null;
              return (
                <li
                  key={a.id}
                  className={`pp-appt pp-row-${a.status}${a.urgent ? " pp-urgent" : ""}${flash === a.id ? " pp-flash" : ""}`}
                >
                  <div className="pp-a-time">
                    <strong>{a.start}</strong>
                    <span>{a.minutes} min</span>
                  </div>
                  <div className="pp-a-main">
                    <div className="pp-a-who">
                      {a.urgent && (
                        <span className="pp-urgent-tag">
                          <WarnIcon /> Urgent
                        </span>
                      )}
                      <Link href={`/patients/${p.id}`} className="pp-pname">
                        {p.name}
                      </Link>
                      <span className="pp-muted">
                        {p.species} · {o?.name}
                      </span>
                    </div>
                    <p className="pp-a-reason">{a.reason}</p>
                    <AlertBadges alerts={p.alerts} size="sm" />
                  </div>
                  <div className="pp-a-vet">
                    <strong>{v?.name}</strong>
                    <span>{v?.room}</span>
                  </div>
                  <div className="pp-a-status">
                    <StatusBadge status={a.status} />
                    {a.status === "checked_in" && <span className="pp-muted">waiting {waitMinutes(a)} min</span>}
                  </div>
                  <div className="pp-a-act">
                    {a.status === "booked" && (
                      <button
                        type="button"
                        className="pp-btn pp-btn-primary"
                        aria-label={`Check in ${p.name}`}
                        onClick={() => setStatus(a, "checked_in")}
                      >
                        Check in
                      </button>
                    )}
                    {a.status === "checked_in" && (
                      <button
                        type="button"
                        className="pp-btn"
                        aria-label={`Send ${p.name} to exam`}
                        onClick={() => setStatus(a, "in_exam")}
                      >
                        Start exam
                      </button>
                    )}
                    {a.status === "in_exam" && (
                      <button
                        type="button"
                        className="pp-btn"
                        aria-label={`Mark ${p.name} done`}
                        onClick={() => setStatus(a, "done")}
                      >
                        Mark done
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <aside aria-labelledby="wait-h" className="pp-card pp-wait">
          <div className="pp-card-head">
            <h2 id="wait-h" className="pp-h2">
              Waiting room
            </h2>
            <span className="pp-count" aria-label={`${waiting.length} waiting`}>
              {waiting.length}
            </span>
          </div>
          {waiting.length === 0 ? (
            <p className="pp-empty">No one is waiting. Check in a booked patient when they arrive.</p>
          ) : (
            <ol className="pp-wait-list">
              {waiting.map((a, i) => {
                const p = patientOf(a.patient);
                const w = waitMinutes(a);
                if (!p) return null;
                return (
                  <li key={a.id} className={w >= 30 ? "pp-long" : undefined}>
                    <span className="pp-pos" aria-hidden="true">
                      {i + 1}
                    </span>
                    <div className="pp-wait-body">
                      <div className="pp-wait-top">
                        <Link href={`/patients/${p.id}`} className="pp-pname">
                          {p.name}
                        </Link>
                        <strong className="pp-wait-time">{w} min</strong>
                      </div>
                      <span className="pp-muted">
                        {ownerOf(p.owner)?.name} · for {vetOf(a.vet)?.name}, booked {a.start}
                      </span>
                      <span className="pp-muted">Checked in {a.checkedInAt}</span>
                      <AlertBadges alerts={p.alerts} size="sm" />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </aside>
      </div>

      <dialog
        ref={dialog}
        className="pp-dialog"
        aria-labelledby={`${formId}-t`}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialog.current) setOpen(false);
        }}
      >
        <form onSubmit={submit} className="pp-form">
          <div className="pp-form-head">
            <h2 id={`${formId}-t`} className="pp-h2">
              Book an appointment
            </h2>
            <button type="button" className="pp-btn pp-btn-ghost" onClick={() => setOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>
          <p className="pp-muted">{longDate(TODAY)}</p>

          <label className="pp-field">
            <span>Patient</span>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              {PATIENTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species}) — {ownerOf(p.owner)?.name}
                </option>
              ))}
            </select>
          </label>
          {chosen && chosen.alerts.length > 0 && <AlertBadges alerts={chosen.alerts} size="md" />}

          <label className="pp-field">
            <span>Vet</span>
            <select value={vetId} onChange={(e) => setVetId(e.target.value)}>
              {VETS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — {v.room}
                </option>
              ))}
            </select>
          </label>

          <div className="pp-field-row">
            <label className="pp-field">
              <span>Time</span>
              <select value={time} onChange={(e) => setTime(e.target.value)}>
                {TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="pp-field">
              <span>Length</span>
              <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
                {LENGTHS.map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="pp-field">
            <span>Reason</span>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>

          {clash && (
            <div className="pp-clash" role="alert">
              <WarnIcon />
              <div>
                <strong>That time clashes.</strong>{" "}
                {vetOf(vetId)?.name} has {patientOf(clash.patient)?.name} ({clash.reason}) from {clash.start} to{" "}
                {endTime(clash.start, clash.minutes)}.
                {suggestion && (
                  <>
                    {" "}
                    <button type="button" className="pp-link" onClick={() => setTime(suggestion)}>
                      Use next free time, {suggestion}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          {error && !clash && (
            <p className="pp-clash" role="alert">
              {error}
            </p>
          )}

          <div className="pp-form-foot">
            <button type="button" className="pp-btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="pp-btn pp-btn-primary pp-btn-lg" disabled={Boolean(clash)}>
              Book {time} with {vetOf(vetId)?.name.replace("Dr. ", "Dr ")}
            </button>
          </div>
        </form>
      </dialog>
      <span className="pp-vh">{OWNERS.length} owners on file</span>
    </>
  );
}
