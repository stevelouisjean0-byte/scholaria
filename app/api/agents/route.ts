import { NextResponse } from "next/server";
import { publicAgents } from "@/lib/agents";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ agents: publicAgents() });
}
