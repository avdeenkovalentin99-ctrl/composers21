export type MediaMaterialCategory =
  | "анонс"
  | "афиша"
  | "интервью"
  | "новость"
  | "публикация"
  | "радио"
  | "репортаж";

export type MediaMaterial = {
  id: string;
  title: string;
  source: string;
  date: string;
  category: MediaMaterialCategory;
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

export const mediaMaterials: MediaMaterial[] = [
  {
    id: "rbc-style-new-academic-music",
    title: "Новая академическая музыка прозвучит на фестивале «Композиторы XXI века»",
    source: "РБК Стиль",
    date: "18 мая 2026",
    category: "публикация",
    url: "https://style.rbc.ru/impressions/6a0aefdb9a794784931d5d55",
  },
  {
    id: "classical-music-news-varvara-myagkova",
    title: "Варвара Мягкова — о диалоге исполнителей, композиторов и слушателя",
    source: "ClassicalMusicNews",
    date: "9 мая 2026",
    category: "интервью",
    url: "https://www.classicalmusicnews.ru/interview/varvara-myagkova-2026/",
  },
  {
    id: "muzlife-tochnost-beskonechnost",
    title: "С точностью до бесконечности",
    source: "Музыкальная жизнь",
    date: "22 мая 2026",
    category: "публикация",
    url: "https://muzlifemagazine.ru/s-tochnostyu-do-beskonechnosti/",
  },
  {
    id: "belcanto-varvara-myagkova",
    title: "Варвара Мягкова: «Большое искусство требует не ума, а интуиции»",
    source: "Belcanto",
    date: "3 мая 2026",
    category: "интервью",
    url: "https://www.belcanto.ru/26050301.html",
  },
  {
    id: "mk-peletsis-premiere",
    title: "Нескучные современные классики прозвучали в галерее «Нико»",
    source: "Московский комсомолец",
    date: "7 июня 2026",
    category: "публикация",
    url: "https://www.mk.ru/culture/2026/06/07/neskuchnye-sovremennye-klassiki-prozvuchali-v-galeree-niko.html",
  },
  {
    id: "tass-festival-opening",
    title: "Фестиваль «Композиторы XXI века» откроется 10 мая в Москве",
    source: "ТАСС",
    date: "30 апреля 2026",
    category: "новость",
    url: "https://tass.ru/kultura/27273755",
  },
  {
    id: "orpheus-music-as-process",
    title: "Музыка как процесс",
    source: "Радио Орфей",
    date: "30 апреля 2026",
    category: "публикация",
    url: "https://radio.orpheus.ru/news/news/120882/muzyka-kak-protsess",
  },
  {
    id: "portal-kultura-first-festival",
    title: "В Москве пройдет первый фестиваль «Композиторы XXI века»",
    source: "Портал «Культура»",
    date: "30 апреля 2026",
    category: "новость",
    url: "https://portal-kultura.ru/articles/news/376623-v-moskve-proydet-pervyy-festival-kompozitory-xxi-veka/",
  },
  {
    id: "intermedia-own-festival",
    title: "У композиторов XXI века появится свой фестиваль",
    source: "InterMedia",
    date: "30 апреля 2026",
    category: "новость",
    url: "https://www.intermedia.ru/news/403553",
  },
  {
    id: "mskagency-festival-may",
    title: "Фестиваль «Композиторы XXI века» пройдет в Москве с 10 по 31 мая",
    source: "Агентство городских новостей «Москва»",
    date: "30 апреля 2026",
    category: "новость",
    url: "https://www.mskagency.ru/materials/3546440",
  },
  {
    id: "timeout-festival",
    title: "Фестиваль «Композиторы XXI века»",
    source: "Time Out Москва",
    date: "10–31 мая 2026",
    category: "афиша",
    url: "https://www.timeout.ru/msk/artwork/festival-kompozitory-xxi-veka",
  },
];

export const cultureReports: MediaMaterial[] = [
  {
    id: "smotrim-news-culture-main-report",
    title: "«Новости культуры» о «Форельном концерте»",
    source: "Новости культуры",
    date: "19 мая 2026",
    category: "репортаж",
    url: "https://smotrim.ru/brand/19725#playing_video=6013362",
  },
  {
    id: "smotrim-solisty-nizhnego-novgoroda",
    title: "«Солисты Нижнего Новгорода» выступили в Москве",
    source: "Новости культуры",
    date: "15 мая 2026",
    category: "репортаж",
    url: "https://smotrim.ru/video/6012162",
  },
];

export const mediaCollections: MediaCollection[] = [];
