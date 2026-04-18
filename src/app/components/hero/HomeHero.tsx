import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import festivalMark from "../../../../FestLogoNowords.svg";
import festivalBottomWord from "/festlogo-bottomword.svg";
import festivalTopWord from "/festlogo-topword.svg";
import { featuredConcerts } from "../../data/site";
import { PageContainer } from "../../layout/PageContainer";

const posterIntervalMs = 6200;
const pelecisPosterHint = "peletsis";
const refinedPosterHints = ["peletsis", "de-la-nuite"] as const;
const coolColorGrainDataUri =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.8' numOctaves='2' seed='17' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.17 0 0 0 0.07 0 0.22 0 0 0.1 0 0 0.24 0 0.12 0 0 0 0.34 0'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)'/%3E%3C/svg%3E\")";
const warmColorGrainDataUri =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.65' numOctaves='2' seed='23' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.24 0 0 0 0.14 0 0.18 0 0 0.1 0 0 0.17 0 0.09 0 0 0 0.33 0'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function HomeHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const rotationTimerRef = useRef<number | null>(null);
  const heroPosters = [
    {
      ...featuredConcerts[0],
      date: "",
      image: "/assets/external/BerezovkiBedited.png",
      title: "Борис Березовский",
      description: "специальный гость фестиваля",
      link: undefined,
    },
    ...featuredConcerts,
  ];
  const activeConcert = heroPosters[activeIndex];
  const isGuestPoster = activeIndex === 0;
  const isPelecisPoster = activeConcert.link?.includes(pelecisPosterHint) ?? false;
  const isRefinedPoster =
    activeConcert.link !== undefined &&
    refinedPosterHints.some((hint) => activeConcert.link?.includes(hint));

  const resetRotationTimer = useCallback(() => {
    if (rotationTimerRef.current !== null) {
      window.clearInterval(rotationTimerRef.current);
    }

    rotationTimerRef.current = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroPosters.length);
    }, posterIntervalMs);
  }, [heroPosters.length]);

  useEffect(() => {
    resetRotationTimer();

    return () => {
      if (rotationTimerRef.current !== null) {
        window.clearInterval(rotationTimerRef.current);
      }
    };
  }, [resetRotationTimer]);

  const handlePosterSelect = (index: number) => {
    setActiveIndex(index);
    resetRotationTimer();
  };

  return (
    <section className="relative overflow-hidden bg-white pt-24 sm:pt-28">
      <PageContainer className="relative py-6 sm:py-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.95fr)] lg:gap-14">
          <div className="flex min-h-[640px] flex-col lg:min-h-[660px]">
            <div className="pointer-events-none relative flex flex-1 items-start justify-start overflow-hidden -mt-10 lg:-mt-12">
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
            </div>

            <div className="mx-auto w-full max-w-[560px] pt-5 text-center sm:pt-6">
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 1.22, ease: "easeOut" }}
                className="font-editorial-sans text-[14px] font-normal uppercase tracking-[0.24em] text-[#111111] sm:text-[15px]"
              >
                МУЗЫКАЛЬНЫЙ ФЕСТИВАЛЬ
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 0.9, y: 0 }}
                transition={{ duration: 0.8, delay: 1.42, ease: "easeOut" }}
                className="font-editorial-sans mt-2 text-[12px] font-light uppercase tracking-[0.15em] text-[#4b5563] sm:mt-[10px] sm:text-[13px]"
              >
                ГАЛЕРЕЯ НИКО · МОСКВА · 10-31 МАЯ
              </motion.p>
            </div>
          </div>

          <div className="relative flex min-h-[640px] flex-col lg:min-h-[660px]">
            <AnimatePresence mode="wait">
              <motion.article
                key={activeConcert.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className={[
                  "relative min-h-[580px] flex-1 overflow-hidden lg:min-h-[600px]",
                  isGuestPoster ? "border border-transparent bg-transparent" : "border border-black/10 bg-black",
                ].join(" ")}
              >
                <img
                  src={activeConcert.image}
                  alt={activeConcert.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    opacity: isGuestPoster ? 1 : 0.95,
                    objectPosition: isGuestPoster ? "50% 17%" : "50% 50%",
                    filter: isGuestPoster
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
                    <div className="absolute inset-0 bg-black/40" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-black/52" />
                )}

                <div
                  className="relative flex h-full flex-col justify-between p-6 sm:p-8"
                  style={{ color: isRefinedPoster ? "#edeae4" : "#ffffff" }}
                >
                  <div className="flex items-start justify-end">
                    <span
                      className="font-editorial-sans text-[0.64rem] font-light uppercase tracking-[0.18em]"
                      style={{
                        color: isRefinedPoster
                          ? "rgba(237, 234, 228, 0.7)"
                          : "rgba(255, 255, 255, 0.62)",
                      }}
                    >
                      {isGuestPoster ? "" : String(activeIndex + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div
                    className="space-y-5"
                    style={
                      isGuestPoster
                        ? { paddingRight: "0px", marginBottom: "0px", marginRight: "-10px" }
                        : undefined
                    }
                  >
                    <div className={isGuestPoster ? "space-y-3 text-right" : "space-y-3"}>
                      <p
                        className="text-[0.72rem] uppercase tracking-[0.26em]"
                        style={{
                          color: isRefinedPoster
                            ? "rgba(237, 234, 228, 0.76)"
                            : "rgba(255, 255, 255, 0.70)",
                        }}
                      >
                        {isRefinedPoster ? "" : activeConcert.date}
                      </p>
                      <h2
                        className={[
                          "text-3xl font-light leading-tight tracking-[-0.04em]",
                          isGuestPoster ? "ml-auto max-w-[390px] sm:text-[2.4rem]" : "max-w-lg sm:text-[2.85rem]",
                        ].join(" ")}
                      >
                        {activeConcert.title}
                      </h2>
                      <p
                        className={[
                          "text-sm leading-7 sm:text-[0.98rem]",
                          isGuestPoster ? "font-editorial-sans tracking-[0.08em]" : "",
                          isGuestPoster ? "ml-auto max-w-[320px]" : "max-w-lg",
                        ].join(" ")}
                        style={{
                          color: isGuestPoster
                            ? "rgba(237, 234, 228, 0.76)"
                            : isRefinedPoster
                            ? "rgba(237, 234, 228, 0.86)"
                            : "rgba(255, 255, 255, 0.82)",
                        }}
                      >
                        {activeConcert.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>

            <div className="mt-4 flex flex-wrap items-center">
              <button
                type="button"
                onClick={() => handlePosterSelect(0)}
                aria-label="Показать афишу: Борис Березовский"
                className="mr-5 inline-flex h-6 w-6 items-center justify-center transition-colors duration-300"
              >
                <span
                  aria-hidden="true"
                  className={[
                    "h-[7px] w-[7px] rounded-full transition-colors duration-300",
                    activeIndex === 0 ? "bg-[#111111]" : "bg-[#b8b8b8]",
                  ].join(" ")}
                />
              </button>

              <div className="flex flex-wrap gap-2">
              {featuredConcerts.map((concert, index) => (
                <button
                  key={concert.title}
                  type="button"
                  onClick={() => handlePosterSelect(index + 1)}
                  className={[
                    "border px-3 py-2 text-left text-[0.68rem] uppercase tracking-[0.2em] transition-all duration-300",
                    activeIndex === index + 1
                      ? "border-black bg-black font-medium tracking-[0.23em] text-[var(--color-panel)]"
                      : "border-black/10 text-[var(--color-muted)] hover:border-black/20 hover:text-[var(--color-text)]",
                  ].join(" ")}
                  aria-label={`Показать афишу: ${concert.title}`}
                >
                  {concert.date}
                </button>
              ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pb-2 pt-8 sm:pb-3 sm:pt-10 lg:pt-12">
          <div
            aria-hidden="true"
            className="flex w-full items-center gap-[10px]"
          >
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
    </section>
  );
}
