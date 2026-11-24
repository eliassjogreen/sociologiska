import type { APIRoute } from "astro";
import { z } from "astro/zod";
import {
  conflictResponse,
  forbiddenResponse,
  formatAttendee,
  invalidJsonResponse,
  invalidPayloadResponse,
  notFoundResponse,
  readJsonPayload,
} from "../../../lib/utils";
import { getEvent } from "../../../lib/event/events";
import { getRegistrationStatus } from "../../../lib/event/registration";
import { hasConfirmedOrVerifiedPayment, saveRegistration } from "../../../server/registrations";

export const prerender = false;

const Payload = z.strictObject({
  event: z.string(),
  payment: z.strictObject({
    kind: z.enum(["swish", "qr"]),
    amount: z.number().int().min(1),
  }),
  attendee: z.strictObject({
    name: z.string(),
    email: z.string().optional(),
    phone: z.string(),
    wantsNeighbor: z.string().optional(),
    dietaryPreferences: z.string().optional(),
    wantsSongbook: z.boolean().default(false),
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

  const event = getEvent(parsedPayload.data.event);
  if (!event) {
    return notFoundResponse("Event not found");
  }

  const registrationStatus = getRegistrationStatus(new Date(), event);
  if (registrationStatus === "upcoming") {
    return forbiddenResponse("Registration has not opened yet");
  }
  if (registrationStatus === "closed") {
    return forbiddenResponse("Registration has closed");
  }

  if (hasConfirmedOrVerifiedPayment(parsedPayload.data.event, parsedPayload.data.attendee.phone)) {
    return conflictResponse("Registration or payment already confirmed");
  }

  saveRegistration(
    parsedPayload.data.event,
    parsedPayload.data.attendee,
    parsedPayload.data.payment,
  );

  console.info(
    `Processing registration to ${parsedPayload.data.event} for ${formatAttendee(parsedPayload.data.attendee)}`,
  );

  return Response.json({ ok: true });
};
