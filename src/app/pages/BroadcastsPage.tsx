import { motion } from "motion/react";
import { broadcasts, type BroadcastItem } from "../data/broadcasts";
import { PageContainer } from "../layout/PageContainer";

const cardOffsets = [
  "md:translate-x-0",
  "md:translate-x-4",
  "md:-translate-x-2",
  "md:translate-x-6",
  "md:translate-x-1",
];

type BroadcastRowsVariant = "featured" | "archive";

function getDayStart(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
}

function getBroadcastDayStart(broadcast: BroadcastItem) {
  return getDayStart(new Date(broadcast.dateTime));
}

function getBroadcastGroups(currentDate = new Date()) {
  const todayStart = getDayStart(currentDate);
  const orderedBroadcasts = [...broadcasts].sort(
    (first, second) => new Date(first.dateTime).getTime() - new Date(second.dateTime).getTime(),
  );
  const featuredBroadcast =
    orderedBroadcasts.find((broadcast) => getBroadcastDayStart(broadcast) >= todayStart) ?? null;
  const featuredBroadcastDayStart = featuredBroadcast ? getBroadcastDayStart(featuredBroadcast) : null;

  return {
    featuredBroadcast,
    featuredLabel:
      featuredBroadcastDayStart === null
        ? null
        : featuredBroadcastDayStart === todayStart
          ? "Сегодняшняя трансляция"
          : "Ближайшая трансляция",
    archiveBroadcasts: orderedBroadcasts
      .filter((broadcast) => getBroadcastDayStart(broadcast) < todayStart)
      .reverse(),
  };
}

function getDisplayStatus(broadcast: BroadcastItem, isArchived: boolean) {
  return isArchived ? "Запись" : broadcast.status;
}

function BroadcastRows({
  broadcast,
  variant,
}: {
  broadcast: BroadcastItem;
  variant: BroadcastRowsVariant;
}) {
  const rows = [
    { label: "Композиторы", value: broadcast.composers },
    { label: "Исполнители", value: broadcast.performers },
  ];
  const valueClassName =
    variant === "featured"
      ? "font-editorial-serif text-[1.05rem] leading-7 text-neutral-700 sm:text-[1.12rem] sm:leading-8"
      : "font-editorial-serif text-[1rem] leading-7 text-neutral-700";

  return (
    <div className="mt-7 grid gap-4 border-t border-black/8 pt-5 sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-x-8 sm:gap-y-4">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <p className="font-editorial-sans text-[10px] uppercase leading-5 tracking-[0.18em] text-neutral-400">
            {row.label}
          </p>
          <p className={valueClassName}>{row.value}</p>
        </div>
      ))}
    </div>
  );
}

function BroadcastCta({ broadcast, isCardLinked = false }: { broadcast: BroadcastItem; isCardLinked?: boolean }) {
  const className =
    "font-editorial-sans inline-flex items-center gap-1.5 border-b border-black/16 pb-[3px] text-[11px] uppercase leading-5 tracking-[0.14em] text-neutral-600 transition-colors duration-300 group-hover:border-black/30 group-hover:text-neutral-900 sm:text-[12px]";
  const label = broadcast.cta.replace(/\s*↗\s*$/u, "");
  const content = (
    <>
      {label}
      <span aria-hidden="true" className="font-sans leading-none">
        {"\u2197\uFE0E"}
      </span>
    </>
  );

  if (broadcast.url === "#") {
    return (
      <span className={className} aria-disabled="true">
        {content}
      </span>
    );
  }

  if (isCardLinked) {
    return <span className={className}>{content}</span>;
  }

  return (
    <a href={broadcast.url} target="_blank" rel="noreferrer" className={className}>
      {content}
    </a>
  );
}

function FeaturedBroadcast({
  broadcast,
  label,
}: {
  broadcast: BroadcastItem;
  label: string;
}) {
  const isLinked = broadcast.url !== "#";
  const content = (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)] lg:gap-12">
      <div>
        <p className="font-editorial-sans text-[10px] uppercase leading-5 tracking-[0.2em] text-neutral-400 sm:text-[11px]">
          {label}
        </p>
        <p className="font-editorial-sans mt-8 text-[10px] uppercase leading-5 tracking-[0.18em] text-neutral-500 sm:text-[11px]">
          {broadcast.date} / {broadcast.time}
        </p>
      </div>

      <div>
        <h2 className="font-editorial-serif max-w-[760px] text-[2rem] font-normal leading-[1.08] tracking-[-0.01em] text-neutral-950 sm:text-[2.65rem] sm:leading-[1.04] lg:text-[3.05rem]">
          {broadcast.title}
        </h2>

        <BroadcastRows broadcast={broadcast} variant="featured" />

        <div className="mt-8 border-t border-black/8 pt-5">
          <BroadcastCta broadcast={broadcast} isCardLinked={isLinked} />
        </div>
      </div>
    </div>
  );
  const className =
    "group block border border-black/10 bg-white px-5 py-7 transition-colors duration-300 hover:border-black/16 sm:px-8 sm:py-9 lg:px-10 lg:py-10";

  if (isLinked) {
    return (
      <motion.a
        href={broadcast.url}
        target="_blank"
        rel="noreferrer"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={className}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {content}
    </motion.article>
  );
}

