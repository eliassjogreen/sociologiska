import { useEffect, useState } from "preact/hooks";
import QRCode from "qrcode";

export function useQrDataUrl(url: string | null): string | null {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setDataUrl(null);
      return;
    }

    let cancelled = false;

    QRCode.toDataURL(url, { width: 320, margin: 1 })
      .then((next) => {
        if (!cancelled) {
          setDataUrl(next);
        }
      })
      .catch((error) => {
        console.error("Kunde inte generera QR-kod", error);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return dataUrl;
}
