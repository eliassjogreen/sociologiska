import type { RefObject } from "preact";
import { useState } from "preact/hooks";
import { ApiError, confirmAttendee, registerAttendee } from "../lib/event/api";
import { getAttendeePayload } from "../lib/event/attendee";
import {
  SONGBOOK_PRICE,
  calculateTotal,
  createSwishUrl,
  type PaymentMode,
  type PendingPayment,
} from "../lib/event/payment";
import { usePendingPayment } from "./usePendingPayment";

export type WaitState = "payment" | "confirming" | null;

const SUBMIT_ERROR_MESSAGE =
  "Kunde inte skicka anmälan just nu. Kontrollera din uppkoppling och försök igen. Ifall felet kvarstår kontakta oss på sociologi.foreningen.uu@gmail.com";

const ALREADY_CONFIRMED_MESSAGE =
  "Din anmälan är redan bekräftad och kan inte ändras. Kontakta oss på sociologi.foreningen.uu@gmail.com om du behöver göra en ändring.";

const COULDNT_FIND_EVENT =
  "Vi kunde inte hitta evenemanget du försökte anmäla dig till. Vänligen ladda om sidan och försök igen. Ifall felet kvarstår kontakta oss på sociologi.foreningen.uu@gmail.com";

const COULDNT_FIND_REGISTRATION =
  "Vi kunde inte hitta din anmälan, vänligen ladda om sidan och försök klicka på någon av betala knapparna igen. Om du redan har Swishat behöver du inte göra det igen.";

const REGISTRATION_NOT_OPEN_MESSAGE = "Anmälan är inte öppen just nu.";

function getConfirmErrorMessage(cause: unknown) {
  if (cause instanceof ApiError && cause.status === 409) {
    return ALREADY_CONFIRMED_MESSAGE;
  }

  if (cause instanceof ApiError && cause.status === 404) {
    return COULDNT_FIND_REGISTRATION;
  }

  return null;
}

function getRegisterErrorMessage(cause: unknown) {
  if (cause instanceof ApiError && cause.status === 409) {
    return ALREADY_CONFIRMED_MESSAGE;
  } else if (cause instanceof ApiError && cause.status === 404) {
    return COULDNT_FIND_EVENT;
  }

  if (cause instanceof ApiError && cause.status === 403) {
    return REGISTRATION_NOT_OPEN_MESSAGE;
  }

  return SUBMIT_ERROR_MESSAGE;
}

export interface EventRegistrationOptions {
  eventSlug: string;
  swishNumber: string;
  basePrice: number;
  formRef: RefObject<HTMLFormElement | null>;
}

export function useEventRegistration({
  eventSlug,
  swishNumber,
  basePrice,
  formRef,
}: EventRegistrationOptions) {
  const [songbook, setSongbook] = useState(false);
  const [wait, setWait] = useState<WaitState>(null);
  const [error, setError] = useState<string | null>(null);
  const pending = usePendingPayment(`event-payment:${eventSlug}`);

  const total = calculateTotal(basePrice, songbook ? [SONGBOOK_PRICE] : []);

  async function startPayment(mode: PaymentMode) {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const attendee = getAttendeePayload(new FormData(form));
    const swishUrl = createSwishUrl({
      swishNumber,
      amount: total,
      message: `${eventSlug}: ${attendee.name || "Anmälan"}`,
    });
    const payment: PendingPayment = {
      swishUrl,
      amount: total,
      view: mode === "qr" ? "qr" : "app",
    };

    setError(null);
    setWait("payment");

    try {
      await registerAttendee({
        event: eventSlug,
        payment: { kind: mode, amount: total },
        attendee,
      });
    } catch (cause) {
      console.error("Kunde inte skicka anmälningsdata", cause);
      setError(getRegisterErrorMessage(cause));
      return;
    } finally {
      setWait(null);
    }

    pending.storePayment(payment);

    if (mode === "qr") {
      pending.showPayment(payment);
    } else {
      window.location.assign(swishUrl);
    }
  }

  async function confirmPayment() {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const attendee = getAttendeePayload(new FormData(form));

    setError(null);
    setWait("confirming");

    try {
      await confirmAttendee({
        event: eventSlug,
        attendee: { name: attendee.name, phone: attendee.phone },
      });
    } catch (cause) {
      setWait(null);
      console.error("Kunde inte bekräfta betalningen", cause);
      const message = getConfirmErrorMessage(cause);
      if (message) {
        setError(message);
        return;
      }
    }

    pending.clearPayment();
    window.location.assign("/tack");
  }

  function showQrCode() {
    if (!pending.payment) {
      return;
    }

    const updated: PendingPayment = { ...pending.payment, view: "qr" };
    pending.storePayment(updated);
    pending.showPayment(updated);
  }

  return {
    songbook,
    setSongbook,
    total,
    wait,
    error,
    payment: pending.payment,
    startPayment,
    confirmPayment,
    showQrCode,
    cancelPayment: pending.clearPayment,
    closePayment: pending.hidePayment,
    dismissError: () => setError(null),
  };
}
