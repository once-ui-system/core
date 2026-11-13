"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DIETS, GUESTS, PARTIES, RSVP_LABEL, tableById, type Rsvp } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { AppFrame } from "./AppFrame";
import { DietTag, RsvpTag } from "./bits";

const STANDARD = "Standard (no dietary need)";

export function GuestsView() {
  const plan = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [seating, setSeating] = useState("all");
  const [copied, setCopied] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return GUESTS.filter((g) => {
      if (needle && !g.name.toLowerCase().includes(needle) && !g.party.toLowerCase().includes(needle)) return false;
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet) return false;
      if (diet === "any" && !g.diet) return false;
      if (diet !== "all" && diet !== "none" && diet !== "any" && g.diet !== diet) return false;
      const seated = !!plan.tableOf[g.id];
      if (seating === "seated" && !seated) return false;
      if (seating === "unseated" && seated) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name, "en"));
  }, [q, party, rsvp, diet, seating, plan.tableOf]);

  const meals = useMemo(() => {
    const names = [STANDARD, ...DIETS];
    const list = names.map((name) => {
      const match = GUESTS.filter((g) => (name === STANDARD ? !g.diet : g.diet === name));
      return {
        name,
        yes: match.filter((g) => g.rsvp === "yes").length,
        open: match.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending").length,
      };
    });
    return {
      list,
      yes: list.reduce((n, r) => n + r.yes, 0),
      open: list.reduce((n, r) => n + r.open, 0),
      declined: GUESTS.filter((g) => g.rsvp === "no").length,
    };
  }, []);

  const copy = async () => {
    const text = [
      "Meal counts, Ines & Mateo's wedding dinner",
      ...meals.list.map((r) => `${r.name}: ${r.yes} confirmed${r.open ? `, ${r.open} awaiting` : ""}`),
      `Total: ${meals.yes} confirmed, ${meals.open} awaiting`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied("Meal counts copied.");
    } catch {
      setCopied("Copy is not available in this browser.");
    }
  };

  const reset = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeating("all");
  };

  return (
    <AppFrame>
      <div className="sw-gl">
        <section className="sw-card" aria-labelledby="gl-h">
          <h1 id="gl-h" className="sw-h1">
            Guest list
          </h1>
          <div className="sw-filters">
            <label className="sw-field wide">
              Search
              <input
                className="sw-input"
                type="search"
                value={q}
                placeholder="Name or party"
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <label className="sw-field">
              Party
              <select className="sw-select" value={party} onChange={(e) => setParty(e.target.value)}>
                <option value="all">All parties</option>
                {PARTIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="sw-field">
              RSVP
              <select className="sw-select" value={rsvp} onChange={(e) => setRsvp(e.target.value)}>
                <option value="all">Any reply</option>
                {(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => (
                  <option key={r} value={r}>
                    {RSVP_LABEL[r]}
                  </option>
                ))}
              </select>
            </label>
            <label className="sw-field">
              Diet
              <select className="sw-select" value={diet} onChange={(e) => setDiet(e.target.value)}>
                <option value="all">Any diet</option>
                <option value="any">Any dietary need</option>
                <option value="none">No dietary need</option>
                {DIETS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="sw-field">
              Seating
              <select className="sw-select" value={seating} onChange={(e) => setSeating(e.target.value)}>
                <option value="all">Seated or not</option>
                <option value="seated">Seated</option>
                <option value="unseated">Not seated</option>
              </select>
            </label>
          </div>
          <p className="sw-sub" role="status" aria-live="polite" style={{ marginBottom: 8 }}>
            Showing {rows.length} of {GUESTS.length} guests.{" "}
            <button type="button" className="sw-btn small" onClick={reset}>
              Clear filters
            </button>
          </p>
          {rows.length === 0 ? (
            <p className="sw-empty">No guests match these filters.</p>
          ) : (
            <div className="sw-tablewrap">
              <table className="sw-t sw-gt">
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
                  {rows.map((g) => {
                    const tid = plan.tableOf[g.id];
                    return (
                      <tr key={g.id}>
                        <td data-label="Guest">{g.name}</td>
                        <td data-label="Party">{g.party}</td>
                        <td data-label="RSVP">
                          <RsvpTag rsvp={g.rsvp} />
                        </td>
                        <td data-label="Diet">{g.diet ? <DietTag diet={g.diet} /> : <span className="sw-sub">None</span>}</td>
                        <td data-label="Table">
                          {tid ? (
                            <Link href="/" onClick={() => plan.selectTable(tid)}>
                              {tableById.get(tid)?.name}
                            </Link>
                          ) : g.rsvp === "no" ? (
                            <span className="sw-sub">Not attending</span>
                          ) : (
                            <span className="sw-tag plain maybe">Not seated</span>
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

        <section className="sw-card" aria-labelledby="meals-h" style={{ marginTop: 0 }}>
          <h2 id="meals-h">Meals for the caterer</h2>
          <p className="sw-sub" style={{ marginBottom: 8 }}>
            Confirmed guests per meal; guests who have not answered yet are counted separately.
          </p>
          <div className="sw-tablewrap">
            <table className="sw-t">
              <thead>
                <tr>
                  <th scope="col">Meal</th>
                  <th scope="col" className="num">
                    Confirmed
                  </th>
                  <th scope="col" className="num">
                    Awaiting
                  </th>
                </tr>
              </thead>
              <tbody>
                {meals.list.map((r) => (
                  <tr key={r.name}>
                    <th scope="row" style={{ textTransform: "none", letterSpacing: 0, fontSize: 14, color: "var(--ink)", fontWeight: 500 }}>
                      {r.name}
                    </th>
                    <td className="num">{r.yes}</td>
                    <td className="num">{r.open}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td className="num">{meals.yes}</td>
                  <td className="num">{meals.open}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="sw-sub" style={{ marginTop: 8 }}>
            {meals.declined} declined and not counted.
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
            <button type="button" className="sw-btn primary" onClick={copy}>
              Copy meal counts
            </button>
            <span className="sw-sub" role="status" aria-live="polite">
              {copied}
            </span>
          </div>
        </section>
      </div>
    </AppFrame>
  );
}
