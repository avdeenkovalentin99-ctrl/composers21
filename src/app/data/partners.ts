import type { PartnerItem } from "./types";
import { localImages } from "./images";

export const partners: PartnerItem[] = [
  {
    role: "Главный партнёр",
    name: "Галерея Нико",
    description:
      "Музей работ классика советского и постсоветского искусства академика Н. Б. Никогосяна и креативное пространство в центре Москвы, открытое для творческих идей.",
    image: "/assets/external/c20f321a__.svg",
    link: "https://nikoartgallery.com/",
  },
  {
    role: "Партнёр",
    name: "Île Thélème",
    description:
      "Île Thélème — художественное пространство в Москве, где выставки, концерты, лекции и кинопоказы складываются в единую культурную программу. Музыкальная жизнь пространства связана с ансамблем Île Thélème Ensemble и вниманием к камерному и современному репертуару.",
    image: localImages.ileThelemeLogoBlack,
    link: "https://ile-theleme.com/",
  },
  {
    role: "Партнёр",
    name: "Радио «Орфей»",
    description:
      "Радио «Орфей» — российская радиостанция академической музыки и современная мультимедийная платформа, освещающая актуальную музыкальную жизнь в эфире и на цифровых площадках.",
    image: "/orpheus-logo.svg",
    link: "https://radio.orpheus.ru/",
  },
  {
    role: "Партнёр",
    name: "Российская академия музыки имени Гнесиных",
    description:
      "Российская академия музыки имени Гнесиных — один из ключевых музыкальных вузов страны и крупный центр концертной, образовательной и исследовательской жизни.",
    image: localImages.gnessinLogo,
    link: "https://gnesin-academy.ru/",
  },
];
