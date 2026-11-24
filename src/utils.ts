import type { z } from "astro/zod";

export function invalidJsonResponse() {
  return Response.json(
    {
      ok: false,
      error: "Invalid JSON payload",
    },
    { status: 422 },
  );
}

export function invalidPayloadResponse(error: z.ZodError) {
  return Response.json(
    {
      ok: false,
      error: "Invalid payload",
      details: error.issues,
    },
    { status: 422 },
  );
}

export function notFoundResponse(errorMessage: string) {
  return Response.json(
    {
      ok: false,
      error: errorMessage,
    },
    { status: 404 },
  );
}

export function conflictResponse(errorMessage: string) {
  return Response.json(
    {
      ok: false,
      error: errorMessage,
    },
    { status: 409 },
  );
}

export function forbiddenResponse(errorMessage: string) {
  return Response.json(
    {
      ok: false,
      error: errorMessage,
    },
    { status: 403 },
  );
}

export function externalServiceErrorResponse(errorMessage: string) {
  return Response.json(
    {
      ok: false,
      error: errorMessage,
    },
    { status: 502 },
  );
}

export async function readJsonPayload(
  request: Request,
): Promise<{ success: true; payload: unknown } | { success: false; error: unknown }> {
  try {
    return {
      success: true,
      payload: await request.json(),
    };
  } catch (error) {
    return { success: false, error };
  }
}

export function formatAttendee(attendee: { name: string; email?: string; phone: string }) {
  return `${attendee.name} (${attendee.phone}${attendee.email ? `, <${attendee.email}>` : ""})`;
}

export function getEventBySlug(eventSlug: string) {}
