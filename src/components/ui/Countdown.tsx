import { getCountdownParts, type CountdownParts } from "../../lib/countdown";
import styles from "./Countdown.module.css";

const UNITS: ReadonlyArray<{ key: keyof CountdownParts; label: string }> = [
  { key: "days", label: "dagar" },
  { key: "hours", label: "timmar" },
  { key: "minutes", label: "minuter" },
  { key: "seconds", label: "sekunder" },
];

export interface CountdownProps {
  remainingMs: number;
}

export function Countdown({ remainingMs }: CountdownProps) {
  const parts = getCountdownParts(remainingMs);

  return (
    <dl className={styles.countdown}>
      {UNITS.map(({ key, label }) => (
        <div key={key} className={styles.unit}>
          <dt className={styles.label}>{label}</dt>
          <dd className={styles.value}>{String(parts[key]).padStart(2, "0")}</dd>
        </div>
      ))}
    </dl>
  );
}
