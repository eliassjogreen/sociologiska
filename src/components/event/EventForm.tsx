import type { TargetedSubmitEvent } from "preact";
import { useRef } from "preact/hooks";
import { useEventRegistration } from "../../hooks/useEventRegistration";
import { useNow } from "../../hooks/useNow";
import { SONGBOOK_PRICE } from "../../lib/event/payment";
import { getRegistrationStatus } from "../../lib/event/registration";
import { CheckboxField } from "../forms/CheckboxField";
import { TextField } from "../forms/TextField";
import { EventHeader } from "./EventHeader";
import { PaymentSection } from "./PaymentSection";
import { ErrorDialog, WaitDialog } from "./RegistrationDialogs";
import { RegistrationNotice } from "./RegistrationNotice";
import { SwishPaymentDialog } from "./SwishPaymentDialog";
import styles from "./EventForm.module.css";

export interface EventFormProps {
  name: string;
  slug: string;
  swishNumber: string;
  basePrice: number;
  membershipRequired?: boolean;
  imageSrc?: string;
  imageSrcSet?: string;
  imageAlt?: string;
  description?: string;
  offerSongbook?: boolean;
  registrationStart: Date;
  registrationEnd: Date;
}

export function EventForm({
  name,
  slug,
  swishNumber,
  basePrice,
  membershipRequired = false,
  imageSrc,
  imageSrcSet,
  imageAlt,
  description,
  offerSongbook,
  registrationStart,
  registrationEnd,
}: EventFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const registration = useEventRegistration({
    eventSlug: slug,
    swishNumber,
    basePrice,
    formRef,
  });
  const now = useNow(1000);
  const status = now
    ? getRegistrationStatus(now, { registrationStart, registrationEnd })
    : null;
  const remainingMs = now ? registrationStart.getTime() - now.getTime() : 0;

  function handleSubmit(event: TargetedSubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!event.currentTarget.reportValidity()) {
      return;
    }

    const submitter = event.submitter;
    const mode =
      submitter instanceof HTMLButtonElement && submitter.value === "qr"
        ? "qr"
        : "swish";

    registration.startPayment(mode);
  }

  return (
    <section className={styles.root}>
      <form
        ref={formRef}
        method="post"
        className={styles.form}
        onSubmit={handleSubmit}
      >
        {status === "open" && (
          <>
            <EventHeader
              name={name}
              description={description}
              imageSrc={imageSrc}
              imageSrcSet={imageSrcSet}
              imageAlt={imageAlt}
            />

            <TextField
              id="name"
              name="name"
              label="Namn"
              autoComplete="name"
              required
            />

            <TextField
              id="email"
              name="email"
              type="email"
              label="E-Post"
              autoComplete="email"
            />

            <TextField
              id="phone"
              name="phone"
              type="tel"
              label="Telefonnummer"
              autoComplete="tel"
              required
            />

            <TextField
              id="wants-neighbor"
              name="wants-neighbor"
              label="Önska bordsgranne"
              help="Du får önska en (1) person som du vill sitta bredvid. Vi kan inte garantera att ni får sitta tillsammans, men vi gör vårt bästa."
            />

            <TextField
              id="dietary-preferences"
              name="dietary-preferences"
              label="Specialkost"
              help="Om du har någon specialkost ange det här. Vi försöker tillgodose alla så gott vi bara kan."
            />

            {offerSongbook && (
              <CheckboxField
                id="wants-songbook"
                name="wants-songbook"
                label={`Jag vill köpa sociologiska föreningens sångbok (${SONGBOOK_PRICE} kr)`}
                checked={registration.songbook}
                onChange={(event) =>
                  registration.setSongbook(event.currentTarget.checked)
                }
              />
            )}

            <PaymentSection
              titleId={`payment-section-${slug}`}
              total={registration.total}
              membershipRequired={membershipRequired}
              submitting={registration.wait === "payment"}
            />
          </>
        )}

        {status === "upcoming" && (
          <RegistrationNotice
            status="upcoming"
            startsAt={registrationStart}
            remainingMs={remainingMs}
          />
        )}

        {status === "closed" && <RegistrationNotice status="closed" />}
      </form>

      <SwishPaymentDialog
        payment={registration.payment}
        confirming={registration.wait === "confirming"}
        onConfirm={registration.confirmPayment}
        onShowQr={registration.showQrCode}
        onCancel={registration.cancelPayment}
        onClose={registration.closePayment}
      />
      <WaitDialog state={registration.wait} />
      <ErrorDialog
        message={registration.error}
        onDismiss={registration.dismissError}
      />
    </section>
  );
}
