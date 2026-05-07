import { motion } from "motion/react";
import { HomeHero } from "../components/hero/HomeHero";
import { Link } from "react-router-dom";
import { PageContainer } from "../layout/PageContainer";

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
                ПРОГРАММА / БИЛЕТЫ
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
                О ФЕСТИВАЛЕ
              </Link>
            </motion.div>
          </motion.div>
        </PageContainer>
      </section>
    </>
  );
}
