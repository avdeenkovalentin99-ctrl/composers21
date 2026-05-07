import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { HomeHero } from "../components/hero/HomeHero";
import { Link } from "react-router-dom";
import { PageContainer } from "../layout/PageContainer";

const cookieStorageKey = "composersxxi_cookie_notice_accepted";

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
                {"\u041f\u0420\u041e\u0413\u0420\u0410\u041c\u041c\u042b/\u0411\u0418\u041b\u0415\u0422\u042b"}
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
                to="/academies"
                className="font-editorial-sans inline-flex min-h-[84px] w-full items-center justify-center border border-black/12 px-6 py-6 text-center text-[13px] uppercase tracking-[0.18em] text-black/58 transition-colors duration-300 ease-out hover:border-black/18 hover:text-black/72 sm:min-h-[96px] sm:text-[15px]"
              >
                {"\u0410\u041a\u0410\u0414\u0415\u041c\u0418\u0418"}
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
        </PageContainer>
      </section>
      <CookieNotice />
    </>
  );
}
