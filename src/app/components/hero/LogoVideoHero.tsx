import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";

import festivalVideo from "../../../assets/hero/logo-film-wide.mp4";
import festivalPortraitVideo from "../../../assets/hero/logo-film-portrait.mp4";
import festivalPoster from "../../../assets/hero/logo-film-wide-poster.webp";
import festivalPortraitPoster from "../../../assets/hero/logo-film-portrait-poster.webp";
import "./LogoVideoHero.css";

function LogoFilm({ source, poster, offset = 0, onReady, paused }: {
  source: string;
  poster: string;
  offset?: number;
  onReady: () => void;
  paused?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hasFrame, setHasFrame] = useState(false);
  const pausedRef = useRef(paused);
  const syncPlaybackRef = useRef<() => void>(() => {});
  useEffect(() => {
    pausedRef.current = paused;
    syncPlaybackRef.current();
  }, [paused]);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = true;
    let notified = false;
    let readyFrame = 0;
    let disposed = false;
    let started = false;
    let offsetApplied = false;
    let autoplayBlocked = false;
    // Set the media properties before play(), including on Safari's first mount.
    video.defaultMuted = true;
    video.muted = true;
    const revealWhenReady = () => {
      if (!started || video.paused || video.seeking || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      window.cancelAnimationFrame(readyFrame);
      readyFrame = window.requestAnimationFrame(() => {
        if (disposed || !started || video.paused || video.seeking || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
        setHasFrame(true);
        if (!notified) {
          notified = true;
          onReady();
        }
      });
    };
    const sync = () => {
      if (pausedRef.current || !inView || document.hidden || motion.matches) {
        video.pause();
        autoplayBlocked = false;
      } else {
        void video.play().then(() => {
          if (!disposed) autoplayBlocked = false;
        }).catch((error: unknown) => {
          if (!disposed && !pausedRef.current && inView && !document.hidden && !motion.matches) {
            autoplayBlocked = error instanceof DOMException && error.name === "NotAllowedError";
          }
        });
      }
    };
    syncPlaybackRef.current = sync;
    const ready = () => {
      sync();
      revealWhenReady();
    };
    const playing = () => {
      started = true;
      autoplayBlocked = false;
      // Seeking before playback is allowed can discard Safari's poster and leave a grey box.
      if (!offsetApplied && Number.isFinite(video.duration) && offset > 0) {
        offsetApplied = true;
        video.currentTime = Math.min(offset, video.duration / 2);
      }
      revealWhenReady();
    };
    const failed = () => {
      started = false;
      setHasFrame(false);
      autoplayBlocked = false;
    };
    const seeking = () => setHasFrame(false);
    const stopped = () => {
      started = false;
      setHasFrame(false);
    };
    const resumeFromGesture = () => {
      if (autoplayBlocked) sync();
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
    video.addEventListener("seeking", seeking);
    video.addEventListener("playing", playing);
    video.addEventListener("pause", stopped);
    video.addEventListener("error", failed);
    document.addEventListener("visibilitychange", sync);
    document.addEventListener("click", resumeFromGesture);
    document.addEventListener("touchend", resumeFromGesture, { passive: true });
    document.addEventListener("keydown", resumeFromGesture);
    motion.addEventListener("change", sync);
    if (video.readyState >= 1) ready();
    else sync();
    return () => {
      disposed = true;
      syncPlaybackRef.current = () => {};
      observer.disconnect();
      window.cancelAnimationFrame(readyFrame);
      video.removeEventListener("loadedmetadata", ready);
      video.removeEventListener("loadeddata", revealWhenReady);
      video.removeEventListener("canplay", revealWhenReady);
      video.removeEventListener("seeked", revealWhenReady);
      video.removeEventListener("seeking", seeking);
      video.removeEventListener("playing", playing);
      video.removeEventListener("pause", stopped);
      video.removeEventListener("error", failed);
      document.removeEventListener("visibilitychange", sync);
      document.removeEventListener("click", resumeFromGesture);
      document.removeEventListener("touchend", resumeFromGesture);
      document.removeEventListener("keydown", resumeFromGesture);
      motion.removeEventListener("change", sync);
      video.pause();
    };
  }, [offset, onReady, source]);
  // Use play() above: Safari can force native controls onto autoplay elements in Low Power Mode.
  return <video ref={ref} src={source} poster={poster} muted loop playsInline controls={false} disablePictureInPicture disableRemotePlayback tabIndex={-1} preload="auto" data-has-frame={hasFrame} aria-hidden="true" />;
}

export function LogoVideoHero({ variant = "graphite", children, presentationTitleId, paused }: {
  variant?: "graphite" | "paper";
  children?: ReactNode;
  presentationTitleId?: string;
  paused?: boolean;
}) {
  const videoMassClipId = useId();
  const [readyFilms, setReadyFilms] = useState(0);
  const onFirstReady = useCallback(() => setReadyFilms((current) => current | 1), []);
  const onSecondReady = useCallback(() => setReadyFilms((current) => current | 2), []);
  return (
    <section id="home-old-hero" className={`logo-video-hero${variant === "paper" ? " logo-video-hero--paper" : ""}`} aria-labelledby={presentationTitleId ?? "logo-video-hero-title"}>
      <div className="logo-video-hero__emblem" data-mobile-menu-boundary data-video-ready={readyFilms === 3}>
        <div className="logo-video-hero__heading" aria-hidden={presentationTitleId ? true : undefined}>
          <p className="logo-video-hero__status">Фестиваль состоялся</p>
        </div>
        <p className="logo-video-hero__year" aria-hidden={presentationTitleId ? true : undefined}>2026</p>
        <div className="logo-video-hero__mass logo-video-hero__mass--first" style={{ backgroundImage: `url(${festivalPoster})` }}><LogoFilm source={festivalVideo} poster={festivalPoster} onReady={onFirstReady} paused={paused} /></div>
        <div className="logo-video-hero__mass logo-video-hero__mass--second" style={{ backgroundImage: `url(${festivalPortraitPoster})` }}><LogoFilm source={festivalPortraitVideo} poster={festivalPortraitPoster} offset={9} onReady={onSecondReady} paused={paused} /></div>
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
      <h1 id="logo-video-hero-title" className="logo-video-hero__title" aria-label="Композиторы XXI века" aria-hidden={presentationTitleId ? true : undefined}>композиторы<span>xxı века</span></h1>
      <div className="logo-video-hero__metadata" aria-hidden={presentationTitleId ? true : undefined}><p>10–31 мая</p><p>Москва · Галерея НИКО</p><p>15 концертов</p></div>
      {children}
      <span data-hero-rail-trigger className="logo-video-hero__rail-trigger" aria-hidden="true" />
    </section>
  );
}
