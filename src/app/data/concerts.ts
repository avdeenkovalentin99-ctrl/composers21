import type { ConcertItem } from "./types";
import { concertProgrammes } from "./concertProgrammes";

const concertPosterPlaceholder = "/assets/external/39e4c798_noroot.png";

export const concerts: ConcertItem[] = concertProgrammes.map((concert, index) => ({
  id: concert.id,
  programNumber: index + 1,
  date: concert.date,
  title: concert.title,
  description: concert.description,
  image: concert.image || concertPosterPlaceholder,
  link: concert.ticketLink,
}));

export const concertOrder: string[] = [
  "2026-05-10-peletcis-24-kaprisa",
  "2026-05-12-il-theleme-de-la-nuite",
  "2026-05-13-v-ischezayushem-gorode",
  "2026-05-15-solisty-nizhnego-novgoroda",
  "2026-05-16-improvizirovannyy-uzhin",
  "2026-05-18-forelnyy-kontsert",
  "2026-05-19-opensoundquartet",
  "2026-05-20-opensoundorchestra",
  "2026-05-21-petr-glavatskikh",
  "2026-05-25-daniil-sayamov-glinka-quartet",
  "2026-05-26-pianisty-kompozitory",
  "2026-05-27-desyatnikov-love-and-life",
  "2026-05-28-brezel-melodiya",
  "2026-05-31-gromche-slova",
];

const concertsById = new Map(concerts.map((concert) => [concert.id, concert] as const));

export const orderedConcerts: ConcertItem[] = [
  ...concertOrder
    .map((id) => concertsById.get(id))
    .filter((concert): concert is ConcertItem => Boolean(concert)),
  ...concerts.filter((concert) => !concertOrder.includes(concert.id)),
];
