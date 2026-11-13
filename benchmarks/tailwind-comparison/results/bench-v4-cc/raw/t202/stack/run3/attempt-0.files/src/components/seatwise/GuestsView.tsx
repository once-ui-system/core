"use client";

import { useMemo, useState } from "react";
import { PARTY_COLORS, RSVP_LABEL, diets, guests, parties, tables, type Rsvp } from "@/lib/data";
import { freeSeats, tableById } from "@/lib/plan";
import { usePlanner } from "./PlannerProvider";
import { Shell } from "./Shell";
import s from "./seatwise.module.css";

function norm(v: string): string {
  return v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const STANDARD = "Standard menu";

export function GuestsView() {
  const { seats, occ, place, unseat } = usePlanner();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [unconfirmed, setUnconfirmed] = useState(false);

  const filtered = useMemo(() => {
    const needle = norm(q.trim());
    return guests.filter((g) => {
      if (needle && !norm(g.name).includes(needle)) return false;
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet) return false;
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false;
      return true;
    });
  }, [q, party, rsvp, diet]);

  const filtersOn = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all";
  const clear = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
  };

  const pool = guests.filter(
    (g) => g.rsvp === "yes" || (unconfirmed && (g.rsvp === "maybe" || g.rsvp === "pending")),
  );
  const meals = useMemo(() => {
    const m = new Map<string, number>();
    for (const g of pool) m.set(g.diet ?? STANDARD, (m.get(g.diet ?? STANDARD) ?? 0) + 1);
    return Array.from(m.entries()).sort((a, b) => {
      if (a[0] === STANDARD) return -1;
      if (b[0] === STANDARD) return 1;
      return b[1] - a[1] || a[0].localeCompare(b[0]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unconfirmed]);
  const maxMeal = Math.max(1, ...meals.map((m) => m[1]));

  const byTable = tables
    .map((t) => ({
      t,
      rows: pool.filter((g) => g.diet && seats[g.id]?.table === t.id),
    }))
    .filter((x) => x.rows.length > 0);
  const notSeated = pool.filter((g) => g.diet && !seats[g.id]);

  return (
    <Shell>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.h1}>Guest list</h1>
          <p className={s.sub}>
            {guests.length} invited, {guests.filter((g) => g.rsvp === "yes").length} attending. Change a guest&apos;s table here and the plan follows.
          </p>
        </div>
        <button type="button" className={`${s.btn} ${s.noPrint}`} onClick={() => window.print()}>
          Print for caterer
        </button>
      </div>

      <div className={s.guestsLayout}>
        <section className={s.card} aria-labelledby="gl-h">
          <h2 id="gl-h" className={s.srOnly}>
            Guests
          </h2>
          <div className={`${s.filters} ${s.noPrint}`} role="search">
            <label className={s.field}>
              <span>Search</span>
              <input
                type="search"
                className={s.input}
                placeholder="Search by name"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <label className={s.field}>
              <span>Party</span>
              <select className={s.select} value={party} onChange={(e) => setParty(e.target.value)}>
                <option value="all">All parties</option>
                {parties.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className={s.field}>
              <span>RSVP</span>
              <select className={s.select} value={rsvp} onChange={(e) => setRsvp(e.target.value)}>
                <option value="all">Any reply</option>
                {(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => (
                  <option key={r} value={r}>
                    {RSVP_LABEL[r]}
                  </option>
                ))}
              </select>
            </label>
            <label className={s.field}>
              <span>Diet</span>
              <select className={s.select} value={diet} onChange={(e) => setDiet(e.target.value)}>
                <option value="all">Any diet</option>
                <option value="none">No dietary needs</option>
                {diets.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className={s.resultLine} role="status">
            Showing {filtered.length} of {guests.length} guests
            {filtersOn ? (
              <>
                {" "}
                <button type="button" className={s.linkBtn} onClick={clear}>
                  Clear filters
                </button>
              </>
            ) : null}
          </p>

          {filtered.length === 0 ? (
            <p className={s.empty}>No guests match these filters.</p>
          ) : (
            <table className={s.table2}>
              <thead>
                <tr>
                  <th scope="col">Guest</th>
                  <th scope="col">Party</th>
                  <th scope="col">RSVP</th>
                  <th scope="col">Diet</th>
                  <th scope="col">Table</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => {
                  const at = seats[g.id]?.table ?? "";
                  return (
                    <tr key={g.id}>
                      <th scope="row" data-label="Guest">
                        {g.name}
                      </th>
                      <td data-label="Party">
                        <span className={s.swatch} style={{ background: PARTY_COLORS[g.party] ?? "#5c6670" }} aria-hidden="true" />
                        {g.party}
                      </td>
                      <td data-label="RSVP">
                        <span className={`${s.rsvp} ${s[`rsvp_${g.rsvp}`] ?? ""}`}>{RSVP_LABEL[g.rsvp]}</span>
                      </td>
                      <td data-label="Diet">{g.diet ? <span className={s.dietTag}>{g.diet}</span> : <span className={s.muted}>None</span>}</td>
                      <td data-label="Table">
                        <select
                          className={s.select}
                          aria-label={`Table for ${g.name}`}
                          value={at}
                          disabled={g.rsvp === "no"}
                          onChange={(e) => {
                            if (e.target.value === "") unseat(g.id);
                            else place(g.id, e.target.value);
                          }}
                        >
                          <option value="">Not seated</option>
                          {tables.map((t) => {
                            const free = freeSeats(occ, t.id);
                            return (
                              <option key={t.id} value={t.id} disabled={free === 0 && t.id !== at}>
                                {t.name} ({free} free)
                              </option>
                            );
                          })}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <aside className={s.mealCol} aria-label="Meal counts">
          <section className={s.card} aria-labelledby="meals-h">
            <div className={s.cardHead}>
              <h2 id="meals-h" className={s.cardTitle}>
                Meals for the caterer
              </h2>
              <span className={s.countPill}>{pool.length} covers</span>
            </div>
            <label className={`${s.check} ${s.noPrint}`}>
              <input type="checkbox" checked={unconfirmed} onChange={(e) => setUnconfirmed(e.target.checked)} />
              Include maybe and pending replies
            </label>
            <ul className={s.meals}>
              {meals.map(([name, n]) => (
                <li key={name}>
                  <div className={s.mealTop}>
                    <span>{name}</span>
                    <strong>{n}</strong>
                  </div>
                  <div className={s.bar} aria-hidden="true">
                    <span style={{ width: `${(n / maxMeal) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className={s.card} aria-labelledby="bytable-h">
            <h2 id="bytable-h" className={s.cardTitle}>
              Dietary needs by table
            </h2>
            {byTable.length === 0 && notSeated.length === 0 ? (
              <p className={s.empty}>No dietary needs among these guests.</p>
            ) : (
              <ul className={s.byTable}>
                {byTable.map(({ t, rows }) => (
                  <li key={t.id}>
                    <strong>{tableById.get(t.id)?.name}</strong>
                    <span>{rows.map((g) => `${g.diet}: ${g.name}`).join("; ")}</span>
                  </li>
                ))}
                {notSeated.length > 0 ? (
                  <li>
                    <strong>Not seated yet</strong>
                    <span>{notSeated.map((g) => `${g.diet}: ${g.name}`).join("; ")}</span>
                  </li>
                ) : null}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </Shell>
  );
}
