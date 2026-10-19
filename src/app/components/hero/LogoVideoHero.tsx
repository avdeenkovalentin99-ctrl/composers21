import { useCallback, useEffect, useId, useRef, useState } from "react";

import festivalVideo from "../../../../herovidv2.mp4";
import festivalPortraitVideo from "../../../../herovidmob.mp4";
import "./LogoVideoHero.css";

function LogoFilm({ source, offset = 0, onReady }: { source: string; offset?: number; onReady: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = true;
    let notified = false;
    let readyFrame = 0;
    const revealWhenReady = () => {
      if (notified || video.seeking || video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;
      window.cancelAnimationFrame(readyFrame);
      readyFrame = window.requestAnimationFrame(() => {
        if (video.seeking || video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;
        notified = true;
        onReady();
      });
    };
    const sync = () => {
      if (!inView || document.hidden || motion.matches) video.pause();
      else void video.play().catch(() => {});
    };
    const ready = () => {
      if (Number.isFinite(video.duration) && offset > 0) video.currentTime = Math.min(offset, video.duration / 2);
      sync();
      revealWhenReady();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(video);
    video.addEventListener("loadedmetadata", ready);
    video.addEventListener("loadeddata", revealWhenReady);
    video.addEventListener("canplay", revealWhenReady);
    video.addEventListener("seeked", revealWhenReady);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    if (video.readyState >= 1) ready();
    else sync();
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(readyFrame);
      video.removeEventListener("loadedmetadata", ready);
      video.removeEventListener("loadeddata", revealWhenReady);
      video.removeEventListener("canplay", revealWhenReady);
      video.removeEventListener("seeked", revealWhenReady);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      video.pause();
    };
  }, [offset, onReady, source]);
  return <video ref={ref} src={source} muted loop playsInline preload="auto" aria-hidden="true" />;
}

export function LogoVideoHero({ variant = "graphite" }: { variant?: "graphite" | "paper" }) {
  const videoMassClipId = useId();
  const [readyFilms, setReadyFilms] = useState(0);
  const onFirstReady = useCallback(() => setReadyFilms((current) => current | 1), []);
  const onSecondReady = useCallback(() => setReadyFilms((current) => current | 2), []);
  return (
    <section id="home-old-hero" className={`logo-video-hero${variant === "paper" ? " logo-video-hero--paper" : ""}`} aria-labelledby="logo-video-hero-title">
      <div className="logo-video-hero__emblem" data-mobile-menu-boundary data-video-ready={readyFilms === 3}>
        <div className="logo-video-hero__heading">
          <p className="logo-video-hero__status">Фестиваль состоялся</p>
        </div>
        <p className="logo-video-hero__year">2026</p>
        <div className="logo-video-hero__mass logo-video-hero__mass--first"><LogoFilm source={festivalVideo} onReady={onFirstReady} /></div>
        <div className="logo-video-hero__mass logo-video-hero__mass--second"><LogoFilm source={festivalPortraitVideo} offset={9} onReady={onSecondReady} /></div>
        <svg aria-hidden="true" className="logo-video-hero__drawing" viewBox="0 0 256 185" fill="none" focusable="false">
          <defs>
            <clipPath id={videoMassClipId}>
              <path d="M62 5h88v164H62z M170 21h46v158h-46z" />
            </clipPath>
          </defs>
          <path d="M6 104 C37 80 81 50 111 35 C129 24 132 31 124 47 C140 56 153 86 164 125 C170 103 178 91 195 84 C213 77 236 81 252 53" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          {variant === "paper" && (
            <path d="M6 104 C37 80 81 50 111 35 C129 24 132 31 124 47 C140 56 153 86 164 125 C170 103 178 91 195 84 C213 77 236 81 252 53" stroke="#fff" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" clipPath={`url(#${videoMassClipId})`} />
          )}
          <circle cx="237" cy="157" r="12.5" fill="#a50b35" />
        </svg>
      </div>
      <h1 id="logo-video-hero-title" className="logo-video-hero__title" aria-label="Композиторы XXI века">композиторы<span>xxı века</span></h1>
      <div className="logo-video-hero__metadata"><p>10–31 мая</p><p>Москва · Галерея НИКО</p><p>15 концертов</p></div>
      <span data-hero-rail-trigger className="logo-video-hero__rail-trigger" aria-hidden="true" />
    </section>
  );
}
