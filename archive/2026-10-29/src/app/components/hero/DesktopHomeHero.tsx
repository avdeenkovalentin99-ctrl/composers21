import { type CSSProperties, type ReactNode } from "react";
import "./DesktopHomeHero.css";

const festivalTitle = "КОМПОЗИТОРЫ";

type HeroMediaProps = {
  name: "choir" | "violin" | "piano";
  src?: string;
  alt: string;
  position: string;
  children?: ReactNode;
};

function HeroMedia({ name, src, alt, position, children }: HeroMediaProps) {
  return (
    <div className={`festival-hero__media festival-hero__media--${name}`} style={{ "--media-position": position } as CSSProperties}>
      {src && (
        <img className="festival-hero__media-source" src={src} alt={alt} decoding="async" fetchPriority="high" />
      )}
      {children}
    </div>
  );
}

export function DesktopHomeHero({ variant = "paper" }: { variant?: "paper" | "graphite" }) {
  return (
    <section id="home-old-hero" className={`festival-hero${variant === "graphite" ? " festival-hero--graphite" : ""}`} aria-labelledby="festival-hero-title">
      <div className="festival-hero__composition">
        <div className="festival-hero__stage">
          <div className="festival-hero__band" aria-hidden="true" />
          <HeroMedia name="choir" src="/assets/hero/choir.png" alt="Дирижёр перед поющим хором" position="50% 48%" />
          <h1 id="festival-hero-title" className="festival-hero__title" aria-label="Композиторы XXI века">{festivalTitle}</h1>
          <p className="festival-hero__status">ФЕСТИВАЛЬ СОСТОЯЛСЯ</p>
          <p className="festival-hero__century" aria-hidden="true">XXI <span className="festival-hero__century-word">века</span></p>

          <HeroMedia name="piano" alt="" position="50% 54%" />
          <HeroMedia name="violin" alt="" position="50% 50%">
            <div className="festival-hero__clip" aria-hidden="true">
              <span className="festival-hero__title festival-hero__title--over-media">{festivalTitle}</span>
            </div>
          </HeroMedia>
          <span className="festival-hero__rail-trigger" data-hero-rail-trigger aria-hidden="true" />
        </div>
      </div>
      <p className="festival-hero__metadata">10–31 МАЯ 2026 · МОСКВА · ГАЛЕРЕЯ НИКО · 15 КОНЦЕРТОВ</p>
    </section>
  );
}