function ArchiveBroadcastCard({
  broadcast,
  index,
  totalCount,
}: {
  broadcast: BroadcastItem;
  index: number;
  totalCount: number;
}) {
  const offsetClassName = cardOffsets[index % cardOffsets.length];
  const isLinked = broadcast.url !== "#";
  const content = (
    <>
      <div className="flex items-start justify-between gap-5">
        <p className="font-editorial-sans text-[10px] uppercase leading-5 tracking-[0.18em] text-neutral-500 sm:text-[11px]">
          {broadcast.date} / {broadcast.time}
        </p>
        <p className="font-editorial-sans whitespace-nowrap text-[10px] uppercase leading-5 tracking-[0.18em] text-neutral-500">
          {getDisplayStatus(broadcast, true)}
        </p>
      </div>

      <h3 className="font-editorial-serif mt-8 max-w-[780px] text-[1.78rem] font-normal leading-[1.12] tracking-[-0.01em] text-neutral-950 sm:text-[2.18rem] sm:leading-[1.08] lg:text-[2.55rem]">
        {broadcast.title}
      </h3>

      <BroadcastRows broadcast={broadcast} variant="archive" />

      <div className="mt-8 border-t border-black/8 pt-5">
        <BroadcastCta broadcast={broadcast} isCardLinked={isLinked} />
      </div>
    </>
  );
  const className = [
    "group relative block border border-black/10 bg-white px-5 py-6 transition-[border-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-black/18 sm:px-7 sm:py-7 lg:px-9 lg:py-8",
    index > 0 ? "-mt-px md:-mt-2" : "",
    offsetClassName,
  ].join(" ");

  if (isLinked) {
    return (
      <motion.a
        href={broadcast.url}
        target="_blank"
        rel="noreferrer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: index * 0.045, ease: [0.22, 1, 0.36, 1] }}
        className={className}
        style={{ zIndex: totalCount - index }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: index * 0.045, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={{ zIndex: totalCount - index }}
    >
      {content}
    </motion.article>
  );
}

export function BroadcastsPage() {
  const { featuredBroadcast, featuredLabel, archiveBroadcasts } = getBroadcastGroups();

  return (
    <section className="min-h-screen bg-[var(--color-bg)] pb-24 pt-32 text-neutral-950 sm:pb-32 sm:pt-40">
      <PageContainer>
        <div className="mx-auto max-w-6xl">
          <h1 className="sr-only">Трансляции</h1>

          <div>
            {featuredBroadcast && featuredLabel ? (
              <FeaturedBroadcast broadcast={featuredBroadcast} label={featuredLabel} />
            ) : null}
          </div>

          <section
            className={featuredBroadcast ? "mt-18 sm:mt-22 lg:mt-24" : ""}
            aria-labelledby="broadcasts-archive-heading"
          >
            <div className="mb-10 border-t border-black/10 pt-8 sm:mb-12 sm:pt-10">
              <h2
                id="broadcasts-archive-heading"
                className="font-editorial-serif text-[1.9rem] font-normal leading-[0.98] tracking-[0.06em] text-neutral-900 sm:text-[2.35rem] lg:text-[2.8rem]"
              >
                архив фестиваля
              </h2>
            </div>

            {archiveBroadcasts.length > 0 ? (
              <div className="mx-auto max-w-[920px] pb-4 md:pl-8 md:pr-18">
                {archiveBroadcasts.map((broadcast, index) => (
                  <ArchiveBroadcastCard
                    key={broadcast.id}
                    broadcast={broadcast}
                    index={index}
                    totalCount={archiveBroadcasts.length}
                  />
                ))}
              </div>
            ) : (
              <p className="font-editorial-sans text-[11px] uppercase leading-5 tracking-[0.18em] text-neutral-400">
                Архив появится после первых трансляций.
              </p>
            )}
          </section>
        </div>
      </PageContainer>
    </section>
  );
}
