import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import festivalLogoDesktop from "../../../lofofinaldesktop.svg";
import festivalLogoMobile from "../../../logofinalmob2.svg";
import { VideoHomeHero } from "../components/hero/VideoHomeHero";
import { FestivalIntro } from "../components/hero/FestivalIntro";
import { DesktopHomeHero } from "../components/hero/DesktopHomeHero";
import { broadcasts } from "../data/broadcasts";
import { concertProgrammes } from "../data/concertProgrammes";
import { cultureReports, mediaMaterials } from "../data/media";
import { PageContainer } from "../layout/PageContainer";

const cookieStorageKey = "composersxxi_cookie_notice_accepted";
const festivalLabel = "ФЕСТИВАЛЬ СОВРЕМЕННОЙ МУЗЫКИ";

const mobileArchiveCards = [
  {
    title: "Трансляции",
    to: "/translyatsii",
  },
  {
    title: "Медиа",
    to: "/media",
  },
] as const;

const homepageBroadcastSelection = [
  { id: "2026-05-31-gromche-slova", number: "15", title: "Громче слова", previewImage: "/assets/hero/p31.png" },
  { id: "2026-05-12-il-theleme-de-la-nuite", number: "02", title: "De la nuit / О ночи", previewImage: "/assets/hero/p12.png" },
  { id: "2026-05-28-brezel-melodiya", number: "12", title: "Новая сакральность", previewImage: "/assets/hero/p28.png" },
  { id: "2026-05-27-desyatnikov-love-and-life", number: "11", title: "Леонид Десятников. Любовь и жизнь поэта", previewImage: "/assets/hero/p27.png" },
  { id: "2026-05-15-solisty-nizhnego-novgoroda", number: "04", title: "Цветущий жасмин", previewImage: "/assets/hero/p15.png" },
] as const;

const homepageBroadcasts = homepageBroadcastSelection.flatMap((selection) => {
  const broadcast = broadcasts.find((item) => item.id === selection.id);
  return broadcast
    ? [{ ...broadcast, ...selection }]
    : [];
});

const homepageReportConcertIds = [
  "2026-05-18-forelnyy-kontsert",
  "2026-05-15-solisty-nizhnego-novgoroda",
] as const;

const homepageCultureReports = cultureReports.flatMap((report, index) => {
  const concert = concertProgrammes.find((item) => item.id === homepageReportConcertIds[index]);

  return concert ? [{ ...report, previewImage: concert.image }] : [];
});

const homepageMediaArticles = [mediaMaterials[0], mediaMaterials[2], mediaMaterials[1], mediaMaterials[3]].filter(
  (article): article is NonNullable<typeof article> => article !== undefined,
);

function CookieNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(window.localStorage.getItem(cookieStorageKey) !== "true");
  }, []);

  function acceptCookies() {
    window.localStorage.setItem(cookieStorageKey, "true");
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      className="font-editorial-sans fixed bottom-7 left-4 z-30 max-w-[calc(100vw-2rem)] border border-black/8 bg-white px-4 py-[10px] text-[11px] leading-5 text-neutral-600 sm:bottom-8 sm:left-5 sm:max-w-[360px] sm:px-5"
      aria-label="Cookie"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>{"Сайт использует cookies и Яндекс.Метрику."}</span>
        <Link to="/privacy" className="border-b border-black/20 text-neutral-700 transition-colors duration-200 hover:text-neutral-950">
          {"Политика конфиденциальности"}
        </Link>
        <button
          type="button"
          onClick={acceptCookies}
          className="ml-auto border border-black/10 px-2 py-[1px] text-[10px] uppercase tracking-[0.12em] text-neutral-500 transition-colors duration-200 hover:border-black/20 hover:text-neutral-700"
        >
          OK
        </button>
      </div>
    </aside>
  );
}

