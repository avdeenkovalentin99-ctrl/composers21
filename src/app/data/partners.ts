import type { PartnerItem } from "./types";
import { localImages } from "./images";

export const partners: PartnerItem[] = [
  {
    tier: "general",
    role: "Генеральный партнёр",
    name: "Галерея НИКО",
    description:
      "Музей работ классика советского и постсоветского искусства академика Н. Б. Никогосяна и креативное пространство в центре Москвы.",
    image: "/assets/external/c20f321a__.svg",
    link: "https://nikoartgallery.com/",
  },
  {
    tier: "general",
    role: "Генеральный партнёр",
    name: "Лидеры строительной России",
    description: "",
    image: "/assets/partners/leaders-building-russia.png",
    link: "http://lsr.ru/",
  },
  {
    tier: "general",
    role: "Генеральный партнёр",
    name: "Lifestyle",
    description: "",
    image: "/assets/partners/lifestyle-logo.png",
    link: "https://obrazfund.ru/",
  },
  {
    tier: "general",
    role: "Генеральный партнёр",
    name: "Дом литераторов | Таруса",
    description: "",
    image: localImages.tarusaLogo,
    link: "https://t.me/a097789",
  },
  {
    tier: "general",
    role: "Генеральный партнёр",
    name: "Île Thélème",
    description:
      "Île Thélème — художественное пространство в Москве, где выставки, концерты, лекции и кинопоказы складываются в единую культурную программу.",
    image: localImages.ileThelemeLogoBlack,
    link: "https://ile-theleme.com/",
  },
  {
    tier: "media",
    role: "Медиа-партнёр",
    name: "Радио «Орфей»",
    description:
      "Радио «Орфей» — российская радиостанция академической музыки и современная мультимедийная платформа.",
    image: "/orpheus-logo.svg",
    link: "https://radio.orpheus.ru/",
  },
  {
    tier: "media",
    role: "Медиа-партнёр",
    name: "Российская академия музыки имени Гнесиных",
    description: "Российская академия музыки имени Гнесиных — один из ключевых музыкальных вузов страны.",
    image: localImages.gnessinLogo,
    link: "https://gnesin-academy.ru/",
  },
  {
    tier: "media",
    role: "Медиа-партнёр",
    name: "Музыканты онлайн",
    description: "",
    image: "/assets/partners/music-online-logo.png",
  },
  {
    tier: "media",
    role: "Информационный партнёр",
    name: "Бельканто",
    description: "",
    image: "/assets/partners/belcantologo.png",
    link: "https://www.belcanto.ru",
  },
  {
    tier: "media",
    role: "Медиа-партнёр",
    name: "Ревизор",
    description: "",
    image: "/assets/partners/revizor-logo.png",
    link: "https://www.rewizor.ru/",
  },
];
