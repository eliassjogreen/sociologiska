import { useRef } from "preact/hooks";

/**
 * Returns the most recent non-null value. Lets a dialog keep its content
 * while it animates closed instead of blanking out.
 */
export function useLastNonNull<T>(value: T | null): T | null {
  const last = useRef<T | null>(value);

  if (value !== null) {
    last.current = value;
  }

  return last.current;
}
