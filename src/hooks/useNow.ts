import { useEffect, useState } from "preact/hooks";

/**
 * Returns the current time, refreshed every `intervalMs`.
 * Returns `null` until mounted so server-rendered output never depends on the clock.
 */
export function useNow(intervalMs: number): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());

    const id = setInterval(() => setNow(new Date()), intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
