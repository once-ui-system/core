import { notFound } from "next/navigation";

// Never matched in practice: `/` is owned by src/app/page.tsx. This file exists
// only because the (team) group's earlier page could not be deleted.
export default function Page() {
  notFound();
}
