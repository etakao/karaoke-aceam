import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import karaokeSingers from '@/data/cantores_aceam.json';

export type Singer = {
  numero: number;
  nome_cantor: string;
  nome_musica: string;
  cidade: string;
  categoria: string;
};

export type ScheduleState = {
  singers: Singer[];
  currentNumber: number | null;
  intervalMode: boolean;
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'cantores_aceam.json');

const seedRaw = karaokeSingers as unknown;
const SEED: ScheduleState = {
  singers: Array.isArray(seedRaw)
    ? (seedRaw as Singer[])
    : (seedRaw as ScheduleState).singers,
  currentNumber: null,
  intervalMode: false,
};

type Global = typeof globalThis & {
  __karaokeBus?: EventEmitter;
  __karaokeState?: ScheduleState;
};

const g = globalThis as Global;

function readFromDisk(): ScheduleState {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed))
      return { singers: parsed, currentNumber: null, intervalMode: false };
    if (parsed && Array.isArray(parsed.singers))
      return { intervalMode: false, ...parsed };
  } catch {
    // no file yet, fall through to seed
  }
  return SEED;
}

function writeToDisk(state: ScheduleState) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch {
    // best-effort persistence; in-memory state still holds
  }
}

if (!g.__karaokeState) {
  g.__karaokeState = readFromDisk();
}
if (!g.__karaokeBus) {
  g.__karaokeBus = new EventEmitter();
  g.__karaokeBus.setMaxListeners(0);
}

const state = g.__karaokeState;
const bus = g.__karaokeBus;

function persistAndNotify() {
  writeToDisk(state);
  bus.emit('update', getState());
}

export function getState(): ScheduleState {
  return {
    singers: [...state.singers].sort((a, b) => a.numero - b.numero),
    currentNumber: state.currentNumber,
    intervalMode: state.intervalMode,
  };
}

function hasNumeroCollision(numero: number, exclude?: number) {
  return state.singers.some((s) => s.numero !== exclude && s.numero === numero);
}

function shiftNumerosFrom(numero: number, exclude?: number) {
  for (const s of state.singers) {
    if (s.numero !== exclude && s.numero >= numero) s.numero += 1;
  }
}

export function setSingers(singers: Singer[]) {
  state.singers = singers;
  if (!state.singers.some((s) => s.numero === state.currentNumber)) {
    state.currentNumber = null;
  }
  persistAndNotify();
  return getState();
}

export function addSinger(singer: Omit<Singer, 'numero'> & { numero?: number }) {
  const numero =
    singer.numero ?? state.singers.reduce((max, s) => Math.max(max, s.numero), 0) + 1;
  if (hasNumeroCollision(numero)) shiftNumerosFrom(numero);
  state.singers.push({ ...singer, numero });
  persistAndNotify();
  return getState();
}

export function updateSinger(
  numero: number,
  patch: Partial<Omit<Singer, 'numero'>> & { numero?: number },
) {
  const singer = state.singers.find((s) => s.numero === numero);
  if (!singer) return getState();
  if (
    patch.numero !== undefined &&
    patch.numero !== singer.numero &&
    hasNumeroCollision(patch.numero, numero)
  ) {
    shiftNumerosFrom(patch.numero, numero);
  }
  if (state.currentNumber === numero && patch.numero !== undefined) {
    state.currentNumber = patch.numero;
  }
  Object.assign(singer, patch);
  persistAndNotify();
  return getState();
}

export function deleteSinger(numero: number) {
  state.singers = state.singers.filter((s) => s.numero !== numero);
  if (state.currentNumber === numero) state.currentNumber = null;
  persistAndNotify();
  return getState();
}

export function setCurrent(numero: number | null) {
  if (numero !== null && !state.singers.some((s) => s.numero === numero)) {
    return getState();
  }
  state.currentNumber = numero;
  persistAndNotify();
  return getState();
}

export function setIntervalMode(on: boolean) {
  state.intervalMode = on;
  persistAndNotify();
  return getState();
}

export function subscribe(listener: (state: ScheduleState) => void) {
  bus.on('update', listener);
  return () => bus.off('update', listener);
}

export function validateSingerShape(
  value: unknown,
): value is Omit<Singer, 'numero'> & { numero?: number } {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.nome_cantor !== 'string' || v.nome_cantor.trim() === '') return false;
  if (typeof v.nome_musica !== 'string' || v.nome_musica.trim() === '') return false;
  if (typeof v.categoria !== 'string' || v.categoria.trim() === '') return false;
  if (typeof v.cidade !== 'string') return false;
  if (v.numero !== undefined && typeof v.numero !== 'number') return false;
  return true;
}
