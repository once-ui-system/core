import {
  FIXTURES,
  GUESTS_BY_ID,
  RULES,
  TABLES,
  TABLES_BY_ID,
  type SeatingRule,
} from "./data"
import { distance, tableGeometry } from "./geometry"

export type RuleStatus = "ok" | "broken" | "open"

export interface RuleResult {
  id: string
  rule: SeatingRule
  status: RuleStatus
  title: string
  detail: string
  /** tables to flag when the rule is broken */
  tables: string[]
  /** every table the rule's guests currently sit at */
  involved: string[]
}

/** A table is "near the garden doors" within this many metres, and "away from the band" beyond the second. */
export const NEAR_DOORS_M = 4
export const AWAY_FROM_BAND_M = 6

const doors = FIXTURES.find((f) => f.kind === "door")
const stage = FIXTURES.find((f) => f.kind === "stage")

function centre(f: { x: number; y: number; w: number; h: number } | undefined) {
  return f ? { x: f.x + f.w / 2, y: f.y + f.h / 2 } : { x: 0, y: 0 }
}

const doorC = centre(doors)
const stageC = centre(stage)

export function tableAccess(tableId: string) {
  const t = TABLES_BY_ID[tableId]
  const geo = tableGeometry(t)
  const toDoors = distance(geo.cx, geo.cy, doorC.x, doorC.y)
  const toBand = distance(geo.cx, geo.cy, stageC.x, stageC.y)
  return {
    toDoors,
    toBand,
    ok: toDoors <= NEAR_DOORS_M && toBand >= AWAY_FROM_BAND_M,
  }
}

const tn = (id: string) => TABLES_BY_ID[id]?.name ?? id
const gn = (id: string) => GUESTS_BY_ID[id]?.name ?? id
const first = (name: string) => name.split(" ")[0]

export function evaluateRules(tableOf: Record<string, string | null>): RuleResult[] {
  return RULES.map((rule, i): RuleResult => {
    const id = `rule-${i}`
    const placed = rule.guests.map((gid) => tableOf[gid] ?? null)
    const involved = Array.from(new Set(placed.filter((t): t is string => t !== null)))

    if (rule.kind === "together") {
      const [a, b] = rule.guests
      const title = `${gn(a)} and ${gn(b)} together`
      const unseated = rule.guests.filter((gid) => !tableOf[gid])
      if (unseated.length === 2) {
        return { id, rule, status: "open", title, detail: "Neither is seated yet.", tables: [], involved }
      }
      if (unseated.length === 1) {
        return {
          id,
          rule,
          status: "open",
          title,
          detail: `${first(gn(unseated[0]))} still needs a seat at ${tn(involved[0])}.`,
          tables: [],
          involved,
        }
      }
      if (involved.length === 1) {
        return { id, rule, status: "ok", title, detail: `Both at ${tn(involved[0])}.`, tables: [], involved }
      }
      return {
        id,
        rule,
        status: "broken",
        title,
        detail: `Split across ${tn(placed[0] as string)} and ${tn(placed[1] as string)}.`,
        tables: involved,
        involved,
      }
    }

    if (rule.kind === "apart") {
      const [a, b] = rule.guests
      const title = `${gn(a)} apart from ${gn(b)}`
      if (placed[0] && placed[0] === placed[1]) {
        return {
          id,
          rule,
          status: "broken",
          title,
          detail: `Both at ${tn(placed[0])}.`,
          tables: [placed[0]],
          involved,
        }
      }
      const seatedBoth = placed[0] && placed[1]
      return {
        id,
        rule,
        status: "ok",
        title,
        detail: seatedBoth
          ? `${tn(placed[0] as string)} and ${tn(placed[1] as string)}.`
          : "Not at the same table.",
        tables: [],
        involved,
      }
    }

    // near
    const gid = rule.guests[0]
    const title = `${gn(gid)} near the garden doors`
    const t = placed[0]
    const good = TABLES.filter((x) => tableAccess(x.id).ok).map((x) => x.name)
    if (!t) {
      return {
        id,
        rule,
        status: "open",
        title,
        detail: good.length ? `Not seated yet. Suitable: ${good.join(", ")}.` : "Not seated yet.",
        tables: [],
        involved,
      }
    }
    const acc = tableAccess(t)
    if (acc.ok) {
      return {
        id,
        rule,
        status: "ok",
        title,
        detail: `${tn(t)} is ${acc.toDoors.toFixed(1)} m from the doors and ${acc.toBand.toFixed(1)} m from the band.`,
        tables: [],
        involved,
      }
    }
    const why =
      acc.toDoors > NEAR_DOORS_M
        ? `${tn(t)} is ${acc.toDoors.toFixed(1)} m from the doors (keep within ${NEAR_DOORS_M} m).`
        : `${tn(t)} is only ${acc.toBand.toFixed(1)} m from the band.`
    return {
      id,
      rule,
      status: "broken",
      title,
      detail: good.length ? `${why} Try ${good.join(", ")}.` : why,
      tables: [t],
      involved,
    }
  })
}
