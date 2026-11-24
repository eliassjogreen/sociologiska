import { database } from "../database";
import type { AttendeePayload } from "../lib/event/attendee";
import type { PaymentMode } from "../lib/event/payment";

const upsertRegistrationExpression = database.prepare(`
  INSERT INTO registrations (
    event,
    name,
    email,
    phone,
    wants_neighbor,
    wants_songbook,
    dietary_preferences,
    payment_kind,
    payment_amount
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT (event, phone) DO UPDATE SET
    name = excluded.name,
    email = excluded.email,
    wants_neighbor = excluded.wants_neighbor,
    wants_songbook = excluded.wants_songbook,
    dietary_preferences = excluded.dietary_preferences,
    payment_kind = excluded.payment_kind,
    payment_amount = excluded.payment_amount,
    payment_confirmed = 0,
    updated_at = CURRENT_TIMESTAMP
`);

const markPaymentConfirmedExpression = database.prepare(`
  UPDATE registrations
  SET payment_confirmed = 1, updated_at = CURRENT_TIMESTAMP
  WHERE event = ? AND phone = ?
`);

const hasConfirmedOrVerifiedPaymentExpression = database.prepare(
  "SELECT payment_confirmed, payment_verified FROM registrations WHERE event = ? AND phone = ?",
);

export function saveRegistration(
  event: string,
  attendee: AttendeePayload,
  payment: { kind: PaymentMode; amount: number },
) {
  upsertRegistrationExpression.run(
    event,
    attendee.name,
    attendee.email ?? null,
    attendee.phone,
    attendee.wantsNeighbor ?? null,
    attendee.wantsSongbook ? 1 : 0,
    attendee.dietaryPreferences ?? null,
    payment.kind,
    payment.amount,
  );
}

export function confirmPayment(event: string, phone: string): boolean {
  return Number(markPaymentConfirmedExpression.run(event, phone).changes) > 0;
}

export function hasConfirmedOrVerifiedPayment(event: string, phone: string): boolean {
  const rows = hasConfirmedOrVerifiedPaymentExpression.get(event, phone);
  return rows?.payment_confirmed === 1 || rows?.payment_verified === 1;
}
