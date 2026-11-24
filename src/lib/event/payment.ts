export const SONGBOOK_PRICE = 90;

export type PaymentMode = "swish" | "qr";
export type PaymentView = "app" | "qr";

export interface PendingPayment {
  swishUrl: string;
  amount: number;
  view: PaymentView;
}

export function calculateTotal(basePrice: number, selectedAddonPrices: number[]): number {
  return selectedAddonPrices.reduce((sum, price) => sum + price, basePrice);
}

export function formatAmount(amount: number): string {
  return amount % 1 !== 0 ? amount.toFixed(2) : amount.toString();
}

export function createSwishUrl({
  swishNumber,
  amount,
  message,
}: {
  swishNumber: string;
  amount: number;
  message: string;
}): string {
  const params = new URLSearchParams({
    sw: swishNumber,
    amt: String(amount),
    cur: "SEK",
    msg: message,
    src: "qr",
  });

  return `https://app.swish.nu/1/p/sw/?${params.toString()}`;
}

function isPendingPayment(value: unknown): value is PendingPayment {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.swishUrl === "string" &&
    typeof candidate.amount === "number" &&
    (candidate.view === "app" || candidate.view === "qr")
  );
}

export function parsePendingPayment(raw: string | null): PendingPayment | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return isPendingPayment(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
