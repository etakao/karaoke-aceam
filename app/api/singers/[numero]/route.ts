import { NextRequest, NextResponse } from "next/server";
import { deleteSinger, updateSinger } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ numero: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { numero: numeroParam } = await params;
  const numero = Number(numeroParam);
  if (Number.isNaN(numero)) {
    return NextResponse.json({ error: "\"numero\" precisa ser um número." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  const v = (body ?? {}) as Record<string, unknown>;
  const patch: {
    numero?: number;
    nome_cantor?: string;
    nome_musica?: string;
    cidade?: string;
    categoria?: string;
  } = {};

  if (v.numero !== undefined) {
    if (typeof v.numero !== "number" || Number.isNaN(v.numero)) {
      return NextResponse.json({ error: "\"numero\" precisa ser número." }, { status: 400 });
    }
    patch.numero = v.numero;
  }
  if (v.nome_cantor !== undefined) {
    if (typeof v.nome_cantor !== "string" || v.nome_cantor.trim() === "") {
      return NextResponse.json({ error: "\"nome_cantor\" precisa ser texto." }, { status: 400 });
    }
    patch.nome_cantor = v.nome_cantor;
  }
  if (v.nome_musica !== undefined) {
    if (typeof v.nome_musica !== "string" || v.nome_musica.trim() === "") {
      return NextResponse.json({ error: "\"nome_musica\" precisa ser texto." }, { status: 400 });
    }
    patch.nome_musica = v.nome_musica;
  }
  if (v.categoria !== undefined) {
    if (typeof v.categoria !== "string" || v.categoria.trim() === "") {
      return NextResponse.json({ error: "\"categoria\" precisa ser texto." }, { status: 400 });
    }
    patch.categoria = v.categoria;
  }
  if (v.cidade !== undefined) {
    if (typeof v.cidade !== "string") {
      return NextResponse.json({ error: "\"cidade\" precisa ser texto." }, { status: 400 });
    }
    patch.cidade = v.cidade;
  }

  const state = updateSinger(numero, patch);
  return NextResponse.json(state);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { numero: numeroParam } = await params;
  const numero = Number(numeroParam);
  if (Number.isNaN(numero)) {
    return NextResponse.json({ error: "\"numero\" precisa ser um número." }, { status: 400 });
  }
  const state = deleteSinger(numero);
  return NextResponse.json(state);
}
