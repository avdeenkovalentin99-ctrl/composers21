import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PageContainer } from "../layout/PageContainer";

const pageTitle = "Академии";
const metaTitle = "Академии — Композиторы XXI века";
const metaDescription =
  "Параллельная программа фестиваля “Композиторы XXI века”: беседы, мастер-классы и встречи с участниками фестиваля.";

const introParagraphs = [
  "В Île Thélème пройдет параллельная программа фестиваля — “Академии”.",
  "Беседы, мастер-классы и открытые встречи, посвященные музыкальному мышлению, композиторским практикам и современному художественному языку.",
  "Все встречи проведет Варвара Мягкова.",
  "Для студентов музыкальных направлений вход свободный.",
];

const ticketLabel = "Билеты";
const eventDetailsLabel = "открыть событие";

const academyEvents = [
  {
    id: "sergey-akhunov",
    date: "14 мая — 16:00",
    title: "Сергей Ахунов. Беседы о музыке",
    teaser:
      "Композитор расскажет о своем опыте сочинительства и о том, что делает классическую музыку долговечной.",
    paragraphs: [
      "Композитор расскажет о своем опыте сочинительства, о том, чем искусство отличается от подражания искусству и о том, что делает классическую музыку долговечной в отличие от других жанров.",
      "В разговоре будут затронуты вопросы вдохновения, смыслов, природы искусства и того, что мы всегда ощущали, слушая музыку, но не могли определить до конца.",
    ],
    highlight: "Что мы всегда ощущали, слушая музыку, но не могли определить до конца.",
    image: "/assets/academies/akhunov-academy.jpg",
    imageAlt: "Сергей Ахунов",
    ticketLabel,
    href: "https://widget.afisha.yandex.ru/w/sessions/NTA3NTV8ODI4OTcxfDQ0MzQzNTB8MTc3ODc2MzYwMDAwMA==?clientKey=e674ad9f-44e9-44b9-ae30-c68f2e27e228",
  },
  {
    id: "festival-creators-meeting",
    date: "17 мая — 16:00",
    title: "Встреча с создателями фестиваля",
    teaser: "Разговор о фестивале, композиторах, музыкантах, проблемах и задачах современной музыкальной среды.",
    paragraphs: [
      "Поговорим о фестивале, о композиторах, музыкантах, о проблемах и задачах. О самом насущном в этой области.",
      "Владимир Жалнин — музыкальный журналист, продюсер, музыковед. Начальник организационно-творческого отдела Союза композиторов России.",
      "Андрей Зубец — композитор, аранжировщик, саунд-продюсер и педагог. Выпускник РАМ имени Гнесиных (2013). Автор музыки для музыкальных и драматических спектаклей.",
      "Варвара Мягкова — пианист, художественный руководитель фестиваля «Композиторы XXI века».",
      "Наталья Соколовская — художественный руководитель Île Thélème Ensemble, пианистка, композитор.",
      "Юра Гинзбург — музыкант-мультиинструменталист, композитор, саунд-дизайнер. Принимал участие во многих известных фестивалях, в том числе в Зальцбурге, Люцерне, Руре, Бремене, Венецианской биеннале.",
      "Екатерина Мочалова — исполнительница на домре и мандолине, солистка и концертмейстер Национального академического оркестра народных инструментов России имени Осипова.",
      "Разговоры будут прерываться музыкой, затем продолжаться, и вновь перетекать в музыку.",
    ],
    highlight: "Разговоры будут прерываться музыкой, затем продолжаться, и вновь перетекать в музыку.",
    image: "/assets/academies/myagkova-academy.jpg",
    imageAlt: "Встреча с создателями фестиваля",
    ticketLabel,
    href: "https://widget.afisha.yandex.ru/w/sessions/NTA3NTV8ODI4OTc2fDQ0MzQzNTB8MTc3OTAyMjgwMDAwMA==?clientKey=e674ad9f-44e9-44b9-ae30-c68f2e27e228",
  },
  {
    id: "ile-theleme-ensemble-meeting",
    date: "22 мая — 16:00",
    title: "Встреча с Île Thélème Ensemble",
    teaser: "Поговорим о современном репертуаре, новых средствах выразительности и задачах исполнителя.",
    paragraphs: [
      "Мы поговорим о современном репертуаре, новых средствах выразительности, основных сложностях и задачах исполнителя.",
      "Île Thélème Ensemble — резиденты галереи, содружество музыкантов, которым подвластны все форматы и стили камерной музыки. Интеллектуально взвешенная и одновременно страстная манера исполнения, интерес к малоизвестной или совершенно неизвестной музыке XIX-XXI веков, концептуальные программы, в которых произведения далекого прошлого вступают в диалог с новейшей музыкой — все это составляет суть творческого метода ансамбля. Художественный руководитель — Наталья Соколовская.",
      "Ансамбль и его худрук Наталья Соколовская сыграют избранные опусы из репертуара.",
    ],
    highlight: "Произведения далекого прошлого вступают в диалог с новейшей музыкой.",
    image: "/assets/academies/ile-theleme-academy.jpg",
    imageAlt: "Île Thélème Ensemble",
    ticketLabel,
    href: "https://widget.afisha.yandex.ru/w/sessions/NTA3NTV8ODI4OTgzfDQ0MzQzNTB8MTc3OTQ1NDgwMDAwMA==?clientKey=e674ad9f-44e9-44b9-ae30-c68f2e27e228",
  },
];

