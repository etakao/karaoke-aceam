import { NextRequest, NextResponse } from "next/server";
import { getState, setSingers, validateSingerShape, type Singer } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getState());
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const list = Array.isArray(body)
    ? body
    : body && typeof body === "object" && Array.isArray((body as Record<string, unknown>).singers)
      ? (body as Record<string, unknown>).singers
      : null;

  if (!list) {
    return NextResponse.json(
      { error: "Envie uma lista de cantores ou um objeto com a chave \"singers\"." },
      { status: 400 }
    );
  }

  const invalidIndex = (list as unknown[]).findIndex(
    (item) => !validateSingerShape(item) || typeof (item as Record<string, unknown>).numero !== "number"
  );
  if (invalidIndex !== -1) {
    return NextResponse.json(
      {
        error: `Cantor na posição ${invalidIndex + 1} é inválido. Cada item precisa de "numero" (número), "nome_cantor", "nome_musica" e "categoria" (texto). "cidade" é opcional.`,
      },
      { status: 400 }
    );
  }

  const state = setSingers(list as Singer[]);
  return NextResponse.json(state);
}
