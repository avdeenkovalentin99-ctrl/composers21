import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ensembles, getPersonSlug, soloists } from "../data/participants";
import { composers, performers } from "../data/site";
import { PageContainer } from "../layout/PageContainer";
import { PARTICIPANTS_SHELL_CLASS } from "../layout/participantsLayout";

type PersonItem = (typeof composers)[number];
type CategoryKey = "composers" | "performers";

const categoryLabels: Record<CategoryKey, string> = {
  composers: "КОМПОЗИТОРЫ",
  performers: "ИСПОЛНИТЕЛИ",
};

function ParticipantCard({
  person,
  onOpen,
  imageClassName,
  actionLabel,
}: {
  person: PersonItem;
  onOpen: (person: PersonItem) => void;
  imageClassName?: string;
  actionLabel?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(person)}
      whileHover="hover"
      className="group block w-full justify-self-start text-left"
    >
      <div className="overflow-hidden bg-white">
        <div className="relative overflow-hidden">
          <motion.img
            variants={{ hover: { scale: 1.015 } }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            src={person.image}
            alt={person.name}
            className={["w-full object-cover grayscale", imageClassName ?? "aspect-[4/5]"].join(" ")}
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/6" />
          {actionLabel ? (
            <div className="pointer-events-none absolute bottom-4 left-4 font-editorial-sans text-[10px] uppercase tracking-[0.14em] text-white/0 transition-colors duration-300 group-hover:text-white/72">
              {actionLabel}
            </div>
          ) : null}
        </div>

        <div className="pt-8">
          <h2 className="font-editorial-sans font-small-caps text-[1rem] font-normal tracking-[0.18em] text-neutral-900 sm:text-[1.08rem]">
            {person.name}
          </h2>
        </div>
      </div>
    </motion.button>
  );
}

function SoloistCard({
  person,
  onOpen,
  actionLabel = "СТРАНИЦА",
}: {
  person: PersonItem;
  onOpen: (person: PersonItem) => void;
  actionLabel?: string;
}) {
  const nameParts = person.name.trim().split(/\s+/);
  const lastName = nameParts.pop() ?? "";
  const firstPart = nameParts.join(" ");
  const imageClassName = getParticipantImageClassName(person);

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(person)}
      whileHover="hover"
      className="group block w-full justify-self-start text-left"
    >
      <div className="overflow-hidden bg-white">
        <div className="relative overflow-hidden">
          <motion.img
            variants={{ hover: { scale: 1.015 } }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            src={person.image}
            alt={person.name}
            className={["w-full object-cover grayscale", imageClassName].join(" ")}
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/6" />
          <div className="pointer-events-none absolute bottom-4 left-4 font-editorial-sans text-[10px] uppercase tracking-[0.14em] text-white/0 transition-colors duration-300 group-hover:text-white/72">
            {actionLabel}
          </div>
        </div>

        <div className="pt-8">
          <h2 className="font-editorial-sans text-[0.94rem] font-[360] uppercase tracking-[0.05em] text-[#333333] sm:text-[1rem]">
            {firstPart ? `${firstPart} ` : ""}
            <span className="last-name font-medium">{lastName}</span>
          </h2>
        </div>
      </div>
    </motion.button>
  );
}

function getParticipantImageClassName(person: PersonItem, fallbackClassName = "aspect-[4/5]") {
  if (person.slug === "leonid-desyatnikov") {
    return `${fallbackClassName} object-[50%_18%]`;
  }

  if (person.slug === "roman-vykulov") {
    return `${fallbackClassName} object-[68%_50%]`;
  }

  return fallbackClassName;
}

function getEnsembleImageClassName(person: PersonItem, fallbackClassName = "aspect-[3/2]") {
  if (person.slug === "kvartet_glinki") {
    return `${fallbackClassName} object-[50%_42%]`;
  }

  return fallbackClassName;
}

