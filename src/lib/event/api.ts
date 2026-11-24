import type { AttendeePayload } from "./attendee";
import type { PaymentMode } from "./payment";

const REGISTER_ENDPOINT = "/api/event/register";
const CONFIRM_ENDPOINT = "/api/event/confirm";

export interface RegisterRequest {
  event: string;
  payment: { kind: PaymentMode; amount: number };
  attendee: AttendeePayload;
}

export interface ConfirmRequest {
  event: string;
  attendee: { name: string; phone: string };
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function postJson(endpoint: string, body: unknown): Promise<void> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    return;
  }

  let message = "Ett oväntat fel uppstod.";

  try {
    const errorBody: unknown = await response.json();
    const error = (errorBody as { error?: unknown } | null)?.error;
    if (typeof error === "string") {
      message = error;
    }
  } catch {
    // Ignore JSON parse errors and keep the default message.
  }

  throw new ApiError(message, response.status);
}

export function registerAttendee(request: RegisterRequest): Promise<void> {
  return postJson(REGISTER_ENDPOINT, request);
}

export function confirmAttendee(request: ConfirmRequest): Promise<void> {
  return postJson(CONFIRM_ENDPOINT, request);
}
