import { concertProgrammes } from "./concertProgrammes";
import type { ConcertProgrammeItem } from "./types";

export type BroadcastProgramWork = {
  composer?: string;
  title: string;
  details?: string;
};

export type BroadcastProgramSection = {
  section: string;
  works: BroadcastProgramWork[];
};

export type BroadcastItem = {
  id: string;
  date: string;
  time: string;
  dateTime: string;
  title: string;
  composers: string;
  performers: string;
  program?: BroadcastProgramSection[];
  status: "Запись" | "Трансляция";
  cta: string;
  url: string;
};

const dateTimeByConcertId: Record<ConcertProgrammeItem["id"], string> = {
  "2026-05-10-peletsis-24-kaprisa": "2026-05-10T19:30:00",
  "2026-05-12-il-theleme-de-la-nuite": "2026-05-12T19:30:00",
  "2026-05-13-v-ischezayushem-gorode": "2026-05-13T19:30:00",
  "2026-05-15-solisty-nizhnego-novgoroda": "2026-05-15T19:30:00",
  "2026-05-16-improvizirovannyy-uzhin": "2026-05-16T21:00:00",
  "2026-05-18-forelnyy-kontsert": "2026-05-18T19:30:00",
  "2026-05-19-opensoundquartet": "2026-05-19T19:30:00",
  "2026-05-20-opensoundorchestra": "2026-05-20T19:30:00",
  "2026-05-21-petr-glavatskikh": "2026-05-21T19:30:00",
  "2026-05-25-daniil-sayamov-glinka-quartet": "2026-05-25T19:30:00",
  "2026-05-26-pianisty-kompozitory": "2026-05-26T19:30:00",
  "2026-05-27-desyatnikov-love-and-life": "2026-05-27T19:30:00",
  "2026-05-28-brezel-melodiya": "2026-05-28T19:30:00",
  "2026-05-29-milyausha-khayrullina": "2026-05-29T19:30:00",
  "2026-05-31-gromche-slova": "2026-05-31T19:30:00",
};

const urlByConcertId: Partial<Record<ConcertProgrammeItem["id"], string>> = {
  "2026-05-12-il-theleme-de-la-nuite":
    "https://www.culture.ru/live/broadcast/157921/ansambl-il-theleme-de-la-nuite-nochyu",
  "2026-05-13-v-ischezayushem-gorode": "https://www.culture.ru/live/broadcast/157923/vecher-kamernoi-muzyki",
  "2026-05-15-solisty-nizhnego-novgoroda":
    "https://www.culture.ru/live/broadcast/157983/kamernyi-orkestr-solisty-nizhnego-novgoroda-cvetushii-zhasmin",
  "2026-05-18-forelnyy-kontsert":
    "https://www.culture.ru/live/broadcast/158564/forelnyi-koncert-rust-pozyumskii",
  "2026-05-19-opensoundquartet": "https://www.culture.ru/live/broadcast/158190/opensoundorchestra-kvartety",
  "2026-05-20-opensoundorchestra":
    "https://www.culture.ru/live/broadcast/158193/opensoundorchestra-vremena-goda-ne-vivaldi",
  "2026-05-25-daniil-sayamov-glinka-quartet":
    "https://www.culture.ru/live/broadcast/158195/daniil-sayamov-kvartet-im-glinki",
  "2026-05-26-pianisty-kompozitory":
    "https://www.culture.ru/live/broadcast/159195/pianisty-kompozitory",
  "2026-05-27-desyatnikov-love-and-life":
    "https://www.culture.ru/live/broadcast/159196/leonid-desyatnikov-lyubov-i-zhizn-poeta",
  "2026-05-28-brezel-melodiya":
    "https://www.culture.ru/live/broadcast/159198/brezel-ensemble-i-khorovoi-ansambl-melodiya-novaya-sakralnost",
  "2026-05-29-milyausha-khayrullina":
    "https://www.culture.ru/live/broadcast/159201/milyausha-khairullina-tvorcheskii-vecher-kompozitora",
  "2026-05-31-gromche-slova":
    "https://www.culture.ru/live/broadcast/159204/gromche-slova-zaklyuchitelnyi-koncert-festivalya",
};

