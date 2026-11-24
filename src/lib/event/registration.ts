export interface RegistrationWindow {
  registrationStart: Date;
  registrationEnd: Date;
}

export type RegistrationStatus = "upcoming" | "open" | "closed";

const dateTimeFormat = new Intl.DateTimeFormat("sv-SE", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Stockholm",
});

export function getRegistrationStatus(now: Date, window: RegistrationWindow): RegistrationStatus {
  if (now < window.registrationStart) {
    return "upcoming";
  }

  if (now < window.registrationEnd) {
    return "open";
  }

  return "closed";
}

export function formatRegistrationDateTime(date: Date): string {
  return dateTimeFormat.format(date);
}
