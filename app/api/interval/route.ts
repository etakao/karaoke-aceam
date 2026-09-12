import { NextRequest, NextResponse } from "next/server";
import { setIntervalMode } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  const on = body && typeof body === "object" ? (body as Record<string, unknown>).on : undefined;
  if (typeof on !== "boolean") {
    return NextResponse.json({ error: "Campo \"on\" precisa ser booleano." }, { status: 400 });
  }
  const state = setIntervalMode(on);
  return NextResponse.json(state);
}
