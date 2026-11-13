import { guests, rules as ruleData, type Rule } from "./data";
import { distance, findFixture, firstName, fixtureCentre, guestById, tableById, tableGeometry } from "./plan";

export type RuleStatus = "ok" | "broken" | "open";

export interface RuleResult {
  id: string;
  rule: Rule;
  status: RuleStatus;
  title: string;
  names: string;
  summary: string;
  detail: string;
  tableIds: string[];
  guestIds: string[];
  warning?: string;
}

/** A table counts as "near" the garden doors within this distance (metres). */
export const NEAR_M = 4.5;
/** ...and as "away from the band" beyond this distance. */
export const AWAY_M = 6;

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function words(text: string): string {
  return ` ${text.replace(/[^A-Za-zÀ-ÿ]+/g, " ")} `;
}

/** The note may name someone the rule's guest ids do not include. */
function noteWarning(rule: Rule): string | undefined {
  const inRule = new Set(rule.guests);
  const text = words(rule.note);
  const strangers = guests.filter((g) => !inRule.has(g.id) && text.includes(` ${firstName(g.name)} `));
  if (strangers.length === 0) return undefined;
  const names = strangers.map((g) => g.name).join(" and ");
  return `The note names ${names}, who ${strangers.length > 1 ? "are" : "is"} not in this rule. Check the guest list.`;
}

export function evaluateRules(guestTable: Record<string, string | null>): RuleResult[] {
  return ruleData.map((rule, index): RuleResult => {
    const names = rule.guests.map((id) => guestById[id]?.name ?? id);
    const nameText = names.join(" and ");
    const tabs = rule.guests.map((id) => guestTable[id] ?? null);
    const tn = (id: string | null) => (id ? (tableById[id]?.name ?? id) : "no table");
    const base = { id: `rule-${index}`, rule, names: nameText, guestIds: rule.guests, warning: noteWarning(rule) };
    const unseated = names.filter((_, i) => tabs[i] === null);

    if (rule.kind === "together") {
      const title = "Keep together";
      if (unseated.length > 0) {
        const seatedTables = unique(tabs.filter((t): t is string => t !== null));
        return {
          ...base, title, status: "open", tableIds: seatedTables,
          summary: `${title}: ${nameText}, not both seated yet`,
          detail: `${unseated.join(" and ")} ${unseated.length > 1 ? "are" : "is"} not seated yet.`,
        };
      }
      const same = tabs.every((t) => t === tabs[0]);
      const tableIds = unique(tabs.filter((t): t is string => t !== null));
      return same
        ? { ...base, title, status: "ok", tableIds, summary: `${title}: ${nameText} at ${tn(tabs[0] ?? null)}`, detail: `Both at ${tn(tabs[0] ?? null)}.` }
        : {
            ...base, title, status: "broken", tableIds,
            summary: `${title}: ${nameText} are at different tables`,
            detail: names.map((n, i) => `${n} is at ${tn(tabs[i] ?? null)}`).join(", ") + ".",
          };
    }

    if (rule.kind === "apart") {
      const title = "Keep apart";
      const seated = tabs.filter((t): t is string => t !== null);
      const clash = seated.find((t, i) => seated.indexOf(t) !== i);
      if (clash) {
        return {
          ...base, title, status: "broken", tableIds: [clash],
          summary: `${title}: ${nameText} are both at ${tn(clash)}`,
          detail: `Both are at ${tn(clash)}.`,
        };
      }
      return {
        ...base, title, status: "ok", tableIds: unique(seated),
        summary: `${title}: ${nameText}`,
        detail: seated.length < 2 ? "Not at the same table (someone is not seated yet)." : "At different tables.",
      };
    }

    const title = "Seat near the garden doors";
    const tid = tabs[0] ?? null;
    if (!tid) {
      return {
        ...base, title, status: "open", tableIds: [],
        summary: `${title}: ${nameText} is not seated yet`,
        detail: `${nameText} is not seated yet.`,
      };
    }
    const door = findFixture("door");
    const stage = findFixture("stage");
    const centre = tableGeometry(tableById[tid]).centre;
    const dDoor = door ? distance(centre, fixtureCentre(door)) : 0;
    const dStage = stage ? distance(centre, fixtureCentre(stage)) : Infinity;
    const near = dDoor <= NEAR_M;
    const away = dStage >= AWAY_M;
    if (near && away) {
      return {
        ...base, title, status: "ok", tableIds: [tid],
        summary: `${title}: ${nameText} at ${tn(tid)}`,
        detail: `${tn(tid)} is ${dDoor.toFixed(1)} m from the garden doors and ${dStage.toFixed(1)} m from the band.`,
      };
    }
    return {
      ...base, title, status: "broken", tableIds: [tid],
      summary: `${title}: ${nameText} is at ${tn(tid)}, ${dDoor.toFixed(1)} m from the doors`,
      detail: near
        ? `${tn(tid)} is only ${dStage.toFixed(1)} m from the band (wanted ${AWAY_M} m or more).`
        : `${tn(tid)} is ${dDoor.toFixed(1)} m from the garden doors (wanted ${NEAR_M} m or less).`,
    };
  });
}
