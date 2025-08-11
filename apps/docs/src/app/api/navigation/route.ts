import getNavigation from "@/app/utils/getNavigation";
import { NextResponse } from "next/server";

export async function GET() {
  const navigation = getNavigation();
  return NextResponse.json(navigation);
}
