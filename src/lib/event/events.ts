import type { ImageMetadata } from "astro";

import julful2026Image from "../../assets/events/julful-2026.png";
import type { RegistrationWindow } from "./registration";

export interface EventConfig extends RegistrationWindow {
  slug: string;
  name: string;
  basePrice: number;
  swishNumber: string;
  membershipRequired?: boolean;
  offerSongbook?: boolean;
  image: ImageMetadata;
  imageAlt: string;
  description: string;
}

export const events: EventConfig[] = [
  {
    slug: "julful-2026",
    name: "Sociologernas julfulsittning",
    basePrice: 250,
    swishNumber: "0738303933",
    offerSongbook: true,
    // Placeholder dates, confirm before release.
    registrationStart: new Date("2026-11-23T23:59:00+01:00"), // new Date("2026-11-25T12:00:00+01:00"),
    registrationEnd: new Date("2026-12-16T23:59:00+01:00"),
    image: julful2026Image,
    imageAlt: "En julig omslagsbild med Kalle Anka karaktärer",
    description: `🎄 VARMT VÄLKOMNA PÅ SOCIOLOGERNAS JULFULSITTNING 2026 🎄

Temat för årets julfulsittning är: !! KALLE ANKAS JULAFTON !! 📺🦆🎁🎅✨

Är du redo för en magisk julstämning, slabbig mat, skränig sång och GIVETVIS en otrolig FEST?! Fira då in julen tillsammans med sociologerna på Bridgens hus fredagen 18 december!

Det kommer att bjudas på en fördrink, mat och efterrätt - men GLÖM INTE att ta med egen dryck givetvis!! 🥂🍾

När: 18/12
Tid: 18DK
Var: Bridgens hus
Klädkod: KALLE ANKAS JULAFTON`,
  },
];

export function hasEvent(slug: string): boolean {
  return events.some((event) => event.slug === slug);
}

export function getEvent(slug: string): EventConfig | undefined {
  return events.find((event) => event.slug === slug);
}
