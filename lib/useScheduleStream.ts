"use client";

import { useEffect, useRef, useState } from "react";
import type { ScheduleState } from "@/lib/store";

export function useScheduleStream(initialState: ScheduleState) {
  const [state, setState] = useState(initialState);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const source = new EventSource("/api/stream");
    sourceRef.current = source;

    source.onmessage = (event) => {
      try {
        const next = JSON.parse(event.data) as ScheduleState;
        setState(next);
      } catch {
        // ignore malformed frame
      }
    };

    return () => {
      source.close();
    };
  }, []);

  return state;
}