const programByConcertId: Partial<Record<ConcertProgrammeItem["id"], BroadcastProgramSection[]>> = {
  "2026-05-12-il-theleme-de-la-nuite": [
    {
      section: "Программа",
      works: [
        {
          composer: "Кайя Саариахо",
          title: "Vent nocturne / «Ночной ветер»",
        },
        {
          composer: "Алексей Ретинский",
          title: "Dream of Birds / «Сны птиц»",
        },
        {
          composer: "Джордж Крамб",
          title: "«Четыре ноктюрна» для скрипки и фортепиано",
        },
        {
          composer: "Андреас Мустукис",
          title: "Les Fleurs du Mal",
        },
        {
          composer: "Сальваторе Шаррино",
          title: "De la Nuit",
        },
        {
          composer: "Сальваторе Шаррино",
          title: "Melencolia / «Меланхолия» для виолончели и фортепиано",
        },
        {
          composer: "Алексей Ретинский",
          title: "Трио для скрипки, виолончели и фортепиано",
        },
      ],
    },
  ],
  "2026-05-13-v-ischezayushem-gorode": [
    {
      section: "Программа",
      works: [
        {
          composer: "Андрей Зубец",
          title: "Три ноты «Туламби»",
        },
        {
          composer: "Павел Турсунов",
          title: "Квинтет «В исчезающем городе»",
        },
        {
          composer: "Павел Турсунов",
          title: "Квинтет для маримбы и струнных «Цветные свадьбы»",
        },
        {
          composer: "Сергей Ахунов",
          title: "Соната для альта и фортепиано",
        },
        {
          composer: "Марианна Домникова",
          title: "Цикл из шести романсов на стихи М. Цветаевой",
        },
      ],
    },
  ],
  "2026-05-15-solisty-nizhnego-novgoroda": [
    {
      section: "I отделение",
      works: [
        {
          composer: "Олег Пайбердин",
          title: "Lamento для альта и струнного оркестра",
          details: "Мировая премьера",
        },
        {
          composer: "Павел Турсунов",
          title: "«Портрет рисовальщика»",
        },
        {
          composer: "Георгий Пелецис",
          title: "«Цветущий жасмин»",
        },
      ],
    },
    {
      section: "II отделение",
      works: [
        {
          composer: "Андрей Зеленский",
          title: "Ave Maria",
        },
        {
          composer: "Екатерина Кожевникова",
          title: "«Голубая планета, улетающая в бесконечность» для струнного оркестра",
        },
        {
          composer: "Сергей Жуков",
          title: "«Песни прощания»",
          details: "на стихи Яна Хендрика Леопольда для сопрано, кларнета, клавесина и струнного оркестра",
        },
      ],
    },
  ],
  "2026-05-18-forelnyy-kontsert": [
    {
      section: "Программа",
      works: [
        {
          composer: "Франц Шуберт",
          title: "«Die Forelle» для голоса и фортепиано",
        },
        {
          composer: "Руст Позюмский",
          title: "Интермеццо 1 для двух скрипок",
        },
        {
          composer: "Франц Шуберт",
          title: "Фортепианный квинтет «Die Forelle» (I часть)",
        },
        {
          composer: "Руст Позюмский",
          title: "Интермеццо 2 для виолончели соло",
        },
        {
          composer: "Владимир Радченков",
          title: "Division on Schubert: тема «Die Forelle» для струнного квинтета",
        },
        {
          composer: "Руст Позюмский",
          title: "Интермеццо 3 для альта и фортепиано",
        },
        {
          composer: "Павел Карманов",
          title: "«Forellenquintet»",
        },
        {
          composer: "Владимир Волков",
          title: "Интермеццо 4 (контрабасовая импровизация на тему «Форели»)",
        },
        {
          composer: "Руст Позюмский",
          title: "Поэма «Форель» для голоса и камерного ансамбля (памяти П.Карманова)",
        },
      ],
    },
  ],
  "2026-05-19-opensoundquartet": [
    {
      section: "Программа",
      works: [
        {
          composer: "Эльмир Низамов",
          title: "Сюита «Люди»",
        },
        {
          composer: "Владимир Кобекин",
          title: "«Три русские песни»",
        },
        {
          composer: "Настасья Хрущёва",
          title: "«Пять песен на Рождество»",
        },
        {
          composer: "Юрий Каспаров",
          title: "«Пурпурные облака»",
        },
        {
          composer: "Павел Карманов",
          title: "String quaREtet",
        },
        {
          composer: "Анастасия Дружинина",
          title: "«Эхо пяти желаний» для квартета и электроники",
        },
      ],
    },
  ],
  "2026-05-20-opensoundorchestra": [
    {
      section: "Программа",
      works: [
        {
          composer: "Сергей Ахунов",
          title: "«Времена года»",
        },
        {
          composer: "Владимир Мартынов",
          title: "«Времена года»",
        },
      ],
    },
  ],
  "2026-05-25-daniil-sayamov-glinka-quartet": [
    {
      section: "I отделение",
      works: [
        {
          title: "13 вариаций на тему Б. Мокроусова для альта и фортепиано, ор. 140",
        },
        {
          title: "Соната №1 «Флорентийский фантом», ор. 120",
          details: "2-я редакция",
        },
        {
          title: "Соната №2, ор. 85",
          details: "I. Чакона; II. Скерцо; III. Ария",
        },
      ],
    },
    {
      section: "II отделение",
      works: [
        {
          title: "Сюита для домры и фортепиано, 2025",
          details: "I. Шторм; II. Заутреня; III. Moderato («Цыганская»)",
        },
        {
          title: "Квинтет для двух скрипок, альта, виолончели и фортепиано, ор. 48",
          details: "Одночастный",
        },
      ],
    },
  ],
  "2026-05-26-pianisty-kompozitory": [
    {
      section: "I отделение",
      works: [
        {
          composer: "Глеб Яковлев",
          title: "«Три эскиза для фортепиано», Basso Ostinato",
          details: "Исполняют: Глеб Яковлев, Игорь Степанич — фортепиано",
        },
        {
          composer: "И. Г. Соколов",
          title: "Фортепианные пьесы по картинам Дитмара Боннена № 1, 3, 6, 7, 8",
          details: "Исполняет: Игорь Степанич — фортепиано",
        },
        {
          composer: "Ольга Иванова",
          title: "Melting Variations, «Юмореска»",
        },
        {
          composer: "Иван Соколов",
          title: "«Ноктюрн»",
        },
        {
          composer: "Владимир Мартынов",
          title: "«Поцелуй вампира»",
          details: "Исполняет: Ольга Иванова — фортепиано",
        },
        {
          composer: "Андрей Зубец",
          title: "«Две зеркальные прелюдии»",
          details: "Исполняет: Евгений Стародубцев — фортепиано",
        },
        {
          composer: "Евгений Стародубцев",
          title: "«Сюита для Мэрилин», «Вальс», «Рождественская элегия», «Деньрожденческий клоун», «Две мазурки», «Арлекин»",
          details: "Исполняет: Евгений Стародубцев — фортепиано",
        },
        {
          composer: "Андрей Комиссаров",
          title:
            "«По дороге на Берлин» — вокальный цикл на слова поэтов — участников Великой Отечественной войны",
          details:
            "«По дороге на Берлин» — А. Твардовский; «Ты помнишь, Алёша» — К. Симонов; «Быть может» — М. Джалиль; «На войне» — А. Твардовский. Исполняют: Андрей Комиссаров — фортепиано, Сергей Москальков — баритон",
        },
      ],
    },
    {
      section: "II отделение",
      works: [
        {
          composer: "Михаил Макорда",
          title:
            "Четыре пьесы из кантаты Carmina Burana в транскрипции для двух фортепиано М. Макорда: O Fortuna, «Приближается весна», «Танец», «Хоровод»",
        },
        {
          composer: "М. Макорда",
          title: "Две пьесы для двух фортепиано: «Полет над горным озером», «Пульс времён»",
          details: "Исполняют: Михаил Макорда — фортепиано, Лиля Валиева — фортепиано",
        },
        {
          composer: "Алексей Петров",
          title: "«Этюд», «Последний ноктюрн», «Этюд октавы»",
        },
        {
          composer: "Дмитрий Онищенко",
          title: "Трио си минор для скрипки, виолончели и фортепиано, op. 28",
          details: "Исполняют: Дмитрий Онищенко — фортепиано, Юлия Игонина — скрипка, Ольга Дёмина — виолончель",
        },
      ],
    },
  ],
  "2026-05-27-desyatnikov-love-and-life": [
    {
      section: "Программа",
      works: [
        {
          title: "«Альбом для Айлики»",
          details: "Для фортепиано в 4 руки",
        },
        {
          title: "Десять избранных прелюдий из фортепианного цикла «Буковинские песни»",
        },
        {
          title: "«В сторону Лебедя»",
          details: "Для двух фортепиано",
        },
        {
          title: "«Любовь и жизнь поэта»",
          details: "Вокальный цикл для тенора и фортепиано на слова Д. Хармса и Н. Олейникова",
        },
      ],
    },
  ],
  "2026-05-28-brezel-melodiya": [
    {
      section: "Программа",
      works: [
        {
          composer: "Николя Челоро",
          title: "«Колокола Суздаля»",
        },
        {
          composer: "Эрикс Эшенвальдс",
          title: "«Stars»",
          details: "Стихи С. Тисдейл",
        },
        {
          composer: "Владимир Мартынов",
          title: "«Заповеди блаженства»",
        },
        {
          composer: "Петерис Васкс",
          title: "Castillo interior",
        },
        {
          composer: "Петерис Васкс",
          title: "Plainscapes",
        },
        {
          composer: "Арво Пярт",
          title: "«Богородице Дево, радуйся»",
        },
        {
          composer: "Арво Пярт",
          title: "«Сольфеджио»",
        },
        {
          composer: "Эрикс Эшенвальдс",
          title: "«In Paradisum»",
        },
        {
          composer: "Сергей Плешак",
          title: "«Credo»",
        },
      ],
    },
  ],
  "2026-05-29-milyausha-khayrullina": [
    {
      section: "Программа",
      works: [
        {
          title: "Три прелюдии для фортепиано: «Звёзды», «Солнечный ветер», «Планета»",
        },
        {
          title: "Соната для скрипки и фортепиано",
        },
        {
          title: "«В гостях у сказки»",
          details: "Избранные пьесы из фортепианной сюиты для юных музыкантов",
        },
        {
          title: "«Жизнь-река»",
          details:
            "Цикл романсов для голоса и фортепиано на стихи Р. Гаташа в переводах А. Зорина и Р. Бухараева",
        },
        {
          title: "«Тема матери»",
          details: "Музыка из спектакля «Приключения Рустема» в редакции для скрипки и фортепиано",
        },
        {
          title: "«Любовь и жизнь женщины»",
          details: "Две песни из авторского песенного цикла",
        },
        {
          title: "«Кави-Сарвар»",
          details: "Фрагменты из оперы о жизни и любви писателя Кави Наджми и его супруги Сарвар Адгамовой",
        },
      ],
    },
  ],
  "2026-05-31-gromche-slova": [
    {
      section: "I отделение",
      works: [
        {
          composer: "Гийом Коннессон",
          title: "«Технопарад», «Смех Сары», «Секстет»",
        },
        {
          composer: "Дэвид Лэнг",
          title: "«Vent», «How to pray»",
        },
      ],
    },
    {
      section: "II отделение",
      works: [
        {
          composer: "Сергей Ахунов",
          title: "Цикл «Поэзия»",
        },
        {
          composer: "Павел Карманов",
          title: "«Второй снег на стадионе», «I Made My Home», «Day one»",
        },
      ],
    },
  ],
};

