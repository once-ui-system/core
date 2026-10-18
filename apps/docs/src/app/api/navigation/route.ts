import { NextResponse } from "next/server";
import getNavigation, { withAvailability } from "@/app/utils/getNavigation";

// Release marks come from npm; see product/published.ts.
export const revalidate = 3600;

export async function GET() {
  const navigation = await withAvailability(getNavigation());
  return NextResponse.json(navigation);
}
