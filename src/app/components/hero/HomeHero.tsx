import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import festivalMark from "../../../../FestLogoNowords.svg";
import festivalBottomWord from "/festlogo-bottomword.svg";
import festivalTopWord from "/festlogo-topword.svg";
import { featuredConcerts } from "../../data/site";
import { PageContainer } from "../../layout/PageContainer";

const posterIntervalMs = 6200;

export function HomeHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeConcert = featuredConcerts[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % featuredConcerts.length);
    }, posterIntervalMs);

    return () => window.clearInterval(timer);
  }, []);

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
                className="relative min-h-[580px] flex-1 overflow-hidden border border-black/10 bg-black lg:min-h-[600px]"
              >
                <img
                  src={activeConcert.image}
                  alt={activeConcert.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-90 grayscale"
                />
                <div className="absolute inset-0 bg-black/52" />

                <div className="relative flex h-full flex-col justify-between p-6 text-white sm:p-8">
                  <div className="flex items-start justify-end">
                    <span className="font-editorial-sans text-[0.64rem] font-light uppercase tracking-[0.18em] text-white/62">
                      {String(activeIndex + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-3">
                      <p className="text-[0.72rem] uppercase tracking-[0.26em] text-white/70">
                        {activeConcert.date}
                      </p>
                      <h2 className="max-w-lg text-3xl font-light leading-tight tracking-[-0.04em] sm:text-[2.85rem]">
                        {activeConcert.title}
                      </h2>
                      <p className="max-w-lg text-sm leading-7 text-white/82 sm:text-[0.98rem]">
                        {activeConcert.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>

            <div className="mt-4 flex flex-wrap gap-2">
              {featuredConcerts.map((concert, index) => (
                <button
                  key={concert.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={[
                    "border px-3 py-2 text-left text-[0.68rem] uppercase tracking-[0.2em] transition-all duration-300",
                    activeIndex === index
                      ? "border-black bg-black text-white"
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
