import { concertProgrammes } from "./concertProgrammes";
import type { ConcertProgrammeItem } from "./types";

export type BroadcastItem = {
  id: string;
  date: string;
  time: string;
  dateTime: string;
  title: string;
  composers: string;
  performers: string;
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
  "2026-05-28-brezel-melodiya": "Эрикс Эшенвальдс, Владимир Мартынов, Петерис Васкс, Арво Пярт, Сергей Плешак",
  "2026-05-29-milyausha-khayrullina": "Миляуша Хайруллина",
  "2026-05-31-gromche-slova": "Гийом Коннессон, Дэвид Лэнг, Павел Карманов, Сергей Ахунов",
};

const initialRecordedConcertIds = new Set<ConcertProgrammeItem["id"]>([
  "2026-05-10-peletsis-24-kaprisa",
  "2026-05-12-il-theleme-de-la-nuite",
  "2026-05-13-v-ischezayushem-gorode",
  "2026-05-15-solisty-nizhnego-novgoroda",
]);

const excludedBroadcastConcertIds = new Set<ConcertProgrammeItem["id"]>([
  "2026-05-10-peletsis-24-kaprisa",
  "2026-05-16-improvizirovannyy-uzhin",
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
    status: initialRecordedConcertIds.has(concert.id) ? "Запись" : "Трансляция",
    cta: "Смотреть на Культура.РФ ↗",
    url: urlByConcertId[concert.id] ?? "#",
  }));
