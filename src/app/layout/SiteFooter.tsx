import { Send } from "lucide-react";
import { festivalInfo, siteTitle } from "../data/site";
import { PageContainer } from "./PageContainer";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-neutral-200 pb-7 pt-10">
      <PageContainer>
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="shrink-0">
            <p className="font-editorial-serif text-base leading-[1.4] text-neutral-800">
              {siteTitle}
            </p>
            <p className="mt-4 font-editorial-sans text-sm leading-[1.6] text-neutral-500/70">
              © 2026
            </p>
          </div>

          <div className="flex items-start gap-4 md:gap-5">
            <div className="space-y-2 text-left md:max-w-[420px]">
              <p className="font-editorial-sans text-sm leading-[1.6] text-neutral-500/70">
                {festivalInfo.dates} · {festivalInfo.city}, {festivalInfo.venue}
              </p>
              <p className="font-editorial-sans text-sm leading-[1.6] text-neutral-500/70">
                <a
                  href={`tel:${festivalInfo.phone.replace(/\s+/g, "")}`}
                  className="transition-colors duration-200 hover:text-neutral-900"
                >
                  {festivalInfo.phone}
                </a>{" "}
                ·{" "}
                <a
                  href={`mailto:${festivalInfo.email}`}
                  className="transition-colors duration-200 hover:text-neutral-900"
                >
                  {festivalInfo.email}
                </a>
              </p>
            </div>

            <div className="flex items-center gap-2 pt-[1px]">
              <a
                href={festivalInfo.telegram}
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-500/80 transition-colors duration-200 hover:border-neutral-900 hover:text-neutral-900"
              >
                <Send size={14} strokeWidth={1.8} />
              </a>
              <span
                aria-label="VK"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 font-editorial-sans text-[11px] tracking-[0.04em] text-neutral-500/80 transition-colors duration-200 hover:border-neutral-900 hover:text-neutral-900"
              >
                VK
              </span>
            </div>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
