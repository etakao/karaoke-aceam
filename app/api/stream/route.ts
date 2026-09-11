import { NextResponse } from "next/server";
import { getState, subscribe, type ScheduleState } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toEvent(state: ScheduleState) {
  return `data: ${JSON.stringify(state)}\n\n`;
}

export async function GET() {
  const encoder = new TextEncoder();
  let unsubscribe: () => void = () => {};
  let heartbeat: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(toEvent(getState())));

      unsubscribe = subscribe((state) => {
        controller.enqueue(encoder.encode(toEvent(state)));
      });

      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 20000);
    },
    cancel() {
      unsubscribe();
      clearInterval(heartbeat);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
