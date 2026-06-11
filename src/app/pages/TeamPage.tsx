import { motion } from "motion/react";
import { teamSections, type TeamPerson } from "../data/team";
import { PageContainer } from "../layout/PageContainer";

function TeamCredit({ person, isLongLine = false }: { person: TeamPerson; isLongLine?: boolean }) {
  return (
    <div className={isLongLine ? "max-w-4xl" : ""}>
      <p
        className={[
          "font-editorial-serif font-normal tracking-[-0.01em] text-neutral-950",
          isLongLine
            ? "text-[1.55rem] leading-[1.22] sm:text-[1.95rem] lg:text-[2.2rem]"
            : "text-[1.82rem] leading-[1.05] sm:text-[2.35rem] lg:text-[2.8rem]",
        ].join(" ")}
      >
        {person.name}
      </p>
      {person.role ? (
        <p className="font-editorial-sans mt-3 max-w-2xl text-[11px] font-normal uppercase leading-5 tracking-[0.16em] text-neutral-500 sm:text-[12px]">
          {person.role}
        </p>
      ) : null}
    </div>
  );
}

export function TeamPage() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="pb-24 pt-32 text-neutral-950 sm:pb-32 sm:pt-40"
    >
      <PageContainer>
        <div className="mx-auto max-w-6xl">
          <h1 className="sr-only">Команда</h1>
          <div className="space-y-20 sm:space-y-24 lg:space-y-28">
            {teamSections.map((section, sectionIndex) => (
              <section
                key={section.title ?? "festival-team"}
                className={[
                  "grid gap-8 sm:gap-10",
                  sectionIndex === 0
                    ? "lg:grid-cols-[minmax(180px,0.28fr)_minmax(0,0.72fr)] lg:gap-16"
                    : "border-t border-black/10 pt-8 sm:pt-10 lg:grid-cols-[minmax(180px,0.28fr)_minmax(0,0.72fr)] lg:gap-16",
                ].join(" ")}
              >
                <div className={sectionIndex === 0 ? "hidden lg:block" : ""}>
                  {section.title ? (
                    <h2 className="font-editorial-sans text-[11px] font-normal uppercase leading-5 tracking-[0.18em] text-neutral-500">
                      {section.title}
                    </h2>
                  ) : (
                    <span className="sr-only">Руководство фестиваля</span>
                  )}
                </div>

                <div className="space-y-12 sm:space-y-14">
                  {section.people.map((person, personIndex) => (
                    <TeamCredit
                      key={`${section.title ?? "festival"}-${person.name}`}
                      person={person}
                      isLongLine={sectionIndex === teamSections.length - 1 && personIndex === section.people.length - 1}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </PageContainer>
    </motion.section>
  );
}
