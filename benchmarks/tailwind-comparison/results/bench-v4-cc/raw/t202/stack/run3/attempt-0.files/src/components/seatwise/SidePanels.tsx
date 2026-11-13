"use client";

import { PARTY_COLORS, RSVP_LABEL, tables } from "@/lib/data";
import { freeSeats, guestById, tableById } from "@/lib/plan";
import { guests } from "@/lib/data";
import { usePlanner } from "./PlannerProvider";
import s from "./seatwise.module.css";

function Swatch({ party }: { party: string }) {
  return <span className={s.swatch} style={{ background: PARTY_COLORS[party] ?? "#5c6670" }} aria-hidden="true" />;
}

function TableSelect({
  guestId,
  label,
  exclude,
}: {
  guestId: string;
  label: string;
  exclude?: string;
}) {
  const { occ, place } = usePlanner();
  return (
    <select
      className={s.select}
      aria-label={label}
      value=""
      onChange={(e) => {
        if (e.target.value) place(guestId, e.target.value);
      }}
    >
      <option value="">{label}</option>
      {tables
        .filter((t) => t.id !== exclude)
        .map((t) => {
          const free = freeSeats(occ, t.id);
          return (
            <option key={t.id} value={t.id} disabled={free === 0}>
              {t.name} ({free} free)
            </option>
          );
        })}
    </select>
  );
}

