import { motion } from "motion/react";
import { concerts } from "../../data/site";
import { PageContainer } from "../../layout/PageContainer";
import { LinkArrow } from "../ui/LinkArrow";
import { SectionTitle } from "../ui/SectionTitle";

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

export function SelectedPosters() {
  return (
    <section className="py-18 sm:py-24">
      <PageContainer>
        <div className="space-y-10 border-t border-black/10 pt-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionTitle eyebrow="Афиша">Избранные концерты фестивальной программы.</SectionTitle>
            <LinkArrow to="/afisha">Вся афиша</LinkArrow>
          </div>

          <div className="grid gap-px overflow-hidden border border-black/10 bg-black/10 lg:grid-cols-3">
            {concerts.slice(0, 3).map((concert, index) => (
              <motion.article
                key={concert.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.36, delay: index * 0.05 }}
                className="bg-[var(--color-panel)] p-6 sm:p-8"
              >
                <p className="mb-10 text-[0.68rem] uppercase tracking-[0.26em] text-[var(--color-muted)]">{concert.date}</p>
                <h3 className="text-2xl font-light leading-tight tracking-[-0.03em]">{concert.title}</h3>
                {!isPosterDescriptionDuplicate(concert.title, concert.description) ? (
                  <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">{concert.description}</p>
                ) : null}
              </motion.article>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
