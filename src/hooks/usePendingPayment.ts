import { useEffect, useState } from "preact/hooks";
import { parsePendingPayment, type PendingPayment } from "../lib/event/payment";

export function usePendingPayment(storageKey: string) {
  const [payment, setPayment] = useState<PendingPayment | null>(null);

  useEffect(() => {
    const restore = () => {
      const stored = parsePendingPayment(sessionStorage.getItem(storageKey));
      if (stored) {
        setPayment((current) => current ?? stored);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        restore();
      }
    };

    restore();
    window.addEventListener("pageshow", restore);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", restore);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [storageKey]);

  return {
    payment,
    storePayment: (next: PendingPayment) => {
      sessionStorage.setItem(storageKey, JSON.stringify(next));
    },
    showPayment: (next: PendingPayment) => setPayment(next),
    clearPayment: () => {
      sessionStorage.removeItem(storageKey);
      setPayment(null);
    },
    hidePayment: () => setPayment(null),
  };
}
