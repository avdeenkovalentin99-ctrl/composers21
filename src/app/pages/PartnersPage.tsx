import { partners } from "../data/partners";
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
  general:
    "grid grid-cols-1 items-center justify-items-center gap-y-14 sm:grid-cols-2 sm:gap-x-16 sm:gap-y-18 lg:grid-cols-3 lg:gap-x-20",
  media:
    "grid grid-cols-2 items-center justify-items-center gap-x-10 gap-y-12 sm:grid-cols-3 sm:gap-x-14 sm:gap-y-16 lg:grid-cols-4 xl:grid-cols-5",
  partner:
    "grid grid-cols-2 items-center justify-items-center gap-x-8 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
};

const logoClassNames: Record<PartnerSectionVariant, string> = {
  general: "max-h-20 max-w-[220px] sm:max-h-24 sm:max-w-[280px] lg:max-h-28 lg:max-w-[330px]",
  media: "max-h-16 max-w-[160px] sm:max-h-[74px] sm:max-w-[190px]",
  partner: "max-h-12 max-w-[136px] sm:max-h-14 sm:max-w-[160px]",
};

const generalLogoScaleByImage: Record<string, string> = {
  "/assets/external/c20f321a__.svg": "scale-[0.82]",
  "/assets/partners/lifestyle-logo.png": "scale-[0.72] opacity-80",
  "/assets/partners/leaders-building-russia.png": "scale-[0.84] opacity-90",
};

function PartnerLogo({
  partner,
  variant,
}: {
  partner: PartnerItem;
  variant: PartnerSectionVariant;
}) {
  const className =
    "group relative flex min-h-20 w-full items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:opacity-80 sm:min-h-24";
  const scaleClassName = variant === "general" ? generalLogoScaleByImage[partner.image] ?? "opacity-90" : "";
  const logo = (
    <img
      src={partner.image}
      alt={partner.name}
      loading="lazy"
      decoding="async"
      className={`h-auto w-auto object-contain transition-all duration-300 ease-out ${logoClassNames[variant]} ${scaleClassName}`}
    />
  );

  if (!partner.link) {
    return <div className={className}>{logo}</div>;
  }

  return (
    <a
      href={partner.link}
      target="_blank"
      rel="noreferrer"
      aria-label={partner.name}
      title={partner.name}
      className={className}
    >
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
        {items.map((partner) => (
          <PartnerLogo key={partner.name} partner={partner} variant={variant} />
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
        <h1 className="sr-only">Партнёры фестиваля</h1>
        <div className="space-y-18 sm:space-y-22 lg:space-y-24">
          {sections.map((section) => (
            <PartnersSection key={section.variant} {...section} />
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
