import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { concerts } from "../data/site";
import { PageContainer } from "../layout/PageContainer";

type EventItem = (typeof concerts)[number];

const weekdayFormatter = new Intl.DateTimeFormat("ru-RU", { weekday: "short" });
const monthFormatter = new Intl.DateTimeFormat("ru-RU", { month: "short" });

function buildEventDate(dateLabel: string) {
  const dayMatch = dateLabel.match(/\d{1,2}/);
  const day = dayMatch ? Number(dayMatch[0]) : 1;
  const date = new Date(Date.UTC(2026, 4, day));

  return {
    dayNumber: String(day).padStart(2, "0"),
    weekday: weekdayFormatter.format(date).replace(".", "").toUpperCase(),
    month: monthFormatter.format(date).replace(".", "").toUpperCase(),
  };
}

function normalizeProgrammePart(value: string) {
  return value
    .replace(/[«»"]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*\/\s*/g, " / ")
    .trim();
}

function getCustomProgrammeItems(event: EventItem) {
  if (event.date === "10 мая") {
    return ["Георг Пелецис. 24 Каприса"];
  }

  if (event.date === "12 мая") {
    return [
      'Кайя Саариахо (1952-2023) "Vent Nocturne"',
      'Алексей Ретинский (род. 1986) "Dream of Birds"',
      "Джордж Крам (1929-2022) Четыре Ноктюрна для скрипки и фортепиано",
      'Андреас Мустукис (род. 1951) "Les Fleur du Mal"',
      'Сальваторе Шаррино (род. 1947) "De la Nuite"',
      "Алексей Ретинский (род. 1986) Трио для скрипки, виолончели и фортепиано",
    ];
  }

  return null;
}

function getCustomPerformers(event: EventItem) {
  if (event.date === "10 мая") {
    return ["Максим Новиков (альт)"];
  }

  if (event.date === "12 мая") {
    return [
      "Наталья Соколовская (фортепиано)",
      "Аяко Танабэ (скрипка)",
      "Сергей Полтавский (альт)",
      "Евгений Румянцев (виолончель)",
      "Худ. руководитель ансамбля — Наталья Соколовская",
    ];
  }

  return null;
}

function getCustomProgrammePreview(event: EventItem) {
  if (event.date === "10 мая") {
    return "Максим Новиков (альт)";
  }

  if (event.date === "12 мая") {
    return "Саариахо · Ретинский · Крам · Мустукис · Шаррино";
  }

  return null;
}

function buildProgrammeItems(event: EventItem) {
  const customProgrammeItems = getCustomProgrammeItems(event);

  if (customProgrammeItems) {
    return customProgrammeItems;
  }

  const sources = [event.title, event.description]
    .flatMap((value) => value.split(/[.;]/))
    .flatMap((value) => value.split(/, (?=[A-ZА-ЯЁ])/u))
    .map(normalizeProgrammePart)
    .filter(Boolean);

  return Array.from(new Set(sources));
}

function buildProgrammePreview(event: EventItem) {
  const customProgrammePreview = getCustomProgrammePreview(event);

  if (customProgrammePreview) {
    return customProgrammePreview;
  }

  return buildProgrammeItems(event).slice(0, 3).join("  •  ");
}

function buildPerformers(event: EventItem) {
  const customPerformers = getCustomPerformers(event);

  if (customPerformers) {
    return customPerformers;
  }

  return event.description
    .split(/[.;]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function EventAccordion({
  event,
  isOpen,
  onToggle,
}: {
  event: EventItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const dateParts = useMemo(() => buildEventDate(event.date), [event.date]);
  const programmePreview = useMemo(() => buildProgrammePreview(event), [event]);
  const programmeItems = useMemo(() => buildProgrammeItems(event), [event]);
  const performers = useMemo(() => buildPerformers(event), [event]);

  return (
    <article className="group py-10 sm:py-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        <div className="relative shrink-0 md:w-[100px]">
          <div className="pr-6 md:pr-8">
            <p className="font-editorial-serif text-3xl font-normal tracking-[-0.04em] text-neutral-900 sm:text-4xl">
              {dateParts.dayNumber}
            </p>
            <p className="font-editorial-sans mt-2 text-xs uppercase tracking-[0.14em] text-neutral-500">
              {dateParts.weekday} / {dateParts.month}
            </p>
          </div>
          <div className="absolute right-0 top-0 hidden h-full w-px bg-black/8 md:block" />
        </div>

        <div className="min-w-0 flex-1 md:pl-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-10">
            <div className="min-w-0 flex-1 space-y-4">
              <h2 className="font-editorial-serif max-w-3xl text-[1.45rem] font-normal leading-[1.35] tracking-[-0.01em] text-neutral-900 sm:text-[1.62rem]">
                {event.title}
              </h2>

              <p className="font-editorial-serif max-w-3xl text-base leading-7 text-neutral-600">{programmePreview}</p>

              <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-label={isOpen ? "Свернуть программу" : "Показать программу"}
                className="inline-flex h-10 w-10 items-center justify-center text-neutral-500 transition-colors duration-200 ease-out hover:text-neutral-900"
              >
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="inline-flex"
                >
                  <ChevronDown size={20} strokeWidth={1.4} />
                </motion.span>
              </button>
            </div>

            <div className="pr-2 pt-1 text-left md:min-w-[120px] md:text-right">
              {event.link ? (
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Купить билеты на концерт"
                  className="font-editorial-sans relative inline-flex px-1 py-[1px] text-[13px] font-normal uppercase tracking-[0.12em] text-neutral-500 transition-all duration-150 ease-out hover:px-3 hover:py-[2px] hover:text-neutral-900 before:pointer-events-none before:absolute before:bottom-[3px] before:left-0 before:top-[3px] before:w-0 before:border-l before:border-neutral-800 before:opacity-0 before:transition-opacity before:duration-150 before:ease-out hover:before:opacity-100 after:pointer-events-none after:absolute after:bottom-[3px] after:right-0 after:top-[3px] after:w-0 after:border-r after:border-neutral-800 after:opacity-0 after:transition-opacity after:duration-150 after:ease-out hover:after:opacity-100"
                >
                  БИЛЕТЫ
                </a>
              ) : null}
            </div>
          </div>

          {isOpen ? (
            <div className="mt-6 border-t border-black/10 pt-6 md:mt-7 md:pt-7">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-x-10">
                <div className="grid gap-8 md:grid-cols-2 md:gap-x-10">
                  <div>
                    <p className="font-editorial-sans mb-4 text-xs uppercase tracking-[0.14em] text-neutral-400">
                      ПРОГРАММА
                    </p>
                    <div className="font-editorial-serif space-y-3 text-base leading-8 text-neutral-800">
                      {programmeItems.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-editorial-sans mb-4 text-xs uppercase tracking-[0.14em] text-neutral-400">
                      ИСПОЛНИТЕЛИ
                    </p>
                    <div className="font-editorial-serif space-y-2 text-[1.04rem] leading-7 text-neutral-800">
                      {performers.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="order-first xl:order-last xl:justify-self-end xl:pt-2">
                  <img
                    src={event.image}
                    alt=""
                    aria-hidden="true"
                    className="aspect-[4/3] h-auto w-full object-cover object-center grayscale xl:w-[340px]"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function AfishaPage() {
  const [openEventKeys, setOpenEventKeys] = useState<string[]>([]);

  return (
    <section className="pb-20 pt-32 sm:pb-24 sm:pt-36">
      <PageContainer className="space-y-7 sm:space-y-8">
        <div>
          <p className="font-editorial-serif text-[1.9rem] leading-[0.95] font-normal tracking-[0.08em] lowercase text-neutral-900 sm:text-[2.2rem] lg:text-[2.5rem]">
            программа фестиваля
          </p>
        </div>

        <div className="divide-y divide-black/8">
          {concerts.map((concert) => {
            const eventKey = `${concert.date}-${concert.title}`;

            return (
              <EventAccordion
                key={eventKey}
                event={concert}
                isOpen={openEventKeys.includes(eventKey)}
                onToggle={() =>
                  setOpenEventKeys((current) =>
                    current.includes(eventKey)
                      ? current.filter((key) => key !== eventKey)
                      : [...current, eventKey],
                  )
                }
              />
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
