import { NextRequest, NextResponse } from "next/server";
import { addSinger, validateSingerShape } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!validateSingerShape(body)) {
    return NextResponse.json(
      { error: "Cantor inválido. Informe \"nome_cantor\", \"nome_musica\" e \"categoria\" (texto). \"cidade\" é opcional." },
      { status: 400 }
    );
  }

  const state = addSinger(body);
  return NextResponse.json(state);
}
