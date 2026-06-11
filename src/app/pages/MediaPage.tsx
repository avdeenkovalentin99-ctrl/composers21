import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode, Ref } from "react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cultureReports, mediaCollections, publicationMaterials, type MediaMaterial } from "../data/media";
import { PageContainer } from "../layout/PageContainer";

const visiblePublicationCount = 3;

function MaterialTypeBadge({ type }: { type: MediaMaterial["type"] }) {
  return (
    <span className="font-editorial-sans inline-flex border border-black/12 px-2 py-1 text-[10px] uppercase leading-none tracking-[0.16em] text-neutral-500">
      {type}
    </span>
  );
}

function ExternalMaterialLink({
  material,
  variant = "compact",
}: {
  material: MediaMaterial;
  variant?: "compact" | "featured";
}) {
  const isFeatured = variant === "featured";

  return (
    <a
      href={material.url}
      target="_blank"
      rel="noreferrer"
      className={[
        "group block border-black/10 transition-[border-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-black/20",
        isFeatured
          ? "border bg-white px-5 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8"
          : "border-t py-5 sm:py-6",
      ].join(" ")}
    >
      <div className={isFeatured ? "flex min-h-full flex-col" : ""}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          {!isFeatured ? <MaterialTypeBadge type={material.type} /> : null}
          <p className="font-editorial-sans text-[11px] uppercase leading-5 tracking-[0.16em] text-neutral-500">
            {material.source}
          </p>
        </div>

        <h3
          className={[
            "font-editorial-serif font-normal tracking-[-0.01em] text-neutral-950",
            isFeatured
              ? "mt-5 text-[1.75rem] leading-[1.08] sm:text-[2.08rem] lg:text-[2.32rem]"
              : "mt-5 max-w-3xl text-[1.35rem] leading-[1.22] sm:text-[1.58rem]",
          ].join(" ")}
        >
          {material.title}
        </h3>

        <div
          className={[
            "font-editorial-sans flex items-center justify-between gap-5 border-black/8 text-[11px] uppercase leading-5 tracking-[0.16em] text-neutral-500",
            isFeatured ? "mt-auto border-t pt-6" : "mt-5",
          ].join(" ")}
        >
          <span>{material.date}</span>
          <span className="inline-flex items-center gap-1.5 text-neutral-700 transition-colors duration-300 group-hover:text-neutral-950">
            Открыть
            <ArrowUpRight
              size={15}
              strokeWidth={1.5}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </a>
  );
}

