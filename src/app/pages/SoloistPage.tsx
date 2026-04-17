import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { findSoloistBySlug } from "../data/participants";
import { personDetails } from "../data/personDetails";
import { PageContainer } from "../layout/PageContainer";
import {
  BIOGRAPHY_STANDARD_ASIDE_CLASS,
  BIOGRAPHY_STANDARD_GRID_CLASS,
  BIOGRAPHY_STANDARD_MEDIA_GRID_CLASS,
  BIOGRAPHY_STANDARD_TEXT_CLASS,
  PARTICIPANTS_SHELL_CLASS,
} from "../layout/participantsLayout";

const paragraphVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.52,
      delay: 1.12 + index * 0.15,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export function SoloistPage() {
  const { slug = "" } = useParams();
  const soloist = findSoloistBySlug(slug);

  if (!soloist) {
    return <Navigate to="/participants" replace />;
  }

  const biographyParagraphs = personDetails[soloist.slug]?.biography ?? [soloist.description];
  const nameParts = soloist.name.trim().split(/\s+/);
  const lastName = nameParts.pop() ?? "";
  const firstPart = nameParts.join(" ");

  return (
    <section className="pb-32 pt-32 sm:pb-36 sm:pt-36">
      <PageContainer>
        <div className={PARTICIPANTS_SHELL_CLASS}>
          <div className={BIOGRAPHY_STANDARD_GRID_CLASS}>
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className={BIOGRAPHY_STANDARD_ASIDE_CLASS}>
                <div className="relative w-full">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.42, delay: 1.5, ease: "easeOut" }}
                    className="mb-4 sm:mb-5 lg:absolute lg:left-0 lg:top-[-38px] lg:z-10 lg:mb-0"
                  >
                    <Link
                      to="/participants"
                      className="inline-flex items-center gap-1.5 font-editorial-sans font-small-caps text-[12px] font-normal tracking-[0.18em] text-neutral-400 transition-colors duration-200 hover:text-neutral-600 sm:text-[12.5px]"
                    >
                      <ChevronLeft aria-hidden="true" size={11} strokeWidth={1.5} />
                      Назад
                    </Link>
                  </motion.div>

                  <div className={BIOGRAPHY_STANDARD_MEDIA_GRID_CLASS}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1.28, delay: 0.5, ease: "easeOut" }}
                      className="absolute bottom-0 left-[-22px] hidden rotate-180 [writing-mode:vertical-rl] lg:block"
                    >
                      <div className="font-editorial-sans text-[0.92rem] font-[360] uppercase tracking-[0.05em] text-[#333333]">
                        {firstPart ? `${firstPart} ` : ""}
                        <span className="last-name font-medium text-[#222222]">{lastName}</span>
                      </div>
                    </motion.div>

                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      src={soloist.image}
                      alt={soloist.name}
                      className="aspect-[4/5] w-full object-cover grayscale lg:absolute lg:bottom-0 lg:left-0 lg:w-[384px]"
                    />
                  </div>
                </div>

                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.28, delay: 0.5, ease: "easeOut" }}
                  className="max-w-full font-editorial-serif text-[1.62rem] font-normal leading-[1.22] tracking-[-0.01em] text-neutral-800 sm:text-[1.74rem] lg:hidden"
                >
                  {soloist.name}
                </motion.h1>
              </div>
            </aside>

            <div className={BIOGRAPHY_STANDARD_TEXT_CLASS}>
              <div className="font-editorial-serif space-y-7 text-[1.05rem] leading-[1.78] text-neutral-800 sm:text-[1.12rem]">
                {biographyParagraphs.map((paragraph, index) => (
                  <motion.p
                    key={paragraph}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={paragraphVariants}
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