function GuestRow({ id, seated }: { id: string; seated: boolean }) {
  const { picked, togglePick, beginDrag, wasDragged, unseat, seats } = usePlanner();
  const g = guestById.get(id);
  if (!g) return null;
  const isPicked = picked === id;
  const at = seats[id]?.table;
  return (
    <li
      className={isPicked ? `${s.guestRow} ${s.guestRowPicked}` : s.guestRow}
      onPointerDown={(e) => beginDrag(e, id)}
    >
      <span className={s.grip} data-grip aria-hidden="true" title="Drag to a seat or table">
        <svg viewBox="0 0 12 18" width="12" height="18">
          {[3, 9].flatMap((x) => [3, 9, 15].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" fill="currentColor" />))}
        </svg>
      </span>
      <button
        type="button"
        className={s.guestMain}
        aria-pressed={isPicked}
        onClick={() => {
          if (wasDragged()) return;
          togglePick(id);
        }}
      >
        <span className={s.guestName}>
          <Swatch party={g.party} />
          {g.name}
        </span>
        <span className={s.guestMeta}>
          {g.party}
          {g.rsvp !== "yes" ? ` · ${RSVP_LABEL[g.rsvp]}` : ""}
        </span>
        {g.diet ? <span className={s.dietTag}>{g.diet}</span> : null}
      </button>
      <span className={s.rowActions} data-nodrag>
        {seated ? (
          <>
            <TableSelect guestId={id} label="Move to" exclude={at} />
            <button type="button" className={s.btnSmall} onClick={() => unseat(id)}>
              Unseat
            </button>
          </>
        ) : (
          <TableSelect guestId={id} label="Seat at" />
        )}
      </span>
    </li>
  );
}

export function UnseatedPanel() {
  const { stats, picked, drag } = usePlanner();
  const over = drag?.over === "unseat";
  return (
    <section
      className={over ? `${s.card} ${s.cardOver}` : s.card}
      aria-labelledby="unseated-h"
      data-drop="unseat"
    >
      <div className={s.cardHead}>
        <h2 id="unseated-h" className={s.cardTitle}>
          Unseated
        </h2>
        <span className={s.countPill}>{stats.unseated.length}</span>
      </div>
      <p className={s.cardHint}>
        {picked
          ? "Now tap a seat or table on the plan."
          : "Attending guests without a seat. Drag one onto the plan, or tap a name and then a seat. Drop a seated guest here to unseat them."}
      </p>
      {stats.unseated.length === 0 ? (
        <p className={s.empty}>Everyone attending has a seat.</p>
      ) : (
        <ul className={s.guestList}>
          {stats.unseated.map((id) => (
            <GuestRow key={id} id={id} seated={false} />
          ))}
        </ul>
      )}
      {stats.awaiting.length > 0 ? (
        <details className={s.awaiting}>
          <summary>
            Not confirmed yet <span className={s.countPill}>{stats.awaiting.length}</span>
          </summary>
          <ul className={s.guestList}>
            {stats.awaiting.map((id) => (
              <GuestRow key={id} id={id} seated={false} />
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

export function TablePanel() {
  const { selectedTable, occ, rules, picked, place, seats } = usePlanner();
  const t = selectedTable ? tableById.get(selectedTable) : undefined;
  if (!t) {
    return (
      <section className={s.card} aria-labelledby="table-h">
        <h2 id="table-h" className={s.cardTitle}>
          Table
        </h2>
        <p className={s.empty}>Select a table on the plan or from the list under it to see its guests and dietary needs.</p>
      </section>
    );
  }
  const row = occ[t.id] ?? [];
  const seatedIds = row.filter((x): x is string => x !== null);
  const dietary = seatedIds
    .map((id) => guestById.get(id))
    .filter((g) => g && g.diet);
  const issues = rules.filter((r) => r.status === "broken" && r.tables.includes(t.id));
  void seats;
  return (
    <section className={s.card} aria-labelledby="table-h">
      <div className={s.cardHead}>
        <h2 id="table-h" className={s.cardTitle}>
          {t.name}
        </h2>
        <span className={s.countPill}>
          {seatedIds.length}/{t.seats} seats
        </span>
      </div>
      {issues.length > 0 ? (
        <ul className={s.issueList}>
          {issues.map((r) => (
            <li key={r.id}>
              <strong>Rule broken.</strong> {r.heading}. {r.detail}
            </li>
          ))}
        </ul>
      ) : null}
      <ol className={s.seatList}>
        {row.map((gid, i) => {
          if (!gid) {
            return (
              <li key={`e-${i}`} className={s.seatRowEmpty}>
                <span className={s.seatNo}>{i + 1}</span>
                <span className={s.emptyLabel}>Empty seat</span>
                {picked ? (
                  <button type="button" className={s.btnSmall} onClick={() => place(picked, t.id, i)}>
                    Seat here
                  </button>
                ) : null}
              </li>
            );
          }
          return (
            <li key={gid} className={s.seatRowWrap}>
              <span className={s.seatNo}>{i + 1}</span>
              <ul className={s.guestListInner}>
                <GuestRow id={gid} seated />
              </ul>
            </li>
          );
        })}
      </ol>
      <h3 className={s.subTitle}>Dietary needs</h3>
      {dietary.length === 0 ? (
        <p className={s.empty}>No dietary needs recorded at this table.</p>
      ) : (
        <ul className={s.dietList}>
          {dietary.map((g) =>
            g ? (
              <li key={g.id}>
                <span className={s.dietTag}>{g.diet}</span> {g.name}
              </li>
            ) : null,
          )}
        </ul>
      )}
    </section>
  );
}

export function RulesPanel() {
  const { rules, selectTable } = usePlanner();
  const broken = rules.filter((r) => r.status === "broken").length;
  const open = rules.filter((r) => r.status === "open").length;
  const label = { ok: "Kept", open: "Waiting", broken: "Broken" } as const;
  return (
    <section className={s.card} aria-labelledby="rules-h">
      <div className={s.cardHead}>
        <h2 id="rules-h" className={s.cardTitle}>
          The couple&apos;s rules
        </h2>
        <span className={broken ? `${s.countPill} ${s.pillBad}` : `${s.countPill} ${s.pillGood}`}>
          {broken ? `${broken} broken` : "All kept"}
        </span>
      </div>
      <p className={s.cardHint}>
        {broken} broken, {open} waiting for guests to be seated, {rules.length - broken - open} kept.
      </p>
      <ul className={s.ruleList}>
        {rules.map((r) => (
          <li key={r.id} className={`${s.rule} ${r.status === "broken" ? s.ruleBroken : r.status === "open" ? s.ruleOpen : s.ruleOk}`}>
            <div className={s.ruleTop}>
              <span className={s.ruleStatus}>
                <span aria-hidden="true">{r.status === "broken" ? "✕" : r.status === "open" ? "…" : "✓"}</span> {label[r.status]}
              </span>
              <strong>{r.heading}</strong>
            </div>
            <p className={s.ruleDetail}>{r.detail}</p>
            <p className={s.ruleNote}>{r.note}</p>
            {r.flag ? <p className={s.ruleFlag}>{r.flag}</p> : null}
            {r.tables.length > 0 ? (
              <button type="button" className={s.btnSmall} onClick={() => selectTable(r.tables[0] ?? null)}>
                Show {r.tables.map((id) => tableById.get(id)?.name).join(" / ")}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TableChips() {
  const { occ, selectedTable, selectTable, rules, drag, picked, place } = usePlanner();
  const broken = new Set(rules.filter((r) => r.status === "broken").flatMap((r) => r.tables));
  return (
    <ul className={s.chips} aria-label="Tables">
      {tables.map((t) => {
        const filled = (occ[t.id] ?? []).filter(Boolean).length;
        const sel = selectedTable === t.id;
        const over = drag?.over === `table:${t.id}`;
        return (
          <li key={t.id}>
            <button
              type="button"
              data-drop={`table:${t.id}`}
              aria-pressed={sel}
              className={[s.chip, sel ? s.chipSel : "", over ? s.chipOver : "", broken.has(t.id) ? s.chipBad : ""].join(" ")}
              onClick={() => (picked ? place(picked, t.id) : selectTable(t.id))}
            >
              {t.name}
              <span className={s.chipCount}>
                {filled}/{t.seats}
              </span>
              {broken.has(t.id) ? <span className={s.chipWarn}>Rule broken</span> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export const _guestCount = guests.length;
