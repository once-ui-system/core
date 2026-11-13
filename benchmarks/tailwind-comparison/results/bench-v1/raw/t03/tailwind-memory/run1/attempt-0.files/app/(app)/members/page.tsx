import { formatDate, members } from "@/lib/data";

const statusStyle = {
  Active: "bg-emerald-500/15 text-emerald-600",
  Invited: "bg-sky-500/15 text-sky-600",
  Suspended: "bg-red-500/15 text-red-600",
} as const;

export default function MembersPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
      <p className="mt-1 text-sm opacity-70">
        {members.length} people have access to this workspace. Use the command palette to invite someone new.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-500/25">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <caption className="sr-only">Workspace members with role, status and join date</caption>
          <thead className="bg-slate-500/10 text-xs uppercase tracking-wide opacity-80">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Name</th>
              <th scope="col" className="px-4 py-3 font-semibold">Role</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-500/20">
            {members.map((m) => (
              <tr key={m.id}>
                <th scope="row" className="px-4 py-3 font-medium">
                  {m.name}
                  <span className="block text-xs font-normal opacity-70">{m.email}</span>
                </th>
                <td className="px-4 py-3">{m.role}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[m.status]}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(m.joined)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
