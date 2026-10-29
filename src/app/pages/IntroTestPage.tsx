import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { useReducedMotion } from "motion/react";
import { LogoVideoHero } from "../components/hero/LogoVideoHero";
import { FestivalIntro } from "../components/hero/FestivalIntro";
import { IntroStorySections } from "../components/intro/IntroStorySections";
import { applyPageMeta } from "../utils/pageMeta";
import "./IntroTestPage.css";

type IntroPhase = "hero" | "entering" | "open" | "returning";

export function IntroTestPage() {
  const [phase, setPhase] = useState<IntroPhase>("hero");
  const [revealed, setRevealed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [activeScene, setActiveScene] = useState<1 | 2 | 3>(1);
  const [stageHeight, setStageHeight] = useState(0);
  const [pinTop, setPinTop] = useState(0);
  const reducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const presentationRef = useRef<HTMLDivElement>(null);
  const entryScrollRef = useRef(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  // This synchronous guard also covers two clicks before React commits a render.
  const phaseRef = useRef<IntroPhase>("hero");

  useEffect(() => {
    applyPageMeta({
      title: "Внутри фестиваля — тест презентации",
      description: "Тест перехода из hero в историю фестиваля «Композиторы XXI века».",
      canonicalPath: "/intro-test",
      robots: "noindex, nofollow",
    });
    let cancelled = false;
    const portrait = new Image();
    portrait.src = "/assets/hero/intro3w.png";
    void portrait.decode().catch(() => {});
    // Load the exact Cyrillic faces/weights before the entry control is enabled.
    void Promise.allSettled([
      document.fonts.load('400 64px "EB Garamond"', "три недели современной музыки"),
      document.fonts.load('300 48px "Cormorant Garamond"', "композиторы"),
      document.fonts.load('300 18px "Manrope"', "внутри фестиваля"),
      document.fonts.load('400 20px "Manrope"', "С 10 по 31 мая"),
    ]).then(() => { if (!cancelled) setFontsReady(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (phase !== "entering") return;
    if (document.activeElement === buttonRef.current) titleRef.current?.focus({ preventScroll: true });
    const pauseTimer = window.setTimeout(() => setPaused(true), reducedMotion ? 180 : 900);
    const completeTimer = window.setTimeout(() => {
      phaseRef.current = "open";
      setPhase("open");
    }, reducedMotion ? 260 : 1250);
    return () => {
      window.clearTimeout(pauseTimer);
      window.clearTimeout(completeTimer);
    };
  }, [phase, reducedMotion]);

  useEffect(() => {
    if (phase === "hero") return;
    let frame = 0;
    const updateScene = () => {
      frame = 0;
      if (phaseRef.current === "entering") return;
      const progress = Math.max(0, window.scrollY - entryScrollRef.current) / Math.max(1, stageHeight);
      setActiveScene(Math.min(3, Math.floor(progress + 0.35) + 1) as 1 | 2 | 3);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScene);
    };
    const resizeObserver = new ResizeObserver(() => {
      const height = heroRef.current?.getBoundingClientRect().height;
      if (height) setStageHeight(height);
      schedule();
    });
    if (heroRef.current) resizeObserver.observe(heroRef.current);
    window.addEventListener("scroll", schedule, { passive: true });
    updateScene();
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      resizeObserver.disconnect();
    };
  }, [phase, stageHeight]);

  useEffect(() => {
    if (phase !== "returning") return;
    const hero = heroRef.current;
    if (!hero) return;
    let frame = 0;
    let finishTimer = 0;
    let arrived = false;
    let stableFrames = 0;
    let cancelled = false;
    const startedAt = performance.now();
    const scrollTarget = (presentationRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;

    const cancelReturn = () => {
      if (cancelled) return;
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(finishTimer);
      setRevealed(true);
      setPaused(true);
      phaseRef.current = "open";
      setPhase("open");
    };
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) cancelReturn();
    };
    const watchArrival = () => {
      if (cancelled) return;
      const atTop = Math.abs(window.scrollY - scrollTarget) < 2;
      if (!arrived && performance.now() - startedAt > 4000) { cancelReturn(); return; }
      if (arrived && !atTop) { cancelReturn(); return; }
      stableFrames = atTop ? stableFrames + 1 : 0;
      if (!arrived && stableFrames >= 2) {
        arrived = true;
        setActiveScene(1);
        // Resume under the opaque black masses, then reveal the existing frames.
        setPaused(false);
      }
      if (arrived && stableFrames === 4) {
        setRevealed(false);
        finishTimer = window.setTimeout(() => {
          if (cancelled) return;
          phaseRef.current = "hero";
          setPhase("hero");
          buttonRef.current?.focus({ preventScroll: true });
        }, reducedMotion ? 240 : 950);
      }
      frame = window.requestAnimationFrame(watchArrival);
    };
    window.scrollTo({ top: scrollTarget, behavior: reducedMotion ? "instant" : "smooth" });
    frame = window.requestAnimationFrame(watchArrival);
    // Native scrolling remains available; deliberate scrolling cancels the return.
    window.addEventListener("wheel", cancelReturn, { passive: true });
    window.addEventListener("touchstart", cancelReturn, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(finishTimer);
      window.removeEventListener("wheel", cancelReturn);
      window.removeEventListener("touchstart", cancelReturn);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, reducedMotion]);

  function openPresentation() {
    if (phaseRef.current !== "hero" || !fontsReady) return;
    const hero = heroRef.current;
    if (!hero) return;
    setStageHeight(hero.getBoundingClientRect().height);
    setPinTop(Math.min(0, hero.getBoundingClientRect().top));
    entryScrollRef.current = window.scrollY;
    setActiveScene(1);
    phaseRef.current = "entering";
    setPhase("entering");
    setRevealed(true);
  }

  function returnToHero(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (phaseRef.current !== "open") return;
    phaseRef.current = "returning";
    setPhase("returning");
  }

  const expanded = phase !== "hero";
  return (
    <main className="intro-test" data-phase={phase} data-revealed={revealed} data-scene={activeScene}
      style={{ "--intro-stage-height": `${stageHeight}px`, "--intro-pin-top": `${pinTop}px` } as CSSProperties}>
      <div ref={presentationRef} className="intro-test__presentation">
        <div className="intro-test__stage">
        <div id="intro-start" ref={heroRef} className="intro-test__hero" aria-hidden={activeScene !== 1 || undefined} inert={activeScene !== 1}>
          <LogoVideoHero variant="paper" paused={paused} presentationTitleId={revealed ? "intro-story-title" : undefined}>
            <div className="intro-test__first-copy" aria-hidden={!revealed} inert={!revealed}>
              <h2 id="intro-story-title" ref={titleRef} tabIndex={-1}>
                <span>три недели</span>
                <span>современной</span>
                <span>музыки</span>
              </h2>
              <p>С 10 по 31 мая 2026 года в московской галерее НИКО прошёл первый фестиваль «Композиторы XXI века».</p>
            </div>
            <button
              ref={buttonRef}
              type="button"
              className="intro-test__entry"
              onClick={openPresentation}
              aria-expanded={expanded}
              aria-controls="intro-story-title intro-story-sections"
              aria-hidden={expanded || undefined}
              aria-disabled={expanded || !fontsReady}
              tabIndex={expanded ? -1 : 0}
            >
              <span className="intro-test__corner intro-test__corner--start" aria-hidden="true" />
              <span>внутри фестиваля</span>
              <span className="intro-test__corner intro-test__corner--end" aria-hidden="true" />
            </button>
          </LogoVideoHero>
        </div>
        {expanded && <div id="intro-story-sections" className="intro-test__scenes"><IntroStorySections activeScene={activeScene} /></div>}
        {expanded && (
          <nav className="intro-test__home-nav" aria-label="Управление презентацией">
            <a href="#intro-start" onClick={returnToHero} aria-disabled={phase !== "open"} className="intro-test__return">НА ГЛАВНУЮ</a>
          </nav>
        )}
        </div>
      </div>
      {!expanded && <FestivalIntro />}
    </main>
  );
}
