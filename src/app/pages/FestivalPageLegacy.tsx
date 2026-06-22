import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import festivalLogo from "../../../logofestnew.png";
import { VideoHomeHero } from "../components/hero/VideoHomeHero";
import { PageContainer } from "../layout/PageContainer";

const cookieStorageKey = "composersxxi_cookie_notice_accepted";

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
  return (
    <>
      <h1 className="sr-only">{"Фестиваль современной музыки „Композиторы XXI века“"}</h1>
      <section id="home-old-hero" className="relative min-h-[100svh] overflow-hidden bg-black text-white">
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
              <div className="relative aspect-[2.6/1] w-full overflow-hidden">
                <img
                  src={festivalLogo}
                  alt=""
                  className="absolute left-0 top-1/2 h-auto w-full -translate-y-1/2 opacity-[0.98] brightness-0 invert"
                  decoding="async"
                  style={{ clipPath: "inset(0 53% 0 0)" }}
                />
                <img
                  src={festivalLogo}
                  alt="Композиторы XXI века"
                  className="absolute left-0 top-1/2 h-auto w-full -translate-y-1/2 scale-[1.06] opacity-90 brightness-0 invert"
                  decoding="async"
                  style={{
                    clipPath: "inset(0 0 0 47%)",
                    transformOrigin: "47% 50%",
                  }}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-1/2 aspect-[3/2] w-full -translate-y-1/2 bg-[#8A2432]"
                  style={{
                    clipPath: "inset(64% 53% 30% 43%)",
                  }}
                />
              </div>
              <span aria-hidden="true" className="ml-[10%] mt-3 block h-px w-[65%] bg-[#8A2432]/70" />
              <p className="font-editorial-sans ml-[10%] mt-3 whitespace-nowrap text-[8px] font-normal uppercase leading-none tracking-[0.37em] text-white/65 sm:text-[9px]">
                Фестиваль современной музыки
              </p>
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
                src={festivalLogo}
                alt="Композиторы XXI века"
                className="absolute left-0 top-1/2 h-auto w-full -translate-y-1/2 opacity-[0.82] brightness-0 invert"
                style={{ clipPath: "inset(0 55% 0 0)" }}
                decoding="async"
              />
              <img
                src={festivalLogo}
                alt=""
                aria-hidden="true"
                className="absolute left-0 top-1/2 h-auto w-full -translate-y-1/2 opacity-[0.86] brightness-0 invert"
                style={{ clipPath: "inset(0 0 0 45%)" }}
                decoding="async"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-1/2 aspect-[3/2] w-full -translate-y-1/2 bg-[#8A2432]"
                style={{
                  clipPath: "inset(64% 53% 30% 43%)",
                }}
              />
            </div>
            <p className="font-editorial-sans mt-1.5 w-full whitespace-nowrap text-[13px] font-normal uppercase leading-none tracking-[0.12em] text-white/76 xl:text-[14px]">
              Фестиваль современной музыки
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.56, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-end justify-between gap-10"
          >
            <p className="font-editorial-sans text-[10px] font-normal uppercase leading-none tracking-[0.18em] text-white/68">
              2026 · 10—31 мая · Москва · Галерея НИКО · 15 концертов
            </p>
            <Link
              to="/media"
              className="font-editorial-sans inline-flex shrink-0 items-center gap-2 text-[11px] font-normal uppercase leading-none tracking-[0.16em] text-white/72 transition-colors duration-300 hover:text-white"
            >
              Медиа фестиваля
              <span aria-hidden="true" className="text-[#8A2432]">→</span>
            </Link>
          </motion.div>
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
