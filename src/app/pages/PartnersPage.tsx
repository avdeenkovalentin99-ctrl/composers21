import { partners } from "../data/site";
import type { PartnerItem } from "../data/types";
import { PageContainer } from "../layout/PageContainer";

type PartnerSectionVariant = "general" | "media" | "partner";

type PartnerSection = {
  title: string;
  items: PartnerItem[];
  variant: PartnerSectionVariant;
  className?: string;
};

const sectionShellClassName = "space-y-8 sm:space-y-10";

const sectionTitleClassName =
  "font-editorial-sans text-center text-[11px] font-light uppercase tracking-[0.18em] text-neutral-950/50 sm:text-[12px]";

const gridClassNames: Record<PartnerSectionVariant, string> = {
  general: "grid grid-cols-1 items-center justify-items-center gap-y-16 sm:grid-cols-2 sm:gap-x-20 sm:gap-y-20 lg:grid-cols-3 lg:gap-x-24",
  media: "grid grid-cols-2 items-center justify-items-center gap-x-10 gap-y-12 sm:grid-cols-3 sm:gap-x-14 sm:gap-y-16 lg:grid-cols-4 xl:grid-cols-5",
  partner: "grid grid-cols-2 items-center justify-items-center gap-x-8 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
};

const logoClassNames: Record<PartnerSectionVariant, string> = {
  general: "max-h-28 max-w-[280px] sm:max-h-32 sm:max-w-[360px] lg:max-h-36 lg:max-w-[430px]",
  media: "max-h-16 max-w-[160px] sm:max-h-[74px] sm:max-w-[190px]",
  partner: "max-h-12 max-w-[136px] sm:max-h-14 sm:max-w-[160px]",
};

const generalLogoScaleByName: Record<string, string> = {
  "Галерея НИКО": "scale-[0.84]",
  "Île Thélème": "scale-[0.82]",
};

function PartnerLogo({
  partner,
  variant,
  index,
}: {
  partner: PartnerItem;
  variant: PartnerSectionVariant;
  index: number;
}) {
  const rhythmClassName = variant === "general" && index % 2 === 1 ? "lg:translate-y-8" : "";
  const className = `group relative flex min-h-24 w-full items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:opacity-75 sm:min-h-28 ${rhythmClassName}`;
  const scaleClassName = variant === "general" ? generalLogoScaleByName[partner.name] ?? "" : "";
  const logo = (
    <>
      <img
        src={partner.image}
        alt={partner.name}
        className={`h-auto w-auto object-contain transition-all duration-300 ease-out ${logoClassNames[variant]} ${scaleClassName}`}
      />
      <span className="pointer-events-none absolute left-1/2 top-full mt-5 -translate-x-1/2 whitespace-nowrap font-editorial-sans text-[10px] uppercase tracking-[0.24em] text-neutral-500/0 transition-colors duration-300 ease-out group-hover:text-neutral-500/55">
        {partner.name}
      </span>
    </>
  );

  if (!partner.link) {
    return <div className={className}>{logo}</div>;
  }

  return (
    <a href={partner.link} target="_blank" rel="noreferrer" aria-label={partner.name} title={partner.name} className={className}>
      {logo}
    </a>
  );
}

function PartnersSection({ title, items, variant, className = "" }: PartnerSection) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={`${sectionShellClassName} ${className}`} aria-labelledby={`partners-${variant}`}>
      <h2 id={`partners-${variant}`} className={sectionTitleClassName}>
        {title}
      </h2>

      <div className={gridClassNames[variant]}>
        {items.map((partner, index) => (
          <PartnerLogo key={partner.name} partner={partner} variant={variant} index={index} />
        ))}
      </div>
    </section>
  );
}

export function PartnersPage() {
  const sections: PartnerSection[] = [
    {
      title: "Генеральные партнёры",
      items: partners.filter((partner) => partner.tier === "general"),
      variant: "general",
    },
    {
      title: "Медиа-партнёры",
      items: partners.filter((partner) => partner.tier === "media"),
      variant: "media",
      className: "pt-10 sm:pt-14 lg:pt-18",
    },
    {
      title: "Партнёры",
      items: partners.filter((partner) => partner.tier === "partner"),
      variant: "partner",
    },
  ];

  return (
    <section className="pb-36 pt-32 sm:pb-44 sm:pt-40">
      <PageContainer className="mx-auto max-w-[1180px]">
        <div className="space-y-18 sm:space-y-22 lg:space-y-24">
          {sections.map((section) => (
            <PartnersSection key={section.variant} {...section} />
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
