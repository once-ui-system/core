export const product = {
  name: "Lumen",
  description: "Product analytics and issue tracking for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type ProjectStatus = "Active" | "Paused" | "Archived";

export type Project = {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
};

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export type MemberStatus = "Active" | "Invited" | "Suspended";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
  status: MemberStatus;
  joined: string | null;
};

export const members: Member[] = [
  { id: "m-01", name: "Maya Okafor", email: "maya@acmelabs.io", role: "Owner", status: "Active", joined: "2024-03-02" },
  { id: "m-02", name: "Daniel Reyes", email: "daniel@acmelabs.io", role: "Admin", status: "Active", joined: "2024-05-19" },
  { id: "m-03", name: "Priya Natarajan", email: "priya@acmelabs.io", role: "Member", status: "Active", joined: "2024-11-07" },
  { id: "m-04", name: "Tomás Lindqvist", email: "tomas@acmelabs.io", role: "Member", status: "Active", joined: "2025-02-14" },
  { id: "m-05", name: "Hana Sato", email: "hana@acmelabs.io", role: "Member", status: "Invited", joined: null },
  { id: "m-06", name: "Grace Mensah", email: "grace@acmelabs.io", role: "Viewer", status: "Active", joined: "2025-06-30" },
  { id: "m-07", name: "Leo Brandt", email: "leo@acmelabs.io", role: "Member", status: "Suspended", joined: "2025-01-21" },
  { id: "m-08", name: "Ines Duarte", email: "ines@acmelabs.io", role: "Viewer", status: "Invited", joined: null },
];

export type NavIconName = "home" | "folder" | "people";

export type NavLink = { href: string; label: string; icon: NavIconName; description: string };

export const navLinks: NavLink[] = [
  { href: "/", label: "Dashboard", icon: "home", description: "Overview of your workspace" },
  { href: "/projects", label: "Projects", icon: "folder", description: "All projects and their status" },
  { href: "/members", label: "Members", icon: "people", description: "People with access to Lumen" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string | null): string {
  if (!iso) return "Pending";
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** The three most recently updated projects, newest first. */
export const recentProjects: Project[] = [...projects]
  .sort((a, b) => b.updated.localeCompare(a.updated))
  .slice(0, 3);
