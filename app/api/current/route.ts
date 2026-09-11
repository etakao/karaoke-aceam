import { NextRequest, NextResponse } from "next/server";
import { setCurrent } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  const numero = body && typeof body === "object" ? (body as Record<string, unknown>).numero : undefined;
  if (numero !== null && typeof numero !== "number") {
    return NextResponse.json({ error: "Campo \"numero\" precisa ser número ou null." }, { status: 400 });
  }
  const state = setCurrent(numero);
  return NextResponse.json(state);
}
