import type { ConcertItem } from "./types";
import { concertProgrammes } from "./concertProgrammes";

export const concerts: ConcertItem[] = concertProgrammes.map((concert) => ({
  date: concert.date,
  title: concert.title,
  description: concert.description,
  image: concert.image,
  link: concert.ticketLink,
}));
