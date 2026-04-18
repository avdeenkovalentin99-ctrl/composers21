import type { PersonItem } from "./types";
import { getParticipantImage, localImages } from "./images";

export const composers: PersonItem[] = [
  {
    name: "Леонид Десятников",
    slug: "leonid-desyatnikov",
    description: "Композитор, представленный в программе фестиваля.",
    image: localImages.desyatnikovImage,
    link: "https://21centcomposers.ru/composers",
  },
  {
    name: "Александр Чайковский",
    slug: "aleksandr-chaykovsky",
    description: "Композитор, представленный в программе фестиваля.",
    image: localImages.aleksandrChaikovskyImage,
    link: "https://21centcomposers.ru/persons/dhfi8dcj81-aleksandr-chaikovskii",
  },
  {
    name: "Сергей Ахунов",
    slug: "sergey-akhunov",
    description: "Композитор, представленный в программе фестиваля.",
    image: localImages.akhunovImage,
    link: "https://21centcomposers.ru/composers",
  },
  {
    name: "Павел Карманов",
    slug: "pavel-karmanov",
    description: "Композитор, представленный в программе фестиваля.",
    image: localImages.karmanovImage,
    link: "https://21centcomposers.ru/composers",
  },
  {
    name: "Владимир Мартынов",
    slug: "vladimir-martynov",
    description: "Композитор, представленный в программе фестиваля.",
    image: localImages.martynovImage,
    link: "https://21centcomposers.ru/composers",
  },
  {
    name: "Павел Турсунов",
    slug: "pavel-tursunov",
    description: "Композитор, представленный в программе фестиваля.",
    image: localImages.tursunovImage,
    link: "https://21centcomposers.ru/composers",
  },
  {
    name: "Георг Пелецис",
    slug: "georg-peletsis",
    description: "Композитор, представленный в программе фестиваля.",
    image: localImages.peletsisImage,
    link: "https://21centcomposers.ru/composers",
  },
  {
    name: "Эрик Эшенвальдс",
    slug: "erik-eshenvalds",
    description: "Композитор, представленный в программе фестиваля.",
    image: "/festlogonowords.svg",
    link: "https://21centcomposers.ru/composers",
  },
  {
    name: "Эдисон Денисов",
    slug: "edison-denisov",
    description: "Композитор, представленный в программе фестиваля.",
    image: getParticipantImage("EdisonD.jpg") || "/festlogonowords.svg",
    link: "https://21centcomposers.ru/composers",
  },
  {
    name: "Янис Ксенаксис",
    slug: "yanis-ksenakis",
    description: "Композитор, представленный в программе фестиваля.",
    image: getParticipantImage("ksenaksisYa.jpg") || "/festlogonowords.svg",
    link: "https://21centcomposers.ru/composers",
  },
];
