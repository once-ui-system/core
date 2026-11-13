"use client";

import { useMemo, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { usePlan } from "@/components/PlanProvider";
import { FALLBACK_COLOR, GUESTS, PARTY_COLORS, RSVP_LABEL, type Rsvp } from "@/lib/data";
import { tableById } from "@/lib/plan";

const PARTIES = Array.from(new Set(GUESTS.map((g) => g.party)));
const DIETS = Array.from(new Set(GUESTS.map((g) => g.diet).filter((d): d is string => d !== null))).sort();
const RSVPS: Rsvp[] = ["yes", "maybe", "pending", "no"];

export function GuestsView() {
  const { assignments } = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState("");
  const [rsvp, setRsvp] = useState("");
  const [diet, setDiet] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GUESTS.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q)) return false;
      if (party && g.party !== party) return false;
      if (rsvp && g.rsvp !== rsvp) return false;
      if (diet === "__none") return g.diet === null;
      if (diet && g.diet !== diet) return false;
      return true;
    });
  }, [query, party, rsvp, diet]);

  const meals = useMemo(() => {
    const rows = ["Standard menu", ...DIETS].map((meal) => {
      const match = (d: string | null) => (meal === "Standard menu" ? d === null : d === meal);
      const confirmed = GUESTS.filter((g) => g.rsvp === "yes" && match(g.diet)).length;
      const awaiting = GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && match(g.diet)).length;
      return { meal, confirmed, awaiting };
    });
    return {
      rows,
      confirmed: rows.reduce((n, r) => n + r.confirmed, 0),
      awaiting: rows.reduce((n, r) => n + r.awaiting, 0),
    };
  }, []);

  const filtersOn = query !== "" || party !== "" || rsvp !== "" || diet !== "";

  return (
    <AppFrame>
      <div className="sw-page">
        <div className="sw-titlebar">
          <div>
            <h1>Guest list</h1>
            <p className="sw-sub">Search and filter the list, see where everyone sits, and hand the meal counts to the caterer.</p>
          </div>
        </div>

        <div className="sw-guests">
          <section className="sw-card sw-guests-main" aria-labelledby="gl-h">
            <h2 id="gl-h" className="sr-only">
              Guests
            </h2>
            <form className="sw-filters" role="search" aria-label="Filter guests" onSubmit={(e) => e.preventDefault()}>
              <div className="sw-field is-wide">
                <label htmlFor="q">Search by name</label>
                <input id="q" type="search" className="sw-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Carvalho" />
              </div>
              <div className="sw-field">
                <label htmlFor="party">Party</label>
                <select id="party" className="sw-select" value={party} onChange={(e) => setParty(e.target.value)}>
                  <option value="">All parties</option>
                  {PARTIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sw-field">
                <label htmlFor="rsvp">RSVP</label>
                <select id="rsvp" className="sw-select" value={rsvp} onChange={(e) => setRsvp(e.target.value)}>
                  <option value="">Any RSVP</option>
                  {RSVPS.map((r) => (
                    <option key={r} value={r}>
                      {RSVP_LABEL[r]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sw-field">
                <label htmlFor="diet">Diet</label>
                <select id="diet" className="sw-select" value={diet} onChange={(e) => setDiet(e.target.value)}>
                  <option value="">Any diet</option>
                  <option value="__none">No dietary needs</option>
                  {DIETS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="sw-btn"
                disabled={!filtersOn}
                onClick={() => {
                  setQuery("");
                  setParty("");
                  setRsvp("");
                  setDiet("");
                }}
              >
                Clear filters
              </button>
            </form>

            <p className="sw-count" role="status" aria-live="polite">
              Showing {filtered.length} of {GUESTS.length} guests
            </p>

            {filtered.length === 0 ? (
              <p className="sw-empty">No guests match these filters.</p>
            ) : (
              <div className="sw-tablewrap">
                <table className="sw-grid">
                  <caption className="sr-only">Guest list with party, RSVP, diet and table</caption>
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
                      const tid = assignments[g.id];
                      const c = PARTY_COLORS[g.party] ?? FALLBACK_COLOR;
                      return (
                        <tr key={g.id}>
                          <th scope="row">{g.name}</th>
                          <td>
                            <span className="sw-dot" style={{ background: c.bg, borderColor: c.edge }} aria-hidden="true" />
                            {g.party}
                          </td>
                          <td>
                            <span className={`sw-tag is-rsvp-${g.rsvp}`}>{RSVP_LABEL[g.rsvp]}</span>
                          </td>
                          <td>{g.diet ?? <span className="sw-muted">None</span>}</td>
                          <td>
                            {tid ? (
                              tableById.get(tid)?.name
                            ) : g.rsvp === "yes" ? (
                              <span className="sw-tag is-warn">Not seated</span>
                            ) : (
                              <span className="sw-muted">Not seated</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="sw-card sw-meals" aria-labelledby="meals-h">
            <h2 id="meals-h">Meals for the caterer</h2>
            <p className="sw-sub">Counted from RSVPs, whatever the filters say. Declined guests are left out.</p>
            <table className="sw-grid is-compact">
              <caption className="sr-only">Meal counts by dietary need</caption>
              <thead>
                <tr>
                  <th scope="col">Meal</th>
                  <th scope="col" className="num">
                    Attending
                  </th>
                  <th scope="col" className="num">
                    Awaiting
                  </th>
                </tr>
              </thead>
              <tbody>
                {meals.rows.map((r) => (
                  <tr key={r.meal}>
                    <th scope="row">{r.meal}</th>
                    <td className="num">{r.confirmed}</td>
                    <td className="num">{r.awaiting}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Total</th>
                  <td className="num">{meals.confirmed}</td>
                  <td className="num">{meals.awaiting}</td>
                </tr>
              </tfoot>
            </table>
            <p className="sw-hint">Awaiting means maybe or no reply yet.</p>
          </aside>
        </div>
      </div>
    </AppFrame>
  );
}