const composersByConcertId: Record<ConcertProgrammeItem["id"], string> = {
  "2026-05-10-peletsis-24-kaprisa": "Георг Пелецис",
  "2026-05-12-il-theleme-de-la-nuite": "Кайя Саариахо, Алексей Ретинский, Джордж Крам, Андреас Мустукис, Сальваторе Шаррино",
  "2026-05-13-v-ischezayushem-gorode": "Андрей Зубец, Павел Турсунов, Сергей Ахунов, Марианна Домникова",
  "2026-05-15-solisty-nizhnego-novgoroda":
    "Павел Турсунов, Андрей Комиссаров, Екатерина Кожевникова, Сергей Жуков, Олег Пайбердин, Андрей Зеленский, Георг Пелецис, Михаил Тарбагаев",
  "2026-05-16-improvizirovannyy-uzhin": "Вечер импровизации",
  "2026-05-18-forelnyy-kontsert": "Франц Шуберт, Руст Позюмский, Владимир Радченков, Павел Карманов, Владимир Волков",
  "2026-05-19-opensoundquartet": "Эльмир Низамов, Владимир Кобекин, Настасья Хрущёва, Юрий Каспаров, Павел Карманов, Анастасия Дружинина",
  "2026-05-20-opensoundorchestra": "Сергей Ахунов, Владимир Мартынов",
  "2026-05-21-petr-glavatskikh": "Владимир Мартынов, Эдисон Денисов, Яннис Ксенакис, Кэйко Абэ",
  "2026-05-25-daniil-sayamov-glinka-quartet": "Александр Чайковский",
  "2026-05-26-pianisty-kompozitory": "Игорь Степанич, Ольга Иванова, Евгений Стародубцев, Андрей Комиссаров, Михаил Макорда, Лиля Валиева, Алексей Петров, Дмитрий Онищенко",
  "2026-05-27-desyatnikov-love-and-life": "Леонид Десятников",
  "2026-05-28-brezel-melodiya":
    "Николя Челоро, Эрикс Эшенвальдс, Владимир Мартынов, Петерис Васкс, Арво Пярт, Сергей Плешак",
  "2026-05-29-milyausha-khayrullina": "Миляуша Хайруллина",
  "2026-05-31-gromche-slova": "Гийом Коннессон, Дэвид Лэнг, Павел Карманов, Сергей Ахунов",
};