export function ParticipantsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(() => {
    if (typeof window === "undefined") {
      return "composers";
    }

    const savedCategory = window.sessionStorage.getItem("participants-active-category");
    return savedCategory === "performers" ? "performers" : "composers";
  });
  const [isLeaving, setIsLeaving] = useState(false);
  const leaveTimeoutRef = useRef<number | null>(null);

  const people = useMemo(
    () => (activeCategory === "composers" ? composers : performers),
    [activeCategory],
  );

  useEffect(() => {
    window.sessionStorage.setItem("participants-active-category", activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    document.body.classList.remove("participants-route-leaving");

    return () => {
      document.body.classList.remove("participants-route-leaving");

      if (leaveTimeoutRef.current !== null) {
        window.clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  const beginParticipantTransition = (targetPath: string) => {
    if (isLeaving) {
      return;
    }

    window.sessionStorage.setItem("participants-active-category", activeCategory);
    document.body.classList.add("participants-route-leaving");
    window.dispatchEvent(new CustomEvent("participants:leave"));
    setIsLeaving(true);
    leaveTimeoutRef.current = window.setTimeout(() => {
      window.location.assign(targetPath);
    }, 140);
  };

  return (
    <section className="pb-20 pt-32 sm:pb-24 sm:pt-36">
      <PageContainer>
        <motion.div
          animate={{ opacity: isLeaving ? 0 : 1 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className={PARTICIPANTS_SHELL_CLASS}
        >
          <div className="space-y-14 sm:space-y-16">
            <div className="flex flex-wrap gap-x-7 gap-y-3 sm:gap-x-8">
              {(["composers", "performers"] as CategoryKey[]).map((category) => {
                const isActive = activeCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      if (isLeaving) {
                        return;
                      }

                      window.sessionStorage.setItem("participants-active-category", category);
                      setActiveCategory(category);
                    }}
                    className={[
                      "font-editorial-sans relative text-[12px] uppercase tracking-[0.14em] transition-colors duration-300 ease-in-out sm:text-[12.5px]",
                      isActive ? "text-neutral-950" : "text-neutral-400 hover:text-neutral-600",
                    ].join(" ")}
                  >
                    {categoryLabels[category]}
                    <span
                      className={[
                        "absolute -bottom-2 left-0 h-[0.5px] bg-black transition-all duration-300 ease-in-out",
                        isActive ? "w-full opacity-50" : "w-0 opacity-0",
                      ].join(" ")}
                    />
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.48, ease: "easeInOut" }}
                className="mt-12 sm:mt-15"
              >
                {activeCategory === "composers" ? (
                  <div
                    className={[
                      "grid gap-y-20 sm:grid-cols-2 sm:gap-y-24",
                      "sm:gap-x-12 xl:grid-cols-[repeat(3,320px)] xl:justify-between",
                    ].join(" ")}
                  >
                    {people.map((person) => (
                      <ParticipantCard
                        key={`${activeCategory}-${person.name}`}
                        person={person}
                        onOpen={() => {
                          beginParticipantTransition(`/participants/composers/${person.slug}`);
                        }}
                        imageClassName={getParticipantImageClassName(person)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-24 sm:space-y-28 lg:space-y-32">
                    <section className="space-y-8">
                      <p className="font-editorial-sans text-[13px] font-normal uppercase tracking-[0.2em] text-neutral-500">
                        АНСАМБЛИ И ОРКЕСТРЫ
                      </p>
                      <div className="ensemble-cards grid gap-x-10 gap-y-20 sm:gap-y-24 lg:grid-cols-[repeat(2,480px)] lg:justify-between">
                        {ensembles.map((person) => (
                          <ParticipantCard
                            key={`ensemble-${person.name}`}
                            person={person}
                            onOpen={() => {
                              beginParticipantTransition(`/participants/ensembles/${getPersonSlug(person)}`);
                            }}
                            imageClassName={getEnsembleImageClassName(person)}
                          />
                        ))}
                      </div>
                    </section>

                    <section className="space-y-10">
                      <p className="font-editorial-sans text-[13px] font-normal uppercase tracking-[0.2em] text-neutral-500">
                        СОЛИСТЫ
                      </p>
                      <div
                        className={[
                          "soloist-cards grid gap-y-20 sm:grid-cols-2 sm:gap-y-24",
                          "sm:gap-x-12 xl:grid-cols-[repeat(3,320px)] xl:justify-between",
                        ].join(" ")}
                      >
                        {soloists.map((person) => (
                          <SoloistCard
                            key={`soloist-${person.name}`}
                            person={person}
                            actionLabel=""
                            onOpen={() => {
                              beginParticipantTransition(`/participants/soloists/${getPersonSlug(person)}`);
                            }}
                          />
                        ))}
                      </div>
                    </section>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </PageContainer>
    </section>
  );
}