export function FestivalPageLegacy() {
  const [isDesktopHero, setIsDesktopHero] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const updateHero = () => setIsDesktopHero(desktopQuery.matches);
    desktopQuery.addEventListener("change", updateHero);
    return () => desktopQuery.removeEventListener("change", updateHero);
  }, []);
  const [activeBroadcastIndex, setActiveBroadcastIndex] = useState(0);
  const [hoveredFestivalNavIndex, setHoveredFestivalNavIndex] = useState<number | null>(null);
  const [festivalNavIndicator, setFestivalNavIndicator] = useState({ x: 0, width: 0 });
  const [shouldAnimateFestivalNavIndicator, setShouldAnimateFestivalNavIndicator] = useState(false);
  const activeBroadcast = homepageBroadcasts[activeBroadcastIndex];

  useEffect(() => {
    if (hoveredFestivalNavIndex === null || shouldAnimateFestivalNavIndicator) {
      return;
    }

    const frame = window.requestAnimationFrame(() => setShouldAnimateFestivalNavIndicator(true));
    return () => window.cancelAnimationFrame(frame);
  }, [hoveredFestivalNavIndex, shouldAnimateFestivalNavIndicator]);

  return (
    <>
      {isDesktopHero ? <DesktopHomeHero variant="graphite" /> : (
      <section id="home-old-hero" className="relative min-h-[100svh] overflow-hidden bg-black text-white">
        <h1 className="sr-only">{"Фестиваль современной музыки „Композиторы XXI века“"}</h1>
        <VideoHomeHero />
        <PageContainer className="relative z-10 min-h-[100svh] lg:hidden">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.1,
                },
              },
            }}
            className="absolute left-1 top-[116px] sm:left-2 sm:top-[124px]"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.56, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="flex w-[260px] flex-col items-start sm:w-[292px]"
            >
              <div className="ml-[10%] w-[205px] sm:w-[220px]">
                <div className="flex h-[90px] items-center overflow-visible">
                  <img
                    src={festivalLogoMobile}
                    alt="Композиторы XXI века"
                    className="relative left-[-5.03%] h-auto w-full opacity-75"
                    decoding="async"
                  />
                </div>
                <span aria-hidden="true" className="mt-3 block h-px w-4/5 bg-[#8A2432]/70" />
                <p
                  className="font-editorial-sans mt-3 flex w-[91.35%] items-center justify-between whitespace-nowrap text-[8px] font-normal uppercase leading-none text-white/65 sm:text-[9px]"
                  aria-label={festivalLabel}
                >
                  {Array.from(festivalLabel).map((character, index) => (
                    <span key={`${character}-${index}`} aria-hidden="true" className="whitespace-pre">
                      {character}
                    </span>
                  ))}
                </p>
              </div>
            </motion.div>
          </motion.div>

          <div className="font-editorial-sans absolute bottom-[52px] left-6 border-l border-[#8A2432] pl-4 text-[11px] font-medium uppercase leading-[1.85] tracking-[0.16em] text-white/85 sm:bottom-14 sm:left-8 sm:text-[12px]">
            <p>10–31 мая</p>
            <p>Москва</p>
            <p>Галерея НИКО</p>
            <p>15 концертов</p>
          </div>

          <p className="font-editorial-sans absolute bottom-[52px] right-6 text-right text-[12px] font-medium uppercase leading-[1.65] tracking-[0.16em] text-white/85 sm:bottom-14 sm:right-7 sm:text-[13px]">
            Фестиваль
            <br />
            состоялся
          </p>
        </PageContainer>

        <PageContainer className="relative z-10 hidden min-h-[100svh] flex-col justify-between pb-8 pt-[27vh] lg:flex">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.56, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="hero-brand relative -ml-2 w-[46vw] max-w-[600px]"
          >
            <p className="font-editorial-sans absolute -top-[42px] left-0 flex items-center gap-2 whitespace-nowrap text-[10px] font-normal uppercase leading-none tracking-[0.18em]">
              <span aria-hidden="true" className="text-[#8A2432]">—</span>
              <span className="text-white/72">Фестиваль состоялся</span>
            </p>
            <div className="relative aspect-[2.6/1] w-full overflow-hidden">
              <img
                src={festivalLogoDesktop}
                alt="Композиторы XXI века"
                className="absolute left-[8.25%] top-1/2 h-auto w-2/3 -translate-y-1/2 opacity-75"
                decoding="async"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-6 left-[10%] block h-px w-[52.58%] bg-[#8A2432]/70"
              />
              <p
                className="font-editorial-sans absolute bottom-0 left-[10%] flex w-[63.47%] items-center justify-between whitespace-nowrap text-[13px] font-normal uppercase leading-none text-white/76 xl:text-[14px]"
                aria-label={festivalLabel}
              >
                {Array.from(festivalLabel).map((character, index) => (
                  <span key={`${character}-${index}`} aria-hidden="true" className="whitespace-pre">
                    {character}
                  </span>
                ))}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.56, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-end justify-between gap-10"
          >
            <p className="font-editorial-sans text-[10px] font-normal uppercase leading-none tracking-[0.18em] text-white/68">
              10—31 мая · Москва · Галерея НИКО · 15 концертов
            </p>
          </motion.div>
        </PageContainer>
      </section>
      )}
      <FestivalIntro />
      {activeBroadcast ? (
        <section className="hidden bg-[var(--color-dark)] text-white lg:block" aria-labelledby="homepage-broadcasts-title">
          <PageContainer className="py-20 xl:py-24 2xl:py-28">
            <div className="mx-auto max-w-[1340px]">
              <div className="flex items-start justify-between gap-12">
                <h2
                  id="homepage-broadcasts-title"
                  className="font-editorial-serif inline-block origin-left scale-x-[0.96] scale-y-[1.03] text-[clamp(56px,5.2vw,76px)] font-extralight lowercase leading-[0.88] tracking-[0.025em] text-white"
                >
                  трансляции
                </h2>
              </div>

              <div className="mt-12 grid grid-cols-[minmax(0,1.68fr)_minmax(340px,0.86fr)] items-start gap-x-12 xl:mt-14 xl:gap-x-16">
                <div>
                  <div className="home-broadcast-card relative aspect-[1.9/1] overflow-hidden bg-neutral-900">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.img
                        key={activeBroadcast.id}
                        src={activeBroadcast.previewImage}
                        alt=""
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28 }}
                        className="home-broadcast-photo absolute inset-0 h-full w-full object-cover"
                      />
                    </AnimatePresence>
                    <div className="absolute bottom-6 left-6 z-10 xl:bottom-7 xl:left-7">
                      <a
                        href={activeBroadcast.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-editorial-sans mt-4 inline-flex items-center gap-3 border-b border-[#64111f] pb-2 text-[10px] font-medium uppercase leading-none tracking-[0.24em] text-white/82 transition-colors duration-200 hover:text-white"
                      >
                        смотреть запись
                        <span aria-hidden="true" className="text-[14px] font-light text-white/58">→</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex min-h-full flex-col">
                  <div className="grid aspect-[0.973/1] grid-rows-5 border-t border-white/10">
                    {homepageBroadcasts.map((broadcast, index) => {
                      const isActive = index === activeBroadcastIndex;

                      return (
                        <button
                          key={broadcast.id}
                          type="button"
                          onClick={() => setActiveBroadcastIndex(index)}
                          className="group relative grid h-full w-full grid-cols-[58px_minmax(0,1fr)] items-center gap-x-5 border-b border-white/10 text-left xl:grid-cols-[64px_minmax(0,1fr)] xl:gap-x-6"
                          aria-pressed={isActive}
                        >
                          <span
                            aria-hidden="true"
                            className={`absolute bottom-[9px] left-[58px] top-[9px] w-[4px] bg-[#64111f] transition-opacity duration-200 xl:left-[64px] ${isActive ? "opacity-100" : "opacity-0"}`}
                          />
                          <span className="font-condensed-display text-[39px] font-light leading-none tracking-[-0.04em] text-white/70 transition-colors duration-200 group-hover:text-white/90 xl:text-[44px]">
                            {broadcast.number}
                          </span>
                          <span className="block pl-1">
                            <span className="font-condensed-display block text-[15px] font-medium leading-[1.14] tracking-[0.06em] text-white/84 transition-colors duration-200 group-hover:text-white xl:text-[16px]">
                              {broadcast.title}
                            </span>
                            <span className="font-editorial-sans mt-2.5 block text-[9px] font-medium uppercase leading-none tracking-[0.24em] text-white/50 xl:text-[10px]">
                              {broadcast.date}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <Link
                    to="/translyatsii"
                    className="font-editorial-sans mt-10 inline-flex w-fit origin-right scale-x-[0.88] scale-y-[1.03] self-end items-center gap-2.5 border-b border-white/28 pb-2 text-[12px] font-extrabold uppercase leading-none tracking-[0.09em] text-white/72 transition-colors duration-200 hover:border-white/50 hover:text-white"
                  >
                    все трансляции
                    <span aria-hidden="true" className="text-[13px] font-light">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>
      ) : null}
      <section data-nav-light-start className="hidden bg-white text-neutral-950 lg:block" aria-labelledby="homepage-media-title">
        <PageContainer className="pb-32 pt-24 xl:pb-38 xl:pt-28 2xl:pb-40 2xl:pt-32">
          <div className="mx-auto grid max-w-[1340px] grid-cols-[minmax(190px,0.78fr)_minmax(0,1.08fr)_minmax(0,1fr)_minmax(260px,1.22fr)] items-start gap-x-7 xl:gap-x-9">
            <Link
              to="/media"
              className="home-media-tile group relative flex min-h-[330px] translate-y-22 flex-col justify-between px-7 pb-8 pt-4 text-white xl:min-h-[370px] xl:translate-y-26 xl:px-9 xl:pb-10 xl:pt-5"
            >
              <h2
                id="homepage-media-title"
                className="font-editorial-serif origin-center -translate-y-3 scale-x-[0.96] scale-y-[1.03] text-center text-[clamp(42px,4vw,60px)] font-extralight lowercase leading-[0.9] tracking-[0.025em] text-white/88"
              >
                медиа
              </h2>
              <span
                aria-hidden="true"
                className="font-editorial-sans -mr-3 inline-flex items-center gap-9 self-end xl:-mr-5"
              >
                <span className="translate-x-2 text-[9px] font-medium uppercase leading-none tracking-[0.16em] text-white/70 opacity-0 transition-[opacity,translate] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none">
                  смотреть медиа
                </span>
                <span className="relative block h-5 w-5 shrink-0 text-white/62">
                  <svg className="absolute right-0 top-0 h-5 w-12 overflow-visible" viewBox="0 0 48 20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path className="home-media-arrow-shaft" d="M6 10H46" vectorEffect="non-scaling-stroke" />
                    <path d="m42 6 5 4-5 4" />
                  </svg>
                </span>
              </span>
            </Link>

            {homepageCultureReports.map((report, index) => (
              <a
                key={report.id}
                href={report.url}
                target="_blank"
                rel="noreferrer"
                className={`group flex min-w-0 flex-col ${index === 1 ? "translate-y-19 xl:translate-y-25" : ""}`}
              >
                <div className={`relative overflow-hidden bg-neutral-200 ${index === 0 ? "aspect-[1.3/1]" : "aspect-[1.45/1]"}`}>
                  <img
                    src={report.previewImage}
                    alt=""
                    className="h-full w-full object-cover grayscale transition-[filter,transform] duration-500 group-hover:scale-[1.015] group-hover:grayscale-0"
                  />
                  <span className="absolute bottom-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/88 pl-0.5 text-[12px] text-neutral-900" aria-hidden="true">
                    ▶
                  </span>
                </div>
                <h3 className={`font-editorial-serif mt-4 font-normal leading-[1.18] tracking-[-0.01em] text-neutral-900 ${index === 0 ? "text-[21px] xl:text-[23px]" : "text-[19px] xl:text-[21px]"}`}>
                  {report.title}
                </h3>
                <p className={`font-editorial-sans mt-3 font-medium uppercase leading-none tracking-[0.16em] text-neutral-500 ${index === 0 ? "text-[10px]" : "text-[9px]"}`}>
                  {report.source} · {report.date}
                </p>
              </a>
            ))}

            <div className="flex min-h-[330px] flex-col border-l border-black/10 pl-7 xl:min-h-[370px] xl:pl-9">
              <div className="flex-1 divide-y divide-black/10">
                {homepageMediaArticles.map((article) => (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block py-5 first:pt-0 xl:py-6"
                  >
                    <p className="font-condensed-display text-[14px] font-medium leading-[1.15] tracking-[0.055em] text-neutral-800 transition-colors duration-200 group-hover:text-[#64111f] xl:text-[15px]">
                      {article.source}
                    </p>
                    <p className="font-editorial-serif mt-2 line-clamp-2 text-[15px] leading-[1.2] text-neutral-700 xl:text-[16px]">
                      {article.title}
                    </p>
                    <p className="font-editorial-sans mt-3 text-[9px] font-medium uppercase leading-none tracking-[0.16em] text-neutral-400">
                      {article.date}
                    </p>
                  </a>
                ))}
              </div>

              <Link
                to="/media"
                className="font-editorial-sans mt-6 inline-flex w-fit origin-right scale-x-[0.88] scale-y-[1.03] self-end items-center gap-2.5 text-[11px] font-semibold uppercase leading-none tracking-[0.09em] text-neutral-800 transition-colors duration-200 hover:text-[#64111f]"
              >
                все публикации
                <span aria-hidden="true" className="text-[15px] font-light leading-none text-neutral-500">→</span>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>
      <section className="hidden bg-white text-neutral-950 lg:block" aria-labelledby="festival-year-title">
        <PageContainer className="pb-24 pt-16 xl:pb-28 xl:pt-20 2xl:pb-32 2xl:pt-24">
          <div className="relative mx-auto max-w-[1340px]">
            <h2 id="festival-year-title" className="font-editorial-sans absolute left-[4%] top-0 z-10 text-[18px] font-black uppercase leading-none tracking-[0.18em] text-neutral-950 xl:text-[20px]">
              фестиваль<span className="sr-only"> 2026</span>
            </h2>

            <nav
              className="home-year-composition relative grid grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,0.82fr)]"
              aria-label="Разделы фестиваля 2026"
              onMouseLeave={() => {
                setHoveredFestivalNavIndex(null);
                setShouldAnimateFestivalNavIndicator(false);
              }}
            >
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2 left-0 h-10 bg-black"
                initial={false}
                animate={{
                  x: festivalNavIndicator.x,
                  width: festivalNavIndicator.width,
                  opacity: hoveredFestivalNavIndex === null ? 0 : 1,
                }}
                transition={{
                  x: { duration: shouldAnimateFestivalNavIndicator ? 0.28 : 0, ease: [0.22, 1, 0.36, 1] },
                  width: { duration: shouldAnimateFestivalNavIndicator ? 0.28 : 0, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.2, ease: "easeOut" },
                }}
              />
              {[
                { label: "Программа", to: "/afisha" },
                { label: "Участники", to: "/participants" },
                { label: "Академии", to: "/academies" },
                { label: "Партнёры", to: "/partners" },
                { label: "Команда", to: "/team" },
              ].map((item, index) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onMouseEnter={(event) => {
                    if (hoveredFestivalNavIndex === null) {
                      setShouldAnimateFestivalNavIndicator(false);
                    }
                    setHoveredFestivalNavIndex(index);
                    setFestivalNavIndicator({
                      x: event.currentTarget.offsetLeft + 10,
                      width: Math.max(0, event.currentTarget.offsetWidth - 20),
                    });
                  }}
                  className="home-year-column relative z-10 block min-w-0 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#64111f]"
                >
                  {index < 4 ? (
                    <span aria-hidden="true" className="home-year-figure pointer-events-none absolute inset-0" data-digit-index={index}>
                      {index === 0 ? <><span className="home-year-square" /><span className="home-year-diagonal" /></> : null}
                      {index === 2 ? <span className="home-year-hairline" /> : null}
                      {index === 3 ? <span className="home-year-square" /> : null}
                      <span className="home-year-digit font-display-serif">{"2026"[index]}</span>
                      {index === 1 || index === 2 ? (
                        <span className="home-year-inversion">
                          <span className="home-year-digit font-display-serif">{"2026"[index]}</span>
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    <span aria-hidden="true" className="home-year-digit font-display-serif pointer-events-none">
                      <span className="inline-block h-[44px] w-[44px] rounded-full bg-black align-baseline" />
                    </span>
                  )}
                  <span className={`font-editorial-sans absolute inset-x-0 bottom-2 flex h-10 items-center justify-center whitespace-nowrap text-[10px] font-medium uppercase leading-none tracking-[0.2em] transition-colors duration-200 xl:text-[12px] ${hoveredFestivalNavIndex === index ? "!text-white" : "text-neutral-900"}`}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </PageContainer>
      </section>
      <section className="bg-white text-neutral-950 sm:hidden" aria-labelledby="mobile-festival-archive-title">
        <PageContainer className="py-12">
          <h2
            id="mobile-festival-archive-title"
            className="font-editorial-serif text-[2rem] font-normal leading-none tracking-[-0.01em]"
          >
            архив фестиваля
          </h2>

          <nav className="mt-8 border-t border-black/10" aria-label="Архив фестиваля">
            {mobileArchiveCards.map((card) => (
              <Link
                key={card.title}
                to={card.to}
                className="group flex items-center justify-between gap-5 border-b border-black/10 py-5"
              >
                <span className="font-editorial-sans min-w-0 text-[12px] font-normal uppercase leading-none tracking-[0.14em] text-neutral-800">
                  {card.title}
                </span>
                <span
                  aria-hidden="true"
                  className="font-editorial-sans shrink-0 text-[17px] leading-none text-neutral-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-neutral-800"
                >
                  →
                </span>
              </Link>
            ))}
          </nav>
        </PageContainer>
      </section>
      <CookieNotice />
    </>
  );
}