const initialRecordedConcertIds = new Set<ConcertProgrammeItem["id"]>([
  "2026-05-10-peletsis-24-kaprisa",
  "2026-05-12-il-theleme-de-la-nuite",
  "2026-05-13-v-ischezayushem-gorode",
  "2026-05-15-solisty-nizhnego-novgoroda",
  "2026-05-19-opensoundquartet",
  "2026-05-20-opensoundorchestra",
  "2026-05-25-daniil-sayamov-glinka-quartet",
]);

const excludedBroadcastConcertIds = new Set<ConcertProgrammeItem["id"]>([
  "2026-05-10-peletsis-24-kaprisa",
  "2026-05-16-improvizirovannyy-uzhin",
  "2026-05-21-petr-glavatskikh",
]);

function formatPerformers(performers: string[]) {
  return performers
    .join(", ")
    .replace(/:,\s+/g, ": ")
    .replace(/,\s+в составе:/g, " в составе:")
    .replace(/,\s+Проект ClassicaPlus:/g, ". Проект ClassicaPlus:");
}

export const broadcasts: BroadcastItem[] = concertProgrammes
  .filter((concert) => !excludedBroadcastConcertIds.has(concert.id))
  .map((concert) => ({
    id: concert.id,
    date: concert.date,
    time: concert.time ?? "19:30",
    dateTime: dateTimeByConcertId[concert.id],
    title: concert.title,
    composers: composersByConcertId[concert.id],
    performers: formatPerformers(concert.performers),
    program: programByConcertId[concert.id],
    status: initialRecordedConcertIds.has(concert.id) ? "Запись" : "Трансляция",
    cta: "Смотреть на Культура.РФ ↗",
    url: urlByConcertId[concert.id] ?? "#",
  }));