function MediaSection({
  title,
  eyebrow,
  children,
  className = "",
  hasTopBorder = true,
  sectionRef,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  hasTopBorder?: boolean;
  sectionRef?: Ref<HTMLElement>;
}) {
  const headingId = `${title.toLowerCase().replace(/\s+/g, "-")}-heading`;

  return (
    <section ref={sectionRef} className={className} aria-labelledby={headingId}>
      <div
        className={[
          "mb-8 sm:mb-10",
          hasTopBorder ? "border-t border-black/10 pt-7 sm:pt-9" : "",
        ].join(" ")}
      >
        {eyebrow ? (
          <p className="font-editorial-sans text-[10px] uppercase leading-5 tracking-[0.2em] text-neutral-400 sm:text-[11px]">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={headingId}
          className={[
            "font-editorial-serif text-[1.9rem] font-normal leading-[1.04] tracking-[-0.01em] text-neutral-950 sm:text-[2.35rem]",
            eyebrow ? "mt-3" : "",
          ].join(" ")}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export function MediaPage() {
  const hasPhotoCollections = mediaCollections.length > 0;
  const publicationsSectionRef = useRef<HTMLElement | null>(null);
  const [showAllPublications, setShowAllPublications] = useState(false);
  const primaryPublicationMaterials = publicationMaterials.slice(0, visiblePublicationCount);
  const hiddenPublicationMaterials = publicationMaterials.slice(visiblePublicationCount);
  const hasHiddenPublicationMaterials = hiddenPublicationMaterials.length > 0;
  const publicationToggleClassName =
    "font-editorial-sans inline-flex items-center gap-1.5 border-b border-black/16 pb-[3px] text-[11px] uppercase leading-5 tracking-[0.14em] text-neutral-600 transition-colors duration-300 hover:border-black/30 hover:text-neutral-950 sm:text-[12px]";

  const collapsePublications = () => {
    setShowAllPublications(false);
    window.setTimeout(() => {
      publicationsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="pb-24 pt-32 text-neutral-950 sm:pb-32 sm:pt-40"
    >
      <PageContainer>
        <div className="mx-auto max-w-6xl">
          <h1 className="sr-only">Медиа фестиваля «Композиторы XXI века»</h1>
          <div className="space-y-16 sm:space-y-20 lg:space-y-24">
            <MediaSection title="публикации и анонсы" hasTopBorder={false} sectionRef={publicationsSectionRef}>
              <div>
                {primaryPublicationMaterials.map((material) => (
                  <ExternalMaterialLink key={material.id} material={material} />
                ))}
                {hasHiddenPublicationMaterials ? (
                  !showAllPublications ? (
                    <button
                      type="button"
                      onClick={() => setShowAllPublications(true)}
                      className={`mt-7 ${publicationToggleClassName}`}
                      aria-expanded={showAllPublications}
                    >
                      показать все материалы
                      <span aria-hidden="true" className="font-sans text-[10px] leading-none text-neutral-500">
                        ↓
                      </span>
                    </button>
                  ) : null
                ) : null}
                <AnimatePresence initial={false}>
                  {showAllPublications ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-5">
                        {hiddenPublicationMaterials.map((material) => (
                          <ExternalMaterialLink key={material.id} material={material} />
                        ))}
                        <button
                          type="button"
                          onClick={collapsePublications}
                          className="font-editorial-sans mt-7 inline-flex items-center gap-1.5 text-[10px] uppercase leading-5 tracking-[0.14em] text-neutral-400 transition-colors duration-300 hover:text-neutral-700 sm:text-[11px]"
                          aria-expanded={showAllPublications}
                        >
                          свернуть список
                          <span aria-hidden="true" className="font-sans text-[9px] leading-none text-neutral-400">
                            ↑
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </MediaSection>

            <MediaSection title="репортажи" hasTopBorder={false}>
              <div className="grid gap-4 md:grid-cols-2">
                {cultureReports.map((material) => (
                  <ExternalMaterialLink key={material.id} material={material} variant="featured" />
                ))}
              </div>
            </MediaSection>

            {hasPhotoCollections ? (
              <MediaSection title="Фоторепортажи" eyebrow="фото">
                <div className="grid gap-4 md:grid-cols-2">
                  {mediaCollections.map((collection) => (
                    <a
                      key={collection.id}
                      href={collection.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group block border border-black/10 bg-white px-5 py-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-black/20 sm:px-7"
                    >
                      <p className="font-editorial-sans text-[10px] uppercase leading-5 tracking-[0.16em] text-neutral-500">
                        {collection.source} / {collection.date}
                      </p>
                      <h3 className="font-editorial-serif mt-5 text-[1.6rem] font-normal leading-[1.12] text-neutral-950">
                        {collection.title}
                      </h3>
                    </a>
                  ))}
                </div>
              </MediaSection>
            ) : null}

            <section className="border-y border-black/10 py-8 sm:py-10">
              <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
                <p className="font-editorial-serif text-[1.45rem] leading-8 text-neutral-900 sm:text-[1.72rem] sm:leading-9">
                  Все записи трансляций доступны в отдельном разделе.
                </p>
                <Link
                  to="/translyatsii"
                  className="font-editorial-sans group inline-flex items-center gap-2 justify-self-start border border-neutral-400 px-4 py-3 text-[11px] uppercase leading-none tracking-[0.14em] text-neutral-700 transition-colors duration-300 hover:border-neutral-900 hover:text-neutral-950 md:justify-self-end"
                >
                  Перейти к трансляциям
                  <ArrowUpRight
                    size={15}
                    strokeWidth={1.5}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </PageContainer>
    </motion.section>
  );
}
