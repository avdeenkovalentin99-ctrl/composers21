export type MediaMaterialType = "анонс" | "публикация" | "репортаж" | "СМИ";

export type MediaMaterial = {
  id: string;
  title: string;
  source: string;
  date: string;
  type: MediaMaterialType;
  url: string;
};

export type MediaCollection = {
  id: string;
  title: string;
  source: string;
  date: string;
  type: "фото";
  url: string;
};

export const publicationMaterials: MediaMaterial[] = [
  {
    id: "mk-peletsis-premiere",
    title: "Мировая премьера сочинения Георга Пелециса состоялась в Москве",
    source: "Московский Комсомолец",
    date: "7 июня 2026",
    type: "репортаж",
    url: "https://www.mk.ru/culture/2026/06/07/neskuchnye-sovremennye-klassiki-prozvuchali-v-galeree-niko.html",
  },
  {
    id: "muzlife-tochnost-beskonechnost",
    title: "С точностью до бесконечности",
    source: "Музыкальная жизнь",
    date: "июнь 2026",
    type: "публикация",
    url: "https://muzlifemagazine.ru/s-tochnostyu-do-beskonechnosti/",
  },
  {
    id: "rbc-style-new-academic-music",
    title: "Новая академическая музыка прозвучит на фестивале «Композиторы XXI века»",
    source: "РБК Стиль",
    date: "18 мая 2026",
    type: "публикация",
    url: "https://style.rbc.ru/amp/news/6a0aefdb9a794784931d5d55",
  },
  {
    id: "mskagency-festival-may",
    title: "Фестиваль «Композиторы XXI века» пройдет в Москве с 10 по 31 мая",
    source: "Агентство городских новостей «Москва»",
    date: "30 апреля 2026",
    type: "СМИ",
    url: "https://www.mskagency.ru/materials/3546440",
  },
  {
    id: "aki-festival",
    title: "Фестиваль «Композиторы XXI века»",
    source: "Агентство культурной информации",
    date: "29 апреля 2026",
    type: "анонс",
    url: "https://www.aki-ros.ru/news/41024.html",
  },
  {
    id: "7days-first-season",
    title: "В России появится фестиваль «Композиторы XXI века»",
    source: "7Дней",
    date: "29 апреля 2026",
    type: "анонс",
    url: "https://7days.ru/dosug/afisha/v-rossii-poyavitsya-festival-kompozitory-xxi-veka.htm",
  },
  {
    id: "profile-festival-start",
    title: "В Москве стартует фестиваль «Композиторы XXI века»",
    source: "Профиль",
    date: "май 2026",
    type: "анонс",
    url: "https://profile.ru/news/culture/v-moskve-startuet-festival-kompozitory-xxi-veka-1853967/",
  },
  {
    id: "timeout-festival",
    title: "Композиторы XXI века",
    source: "Time Out Москва",
    date: "май 2026",
    type: "анонс",
    url: "https://www.timeout.ru/msk/artwork/kompozitory-xxi-veka",
  },
];

export const cultureReports: MediaMaterial[] = [
  {
    id: "smotrim-news-culture-main-report",
    title: "«Новости культуры» о «Форельном концерте»",
    source: "Новости культуры",
    date: "19 мая 2026",
    type: "репортаж",
    url: "https://smotrim.ru/brand/19725#playing_video=6013362",
  },
  {
    id: "smotrim-solisty-nizhnego-novgoroda",
    title: "«Солисты Нижнего Новгорода» выступили в Москве",
    source: "Новости культуры",
    date: "15 мая 2026",
    type: "репортаж",
    url: "https://smotrim.ru/video/6012162",
  },
];

export const mediaCollections: MediaCollection[] = [];
