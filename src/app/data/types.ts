export type NavItem = {
  label: string;
  to: string;
};

export type FestivalInfo = {
  title: string;
  subtitle: string;
  dates: string;
  city: string;
  venue: string;
  address: string;
  description: string;
  projectText: string[];
  venueText: string;
  telegram: string;
  phone: string;
  email: string;
};

export type ConcertItem = {
  id: string;
  programNumber: number;
  date: string;
  title: string;
  description: string;
  image: string;
  link?: string;
};

export type ConcertProgrammeItem = {
  id: string;
  date: string;
  title: string;
  description: string;
  programme: string[];
  performers: string[];
  image: string;
  ticketLink?: string;
};

export type PersonItem = {
  slug: string;
  name: string;
  role?: string;
  description: string;
  image: string;
  link: string;
};

export type PartnerItem = {
  tier: "general" | "media" | "partner";
  role: string;
  name: string;
  description: string;
  image: string;
  link?: string;
};
