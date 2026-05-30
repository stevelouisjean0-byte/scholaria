import { NextResponse } from "next/server";
import { renderDPA } from "@/lib/reports/dpa-template";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  const bytes = await renderDPA();
  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="dec-dpa-template.pdf"',
      "Cache-Control": "public, max-age=86400, s-maxage=86400"
    }
  });
}
