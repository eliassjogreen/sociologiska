import type { APIRoute } from "astro";
import { z } from "astro/zod";
import {
  conflictResponse,
  formatAttendee,
  invalidJsonResponse,
  invalidPayloadResponse,
  notFoundResponse,
  readJsonPayload,
} from "../../../lib/utils";
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
    console.warn(
      `${formatAttendee(parsedPayload.data.attendee)} tried to confirm their payment for ${parsedPayload.data.event} which does not exist`,
    );
    return notFoundResponse("Event not found");
  }

  if (hasConfirmedOrVerifiedPayment(parsedPayload.data.event, parsedPayload.data.attendee.phone)) {
    console.warn(
      `Registration or payment already confirmed for ${formatAttendee(parsedPayload.data.attendee)} to ${parsedPayload.data.event}`,
    );
    return conflictResponse("Registration or payment already confirmed");
  }

  console.info(
    `Processing payment confirmation from ${formatAttendee(parsedPayload.data.attendee)} to ${parsedPayload.data.event}`,
  );

  if (!confirmPayment(parsedPayload.data.event, parsedPayload.data.attendee.phone)) {
    console.warn(
      `Registration not found for ${formatAttendee(parsedPayload.data.attendee)} to ${parsedPayload.data.event}`,
    );
    return notFoundResponse("Registration not found");
  }

  console.info(
    `Payment confirmed for ${formatAttendee(parsedPayload.data.attendee)} to ${parsedPayload.data.event}`,
  );

  return Response.json({ ok: true });
};
