"use client";

import { useState, type DragEvent } from "react";
import { DIET_COLOR, GUESTS, TABLES, guestById, tableById, type Guest } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { DietTag, cssVars, partyColor } from "./bits";

function GuestRow({ g }: { g: Guest }) {
  const plan = usePlan();
  const held = plan.heldId === g.id;
  const seated = plan.tableOf[g.id];
  const options = TABLES.filter((t) => t.id !== seated && plan.tableCount(t.id) < t.seats);

  const onDragStart = (e: DragEvent) => {
    e.dataTransfer.setData("text/plain", g.id);
    e.dataTransfer.effectAllowed = "move";
    plan.setDragId(g.id);
  };

  return (
    <li className={`sw-grow ${held ? "is-held" : ""}`}>
      <button
        type="button"
        className="sw-gmain"
        aria-pressed={held}
        draggable
        onDragStart={onDragStart}
        onDragEnd={() => plan.setDragId(null)}
        onClick={() => plan.hold(held ? null : g.id)}
      >
        <span className="sw-chipdot" style={cssVars({ "--c": partyColor(g.party) })} aria-hidden="true" />
        <span>
          <span className="sw-gname">{g.name}</span>
          <span className="sw-gmeta">{g.party}</span>
        </span>
      </button>
      <DietTag diet={g.diet} />
      <select
        className="sw-select small"
        aria-label={`${seated ? "Move" : "Seat"} ${g.name} at a table`}
        value=""
        onChange={(e) => {
          if (e.target.value) plan.place(g.id, e.target.value);
        }}
      >
        <option value="">{seated ? "Move to…" : "Seat at…"}</option>
        {options.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} ({t.seats - plan.tableCount(t.id)} free)
          </option>
        ))}
      </select>
      {seated && (
        <button type="button" className="sw-btn small" onClick={() => plan.unseat(g.id)} aria-label={`Unseat ${g.name}`}>
          Unseat
        </button>
      )}
    </li>
  );
}

export function SidePanel() {
  const plan = usePlan();
  const [over, setOver] = useState(false);

  const held = plan.heldId ? guestById.get(plan.heldId) : undefined;
  const heldTable = held ? plan.tableOf[held.id] : null;

  const toSeat = GUESTS.filter((g) => g.rsvp === "yes" && !plan.tableOf[g.id]);
  const unconfirmed = GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !plan.tableOf[g.id]);

  const selected = plan.selectedTableId ? tableById.get(plan.selectedTableId) : undefined;
  const tableGuests = selected
    ? (plan.seats[selected.id] ?? []).filter((x): x is string => x !== null).map((id) => guestById.get(id)).filter((g): g is Guest => !!g)
    : [];
  const needs = new Map<string, number>();
  tableGuests.forEach((g) => g.diet && needs.set(g.diet, (needs.get(g.diet) ?? 0) + 1));
  const tableResults = selected ? plan.results.filter((r) => r.tables.includes(selected.id) && r.status === "broken") : [];

  return (
    <aside aria-label="Guests, rules and table details">
      {held && (
        <div className="sw-held" role="group" aria-label="Selected guest">
          <strong>
            {held.name} is selected{heldTable ? ` (at ${tableById.get(heldTable)?.name})` : ""}
          </strong>
          <span className="sw-sub" style={{ flex: "1 1 100%" }}>
            Tap an empty seat to place, a seated guest to swap, or a table to take the next free seat.
          </span>
          {heldTable && (
            <button type="button" className="sw-btn small" onClick={() => plan.unseat(held.id)}>
              Unseat
            </button>
          )}
          <button type="button" className="sw-btn small" onClick={() => plan.hold(null)}>
            Cancel (Esc)
          </button>
        </div>
      )}

      <section className="sw-card" aria-labelledby="rules-h">
        <h2 id="rules-h">
          The couple's rules
          <span className="sw-count">{plan.brokenCount === 0 ? "all kept" : `${plan.brokenCount} broken`}</span>
        </h2>
        <ul className="sw-rules">
          {plan.results.map((r) => (
            <li key={r.index} className={`sw-rule ${r.status}`}>
              <span className={`sw-pill ${r.status}`}>
                {r.status === "ok" ? "Kept" : r.status === "broken" ? "Broken" : "Waiting"}
              </span>
              <b>{r.title}</b>
              <span>{r.detail}</span>
              {r.rule.kind !== "near" && r.status === "broken" ? null : null}
              {r.status === "broken" && r.tables[0] && (
                <button type="button" className="link" onClick={() => plan.selectTable(r.tables[0])}>
                  Show {r.tables.map((t) => tableById.get(t)?.name).join(" and ")}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="sw-card" aria-labelledby="table-h">
        {selected ? (
          <>
            <h2 id="table-h">
              {selected.name}
              <span className="sw-count">
                {tableGuests.length}/{selected.seats} seats
              </span>
            </h2>
            {tableResults.map((r) => (
              <p key={r.index} className="sw-rule broken" style={{ marginBottom: 8 }}>
                <span className="sw-pill broken">Broken</span> {r.detail}
              </p>
            ))}
            {needs.size > 0 ? (
              <div className="sw-needs" aria-label="Dietary needs at this table">
                {Array.from(needs.entries()).map(([d, n]) => (
                  <span key={d} className="sw-tag" style={cssVars({ "--c": DIET_COLOR[d] ?? "#6d8fb3" })}>
                    {n} × {d}
                  </span>
                ))}
              </div>
            ) : (
              <p className="sw-sub" style={{ margin: "6px 0" }}>
                No dietary needs at this table.
              </p>
            )}
            {tableGuests.length === 0 ? (
              <p className="sw-empty">Nobody is seated here yet.</p>
            ) : (
              <ul className="sw-glist">
                {tableGuests.map((g) => (
                  <GuestRow key={g.id} g={g} />
                ))}
              </ul>
            )}
            <button type="button" className="sw-btn small" style={{ marginTop: 10 }} onClick={() => plan.selectTable(null)}>
              Close table
            </button>
          </>
        ) : (
          <>
            <h2 id="table-h">Table details</h2>
            <p className="sw-empty">Select a table on the plan to see who sits there and what they can eat.</p>
          </>
        )}
      </section>

      <section
        className={`sw-card sw-dropzone ${over ? "is-over" : ""}`}
        aria-labelledby="toseat-h"
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const id = plan.dragId ?? e.dataTransfer.getData("text/plain");
          plan.setDragId(null);
          if (id) plan.unseat(id);
        }}
      >
        <h2 id="toseat-h">
          Attending, no seat yet
          <span className="sw-count">{toSeat.length}</span>
        </h2>
        {toSeat.length === 0 ? (
          <p className="sw-empty">Everyone attending has a seat.</p>
        ) : (
          <ul className="sw-glist">
            {toSeat.map((g) => (
              <GuestRow key={g.id} g={g} />
            ))}
          </ul>
        )}
        <p className="sw-sub" style={{ marginTop: 8 }}>
          Drop a seated guest here to unseat them.
        </p>
      </section>

      {unconfirmed.length > 0 && (
        <section className="sw-card" aria-labelledby="unconf-h">
          <h2 id="unconf-h">
            Not confirmed yet
            <span className="sw-count">{unconfirmed.length}</span>
          </h2>
          <ul className="sw-glist">
            {unconfirmed.map((g) => (
              <GuestRow key={g.id} g={g} />
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
