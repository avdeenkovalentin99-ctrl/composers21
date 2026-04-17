import { motion } from "motion/react";
import { festivalInfo } from "../../data/site";
import { PageContainer } from "../../layout/PageContainer";
import { SectionTitle } from "../ui/SectionTitle";

export function FestivalIntro() {
  return (
    <section className="py-18 sm:py-24">
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
          className="grid gap-10 border-t border-black/10 pt-8 lg:grid-cols-[1fr_1.1fr]"
        >
          <SectionTitle eyebrow="Фестиваль">Музыка современников, живой диалог авторов, исполнителей и слушателей.</SectionTitle>
          <div className="space-y-6 text-sm leading-7 text-[var(--color-muted)] sm:text-base">
            <p>{festivalInfo.projectText[0]}</p>
            <p>{festivalInfo.projectText[1]}</p>
          </div>
        </motion.div>
      </PageContainer>
    </section>
  );
}
