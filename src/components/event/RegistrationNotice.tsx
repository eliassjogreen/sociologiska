import { formatRegistrationDateTime } from "../../lib/event/registration";
import { Countdown } from "../ui/Countdown";
import styles from "./RegistrationNotice.module.css";

export type RegistrationNoticeProps =
  | { status: "upcoming"; startsAt: Date; remainingMs: number }
  | { status: "closed" };

export function RegistrationNotice(props: RegistrationNoticeProps) {
  if (props.status === "closed") {
    return (
      <section className={styles.notice}>
        <h2 className={styles.title}>Anmälan är stängd</h2>
        <p className={styles.text}>
          Attans bananer, det går inte längre att anmäla sig till evenemanget.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.notice}>
      <h2 className={styles.title}>Anmälan öppnar snart</h2>
      <p className={styles.text}>
        Sakta i backarna, anmälan öppnar först {formatRegistrationDateTime(props.startsAt)}.
      </p>
      <Countdown className={styles.countdown} remainingMs={props.remainingMs} />
    </section>
  );
}
