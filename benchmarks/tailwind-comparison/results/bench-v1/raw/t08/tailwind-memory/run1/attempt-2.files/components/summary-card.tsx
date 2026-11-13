import { teamSizes, themes, type WizardData } from "@/lib/data";

function Row({ label, value }: { label: string; value: string }) {
  const empty = value === "";
  return (
    <div className="py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-600">{label}</dt>
      <dd
        className={"mt-0.5 break-words text-sm " + (empty ? "text-slate-500" : "text-slate-900")}
      >
        {empty ? "Not provided yet" : value}
      </dd>
    </div>
  );
}

export function SummaryCard({ data }: { data: WizardData }) {
  const teamSizeMatch = teamSizes.find((t) => t.value === data.teamSize);
  const themeMatch = themes.find((t) => t.value === data.theme);
  const invites = data.invites.map((v) => v.trim()).filter((v) => v !== "");

  return (
    <aside
      aria-labelledby="summary-heading"
      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6 lg:sticky lg:top-8"
    >
      <h2 id="summary-heading" className="text-base font-semibold text-slate-900">
        Your setup so far
      </h2>
      <dl className="mt-2 divide-y divide-slate-200">
        <Row label="Name" value={data.name.trim()} />
        <Row label="Work email" value={data.email.trim()} />
        <Row label="Workspace" value={data.workspace.trim()} />
        <Row label="Team size" value={teamSizeMatch ? teamSizeMatch.label : ""} />
        <div className="py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-600">
            Invitations
          </dt>
          <dd className="mt-0.5 text-sm">
            {invites.length === 0 ? (
              <span className="text-slate-500">No one invited yet</span>
            ) : (
              <ul className="space-y-0.5 text-slate-900">
                {invites.map((e, i) => (
                  <li key={i} className="break-all">
                    {e}
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>
        <Row label="Theme" value={themeMatch ? themeMatch.label : ""} />
        <Row label="Weekly digest" value={data.digest ? "On" : "Off"} />
      </dl>
    </aside>
  );
}
