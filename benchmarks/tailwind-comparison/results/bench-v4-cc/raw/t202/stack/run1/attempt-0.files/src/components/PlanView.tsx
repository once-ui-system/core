"use client";

import { useEffect, useMemo, useState, type DragEvent } from "react";
import { AppFrame } from "@/components/AppFrame";
import { usePlan } from "@/components/PlanProvider";
import { RoomPlan } from "@/components/RoomPlan";
import { EVENT, FALLBACK_COLOR, GUESTS, PARTY_COLORS, RSVP_LABEL, TABLES, type Guest } from "@/lib/data";
import {
  computeCounts,
  dietSummary,
  evaluateRules,
  guestById,
  guestsAt,
  ROOM,
  tableById,
} from "@/lib/plan";

function PartyDot({ party }: { party: string }) {
  const c = PARTY_COLORS[party] ?? FALLBACK_COLOR;
  return <span className="sw-dot" style={{ background: c.bg, borderColor: c.edge }} aria-hidden="true" />;
}

export function PlanView() {
  const { assignments, place } = usePlan();
  const [selectedTable, setSelectedTable] = useState<string | null>("t-1");
  const [armed, setArmed] = useState<string | null>(null);
  const [overTable, setOverTable] = useState<string | null>(null);
  const [overUnseated, setOverUnseated] = useState(false);
  const [notice, setNotice] = useState("");

  const counts = useMemo(() => computeCounts(assignments), [assignments]);
  const rules = useMemo(() => evaluateRules(assignments), [assignments]);
  const broken = rules.filter((r) => r.status === "broken");
  const brokenTables = useMemo(() => new Set(broken.flatMap((r) => r.tableIds)), [broken]);
  const brokenGuests = useMemo(() => new Set(broken.flatMap((r) => r.guestIds)), [broken]);

  useEffect(() => {
    if (!armed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setArmed(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [armed]);

  const unseatedConfirmed = GUESTS.filter((g) => g.rsvp === "yes" && !assignments[g.id]);
  const unseatedAwaiting = GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !assignments[g.id]);
  const declined = GUESTS.filter((g) => g.rsvp === "no").length;

  const placeGuest = (guestId: string, tableId: string | null) => {
    const res = place(guestId, tableId);
    setNotice(res.message);
    if (res.ok) {
      setArmed(null);
      if (tableId) setSelectedTable(tableId);
    }
  };

  const onTableClick = (tableId: string) => {
    if (armed) placeGuest(armed, tableId);
    else setSelectedTable(tableId);
  };

  const onSeatClick = (tableId: string, guestId: string | null) => {
    if (armed) {
      placeGuest(armed, tableId);
      return;
    }
    setSelectedTable(tableId);
    if (guestId) {
      setArmed(guestId);
      setNotice(`${guestById.get(guestId)?.name} picked up. Tap a table to move them.`);
    }
  };

  const toggleArm = (guestId: string) => {
    if (armed === guestId) {
      setArmed(null);
      setNotice("");
    } else {
      setArmed(guestId);
      setNotice(`${guestById.get(guestId)?.name} picked up. Tap a table to seat them.`);
    }
  };

  const dragStartFor = (e: DragEvent<HTMLElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const selected = selectedTable ? tableById.get(selectedTable) : undefined;
  const selectedGuests = selected ? guestsAt(assignments, selected.id) : [];
  const selectedDiets = dietSummary(selectedGuests);
  const armedGuest = armed ? guestById.get(armed) : undefined;

  const chip = (g: Guest) => {
    const isArmed = armed === g.id;
    return (
      <li key={g.id}>
        <button
          type="button"
          className={`sw-chip${isArmed ? " is-armed" : ""}${brokenGuests.has(g.id) ? " has-rule" : ""}`}
          draggable
          aria-pressed={isArmed}
          onDragStart={(e) => dragStartFor(e, g.id)}
          onClick={() => toggleArm(g.id)}
        >
          <PartyDot party={g.party} />
          <span className="sw-chip-text">
            <span className="sw-chip-name">{g.name}</span>
            <span className="sw-chip-sub">
              {g.party}
              {g.rsvp !== "yes" ? ` · ${RSVP_LABEL[g.rsvp]}` : ""}
            </span>
          </span>
          {g.diet ? <span className="sw-tag">{g.diet}</span> : null}
        </button>
      </li>
    );
  };

  return (
    <AppFrame>
      <div className="sw-page">
        <div className="sw-titlebar">
          <div>
            <h1>Seating plan</h1>
            <p className="sw-sub">
              {EVENT.venue} · room {ROOM.width} × {ROOM.depth} m · drag guests onto tables, or tap a guest and then a table.
            </p>
          </div>
        </div>

        <section className="sw-stats" aria-label="Seating totals">
          <div className="sw-stat">
            <span className="sw-stat-num">
              {counts.seated}
              <small> of {counts.attending}</small>
            </span>
            <span className="sw-stat-label">attending guests seated</span>
          </div>
          <div className={`sw-stat${counts.unseated > 0 ? " is-warn" : ""}`}>
            <span className="sw-stat-num">{counts.unseated}</span>
            <span className="sw-stat-label">attending, no seat yet</span>
          </div>
          <div className="sw-stat">
            <span className="sw-stat-num">
              {counts.seated + counts.provisional}
              <small> of {counts.capacity}</small>
            </span>
            <span className="sw-stat-label">
              seats filled{counts.provisional > 0 ? ` (${counts.provisional} awaiting reply)` : ""}
            </span>
          </div>
          <div className={`sw-stat${broken.length > 0 ? " is-bad" : " is-good"}`}>
            <span className="sw-stat-num">{broken.length}</span>
            <span className="sw-stat-label">{broken.length === 1 ? "rule broken" : "rules broken"}</span>
          </div>
        </section>

        <p role="status" aria-live="polite" className="sw-notice">
          {notice}
        </p>
        {armedGuest ? (
          <div className="sw-armed" role="group" aria-label="Guest picked up">
            <span>
              Placing <strong>{armedGuest.name}</strong>. Tap a table to seat them.
            </span>
            <button type="button" className="sw-btn" onClick={() => setArmed(null)}>
              Cancel
            </button>
          </div>
        ) : null}

        <div className="sw-plan">
          <div className="sw-plan-main">
            <RoomPlan
              assignments={assignments}
              brokenTables={brokenTables}
              selectedTable={selectedTable}
              armedGuest={armed}
              overTable={overTable}
              onTableClick={onTableClick}
              onSeatClick={onSeatClick}
              onDragStartGuest={() => undefined}
              onDragEnd={() => setOverTable(null)}
              onOverTable={setOverTable}
              onDropGuest={(tableId, guestId) => placeGuest(guestId, tableId)}
            />
            <ul className="sw-legend" aria-label="Party colours">
              {Object.keys(PARTY_COLORS).map((p) => (
                <li key={p}>
                  <PartyDot party={p} />
                  {p}
                </li>
              ))}
              <li>
                <span className="sw-dot is-empty" aria-hidden="true" />
                Empty seat
              </li>
            </ul>
          </div>

          <aside className="sw-side" aria-label="Plan details">
            <section className="sw-card" aria-labelledby="rules-h">
              <h2 id="rules-h">
                The couple&apos;s rules
                <span className={`sw-pill${broken.length ? " is-bad" : " is-good"}`}>
                  {broken.length ? `${broken.length} broken` : "all kept"}
                </span>
              </h2>
              <ul className="sw-rules">
                {rules.map((r) => (
                  <li key={r.id} className={`sw-rule is-${r.status}`}>
                    <span className="sw-rule-icon" aria-hidden="true">
                      {r.status === "ok" ? "✓" : r.status === "broken" ? "!" : "…"}
                    </span>
                    <div>
                      <p className="sw-rule-title">
                        <span className="sr-only">
                          {r.status === "ok" ? "Kept. " : r.status === "broken" ? "Broken. " : "Waiting. "}
                        </span>
                        {r.title}
                      </p>
                      <p className="sw-rule-detail">{r.detail}</p>
                      <p className="sw-rule-note">{r.note}</p>
                      {r.status === "broken" && r.tableIds[0] ? (
                        <button type="button" className="sw-link" onClick={() => setSelectedTable(r.tableIds[0] ?? null)}>
                          Show {r.tableIds.map((t) => tableById.get(t)?.name).join(", ")}
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="sw-card" aria-labelledby="table-h">
              {selected ? (
                <>
                  <h2 id="table-h">
                    {selected.name}
                    <span className="sw-pill">
                      {selectedGuests.length} of {selected.seats} seats
                    </span>
                  </h2>
                  {brokenTables.has(selected.id) ? (
                    <p className="sw-warnline">A rule is broken at this table.</p>
                  ) : null}
                  {selectedDiets.length > 0 ? (
                    <p className="sw-dietline">
                      <span>Dietary needs: </span>
                      {selectedDiets.map((d) => `${d.count} ${d.diet}`).join(", ")}
                    </p>
                  ) : (
                    <p className="sw-dietline">No dietary needs at this table.</p>
                  )}
                  <ol className="sw-seatlist">
                    {Array.from({ length: selected.seats }, (_, i) => {
                      const g = selectedGuests[i];
                      if (!g) {
                        return (
                          <li key={`e-${i}`} className="sw-seatrow is-empty">
                            <span className="sw-seatno">{i + 1}</span>
                            <span className="sw-empty-text">Empty seat</span>
                            {armed ? (
                              <button type="button" className="sw-btn is-primary" onClick={() => placeGuest(armed, selected.id)}>
                                Seat {armedGuest?.name.split(" ")[0]} here
                              </button>
                            ) : null}
                          </li>
                        );
                      }
                      return (
                        <li key={g.id} className="sw-seatrow">
                          <span className="sw-seatno">{i + 1}</span>
                          <span className="sw-seatguest">
                            <span className="sw-chip-name">
                              <PartyDot party={g.party} />
                              {g.name}
                            </span>
                            <span className="sw-chip-sub">
                              {g.party}
                              {g.rsvp !== "yes" ? ` · ${RSVP_LABEL[g.rsvp]}` : ""}
                            </span>
                            <span className="sw-tags">
                              {g.diet ? <span className="sw-tag">{g.diet}</span> : null}
                              {brokenGuests.has(g.id) ? <span className="sw-tag is-bad">Rule broken</span> : null}
                            </span>
                          </span>
                          <span className="sw-seatactions">
                            <label className="sr-only" htmlFor={`mv-${g.id}`}>
                              Move {g.name} to another table
                            </label>
                            <select
                              id={`mv-${g.id}`}
                              className="sw-select is-small"
                              value=""
                              onChange={(e) => {
                                if (e.target.value) placeGuest(g.id, e.target.value);
                              }}
                            >
                              <option value="">Move to…</option>
                              {TABLES.filter((t) => t.id !== selected.id).map((t) => {
                                const n = guestsAt(assignments, t.id).length;
                                return (
                                  <option key={t.id} value={t.id} disabled={n >= t.seats}>
                                    {t.name} ({n}/{t.seats}){n >= t.seats ? " full" : ""}
                                  </option>
                                );
                              })}
                            </select>
                            <button type="button" className="sw-btn" onClick={() => placeGuest(g.id, null)}>
                              Unseat
                              <span className="sr-only"> {g.name}</span>
                            </button>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </>
              ) : (
                <>
                  <h2 id="table-h">Table details</h2>
                  <p className="sw-sub">Select a table to see its guests and their dietary needs.</p>
                </>
              )}
            </section>

            <section
              className={`sw-card sw-unseated${overUnseated ? " is-over" : ""}`}
              aria-labelledby="un-h"
              onDragOver={(e) => {
                e.preventDefault();
                setOverUnseated(true);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOverUnseated(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setOverUnseated(false);
                const gid = e.dataTransfer.getData("text/plain");
                if (gid && guestById.has(gid)) placeGuest(gid, null);
              }}
            >
              <h2 id="un-h">
                Needs a seat
                <span className={`sw-pill${unseatedConfirmed.length ? " is-warn" : " is-good"}`}>{unseatedConfirmed.length}</span>
              </h2>
              {unseatedConfirmed.length === 0 ? (
                <p className="sw-sub">Everyone attending has a seat.</p>
              ) : (
                <ul className="sw-chips">{unseatedConfirmed.map(chip)}</ul>
              )}
              {unseatedAwaiting.length > 0 ? (
                <>
                  <h3>Awaiting a reply ({unseatedAwaiting.length})</h3>
                  <ul className="sw-chips">{unseatedAwaiting.map(chip)}</ul>
                </>
              ) : null}
              <p className="sw-hint">
                Drop a guest here to unseat them.{declined > 0 ? ` ${declined} declined and are not listed.` : ""}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </AppFrame>
  );
}
