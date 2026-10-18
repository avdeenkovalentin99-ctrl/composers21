import { useLayoutEffect, useRef, useState } from "react";
import { homeDesktopQuery } from "../layout/homeViewport";
import { requestViewportFrame, subscribeViewportFrame } from "../layout/viewportFrame";
import "./FestivalYearEntrance.css";

// One assembly per SPA document; the title and graphic shapes stay visible.
let hasAssembled = false;

export function useFestivalYearEntrance(variant: "desktop" | "mobile") {
  const ref = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const desktop = window.matchMedia(homeDesktopQuery);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup: (() => void) | undefined;

    const synchronize = () => {
      cleanup?.();
      cleanup = undefined;
      delete root.dataset.yearEntrance;
      setIsReady(false);
      if (desktop.matches !== (variant === "desktop")) return;

      const finish = () => {
        hasAssembled = true;
        root.dataset.yearEntrance = "complete";
        setIsReady(true);
      };
      if (reduced.matches) {
        finish();
        return;
      }
      root.dataset.yearEntrance = hasAssembled ? "complete" : "pending";
      setIsReady(hasAssembled);

      const title = root.querySelector<HTMLElement>("[data-year-title]");
      const composition = root.querySelector<HTMLElement>(".home-year-composition, .mobile-festival-year__composition");
      if (!title || !composition) {
        finish();
        return;
      }

      let disposed = false;
      const read = () => {
        if (disposed) return;
        if (root.dataset.yearEntrance !== "pending") return;

        const titleRect = title.getBoundingClientRect();
        const compositionRect = composition.getBoundingClientRect();
        const gate = window.innerHeight * 0.7;
        // On mobile the heading sits inside the 2x2 composition. Use its top
        // so the upper row remains in view when the numerals begin to assemble.
        const triggerTop = variant === "desktop" ? titleRect.top : compositionRect.top;
        if (triggerTop > gate || compositionRect.bottom <= 0) return;

        return () => {
          if (disposed) return;
          hasAssembled = true;
          root.dataset.yearEntrance = "visible";
        };
      };
      const labels = root.querySelectorAll("[data-year-nav-label]");
      let readyTimer: number | undefined;
      const onEntranceEnd = (event: AnimationEvent) => {
        if (event.animationName !== "year-nav-in") return;
        window.clearTimeout(readyTimer);
        readyTimer = window.setTimeout(() => {
          if (disposed) return;
          const fullyVisible = Array.from(labels).every((label) =>
            Number(getComputedStyle(label).opacity) === 1
            && label.getAnimations().every((animation) => animation.playState === "finished")
          );
          if (fullyVisible) finish();
        }, 180);
      };
      root.addEventListener("animationend", onEntranceEnd);
      const schedule = () => { if (!disposed) requestViewportFrame(); };
      const unsubscribe = subscribeViewportFrame(read);
      const resizeObserver = new ResizeObserver(schedule);
      resizeObserver.observe(root);
      resizeObserver.observe(title);
      document.fonts.addEventListener("loadingdone", schedule);
      void document.fonts.ready.then(schedule);
      read()?.();

      cleanup = () => {
        disposed = true;
        unsubscribe();
        resizeObserver.disconnect();
        document.fonts.removeEventListener("loadingdone", schedule);
        window.clearTimeout(readyTimer);
        root.removeEventListener("animationend", onEntranceEnd);
      };
    };

    synchronize();
    desktop.addEventListener("change", synchronize);
    reduced.addEventListener("change", synchronize);
    return () => {
      cleanup?.();
      desktop.removeEventListener("change", synchronize);
      reduced.removeEventListener("change", synchronize);
      delete root.dataset.yearEntrance;
    };
  }, [variant]);

  return { ref, isReady };
}
