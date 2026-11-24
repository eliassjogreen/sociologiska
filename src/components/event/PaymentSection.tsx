import { formatAmount } from "../../lib/event/payment";
import { CheckboxField } from "../forms/CheckboxField";
import { Button } from "../ui/Button";
import styles from "./PaymentSection.module.css";

export interface PaymentSectionProps {
  titleId: string;
  total: number;
  membershipRequired: boolean;
  submitting: boolean;
}

export function PaymentSection({
  titleId,
  total,
  membershipRequired,
  submitting,
}: PaymentSectionProps) {
  return (
    <section className={styles.payment} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        Betalning
      </h2>

      <p className={styles.total}>
        Totalbelopp: <span>{formatAmount(total)}</span> kr
      </p>

      {membershipRequired && (
        <CheckboxField
          id="medlem"
          name="medlem"
          label="Jag förstår att endast medlemmar i Sociologiska Föreningen får delta på evenemanget."
          required
        />
      )}

      <CheckboxField
        id="samtycke"
        name="samtycke"
        label="Jag förstår även att Sociologiska Föreningen kommer att spara mina uppgifter i syfte att kunna administrera evenemanget och kontakta deltagare vid behov. Dessutom förstår jag att biljetten inte är återbetalningsbar."
        required
      />

      <menu role="list" className={styles.actions}>
        <li>
          <Button type="submit" value="swish" className={styles.swish} disabled={submitting}>
            Öppna Swish
          </Button>
        </li>
        <li>
          <Button type="submit" value="qr" className={styles.qr} disabled={submitting}>
            Visa Swish QR-kod
          </Button>
        </li>
      </menu>
    </section>
  );
}
