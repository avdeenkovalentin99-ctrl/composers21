import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { findEnsembleBySlug } from "../data/participants";
import { personDetails } from "../data/personDetails";
import { PageContainer } from "../layout/PageContainer";
import { PARTICIPANTS_SHELL_CLASS } from "../layout/participantsLayout";

const paragraphVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.56,
      delay: 1.24 + index * 0.16,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

function getEnsembleImageClassName(slug: string) {
  if (slug === "kvartet_glinki") {
    return "aspect-[3/2] h-full w-full object-cover object-[50%_42%] grayscale";
  }

  return "aspect-[3/2] h-full w-full object-cover grayscale";
}

export function EnsemblePage() {
  const { slug = "" } = useParams();
  const ensemble = findEnsembleBySlug(slug);

  if (!ensemble) {
    return <Navigate to="/participants" replace />;
  }

  const biographyParagraphs = personDetails[ensemble.slug]?.biography ?? [ensemble.description];
  const introParagraphs =
    biographyParagraphs.length > 2 ? biographyParagraphs.slice(0, 2) : biographyParagraphs.slice(0, 1);
  const continuationParagraphs = biographyParagraphs.slice(introParagraphs.length);

  return (
    <section className="pb-32 pt-32 sm:pb-36 sm:pt-36">
      <PageContainer>
        <div className={PARTICIPANTS_SHELL_CLASS}>
          <div className="space-y-8 sm:space-y-9 lg:space-y-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.42, delay: 1.5, ease: "easeOut" }}
            >
              <Link
                to="/participants"
                className="inline-flex items-center gap-1.5 font-editorial-sans font-small-caps text-[12px] font-normal tracking-[0.18em] text-neutral-400 transition-colors duration-200 hover:text-neutral-600 sm:text-[12.5px]"
              >
                <ChevronLeft aria-hidden="true" size={11} strokeWidth={1.5} />
                Назад
              </Link>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.88fr)] lg:items-start lg:gap-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.96, ease: "easeOut" }}
                className="relative overflow-hidden bg-neutral-950/5"
              >
                <img
                  src={ensemble.image}
                  alt={ensemble.name}
                  className={getEnsembleImageClassName(ensemble.slug)}
                />
                <div aria-hidden="true" className="absolute inset-0 bg-black/5" />
              </motion.div>

              <div className="space-y-7 sm:space-y-8 lg:self-start">
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.3, delay: 0.56, ease: "easeOut" }}
                  className="max-w-[560px] font-editorial-sans text-[1.38rem] font-normal uppercase leading-[1.08] tracking-[0.05em] text-[#222222] sm:text-[1.56rem] lg:text-[1.84rem]"
                >
                  {ensemble.name}
                </motion.h1>

                <div className="font-editorial-serif space-y-6 text-[1.05rem] leading-[1.74] text-neutral-800 sm:text-[1.1rem]">
                  {introParagraphs.map((paragraph, index) => (
                    <motion.p
                      key={`${ensemble.slug}-intro-${index}`}
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

            {continuationParagraphs.length > 0 ? (
              <div className="max-w-[720px] font-editorial-serif space-y-7 text-[1.05rem] leading-[1.74] text-neutral-800 sm:text-[1.1rem] lg:max-w-[700px]">
                {continuationParagraphs.map((paragraph, index) => (
                  <motion.p
                    key={`${ensemble.slug}-body-${index}`}
                    custom={index + introParagraphs.length}
                    initial="hidden"
                    animate="visible"
                    variants={paragraphVariants}
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
