import { type CSSProperties, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import { MobileHomeMedia } from "../components/MobileHomeMedia";
import { EditorialCta } from "../components/ui/EditorialCta";
import { MediaSyncText } from "../components/MediaSyncText";
import { useMediaSyncopation } from "../components/useMediaSyncopation";
import { MobileFestivalYear } from "../components/MobileFestivalYear";
import { useBroadcastEntrance } from "../components/useBroadcastEntrance";
import { MobileHomeBroadcasts } from "../components/MobileHomeBroadcasts";
import { LogoVideoHero } from "../components/hero/LogoVideoHero";
import { FestivalIntro } from "../components/hero/FestivalIntro";
import { broadcasts } from "../data/broadcasts";
import { cultureReports, mediaMaterials } from "../data/media";
import { PageContainer } from "../layout/PageContainer";
import { useFestivalYearEntrance } from "../components/useFestivalYearEntrance";
import { useFestivalFigureMotion } from "../components/useFestivalFigureMotion";
import "../components/FestivalYearMotion.css";

const cookieStorageKey = "composersxxi_cookie_notice_accepted";



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

const homepageReportPreviews: Record<string, string> = {
  "smotrim-news-culture-main-report": "/assets/hero/culture1.webp",
  "smotrim-solisty-nizhnego-novgoroda": "/assets/hero/culture2.webp",
};

const homepageCultureReports = cultureReports.flatMap((report) => {
  const previewImage = homepageReportPreviews[report.id];

  return previewImage ? [{ ...report, previewImage }] : [];
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
  const mediaRef = useMediaSyncopation("desktop");
  const broadcastRef = useBroadcastEntrance("desktop");
  const [activeBroadcastIndex, setActiveBroadcastIndex] = useState(0);
  const [hoveredFestivalNavIndex, setHoveredFestivalNavIndex] = useState<number | null>(null);
  const [festivalNavIndicator, setFestivalNavIndicator] = useState({ x: 0, width: 0 });
  const [shouldAnimateFestivalNavIndicator, setShouldAnimateFestivalNavIndicator] = useState(false);
  const activeBroadcast = homepageBroadcasts[activeBroadcastIndex];
  const festivalFigureMotion = useFestivalFigureMotion();
  const { ref: festivalYearRef, isReady: festivalYearReady } = useFestivalYearEntrance("desktop");

  useEffect(() => {
    if (festivalYearReady) return;
    setHoveredFestivalNavIndex(null);
    setShouldAnimateFestivalNavIndicator(false);
    for (let index = 0; index < 4; index += 1) festivalFigureMotion.setColumnHovered(index, false);
  }, [festivalYearReady, festivalFigureMotion.setColumnHovered]);

  useEffect(() => {
    if (hoveredFestivalNavIndex === null || shouldAnimateFestivalNavIndicator) {
      return;
    }

    const frame = window.requestAnimationFrame(() => setShouldAnimateFestivalNavIndicator(true));
    return () => window.cancelAnimationFrame(frame);
  }, [hoveredFestivalNavIndex, shouldAnimateFestivalNavIndicator]);

  function activateFestivalColumn(index: number, column: HTMLAnchorElement) {
    if (!festivalYearReady || hoveredFestivalNavIndex === index) return;
    festivalFigureMotion.setColumnHovered(index, true);
    if (hoveredFestivalNavIndex === null) setShouldAnimateFestivalNavIndicator(false);
    setHoveredFestivalNavIndex(index);
    setFestivalNavIndicator({
      x: column.offsetLeft + 10,
      width: Math.max(0, column.offsetWidth - 20),
    });
  }


  return (
    <>
      <LogoVideoHero variant="paper" />
      <FestivalIntro />
      <MobileHomeBroadcasts broadcasts={homepageBroadcasts} activeIndex={activeBroadcastIndex} onSelect={setActiveBroadcastIndex} />
      <MobileHomeMedia reports={homepageCultureReports} articles={homepageMediaArticles} />
      <MobileFestivalYear />
      {activeBroadcast ? (
        <section className="hidden bg-[var(--color-dark)] text-white home-desktop:block" aria-labelledby="homepage-broadcasts-title">
          <PageContainer className="py-20 xl:py-24 2xl:py-28">
            <div ref={broadcastRef} className="mx-auto max-w-[1340px]">
              <div className="flex items-start justify-between gap-12">
                <h2
                  id="homepage-broadcasts-title"
                  data-broadcast-title
                  className="font-editorial-serif inline-block origin-left scale-x-[0.96] scale-y-[1.03] text-[clamp(56px,5.2vw,76px)] font-extralight lowercase leading-[0.88] tracking-[0.025em] text-white"
                >
                  трансляции
                </h2>
              </div>

              <div className="mt-12 grid grid-cols-[minmax(0,1.68fr)_minmax(340px,0.86fr)] items-start gap-x-12 xl:mt-14 xl:gap-x-16">
                <div>
                  <a
                    href={activeBroadcast.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Смотреть запись: ${activeBroadcast.title}`}
                    className="home-broadcast-card group relative block aspect-[1.9/1] overflow-hidden bg-neutral-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    <div data-broadcast-photo>
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
                      <span
                        className="home-broadcast-watch font-editorial-sans mt-4 inline-flex items-center gap-3 pb-2 text-[11px] font-medium uppercase leading-none tracking-[0.24em] text-white/82 transition-colors duration-200 group-hover:text-white group-focus-visible:text-white"
                      >
                        <span>смотреть запись</span>
                        <span aria-hidden="true" className="text-[14px] font-light text-white/58">→</span>
                      </span>
                    </div>
                    </div>
                  </a>
                </div>

                <div className="flex min-h-full flex-col">
                  <div data-broadcast-list className="grid aspect-[0.973/1] grid-rows-5 border-t border-transparent">
                    {homepageBroadcasts.map((broadcast, index) => {
                      const isActive = index === activeBroadcastIndex;

                      return (
                        <button
                          key={broadcast.id}
                          data-broadcast-row
                          style={{ "--broadcast-row": index } as CSSProperties}
                          type="button"
                          onClick={() => setActiveBroadcastIndex(index)}
                          className="group relative grid h-full w-full grid-cols-[58px_minmax(0,1fr)] items-center gap-x-5 border-b border-transparent text-left xl:grid-cols-[64px_minmax(0,1fr)] xl:gap-x-6"
                          aria-pressed={isActive}
                        >
                          <span
                            aria-hidden="true"
                            data-broadcast-marker
                            className={`absolute bottom-[9px] left-[58px] top-[9px] w-[4px] bg-[#64111f] transition-opacity duration-200 xl:left-[64px] ${isActive ? "opacity-100" : "opacity-0"}`}
                          />
                          <span data-broadcast-copy data-broadcast-number className="font-condensed-display text-[39px] font-light leading-none tracking-[-0.04em] text-white/70 transition-colors duration-200 group-hover:text-white/90 xl:text-[44px]">
                            {broadcast.number}
                          </span>
                          <span data-broadcast-copy data-broadcast-details className="block pl-1">
                            <span className="font-condensed-display block text-[15px] font-medium leading-[1.14] tracking-[0.06em] text-white/84 transition-colors duration-200 group-hover:text-white xl:text-[16px]">
                              {broadcast.title}
                            </span>
                            <span className="font-editorial-sans mt-2.5 block text-[11px] font-medium uppercase leading-none tracking-[0.24em] text-white/65">
                              {broadcast.date}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <EditorialCta
                    to="/translyatsii"
                    data-broadcast-all
                    className="editorial-cta--light mt-10 self-end"
                  >
                    все трансляции
                  </EditorialCta>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>
      ) : null}
      <section data-nav-light-start className="hidden bg-white text-neutral-950 home-desktop:block" aria-labelledby="homepage-media-title">
        <PageContainer className="pb-32 pt-24 xl:pb-38 xl:pt-28 2xl:pb-40 2xl:pt-32">
          <div ref={mediaRef} className="mx-auto grid max-w-[1340px] grid-cols-[minmax(190px,0.78fr)_minmax(0,1.08fr)_minmax(0,1fr)_minmax(260px,1.22fr)] items-start gap-x-7 xl:gap-x-9">
            <Link
              to="/media"
              data-sync-group="tile"
              className="home-media-tile group relative flex min-h-[330px] translate-y-22 flex-col justify-between px-7 pb-8 pt-4 text-white xl:min-h-[370px] xl:translate-y-26 xl:px-9 xl:pb-10 xl:pt-5"
            >
              <h2
                id="homepage-media-title"
                className="font-editorial-serif -ml-2 w-max origin-left -translate-y-3 scale-x-[0.96] scale-y-[1.03] text-left text-[clamp(42px,4vw,60px)] xl:-ml-4 font-extralight lowercase leading-[0.9] tracking-[0.025em] text-white/88"
              >
                <MediaSyncText id="label">медиа</MediaSyncText>
              </h2>
              <span
                aria-hidden="true"
                className="font-editorial-sans -mr-3 inline-flex items-center gap-9 self-end xl:-mr-5"
              >
                <span className="translate-x-2 text-[11px] font-medium uppercase leading-none tracking-[0.16em] text-white/70 opacity-0 transition-[opacity,translate] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none">
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
                data-sync-group={index === 0 ? "a" : "b"}
                href={report.url}
                target="_blank"
                rel="noreferrer"
                className={`home-media-report group flex min-w-0 flex-col ${index === 1 ? "translate-y-19 xl:translate-y-25" : ""}`}
              >
                <div className={`relative overflow-hidden ${index === 0 ? "aspect-[1.3/1]" : "aspect-[1.45/1]"}`}>
                  <div data-sync-image-mask>
                    <div data-sync-image-shift>
                      <img
                        src={report.previewImage}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0 group-focus-visible:grayscale-0"
                      />
                    </div>
                  </div>
                  <span data-sync-play className="absolute bottom-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/88 pl-0.5 text-[12px] text-neutral-900" aria-hidden="true">
                    ▶
                  </span>
                </div>
                <h3 className={`font-editorial-serif mt-4 font-normal leading-[1.18] tracking-[-0.01em] text-neutral-900 ${index === 0 ? "text-[21px] xl:text-[23px]" : "text-[19px] xl:text-[21px]"}`}>
                  <MediaSyncText id="title">{report.title}</MediaSyncText>
                </h3>
                <p className="font-editorial-sans mt-3 text-[11px] font-medium uppercase leading-[1.5] tracking-[0.16em] text-neutral-600">
                  <MediaSyncText id="meta">{report.source} · {report.date}</MediaSyncText>
                </p>
              </a>
            ))}

            <div data-sync-group="articles" className="flex min-h-[330px] flex-col pl-7 xl:min-h-[370px] xl:pl-9">
              <div className="flex-1 divide-y divide-black/10">
                {homepageMediaArticles.map((article) => (
                  <a
                    key={article.id}
                    data-sync-row
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="home-media-article group block py-5 first:pt-0 xl:py-6"
                  >
                    <p className="font-condensed-display text-[14px] font-medium leading-[1.15] tracking-[0.055em] text-neutral-800 transition-colors duration-200 group-hover:text-[#64111f] xl:text-[15px]">
                      {article.source}
                    </p>
                    <p className="font-editorial-serif mt-2 line-clamp-2 text-[15px] leading-[1.2] text-neutral-700 xl:text-[16px]">
                      {article.title}
                    </p>
                    <p className="font-editorial-sans mt-3 text-[11px] font-medium uppercase leading-none tracking-[0.16em] text-neutral-500">
                      {article.date}
                    </p>
                  </a>
                ))}
              </div>

              <EditorialCta to="/media" data-sync-all className="mt-6 self-start">
                все публикации
              </EditorialCta>
            </div>
          </div>
        </PageContainer>
      </section>
      <section className="hidden bg-white text-neutral-950 home-desktop:block" aria-labelledby="festival-year-title">
        <PageContainer className="pb-24 pt-16 xl:pb-28 xl:pt-20 2xl:pb-32 2xl:pt-24">
          <div ref={festivalYearRef} className="relative mx-auto max-w-[1340px] pt-10 xl:pt-12">
            <h2 data-year-title id="festival-year-title" className="font-editorial-serif absolute left-5 -top-6 xl:-top-8 z-10 origin-left scale-x-[0.96] scale-y-[1.03] text-[clamp(56px,5.2vw,76px)] font-extralight lowercase leading-[0.88] tracking-[0.025em] text-neutral-950">
              фестиваль<span className="sr-only"> 2026</span>
            </h2>

            <nav
              ref={festivalFigureMotion.ref}
              className="home-year-composition relative grid grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,0.82fr)]"
              aria-label="Разделы фестиваля 2026"
              onMouseLeave={() => {
                setHoveredFestivalNavIndex(null);
                setShouldAnimateFestivalNavIndicator(false);
              }}
            >
              <motion.span
                aria-hidden="true"
                data-year-nav-indicator
                className="pointer-events-none absolute bottom-2 left-0 h-10 bg-black"
                initial={false}
                animate={{
                  x: festivalNavIndicator.x,
                  width: festivalNavIndicator.width,
                  opacity: !festivalYearReady || hoveredFestivalNavIndex === null ? 0 : 1,
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
                  onMouseEnter={(event) => activateFestivalColumn(index, event.currentTarget)}
                  onMouseMove={(event) => activateFestivalColumn(index, event.currentTarget)}
                  onMouseLeave={() => festivalFigureMotion.setColumnHovered(index, false)}
                  className="home-year-column relative z-10 block min-w-0 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#64111f]"
                >
                  {index < 4 ? (
                    <span aria-hidden="true" className="home-year-figure pointer-events-none absolute inset-0" data-digit-index={index}>
                      {index === 0 ? <><span data-year-graphic className="home-year-square" /><span data-year-line="diagonal" className="home-year-diagonal" /></> : null}
                      {index === 2 ? <span data-year-line="vertical" className="home-year-hairline" /> : null}
                      {index === 3 ? <span data-year-graphic className="home-year-square" /> : null}
                      <span data-year-digit className="home-year-digit font-display-serif">{"2026"[index]}</span>
                      {index === 1 || index === 2 ? (
                        <span data-year-graphic className="year-graphic-mask">
                          <span className="home-year-inversion">
                            <span className="year-inversion-counter">
                              <span data-year-digit className="home-year-digit font-display-serif">{"2026"[index]}</span>
                            </span>
                          </span>
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    <span aria-hidden="true" className="home-year-digit font-display-serif pointer-events-none">
                      <span data-year-dot className="home-year-team-dot inline-block h-[44px] w-[44px] rounded-full bg-black align-baseline" />
                    </span>
                  )}
                  <span data-year-nav-label style={{ "--year-nav-index": index } as CSSProperties} className={`font-editorial-sans absolute inset-x-0 bottom-2 flex h-10 items-center justify-center whitespace-nowrap text-[10px] font-medium uppercase leading-none tracking-[0.2em] transition-colors duration-200 xl:text-[12px] ${festivalYearReady && hoveredFestivalNavIndex === index ? "!text-white" : "text-neutral-900"}`}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </PageContainer>
      </section>
      <CookieNotice />
    </>
  );
}
