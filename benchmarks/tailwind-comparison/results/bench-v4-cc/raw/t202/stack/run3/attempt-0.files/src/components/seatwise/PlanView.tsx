"use client";

import { guestById } from "@/lib/plan";
import { PlannerProvider, usePlanner } from "./PlannerProvider";
import { PartyLegend, RoomPlan } from "./RoomPlan";
import { Shell } from "./Shell";
import { RulesPanel, TableChips, TablePanel, UnseatedPanel } from "./SidePanels";
import s from "./seatwise.module.css";

void PlannerProvider;

export function PlanView() {
  const { stats, rules, picked, pick } = usePlanner();
  const broken = rules.filter((r) => r.status === "broken");
  const pickedGuest = picked ? guestById.get(picked) : undefined;
  return (
    <Shell>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.h1}>Seating plan</h1>
          <p className={s.sub}>Drag guests onto seats, or tap a guest and then a seat. Counts and rules update as you go.</p>
        </div>
        <button type="button" className={`${s.btn} ${s.noPrint}`} onClick={() => window.print()}>
          Print for venue and caterer
        </button>
      </div>

      <ul className={s.stats} aria-label="Seating counts">
        <li className={s.stat}>
          <span className={s.statLabel}>Seated</span>
          <span className={s.statValue}>{stats.seated}</span>
          <span className={s.statNote}>
            of {stats.attending} attending
            {stats.unconfirmedSeated > 0 ? `, incl. ${stats.unconfirmedSeated} unconfirmed` : ""}
          </span>
        </li>
        <li className={s.stat}>
          <span className={s.statLabel}>Unseated</span>
          <span className={stats.unseated.length ? `${s.statValue} ${s.statAmber}` : s.statValue}>
            {stats.unseated.length}
          </span>
          <span className={s.statNote}>attending, no seat yet</span>
        </li>
        <li className={s.stat}>
          <span className={s.statLabel}>Free seats</span>
          <span className={s.statValue}>{stats.freeSeats}</span>
          <span className={s.statNote}>of {stats.totalSeats} across 7 tables</span>
        </li>
        <li className={s.stat}>
          <span className={s.statLabel}>Rules</span>
          <span className={broken.length ? `${s.statValue} ${s.statBad}` : `${s.statValue} ${s.statGood}`}>
            {broken.length ? `${broken.length} broken` : "All kept"}
          </span>
          <span className={s.statNote}>of {rules.length} from the couple</span>
        </li>
      </ul>

      {broken.length > 0 ? (
        <div className={s.alert} role="alert">
          <strong>
            {broken.length} {broken.length === 1 ? "rule is" : "rules are"} broken
          </strong>
          <ul>
            {broken.map((r) => (
              <li key={r.id}>
                {r.heading}. {r.detail}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {pickedGuest ? (
        <div className={`${s.pickBar} ${s.noPrint}`}>
          <span>
            Placing <strong>{pickedGuest.name}</strong>. Tap an empty seat, a seat to swap with, or a table.
          </span>
          <button type="button" className={s.btnSmall} onClick={() => pick(null)}>
            Cancel
          </button>
        </div>
      ) : null}

      <div className={s.layout}>
        <div className={s.planCol}>
          <section className={s.card} aria-labelledby="plan-h">
            <div className={s.cardHead}>
              <h2 id="plan-h" className={s.cardTitle}>
                Room plan
              </h2>
              <span className={s.cardHint}>24 &times; 14 m, drawn to scale</span>
            </div>
            <RoomPlan />
            <PartyLegend />
            <TableChips />
          </section>
        </div>
        <div className={s.side}>
          <TablePanel />
          <UnseatedPanel />
          <RulesPanel />
        </div>
      </div>
    </Shell>
  );
}