type AcademyEvent = (typeof academyEvents)[number];

const imageAspectByIndex = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[5/6]"];
const cardOffsetByIndex = ["", "lg:pt-12", "lg:pt-6"];
const imageWidthByIndex = ["w-[90%]", "w-[90%]", "w-[90%]"];

function useAcademiesMeta() {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = descriptionMeta?.getAttribute("content") ?? null;

    document.title = metaTitle;
    descriptionMeta?.setAttribute("content", metaDescription);

    return () => {
      document.title = previousTitle;
      if (previousDescription !== null) {
        descriptionMeta?.setAttribute("content", previousDescription);
      }
    };
  }, []);
}

function useOverlayScrollLock(isOpen: boolean) {
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = html.style.overflow;

    if (isOpen) {
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
    }

    return () => {
      body.style.overflow = previousBodyOverflow;
      html.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);
}

function AcademyOverlay({ event, onClose }: { event: AcademyEvent | null; onClose: () => void }) {
  useOverlayScrollLock(Boolean(event));

  useEffect(() => {
    if (!event) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [event, onClose]);

  return (
    <AnimatePresence>
      {event ? (
        <>
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#f8f7f3]/95 text-neutral-950 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.42, 0, 0.58, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`academy-overlay-${event.id}`}
        >
          <div className="min-h-screen px-5 py-20 sm:px-8 sm:py-24 lg:px-14 lg:py-16">
            <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)] lg:gap-20 xl:gap-28">
              <motion.div
                className="lg:sticky lg:top-16 lg:self-start"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08, ease: [0.42, 0, 0.58, 1] }}
              >
                <img
                  src={event.image}
                  alt={event.imageAlt}
                  className="max-h-[76vh] w-full object-cover grayscale lg:min-h-[62vh]"
                />
              </motion.div>

              <motion.div
                className="pb-14 lg:pb-28 lg:pt-[10vh]"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.14, ease: [0.42, 0, 0.58, 1] }}
              >
                <p className="font-editorial-sans text-[11px] uppercase leading-5 tracking-[0.18em] text-neutral-500">
                  {event.date}
                </p>

                <h2
                  id={`academy-overlay-${event.id}`}
                  className="font-editorial-serif mt-8 max-w-4xl text-[3.3rem] font-normal leading-[0.96] text-neutral-950 sm:text-[5rem] lg:text-[6.2rem]"
                >
                  {event.title}
                </h2>

                <div className="mt-20 max-w-3xl space-y-10 font-editorial-serif text-[1.25rem] leading-9 text-neutral-700 sm:text-[1.42rem] sm:leading-10">
                  {event.paragraphs.slice(0, 2).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <blockquote className="font-editorial-serif my-20 max-w-3xl text-[2.15rem] font-normal leading-[1.06] text-neutral-950 sm:my-24 sm:text-[3rem]">
                  {event.highlight}
                </blockquote>

                {event.paragraphs.length > 2 ? (
                  <div className="max-w-3xl space-y-8 font-editorial-serif text-[1.14rem] leading-8 text-neutral-700 sm:text-[1.28rem] sm:leading-9">
                    {event.paragraphs.slice(2).map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}

                <a
                  href={event.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-editorial-sans mt-20 inline-flex border-b border-black/20 pb-1 text-[11px] uppercase tracking-[0.18em] text-neutral-600 transition-colors duration-200 hover:border-black/40 hover:text-neutral-950"
                >
                  {event.ticketLabel}
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>

          <button
            type="button"
            className="font-editorial-sans fixed right-5 top-5 z-60 flex h-10 w-10 items-center justify-center text-2xl leading-none text-neutral-500 transition-colors duration-200 hover:text-neutral-950 sm:right-8 sm:top-8"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export function AcademiesPage() {
  const [selectedEvent, setSelectedEvent] = useState<AcademyEvent | null>(null);

  useAcademiesMeta();

  return (
    <section className="pb-20 pt-32 text-neutral-950 sm:pb-24 sm:pt-36">
      <PageContainer>
        <div className="mx-auto max-w-6xl">
          <h1 className="sr-only">{pageTitle}</h1>
          <div className="pb-8 sm:pb-10 lg:pb-12">
            <div className="font-editorial-serif max-w-2xl space-y-5 text-left text-[1.02rem] leading-8 text-neutral-700 sm:text-[1.1rem] sm:leading-8">
              {introParagraphs.map((paragraph, index) => (
                <p key={paragraph} className={index > 1 ? "text-neutral-600" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <section className="pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32">
            <div className="grid gap-x-10 gap-y-20 sm:grid-cols-2 sm:gap-y-24 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-28">
              {academyEvents.map((event, index) => (
                <article key={event.id} className={cardOffsetByIndex[index % cardOffsetByIndex.length]}>
                  <button
                    type="button"
                    className="group block w-full cursor-pointer bg-transparent py-2 text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-6 focus-visible:outline-black/30"
                    onClick={() => setSelectedEvent(event)}
                    aria-label={`Открыть: ${event.title}`}
                  >
                    <p className="font-editorial-sans mb-5 text-[11px] uppercase leading-5 tracking-[0.16em] text-neutral-500">
                      {event.date}
                    </p>

                    <div className={`${imageWidthByIndex[index % imageWidthByIndex.length]} overflow-hidden`}>
                      <img
                        src={event.image}
                        alt={event.imageAlt}
                        className={`${imageAspectByIndex[index % imageAspectByIndex.length]} w-full object-cover object-center grayscale transition duration-700 ease-out group-hover:scale-[1.015] group-hover:opacity-90`}
                      />
                    </div>

                    <div className="mt-6 max-w-[90%]">
                      <h2 className="font-editorial-serif text-[1.72rem] font-normal leading-[1.1] text-neutral-950 transition-[text-decoration-color] duration-300 decoration-black/0 underline-offset-[5px] group-hover:decoration-black/25 sm:text-[1.95rem]">
                        {event.title}
                      </h2>

                      <p className="mt-4 font-editorial-serif text-[0.98rem] leading-7 text-neutral-600">{event.teaser}</p>

                      <span className="font-editorial-sans mt-6 inline-flex border-b border-transparent pb-[2px] text-[10px] lowercase tracking-[0.2em] text-neutral-500 transition-colors duration-300 group-hover:border-black/25 group-hover:text-neutral-800">
                        {eventDetailsLabel}
                      </span>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </PageContainer>

      <AcademyOverlay event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </section>
  );
}
