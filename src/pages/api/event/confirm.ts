import type { APIRoute } from "astro";
import { z } from "astro/zod";
import {
  conflictResponse,
  formatAttendee,
  invalidJsonResponse,
  invalidPayloadResponse,
  notFoundResponse,
  readJsonPayload,
} from "../../../utils";
import { hasEvent } from "../../../lib/event/events";
import { confirmPayment, hasConfirmedOrVerifiedPayment } from "../../../server/registrations";

export const prerender = false;

const Payload = z.strictObject({
  event: z.string(),
  attendee: z.strictObject({
    name: z.string(),
    phone: z.string(),
  }),
});

export const POST: APIRoute = async ({ request }) => {
  const jsonPayload = await readJsonPayload(request);
  if (!jsonPayload.success) {
    return invalidJsonResponse();
  }

  const parsedPayload = Payload.safeParse(jsonPayload.payload);
  if (!parsedPayload.success) {
    return invalidPayloadResponse(parsedPayload.error);
  }

  if (!hasEvent(parsedPayload.data.event)) {
    return notFoundResponse("Event not found");
  }

  if (hasConfirmedOrVerifiedPayment(parsedPayload.data.event, parsedPayload.data.attendee.phone)) {
    return conflictResponse("Registration or payment already confirmed");
  }

  if (!confirmPayment(parsedPayload.data.event, parsedPayload.data.attendee.phone)) {
    return notFoundResponse("Registration not found");
  }

  console.info(
    `Processing payment confirmation from ${formatAttendee(parsedPayload.data.attendee)}`,
  );

  return Response.json({ ok: true });
};
