import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MemberDetail } from "@/components/MemberDetail";
import { MEMBERS, getMember } from "@/lib/data";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return MEMBERS.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const member = getMember(id);
  return { title: member ? `${member.name} · Team · Lumen` : "Member not found · Lumen" };
}

export default async function MemberPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();
  return <MemberDetail member={member} />;
}
