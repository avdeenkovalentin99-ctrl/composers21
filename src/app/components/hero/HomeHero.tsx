import { type TouchEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import festivalMark from "../../../../FestLogoNowords.svg";
import festivalBottomWord from "/festlogo-bottomword.svg";
import festivalTopWord from "/festlogo-topword.svg";
import { orderedConcerts } from "../../data/site";
import { PageContainer } from "../../layout/PageContainer";
import { HeroConcertSelector } from "./HeroConcertSelector";
import { HeroDesktopLoadingOverlay, useHeroLoadingTransition } from "./HeroLoadingTransition";

const pelecisPosterHint = "peletsis";
const refinedPosterHints = ["peletsis", "de-la-nuite"] as const;
const posterIntervalMs = 6200;
const swipeThreshold = 48;
const coolColorGrainDataUri =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.8' numOctaves='2' seed='17' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.17 0 0 0 0.07 0 0.22 0 0 0.1 0 0 0.24 0 0.12 0 0 0 0.34 0'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)'/%3E%3C/svg%3E\")";
const warmColorGrainDataUri =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.65' numOctaves='2' seed='23' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.24 0 0 0 0.14 0 0.18 0 0 0.1 0 0 0.17 0 0.09 0 0 0 0.33 0'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)'/%3E%3C/svg%3E\")";

const posterVariants = {
  center: {
    opacity: 1,
    x: 0,
  },
  enter: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? 32 : -32,
  }),
  exit: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? -24 : 24,
  }),
};

const specialGuestPoster = {
  id: "special-guest-boris-berezovsky",
  kind: "guest" as const,
  date: "",
  title: "\u0411\u043e\u0440\u0438\u0441 \u0411\u0435\u0440\u0435\u0437\u043e\u0432\u0441\u043a\u0438\u0439",
  description: "\u0441\u043f\u0435\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u0439 \u0433\u043e\u0441\u0442\u044c",
  image: "/assets/external/heroafisha/BerezovkiBedited.webp",
  link: undefined,
};

const initialHeroPosterId = "2026-05-27-desyatnikov-love-and-life";

type HeroGuestPoster = typeof specialGuestPoster;
type HeroConcertPoster = (typeof orderedConcerts)[number] & { kind: "concert" };
type HeroPoster = HeroGuestPoster | HeroConcertPoster;

function wrapIndex(index: number, length: number) {
  return (index + length) % length;
}

