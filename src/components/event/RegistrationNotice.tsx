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
        <p className={styles.text}>Det går inte längre att anmäla sig till evenemanget.</p>
      </section>
    );
  }

  return (
    <section className={styles.notice}>
      <h2 className={styles.title}>Anmälan öppnar snart</h2>
      <p className={styles.text}>Anmälan öppnar {formatRegistrationDateTime(props.startsAt)}.</p>
      <Countdown remainingMs={props.remainingMs} />
    </section>
  );
}
