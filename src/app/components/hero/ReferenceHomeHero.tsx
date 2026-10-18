import { VideoHomeHero } from "./VideoHomeHero";
import "./ReferenceHomeHero.css";


export function ReferenceHomeHero() {
  return (
    <section id="home-old-hero" className="reference-hero" aria-labelledby="home-hero-title">
      <VideoHomeHero />
      <div className="reference-hero__year-status">
        <p className="reference-hero__year">2026</p>
        <p className="reference-hero__status">Фестиваль состоялся</p>
      </div>
      <h1 id="home-hero-title" className="reference-hero__brand">
        <span className="sr-only">Композиторы XXI века</span>
        <img className="reference-hero__logo" src="/assets/hero/festival-logo-inverse.svg" alt="" aria-hidden="true" fetchPriority="high" />
      </h1>
      <div className="reference-hero__metadata">
        <p className="reference-hero__dates">10–31 мая</p>
        <p>Москва · Галерея НИКО</p>
        <p>15 концертов</p>
      </div>
      <span data-hero-rail-trigger className="reference-hero__rail-trigger" aria-hidden="true" />
    </section>
  );
}