function normalizePosterText(value: string) {
  return value
    .toLowerCase()
    .replace(/["'`«»().,!?;:/\\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isPosterDescriptionDuplicate(title: string, description: string) {
  const normalizedTitle = normalizePosterText(title);
  const normalizedDescription = normalizePosterText(description);

  if (normalizedTitle === "" || normalizedDescription === "") {
    return false;
  }

  return (
    normalizedTitle === normalizedDescription ||
    normalizedTitle.includes(normalizedDescription) ||
    normalizedDescription.includes(normalizedTitle)
  );
}

function HeroLogoMark({ tone, className = "" }: { tone: "dark" | "light"; className?: string }) {
  const filter = tone === "light" ? "brightness(0) invert(1)" : undefined;

  return (
    <div className={`w-full max-w-[560px] ${className}`}>
      <img
        src={festivalMark}
        alt=""
        aria-hidden="true"
        className="h-auto w-full object-contain"
        style={{ filter }}
      />
    </div>
  );
}

function HeroLogoLockup({ tone, className = "" }: { tone: "dark" | "light"; className?: string }) {
  const filter = tone === "light" ? "brightness(0) invert(1)" : undefined;

  return (
    <div className={`relative w-full max-w-[560px] ${className}`}>
      <img
        src={festivalMark}
        alt=""
        aria-hidden="true"
        className="h-auto w-full object-contain"
        style={{ filter }}
      />

      <div className="absolute left-[2.9%] top-[7.2%] z-10 w-[94.1%] overflow-hidden">
        <img
          src={festivalTopWord}
          alt=""
          aria-hidden="true"
          className="h-auto w-full"
          style={{ filter }}
        />
      </div>

      <div className="absolute left-[74.1%] bottom-[14.1%] z-10 w-[22.2%] overflow-hidden">
        <img
          src={festivalBottomWord}
          alt=""
          aria-hidden="true"
          className="h-auto w-full"
          style={{ filter }}
        />
      </div>
    </div>
  );
}

export function HomeHero() {
  const heroPosters = useMemo<HeroPoster[]>(
    () => [specialGuestPoster, ...orderedConcerts.map((concert) => ({ ...concert, kind: "concert" as const }))],
    [],
  );

  const defaultActiveIndex = useMemo(() => {
    const foundIndex = heroPosters.findIndex((poster) => poster.id === initialHeroPosterId);
    return foundIndex === -1 ? 0 : foundIndex;
  }, [heroPosters]);

  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const [direction, setDirection] = useState(1);
  const rotationTimerRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const autoRotationOrder = useMemo(() => {
    const desiredOrderIds = [
      "2026-05-27-desyatnikov-love-and-life",
      "special-guest-boris-berezovsky",
      "2026-05-20-opensoundorchestra",
      "2026-05-10-peletcis-24-kaprisa",
      "2026-05-28-brezel-melodiya",
      "2026-05-15-solisty-nizhnego-novgoroda",
    ] as const;

    const indexById = new Map(heroPosters.map((poster, index) => [poster.id, index] as const));
    const ordered = desiredOrderIds
      .map((id) => indexById.get(id))
      .filter((index): index is number => index !== undefined);
    const remaining = heroPosters
      .map((_, index) => index)
      .filter((index) => !ordered.includes(index));

    return [...ordered, ...remaining];
  }, [heroPosters]);

  if (heroPosters.length === 0) {
    return null;
  }

  const activePoster = heroPosters[activeIndex];
  const {
    introMode,
    logoRevealProps,
    posterRevealProps,
    selectorRevealProps,
    showDesktopOverlay,
    startDesktopCurtain,
    textRevealProps,
  } = useHeroLoadingTransition(activePoster.image);

  const isGuestPoster = activePoster.kind === "guest";
  const isPelecisPoster = activePoster.link?.includes(pelecisPosterHint) ?? false;
  const isDeLaNuitePoster = activePoster.link?.includes("de-la-nuite") ?? false;
  const isVIschezayushemGorodePoster =
    activePoster.link?.includes("kamernye-ansambli-zubets-tursunov-akhunov") ?? false;
  const isOpenSoundOrchestraPoster =
    activePoster.link?.includes("opensoundorchestra-vremena-goda-ne-vivaldi") ?? false;
  const isForelnyyPoster =
    activePoster.link?.includes("forelnyy-kontsert-rust-pozyumskiy") ?? false;
  const isOpenSoundQuartetPoster =
    activePoster.link?.includes("opensoundquartet-muzyka-sovremennykh-kompozitorov-dlya-kvarteta") ?? false;
  const isGromcheSlovaPoster = activePoster.link?.includes("karmanov-konneson-leng-") ?? false;
  const isDesyatnikovPoster = activePoster.link?.includes("leonid-desyatnikov-lyubov-i-zhizn-poeta") ?? false;
  const isNizhnySoloistsPoster =
    activePoster.link?.includes("kamernyy-orkestr-solisty-nizhnego-novgoroda-tsvetushchiy-zhasmin-") ?? false;
  const isBrezelPoster = activePoster.link?.includes("brezel-melodiya") ?? false;
  const isConcertPoster = activePoster.kind === "concert";
  const isFourthOrFifthConcertPoster = activePoster.kind === "concert";
  const isRefinedPoster =
    activePoster.link !== undefined &&
    refinedPosterHints.some((hint) => activePoster.link?.includes(hint));
  const isPaintingPoster = isRefinedPoster;
  const displayTitle = isNizhnySoloistsPoster
    ? activePoster.title.replace(/^\u041a\u0430\u043c\u0435\u0440\u043d\u044b\u0439 \u043e\u0440\u043a\u0435\u0441\u0442\u0440\s*/i, "")
    : activePoster.title;
  const nizhnySoloistsTitleLine1 = isNizhnySoloistsPoster ? "Солисты Нижнего Новгорода" : "";
  const nizhnySoloistsTitleLine2 = isNizhnySoloistsPoster ? "«Цветущий жасмин»" : "";
  const deLaNuiteTitleLine1 = isDeLaNuitePoster ? "Ансамбль «IL THELEME»" : "";
  const deLaNuiteTitleLine2 = isDeLaNuitePoster ? "«De la Nuite» («Ночью»)" : "";
  const vischezayushemGorodeTitleLine1 = isVIschezayushemGorodePoster ? "" : "";
  const vischezayushemGorodeTitleLine2 = isVIschezayushemGorodePoster ? "" : "";
  const displayDescription = activePoster.description;
  const nizhnyComposerParts = isNizhnySoloistsPoster
    ? displayDescription.split(" · ").map((part) => part.trim()).filter(Boolean)
    : [];
  const nizhnyComposerLine1 =
    nizhnyComposerParts.length > 0
      ? nizhnyComposerParts.slice(0, Math.ceil(nizhnyComposerParts.length / 2)).join(" · ")
      : "";
  const nizhnyComposerLine2 =
    nizhnyComposerParts.length > 0
      ? nizhnyComposerParts.slice(Math.ceil(nizhnyComposerParts.length / 2)).join(" · ")
      : "";
  const openSoundOrchestraTitleLine1 = isOpenSoundOrchestraPoster ? "OpensoundOrchestra" : "";
  const openSoundOrchestraTitleLine2 = isOpenSoundOrchestraPoster
    ? activePoster.title.replace(/^OpensoundOrchestra\.?\s*/i, "").trim()
    : "";
  const gromcheSlovaTitleLine1 = isGromcheSlovaPoster ? "«Громче слова»" : "";
  const gromcheSlovaTitleLine2 = isGromcheSlovaPoster ? "Заключительный концерт фестиваля" : "";
  const desyatnikovTitleLine1 = isDesyatnikovPoster ? "Леонид Десятников" : "";
  const desyatnikovTitleLine2 = isDesyatnikovPoster ? "«Любовь и жизнь поэта»" : "";
  const brezelTitleLine1 = isBrezelPoster ? "Brezel ensemble и хоровой ансамбль «Мелодия»" : "";
  const brezelTitleLine2 = isBrezelPoster ? "Новая сакральность" : "";
  const pelecisDescriptionLine1 = isPelecisPoster
    ? "\u041f\u043e\u0441\u0432\u044f\u0449\u0435\u043d\u0438\u0435 \u041c\u0430\u043a\u0441\u0438\u043c\u0443 \u041d\u043e\u0432\u0438\u043a\u043e\u0432\u0443"
    : "";
  const pelecisDescriptionLine2 = isPelecisPoster
    ? displayDescription
        .replace(/^(\u041f\u043e\u0441\u0432\u044f\u0449\u0435\u043d\u0438\u0435\s+)\u041c\.\s*\u041d\u043e\u0432\u0438\u043a\u043e\u0432\u0443\.\s*/i, "")
        .replace(
          /^(\u041f\u043e\u0441\u0432\u044f\u0449\u0435\u043d\u0438\u0435\s+)\u041c\u0430\u043a\u0441\u0438\u043c\u0443\s+\u041d\u043e\u0432\u0438\u043a\u043e\u0432\u0443\.\s*/i,
          "",
        )
        .replace(/\.\s*$/u, "")
        .trim()
    : "";
  const shouldShowDescription = !isPosterDescriptionDuplicate(activePoster.title, displayDescription);

  const resetRotationTimer = useCallback(() => {
    if (rotationTimerRef.current !== null) {
      window.clearInterval(rotationTimerRef.current);
    }

    rotationTimerRef.current = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((current) => {
        const currentOrderIndex = autoRotationOrder.indexOf(current);

        if (currentOrderIndex === -1 || autoRotationOrder.length === 0) {
          return wrapIndex(current + 1, heroPosters.length);
        }

        const nextOrderIndex = wrapIndex(currentOrderIndex + 1, autoRotationOrder.length);
        return autoRotationOrder[nextOrderIndex] ?? current;
      });
    }, posterIntervalMs);
  }, [autoRotationOrder, heroPosters.length]);

  useEffect(() => {
    resetRotationTimer();

    return () => {
      if (rotationTimerRef.current !== null) {
        window.clearInterval(rotationTimerRef.current);
      }
    };
  }, [resetRotationTimer]);

  const handlePosterSelect = useCallback(
    (index: number) => {
      if (index === activeIndex) {
        return;
      }

      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
      resetRotationTimer();
    },
    [activeIndex, resetRotationTimer],
  );

  const handlePrevious = useCallback(() => {
    setDirection(-1);
    setActiveIndex((current) => wrapIndex(current - 1, heroPosters.length));
    resetRotationTimer();
  }, [heroPosters.length, resetRotationTimer]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((current) => wrapIndex(current + 1, heroPosters.length));
    resetRotationTimer();
  }, [heroPosters.length, resetRotationTimer]);

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const touchStartX = touchStartXRef.current;
    const touchEndX = event.changedTouches[0]?.clientX ?? null;

    touchStartXRef.current = null;

    if (touchStartX === null || touchEndX === null) {
      return;
    }

    const deltaX = touchEndX - touchStartX;

    if (Math.abs(deltaX) < swipeThreshold) {
      return;
    }

    if (deltaX < 0) {
      handleNext();
      return;
    }

    handlePrevious();
  };

  const isDesktopLoadingTransition = introMode === "desktop";

  return (
    <section className="relative overflow-hidden bg-white pt-24 sm:pt-28">
      <div className="relative">
        <HeroDesktopLoadingOverlay
          show={showDesktopOverlay}
          startCurtain={startDesktopCurtain}
          logo={<HeroLogoMark tone="light" />}
        />

        <PageContainer className="relative z-10 py-6 sm:py-10 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.95fr)] lg:gap-14">
            <div className="flex flex-col lg:min-h-[660px]">
              <div className="pointer-events-none relative flex items-start justify-start overflow-hidden -mt-10 lg:-mt-12 lg:flex-1">
                {isDesktopLoadingTransition ? (
                  <motion.div {...logoRevealProps} className="w-full max-w-[560px]">
                    <HeroLogoLockup tone="dark" />
                  </motion.div>
                ) : (
                  <div className="relative w-full max-w-[560px]">
                    <motion.img
                      src={festivalMark}
                      alt=""
                      aria-hidden="true"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-auto w-full object-contain"
                    />

                    <motion.div
                      initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
                      animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
                      transition={{ duration: 0.72, delay: 0.22, ease: "easeOut" }}
                      className="absolute left-[2.9%] top-[7.2%] z-10 w-[94.1%] overflow-hidden"
                    >
                      <img
                        src={festivalTopWord}
                        alt=""
                        aria-hidden="true"
                        className="h-auto w-full"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, clipPath: "inset(0 0 0 100%)" }}
                      animate={{ opacity: 1, clipPath: "inset(0 0 0 0%)" }}
                      transition={{ duration: 0.9, delay: 1.02, ease: "easeOut" }}
                      className="absolute left-[74.1%] bottom-[14.1%] z-10 w-[22.2%] overflow-hidden"
                    >
                      <img
                        src={festivalBottomWord}
                        alt=""
                        aria-hidden="true"
                        className="h-auto w-full"
                      />
                    </motion.div>
                  </div>
                )}
              </div>

              {isDesktopLoadingTransition ? (
                <motion.div
                  {...textRevealProps}
                  className="mx-auto w-full max-w-[560px] pt-5 text-center sm:pt-6"
                >
                  <p className="font-editorial-sans text-[14px] font-normal uppercase tracking-[0.24em] text-[#111111] sm:text-[15px]">
                    {"\u041c\u0443\u0437\u044b\u043a\u0430\u043b\u044c\u043d\u044b\u0439 \u0444\u0435\u0441\u0442\u0438\u0432\u0430\u043b\u044c"}
                  </p>
                  <p className="font-editorial-sans mt-2 text-[12px] font-light uppercase tracking-[0.15em] text-[#4b5563] sm:mt-[10px] sm:text-[13px]">
                    {"\u0413\u0430\u043b\u0435\u0440\u0435\u044f \u041d\u0438\u043a\u043e \u00b7 \u041c\u043e\u0441\u043a\u0432\u0430 \u00b7 10-31 \u043c\u0430\u044f"}
                  </p>
                </motion.div>
              ) : (
                <div className="mx-auto w-full max-w-[560px] pt-5 text-center sm:pt-6">
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.85, delay: 1.22, ease: "easeOut" }}
                    className="font-editorial-sans text-[14px] font-normal uppercase tracking-[0.24em] text-[#111111] sm:text-[15px]"
                  >
                    {"\u041c\u0443\u0437\u044b\u043a\u0430\u043b\u044c\u043d\u044b\u0439 \u0444\u0435\u0441\u0442\u0438\u0432\u0430\u043b\u044c"}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 0.9, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.42, ease: "easeOut" }}
                    className="font-editorial-sans mt-2 text-[12px] font-light uppercase tracking-[0.15em] text-[#4b5563] sm:mt-[10px] sm:text-[13px]"
                  >
                    {"\u0413\u0430\u043b\u0435\u0440\u0435\u044f \u041d\u0438\u043a\u043e \u00b7 \u041c\u043e\u0441\u043a\u0432\u0430 \u00b7 10-31 \u043c\u0430\u044f"}
                  </motion.p>
                </div>
              )}
            </div>

            <div className="relative flex flex-col overflow-hidden lg:min-h-[660px] lg:overflow-visible">
              <motion.div {...posterRevealProps} className="lg:flex-1">
                <AnimatePresence initial={false} mode="wait" custom={direction}>
                <motion.article
                  key={activePoster.id}
                  custom={direction}
                  variants={posterVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className={[
                    "relative mx-auto aspect-[6/5] w-full max-w-[360px] sm:max-w-[420px] lg:mx-0 lg:h-full lg:min-h-[600px] lg:max-w-none lg:flex-1 lg:aspect-auto",
                    isOpenSoundQuartetPoster ? "bg-white" : "bg-black",
                    isConcertPoster ? "overflow-hidden lg:overflow-visible" : "overflow-hidden",
                  ].join(" ")}
                >
                <img
                  src={activePoster.image}
                  alt={activePoster.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    opacity: isGuestPoster ? 1 : 0.96,
                    objectPosition: isGuestPoster
                      ? "50% 17%"
                      : isOpenSoundQuartetPoster
                        ? "50% 42%"
                        : "50% 50%",
                    transform: isOpenSoundQuartetPoster ? "scale(0.985)" : undefined,
                    transformOrigin: isOpenSoundQuartetPoster ? "center center" : undefined,
                    filter: isGuestPoster
                      ? "none"
                      : isGromcheSlovaPoster
                        ? "none"
                      : isVIschezayushemGorodePoster
                        ? "none"
                      : isPaintingPoster
                        ? "none"
                      : isRefinedPoster
                        ? "grayscale(0.95) saturate(1.05) brightness(1.1) contrast(1.06)"
                        : "grayscale(1)",
                  }}
                />

                {isGuestPoster ? null : isRefinedPoster ? (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(241,229,212,0.05) 0%, rgba(236,219,199,0.08) 52%, rgba(227,210,193,0.06) 100%)",
                        mixBlendMode: "soft-light",
                      }}
                    />
                    {isPelecisPoster ? (
                      <>
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: coolColorGrainDataUri,
                            backgroundSize: "128px 128px",
                            opacity: 0.038,
                            mixBlendMode: "soft-light",
                          }}
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: warmColorGrainDataUri,
                            backgroundSize: "128px 128px",
                            opacity: 0.055,
                            mixBlendMode: "soft-light",
                          }}
                        />
                      </>
                    ) : null}
                  </>
                ) : null}

                <div
                  className="relative flex h-full flex-col justify-between p-4 sm:p-8"
                  style={{ color: isRefinedPoster || isGuestPoster ? "#edeae4" : "#ffffff" }}
                >
                  <div className="flex items-start justify-end">
                    {isConcertPoster ? (
                      <span className="relative mr-0 inline-flex items-center px-2 py-0">
                        <span aria-hidden="true" className="absolute inset-y-0 -left-2 -right-12 bg-white" />
                        <span className="font-editorial-sans relative text-[0.64rem] font-light uppercase tracking-[0.24em] text-[#1a1a1a] sm:text-[0.72rem]">
                          {activePoster.date}
                        </span>
                      </span>
                    ) : (
                      <span
                        className="font-editorial-sans text-[0.64rem] font-light uppercase tracking-[0.24em] sm:text-[0.72rem]"
                        style={{
                          color: isRefinedPoster || isGuestPoster
                            ? "rgba(237, 234, 228, 0.78)"
                            : "rgba(255, 255, 255, 0.72)",
                        }}
                      >
                        {activePoster.date}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 text-right sm:space-y-5">
                    <h2
                      className={[
                        "ml-auto break-normal font-light leading-tight tracking-[-0.02em]",
                        isConcertPoster
                          ? "overflow-hidden lg:overflow-visible"
                          : "overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]",
                        isFourthOrFifthConcertPoster ? "font-editorial-serif" : "",
                        isFourthOrFifthConcertPoster ? "relative lg:translate-x-[8px]" : "",
                        isGuestPoster
                          ? "max-w-[250px] text-[0.86rem] sm:max-w-[320px] sm:text-[1.28rem] lg:max-w-[390px] lg:text-[2.1rem]"
                          : "max-w-[250px] text-[0.88rem] sm:max-w-[360px] sm:text-[1.16rem] lg:max-w-[520px] lg:text-[1.72rem]",
                      ].join(" ")}
                    >
                      {isOpenSoundOrchestraPoster && openSoundOrchestraTitleLine1 !== "" ? (
                        <span className="inline-flex flex-col items-end gap-[2px]">
                          <span className="relative inline-flex items-center px-4 py-[1px] text-[#f4f4f4]">
                            <span aria-hidden="true" className="absolute inset-y-0 -left-3 -right-10 bg-black" />
                            <span className="relative">{openSoundOrchestraTitleLine1}</span>
                          </span>
                          <span className="relative inline-flex items-center px-4 py-0 text-[#f4f4f4]">
                            <span aria-hidden="true" className="absolute inset-y-0 -left-3 -right-8 bg-black" />
                            <span className="relative">{openSoundOrchestraTitleLine2}</span>
                          </span>
                        </span>
                      ) : isNizhnySoloistsPoster && nizhnySoloistsTitleLine1 !== "" ? (
                        <span className="inline-flex flex-col items-end gap-[2px] text-[0.9em] sm:text-[0.92em]">
                          <span className="relative mr-0 inline-flex items-center px-4 py-[1px] text-[#f4f4f4]">
                            <span aria-hidden="true" className="absolute inset-y-0 -left-4 -right-16 bg-black" />
                            <span className="relative">{nizhnySoloistsTitleLine1}</span>
                          </span>
                          <span className="relative mr-0 inline-flex items-center px-4 py-0 text-[#f4f4f4]">
                            <span aria-hidden="true" className="absolute inset-y-0 -left-3 -right-8 bg-black" />
                            <span className="relative">{nizhnySoloistsTitleLine2}</span>
                          </span>
                        </span>
                      ) : isDeLaNuitePoster && deLaNuiteTitleLine1 !== "" ? (
                        isConcertPoster ? (
                          <span className="inline-flex flex-col items-end gap-[2px] text-[0.9em] sm:text-[0.92em]">
                            <span className="relative mr-0 inline-flex items-center px-4 py-[1px] text-[#f4f4f4]">
                              <span aria-hidden="true" className="absolute inset-y-0 -left-3 -right-14 bg-black" />
                              <span className="relative">{deLaNuiteTitleLine1}</span>
                            </span>
                            <span className="relative mr-0 inline-flex items-center px-4 py-0 text-[#f4f4f4]">
                              <span aria-hidden="true" className="absolute inset-y-0 -left-3 -right-7 bg-black" />
                              <span className="relative">{deLaNuiteTitleLine2}</span>
                            </span>
                          </span>
                        ) : (
                          <>
                            {deLaNuiteTitleLine1}
                            <br />
                            {deLaNuiteTitleLine2}
                          </>
                        )
                      ) : isVIschezayushemGorodePoster && vischezayushemGorodeTitleLine1 !== "" ? (
                        isConcertPoster ? (
                          <span className="inline-flex flex-col items-end gap-[2px] text-[0.9em] sm:text-[0.92em]">
                            <span className="relative mr-0 inline-flex items-center px-4 py-[1px] text-[#f4f4f4]">
                              <span aria-hidden="true" className="absolute inset-y-0 -left-3 -right-14 bg-black" />
                              <span className="relative">{vischezayushemGorodeTitleLine1}</span>
                            </span>
                            <span className="relative mr-0 inline-flex items-center px-4 py-0 text-[#f4f4f4]">
                              <span aria-hidden="true" className="absolute inset-y-0 -left-3 -right-7 bg-black" />
                              <span className="relative">{vischezayushemGorodeTitleLine2}</span>
                            </span>
                          </span>
                        ) : (
                          <>
                            {vischezayushemGorodeTitleLine1}
                            <br />
                            {vischezayushemGorodeTitleLine2}
                          </>
                        )
                      ) : isGromcheSlovaPoster && gromcheSlovaTitleLine1 !== "" ? (
                        <span className="inline-flex flex-col items-end gap-[2px]">
                          <span className="relative inline-flex items-center px-4 py-[1px] text-[#f4f4f4]">
                            <span aria-hidden="true" className="absolute inset-y-0 -left-3 -right-10 bg-black" />
                            <span className="relative">{gromcheSlovaTitleLine1}</span>
                          </span>
                          <span className="relative inline-flex items-center px-4 py-0 text-[#f4f4f4]">
                            <span aria-hidden="true" className="absolute inset-y-0 -left-3 -right-8 bg-black" />
                            <span className="relative">{gromcheSlovaTitleLine2}</span>
                          </span>
                        </span>
                      ) : isDesyatnikovPoster && desyatnikovTitleLine1 !== "" ? (
                        <span className="inline-flex flex-col items-end gap-[2px]">
                          <span className="relative inline-flex items-center px-4 py-[1px] text-[#f4f4f4]">
                            <span aria-hidden="true" className="absolute inset-y-0 -left-3 -right-10 bg-black" />
                            <span className="relative">{desyatnikovTitleLine1}</span>
                          </span>
                          <span className="relative inline-flex items-center px-4 py-0 text-[#f4f4f4]">
                            <span aria-hidden="true" className="absolute inset-y-0 -left-3 -right-8 bg-black" />
                            <span className="relative">{desyatnikovTitleLine2}</span>
                          </span>
                        </span>
                      ) : isBrezelPoster && brezelTitleLine1 !== "" ? (
                        <span className="inline-flex flex-col items-end gap-[2px]">
                          <span className="relative inline-flex items-center px-4 py-[1px] text-[#f4f4f4]">
                            <span aria-hidden="true" className="absolute bottom-[2px] top-[2px] -left-3 -right-10 bg-black" />
                            <span className="relative">{brezelTitleLine1}</span>
                          </span>
                          <span className="relative inline-flex items-center px-4 py-0 text-[#f4f4f4]">
                            <span aria-hidden="true" className="absolute bottom-[2px] top-[2px] -left-3 -right-8 bg-black" />
                            <span className="relative">{brezelTitleLine2}</span>
                          </span>
                        </span>
                      ) : isConcertPoster ? (
                        <span className="relative mr-0 inline-flex items-center px-4 py-[1px] text-[#f4f4f4]">
                          <span aria-hidden="true" className="absolute inset-y-0 -left-3 -right-10 bg-black" />
                          <span className="relative">{displayTitle}</span>
                        </span>
                      ) : (
                        displayTitle
                      )}
                    </h2>
                    {shouldShowDescription ? (
                      <p
                        className={[
                          "font-editorial-sans ml-auto text-[0.42rem] leading-[0.72rem] tracking-[0.08em]",
                          isFourthOrFifthConcertPoster ? "relative lg:-translate-x-[8px]" : "",
                          isPelecisPoster
                            ? "max-w-[300px] sm:max-w-[400px] lg:max-w-[560px]"
                            : isForelnyyPoster
                            ? "max-w-[280px] sm:max-w-[560px] lg:max-w-[760px] sm:whitespace-nowrap"
                            : isNizhnySoloistsPoster
                            ? "max-w-[230px] sm:max-w-[290px] lg:max-w-[350px]"
                            : isDeLaNuitePoster
                            ? "max-w-[300px] sm:max-w-[420px] lg:max-w-[560px] lg:whitespace-nowrap"
                            : isOpenSoundQuartetPoster
                            ? "max-w-[400px] sm:max-w-[560px] lg:max-w-[760px] lg:whitespace-nowrap"
                            : isGuestPoster
                            ? "max-w-[230px] sm:max-w-[270px] lg:max-w-[320px]"
                            : "max-w-[230px] sm:max-w-[280px] lg:max-w-[360px]",
                          "sm:text-[0.68rem] sm:leading-[1.02rem] lg:text-[0.86rem] lg:leading-6",
                        ].join(" ")}
                        style={
                          isConcertPoster
                            ? {
                                color: "#1a1a1a",
                                fontVariantCaps: isFourthOrFifthConcertPoster ? "all-small-caps" : undefined,
                              }
                            : {
                                color: isRefinedPoster || isGuestPoster
                                  ? "rgba(237, 234, 228, 0.86)"
                                  : "rgba(255, 255, 255, 0.82)",
                              }
                        }
                      >
                        {isPelecisPoster && pelecisDescriptionLine1 !== "" && pelecisDescriptionLine2 !== "" ? (
                          <span className="inline-flex flex-col items-end gap-[1px]">
                            <span className="relative inline-flex items-center px-2 py-0">
                              <span aria-hidden="true" className="absolute bottom-[2px] top-[2px] -left-2 -right-3 bg-white" />
                              <span className="relative">{pelecisDescriptionLine1}</span>
                            </span>
                            <span className="relative inline-flex items-center px-2 py-0">
                              <span aria-hidden="true" className="absolute bottom-[2px] top-[2px] -left-2 -right-3 bg-white" />
                              <span className="relative">{pelecisDescriptionLine2}</span>
                            </span>
                          </span>
                        ) : isNizhnySoloistsPoster ? (
                          <>
                            <span className="relative mr-0 inline-flex items-center px-2 py-0 whitespace-nowrap">
                              <span aria-hidden="true" className="absolute bottom-[2px] top-[2px] -left-2 -right-3 bg-white" />
                              <span className="relative">{nizhnyComposerLine1}</span>
                            </span>
                            {nizhnyComposerLine2 !== "" ? (
                              <>
                                <br />
                                <span className="relative mt-[1px] mr-0 inline-flex items-center px-2 py-0 whitespace-nowrap">
                                  <span aria-hidden="true" className="absolute bottom-[2px] top-[2px] -left-2 -right-12 bg-white" />
                                  <span className="relative">{nizhnyComposerLine2}</span>
                                </span>
                              </>
                            ) : null}
                          </>
                        ) : isConcertPoster ? (
                          <span className="relative mr-0 inline-flex items-center px-2 py-0">
                            <span aria-hidden="true" className="absolute bottom-[2px] top-[2px] -left-2 -right-5 bg-white" />
                            <span className="relative">{displayDescription}</span>
                          </span>
                        ) : (
                          displayDescription
                        )}
                      </p>
                    ) : null}
                  </div>
                </div>
                </motion.article>
                </AnimatePresence>
              </motion.div>

              <motion.div {...selectorRevealProps}>
                <div className="mt-5 flex min-h-12 items-center justify-between gap-2 sm:mt-6 sm:gap-6">
                  <div className="min-h-12 min-w-0">
                    <HeroConcertSelector
                      activePosterIndex={activeIndex}
                      totalConcerts={orderedConcerts.length}
                      onSelectPosterIndex={handlePosterSelect}
                    />
                  </div>

                  <Link
                    to="/afisha"
                    className="font-editorial-sans inline-flex shrink-0 items-center justify-end whitespace-nowrap leading-none text-[9px] uppercase tracking-[0.12em] text-black/62 transition-colors duration-300 hover:text-black sm:text-right sm:text-[11px] sm:tracking-[0.22em]"
                  >
                    <span>{"\u041f\u0420\u041e\u0413\u0420\u0410\u041c\u041C\u0410 \u0424\u0415\u0421\u0422\u0418\u0412\u0410\u041B\u042F \u2192"}</span>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="pb-20 pt-16 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-20">
            <div aria-hidden="true" className="flex w-full items-center gap-[10px]">
              <div className="h-px flex-1 bg-black" />
              <div className="flex items-center gap-[3px]">
                <div className="h-3 w-px bg-black" />
                <div className="h-3 w-px bg-black" />
                <div className="h-3 w-px bg-black" />
              </div>
              <div className="h-px flex-1 bg-black" />
            </div>
          </div>
        </PageContainer>
      </div>
    </section>
  );
}
