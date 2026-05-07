import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { HomeHero } from "../components/hero/HomeHero";
import { Link } from "react-router-dom";
import { PageContainer } from "../layout/PageContainer";

const cookieStorageKey = "composersxxi_cookie_notice_accepted";

const academyConstellationItems = [
  {
    date: "\u0031\u0034 \u043c\u0430\u044f",
    title: "\u0421\u0435\u0440\u0433\u0435\u0439 \u0410\u0445\u0443\u043d\u043e\u0432. \u0411\u0435\u0441\u0435\u0434\u044b \u043e \u043c\u0443\u0437\u044b\u043a\u0435",
    className: "left-[4%] top-[14%] max-w-[12.5rem] sm:left-[7%] sm:top-[13%] sm:max-w-[15rem]",
    line: { x1: 36, y1: 37, x2: 50, y2: 50 },
    drift: { x: [0, 2, -1, 0], y: [0, -2, 1, 0], duration: 16 },
  },
  {
    date: "\u0031\u0037 \u043c\u0430\u044f",
    title: "\u0412\u0441\u0442\u0440\u0435\u0447\u0430 \u0441 \u0441\u043e\u0437\u0434\u0430\u0442\u0435\u043b\u044f\u043c\u0438 \u0444\u0435\u0441\u0442\u0438\u0432\u0430\u043b\u044f",
    className: "right-[4%] top-[15%] max-w-[13rem] text-right sm:right-[6%] sm:top-[15%] sm:max-w-[15rem]",
    line: { x1: 64, y1: 38, x2: 50, y2: 50 },
    drift: { x: [0, -2, 1, 0], y: [0, 1, -2, 0], duration: 18 },
  },
  {
    date: "\u0032\u0032 \u043c\u0430\u044f",
    title: "\u0412\u0441\u0442\u0440\u0435\u0447\u0430 \u0441 \u00cele Th\u00e9l\u00e8me Ensemble",
    className: "bottom-[10%] left-[50%] max-w-[15rem] -translate-x-1/2 text-center sm:bottom-[10%] sm:max-w-[17rem]",
    line: { x1: 50, y1: 67, x2: 50, y2: 50 },
    drift: { x: [0, 1, -2, 0], y: [0, 2, -1, 0], duration: 20 },
  },
];

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
      className="font-editorial-sans fixed bottom-7 left-4 z-[60] max-w-[calc(100vw-2rem)] border border-black/8 bg-white px-4 py-[10px] text-[11px] leading-5 text-neutral-600 sm:bottom-8 sm:left-5 sm:max-w-[360px] sm:px-5"
      aria-label="Cookie"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>{"\u0421\u0430\u0439\u0442 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442 cookies \u0438 \u042f\u043d\u0434\u0435\u043a\u0441.\u041c\u0435\u0442\u0440\u0438\u043a\u0443."}</span>
        <Link to="/privacy" className="border-b border-black/20 text-neutral-700 transition-colors duration-200 hover:text-neutral-950">
          {"\u041f\u043e\u043b\u0438\u0442\u0438\u043a\u0430 \u043a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u0438"}
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

export function FestivalPage() {
  return (
    <>
      <h1 className="sr-only">{"\u0424\u0435\u0441\u0442\u0438\u0432\u0430\u043B\u044C \u0441\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0439 \u043C\u0443\u0437\u044B\u043A\u0438 \u201E\u041A\u043E\u043C\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u044B XXI \u0432\u0435\u043A\u0430\u201C"}</h1>
      <HomeHero />
      <section className="bg-[var(--color-bg)] pb-16 pt-8 text-neutral-950 sm:pb-20 sm:pt-10">
        <PageContainer>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.95 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.08,
                },
              },
            }}
            className="mx-auto flex w-full max-w-[32rem] flex-col gap-4 pt-2 sm:gap-5 sm:pt-4"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <Link
                to="/afisha"
                className="font-editorial-sans inline-flex min-h-[84px] w-full items-center justify-center border border-black/12 px-6 py-6 text-center text-[13px] uppercase tracking-[0.18em] text-black/58 transition-colors duration-300 ease-out hover:border-black/18 hover:text-black/72 sm:min-h-[96px] sm:text-[15px]"
              >
                {"\u041f\u0420\u041e\u0413\u0420\u0410\u041c\u041c\u0410 / \u0411\u0418\u041b\u0415\u0422\u042b"}
              </Link>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <Link
                to="/festival"
                className="font-editorial-sans inline-flex min-h-[84px] w-full items-center justify-center border border-black/12 px-6 py-6 text-center text-[13px] uppercase tracking-[0.18em] text-black/58 transition-colors duration-300 ease-out hover:border-black/18 hover:text-black/72 sm:min-h-[96px] sm:text-[15px]"
              >
                {"\u041e \u0424\u0415\u0421\u0422\u0418\u0412\u0410\u041b\u0415"}
              </Link>
            </motion.div>
          </motion.div>

          <section className="mt-24 sm:mt-28 lg:mt-36" aria-labelledby="home-academies-title">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to="/academies"
                className="group relative mx-auto block h-[19rem] max-w-[52rem] cursor-pointer text-neutral-700 outline-none transition-opacity duration-300 hover:opacity-90 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-6 focus-visible:outline-black/25 sm:h-[22rem]"
                aria-label={"\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0443 \u0430\u043a\u0430\u0434\u0435\u043c\u0438\u0439"}
              >
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 h-px w-24 -translate-x-1/2 -translate-y-1/2 bg-black/[0.035]"
                />
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 h-24 w-px -translate-x-1/2 -translate-y-1/2 bg-black/[0.025]"
                />

                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {academyConstellationItems.map((event) => (
                    <motion.line
                      key={event.title}
                      x1={event.line.x1}
                      y1={event.line.y1}
                      x2={event.line.x2}
                      y2={event.line.y2}
                      vectorEffect="non-scaling-stroke"
                      stroke="currentColor"
                      strokeWidth="0.45"
                      className="text-black/10 transition-colors duration-300 group-hover:text-black/16"
                      animate={{
                        opacity: [0.36, 0.58, 0.42],
                        x1: [event.line.x1, event.line.x1 + 0.35, event.line.x1 - 0.25, event.line.x1],
                        y1: [event.line.y1, event.line.y1 - 0.35, event.line.y1 + 0.25, event.line.y1],
                      }}
                      transition={{
                        duration: event.drift.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </svg>

                {academyConstellationItems.map((event) => (
                  <motion.span
                    key={event.title}
                    className={`absolute block ${event.className}`}
                    animate={{ x: event.drift.x, y: event.drift.y }}
                    transition={{
                      duration: event.drift.duration,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <span className="font-editorial-sans block text-[9px] uppercase leading-4 tracking-[0.18em] text-neutral-400">
                      {event.date}
                    </span>
                    <span className="font-editorial-serif mt-1 block text-[1rem] leading-6 text-neutral-700 transition-colors duration-300 group-hover:text-neutral-950 sm:text-[1.12rem]">
                      {event.title}
                    </span>
                  </motion.span>
                ))}

                <span
                  id="home-academies-title"
                  className="font-editorial-sans absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] uppercase leading-5 tracking-[0.24em] text-neutral-500 transition-colors duration-300 group-hover:text-neutral-700"
                >
                  {"\u0410\u041a\u0410\u0414\u0415\u041c\u0418\u0418"}
                </span>
              </Link>
            </motion.div>
          </section>
        </PageContainer>
      </section>
      <CookieNotice />
    </>
  );
}
