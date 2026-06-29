import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode, Ref } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  cultureReports,
  mediaCollections,
  mediaMaterials,
  type MediaMaterial,
} from "../data/media";
import { PageContainer } from "../layout/PageContainer";

const visibleMaterialCount = 4;

function MaterialCategoryBadge({ category }: { category: MediaMaterial["category"] }) {
  return (
    <span className="font-editorial-sans inline-flex border border-black/12 px-2 py-1 text-[10px] uppercase leading-none tracking-[0.08em] text-neutral-500 md:tracking-[0.16em]">
      {category}
    </span>
  );
}

function EditorialMaterialLink({
  material,
}: {
  material: MediaMaterial;
}) {
  return (
    <a
      href={material.url}
      target="_blank"
      rel="noreferrer"
      className="group box-border flex h-auto min-h-0 w-full flex-col border border-black/[0.08] px-5 py-[18px] transition-colors duration-300 hover:border-black/15 md:min-h-[10.75rem] md:border-black/[0.07] md:px-6 md:py-6"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 md:gap-x-4 md:gap-y-3">
        <MaterialCategoryBadge category={material.category} />
        <p className="font-editorial-sans text-[10px] uppercase leading-none tracking-[0.08em] text-neutral-500 md:text-[11px] md:leading-5 md:tracking-[0.16em]">
          {material.source}
        </p>
      </div>

      <h3 className="font-editorial-serif mt-4 max-w-none text-[18px] font-normal leading-[1.15] tracking-[-0.01em] text-neutral-950 md:text-[1.5rem] md:leading-[1.18]">
        {material.title}
      </h3>

      <div className="font-editorial-sans mt-auto flex flex-wrap items-center justify-between gap-x-5 gap-y-2 pt-[22px] text-[10px] uppercase leading-5 tracking-[0.12em] text-neutral-500 md:flex-nowrap md:items-end md:pt-5 md:text-[11px] md:tracking-[0.16em]">
        <span>{material.date}</span>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-neutral-700 transition-colors duration-300 group-hover:text-neutral-950">
          Открыть
          <ArrowUpRight
            size={15}
            strokeWidth={1.5}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
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
          "mb-5 md:mb-10",
          hasTopBorder ? "border-t border-black/10 pt-7 md:pt-9" : "",
        ].join(" ")}
      >
        {eyebrow ? (
          <p className="font-editorial-sans text-[10px] uppercase leading-5 tracking-[0.2em] text-neutral-400 md:text-[11px]">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={headingId}
          className={[
            "font-editorial-serif font-normal tracking-[-0.01em] text-neutral-950 md:text-[2.35rem] md:leading-[1.04]",
            "text-[28px] leading-none",
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
  const visibleMaterials = mediaMaterials.slice(0, visibleMaterialCount);
  const hiddenMaterials = mediaMaterials.slice(visibleMaterialCount);
  const [showAllMaterials, setShowAllMaterials] = useState(false);
  const materialsPanelId = "additional-media-materials";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="box-border pb-4 pt-24 text-neutral-950 md:pb-32 md:pt-40"
    >
      <PageContainer className="box-border !px-5 sm:!px-5 md:!px-8 lg:!px-12">
        <div className="mx-0 w-full max-w-none md:mx-auto md:max-w-6xl">
          <div className="space-y-[42px] md:space-y-24 lg:space-y-28">
            <section className="border-y border-black/10 py-6 md:py-10">
              <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:gap-6">
                <p className="font-editorial-serif text-[22px] leading-[1.35] text-neutral-900 md:text-[1.72rem] md:leading-9">
                  Трансляции концертов фестиваля собраны в отдельном разделе.
                </p>
                <Link
                  to="/translyatsii"
                  className="font-editorial-sans group inline-flex items-center gap-2 justify-self-start border border-neutral-400 px-4 py-3 text-[11px] uppercase leading-none tracking-[0.14em] text-neutral-700 transition-colors duration-300 hover:border-neutral-900 hover:text-neutral-950 md:justify-self-end"
                >
                  Архив трансляций
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
            </section>

            <MediaSection title="репортажи" hasTopBorder={false}>
              <div className="grid gap-[14px] md:grid-cols-2 md:gap-6">
                {cultureReports.map((material) => (
                  <EditorialMaterialLink key={material.id} material={material} />
                ))}
              </div>
            </MediaSection>

            <MediaSection
              title="СМИ о нас"
              hasTopBorder={false}
            >
              <div className="grid gap-[14px] md:grid-cols-2 md:gap-6">
                {visibleMaterials.map((material) => (
                  <EditorialMaterialLink key={material.id} material={material} />
                ))}
              </div>
              {!showAllMaterials ? (
                <button
                  type="button"
                  onClick={() => setShowAllMaterials(true)}
                  className="font-editorial-sans mb-12 mt-6 flex w-fit items-center gap-1.5 border-b border-black/15 pb-[3px] text-[14px] uppercase leading-5 tracking-[0.12em] text-neutral-600 transition-colors duration-300 hover:border-black/30 hover:text-neutral-950 md:mb-0 md:mt-8 md:inline-flex md:text-[11px] md:tracking-[0.14em]"
                  aria-expanded={showAllMaterials}
                  aria-controls={materialsPanelId}
                >
                  показать все материалы
                  <span aria-hidden="true">↓</span>
                </button>
              ) : null}
              <AnimatePresence initial={false}>
                {showAllMaterials ? (
                  <motion.div
                    id={materialsPanelId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-[14px] pt-[14px] md:grid-cols-2 md:gap-6 md:pt-6">
                      {hiddenMaterials.map((material) => (
                        <EditorialMaterialLink key={material.id} material={material} />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAllMaterials(false)}
                      className="font-editorial-sans mb-12 mt-7 flex w-fit items-center gap-1.5 text-[10px] uppercase leading-5 tracking-[0.14em] text-neutral-400 transition-colors duration-300 hover:text-neutral-700 md:mb-0 md:mt-8 md:inline-flex md:text-[11px]"
                      aria-expanded={showAllMaterials}
                      aria-controls={materialsPanelId}
                    >
                      свернуть список
                      <span aria-hidden="true">↑</span>
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
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

          </div>
        </div>
      </PageContainer>
    </motion.section>
  );
}
