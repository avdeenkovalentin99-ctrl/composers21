import { motion } from "motion/react";
import { featuredParticipants } from "../../data/site";
import { PageContainer } from "../../layout/PageContainer";
import { LinkArrow } from "../ui/LinkArrow";
import { SectionTitle } from "../ui/SectionTitle";

function getPreviewImageClassName(slug: string) {
  if (slug === "roman-vykulov") {
    return "h-72 w-full object-cover object-[68%_50%] grayscale";
  }

  return "h-72 w-full object-cover grayscale";
}

export function ParticipantsPreview() {
  return (
    <section className="py-18 sm:py-24">
      <PageContainer>
        <div className="space-y-10 border-t border-black/10 pt-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionTitle eyebrow="Участники">Композиторы, ансамбли и исполнители фестиваля.</SectionTitle>
            <LinkArrow to="/participants">Смотреть список</LinkArrow>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredParticipants.map((person, index) => (
              <motion.article
                key={person.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.36, delay: index * 0.04 }}
                className="border border-black/10 bg-[var(--color-panel)]"
              >
                <img src={person.image} alt={person.name} className={getPreviewImageClassName(person.slug)} />
                <div className="space-y-3 p-6">
                  <h3 className="text-xl font-light tracking-[-0.03em]">{person.name}</h3>
                  <p className="text-sm leading-7 text-[var(--color-muted)]">{person.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
