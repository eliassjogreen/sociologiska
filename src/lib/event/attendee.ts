export interface AttendeePayload {
  name: string;
  email?: string;
  phone: string;
  wantsNeighbor?: string;
  dietaryPreferences?: string;
  wantsSongbook: boolean;
}

function getTrimmedString(formData: FormData, field: string): string {
  return String(formData.get(field) ?? "").trim();
}

function getOptionalString(formData: FormData, field: string): string | undefined {
  return getTrimmedString(formData, field) || undefined;
}

export function getAttendeePayload(formData: FormData): AttendeePayload {
  return {
    name: getTrimmedString(formData, "name"),
    email: getOptionalString(formData, "mail"),
    phone: getTrimmedString(formData, "phone"),
    wantsNeighbor: getOptionalString(formData, "wants-neighbor"),
    dietaryPreferences: getOptionalString(formData, "specialkost"),
    wantsSongbook: formData.has("wants-songbook"),
  };
}
