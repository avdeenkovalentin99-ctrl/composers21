import { PageContainer } from "../../layout/PageContainer";
import { partners } from "../../data/site";
import { LinkArrow } from "../ui/LinkArrow";
import { SectionTitle } from "../ui/SectionTitle";

export function PartnersPreview() {
  const partner = partners[0];

  return (
    <section className="py-18 sm:py-24">
      <PageContainer>
        <div className="grid gap-10 border-y border-black/10 py-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <SectionTitle eyebrow="Партнёры">Площадка и институции, на которых держится фестивальная программа.</SectionTitle>
            <LinkArrow to="/partners">Партнёры</LinkArrow>
          </div>

          <article className="grid gap-6 border border-black/10 bg-[var(--color-panel)] p-6 sm:grid-cols-[180px_1fr] sm:p-8">
            <img src={partner.image} alt={partner.name} className="h-24 w-24 object-contain sm:h-32 sm:w-32" />
            <div className="space-y-4">
              <p className="text-[0.68rem] uppercase tracking-[0.26em] text-[var(--color-muted)]">{partner.role}</p>
              <h3 className="text-2xl font-light tracking-[-0.03em]">{partner.name}</h3>
              <p className="text-sm leading-7 text-[var(--color-muted)]">{partner.description}</p>
              {partner.link ? (
                <a href={partner.link} target="_blank" rel="noreferrer" className="inline-flex text-sm uppercase tracking-[0.16em] transition-colors hover:text-[var(--color-muted)]">
                  Открыть сайт
                </a>
              ) : null}
            </div>
          </article>
        </div>
      </PageContainer>
    </section>
  );
}
