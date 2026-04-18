import { ArrowUpRight } from "lucide-react";
import { partners } from "../data/site";
import { PageContainer } from "../layout/PageContainer";

export function PartnersPage() {
  return (
    <section className="pb-36 pt-32 sm:pb-44 sm:pt-38">
      <PageContainer className="space-y-10">
        <div className="space-y-8 border-t border-black/10 pt-8">
          <div className="space-y-8 pt-2">
            {partners.map((partner) => (
              <div key={partner.name} className="grid gap-6 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-start sm:gap-x-8">
                <div className="flex min-h-24 items-center">
                  <img src={partner.image} alt={partner.name} className="h-auto max-h-24 w-full max-w-[120px] object-contain object-left" />
                </div>

                <div className="max-w-3xl pr-2">
                  <div className="flex items-start justify-between gap-5">
                    <div className="space-y-3">
                      {partner.description ? (
                        <p className="font-editorial-serif text-[17px] leading-[1.62] text-[var(--color-muted)] sm:text-[18px] sm:leading-[1.65]">
                          {partner.description}
                        </p>
                      ) : null}
                    </div>

                    {partner.link ? (
                      <a
                        href={partner.link}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Перейти на сайт: ${partner.name}`}
                        className="mt-1 mr-[-15px] inline-flex h-8 w-8 shrink-0 items-center justify-center text-[var(--color-muted)] transition-all duration-200 hover:-translate-y-[2px] hover:translate-x-[2px] hover:text-[var(--color-text)]"
                      >
                        <ArrowUpRight size={18} strokeWidth={1.5} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
