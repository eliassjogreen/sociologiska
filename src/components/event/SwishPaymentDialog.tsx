import { useLastNonNull } from "../../hooks/useLastNonNull";
import { useQrDataUrl } from "../../hooks/useQrDataUrl";
import type { PendingPayment } from "../../lib/event/payment";
import { Button, LinkButton } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import styles from "./SwishPaymentDialog.module.css";

const QR_TEXT =
  "Skanna QR-koden med Swish-appen på din telefon och bekräfta sedan ditt köp för att underlätta föreningens arbete.";
const APP_TEXT =
  "Ifall betalningen gick igenom får du gärna bekräfta ditt köp för att underlätta föreningens arbete. Om inte så kan du försöka igen genom att klicka på någon av knapparna nedan.";

export interface SwishPaymentDialogProps {
  payment: PendingPayment | null;
  confirming: boolean;
  onConfirm: () => void;
  onShowQr: () => void;
  onCancel: () => void;
  onClose: () => void;
}

export function SwishPaymentDialog({
  payment,
  confirming,
  onConfirm,
  onShowQr,
  onCancel,
  onClose,
}: SwishPaymentDialogProps) {
  const shown = useLastNonNull(payment);
  const isQr = shown?.view === "qr";
  const qrDataUrl = useQrDataUrl(isQr ? shown.swishUrl : null);

  return (
    <Dialog
      open={payment !== null}
      label="Swishbetalning"
      title="Swishbetalning"
      text={isQr ? QR_TEXT : APP_TEXT}
      onClose={onClose}
      actions={[
        <Button variant="primary" onClick={onConfirm} disabled={confirming}>
          Jag har betalat
        </Button>,
        <LinkButton href={shown?.swishUrl} target="_blank" rel="noreferrer">
          {isQr
            ? `Öppna Swish på denna enhet (${shown?.amount} kr)`
            : `Öppna appen igen (${shown?.amount} kr)`}
        </LinkButton>,
        !isQr && <Button onClick={onShowQr}>Visa QR-kod</Button>,
        <Button onClick={onCancel}>Avbryt</Button>,
      ]}
    >
      {qrDataUrl && (
        <img src={qrDataUrl} alt="QR-kod för Swish-betalning" className={styles.image} />
      )}
    </Dialog>
  );
}
