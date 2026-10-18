import { homeDesktopQuery } from "./homeViewport";
import { type RefObject, useLayoutEffect } from "react";
import { requestViewportFrame, subscribeViewportFrame } from "./viewportFrame";

// Remember the first reveal for this SPA document, including route changes.
let hasPlayedRailEntrance = false;

/** The Hero owns the precise title edge; the rail shares the viewport scheduler. */
export function useHomeRailEntrance({
  railRef,
  pathname,
}: {
  railRef: RefObject<HTMLElement | null>;
  pathname: string;
}) {
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const reset = () => {
      delete rail.dataset.entrance;
      rail.dataset.labelEntrance = hasPlayedRailEntrance ? "complete" : "pending";
      rail.removeAttribute("aria-hidden");
      rail.inert = false;
    };
    if (pathname !== "/" && pathname !== "/hero2" && pathname !== "/hero3") {
      reset();
      return;
    }

    const desktop = window.matchMedia(pathname === "/" ? homeDesktopQuery : "(min-width: 64rem)");
    let stopDesktop: (() => void) | undefined;
    const synchronizeDesktop = () => {
      stopDesktop?.();
      stopDesktop = undefined;
      if (!desktop.matches) {
        reset();
        return;
      }

      rail.dataset.labelEntrance = hasPlayedRailEntrance ? "complete" : "pending";

      let trigger: HTMLElement | null = null;
      let hero: HTMLElement | null = null;
      let contentDirty = true;
      let stopped = false;
      let exitTimeout: number | undefined;
      let previousEntrance: "visible" | "hidden" | undefined;
      const schedule = () => {
        if (!stopped) requestViewportFrame();
      };
      const resizeObserver = new ResizeObserver(schedule);
      const mutationObserver = new MutationObserver(() => {
        contentDirty = true;
        schedule();
      });
      const refreshContent = () => {
        contentDirty = false;
        trigger = document.querySelector<HTMLElement>("[data-hero-rail-trigger]");
        hero = trigger?.closest<HTMLElement>("section") ?? null;
        const main = document.querySelector("main");
        mutationObserver.disconnect();
        mutationObserver.observe(main ?? document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["data-hero-rail-trigger"],
        });
        resizeObserver.disconnect();
        if (main) resizeObserver.observe(main);
        if (hero) resizeObserver.observe(hero);
      };
      const read = () => {
        if (stopped) return;
        if (contentDirty) refreshContent();
        const visible = trigger !== null && trigger.getBoundingClientRect().top <= 0;
        const entrance = visible ? "visible" : "hidden";
        if (previousEntrance === entrance) return;
        return () => {
          if (stopped) return;
          previousEntrance = entrance;
          window.clearTimeout(exitTimeout);
          if (visible) {
            rail.dataset.labelEntrance = hasPlayedRailEntrance ? "complete" : "playing";
            hasPlayedRailEntrance = true;
          } else if (hasPlayedRailEntrance) {
            // Closing early also consumes the reveal; reopening is always ready.
            rail.dataset.labelEntrance = "complete";
          }
          if (!visible && rail.dataset.entrance === "visible") {
            // Keep artwork intact until the whole rail has left the viewport.
            rail.dataset.entrance = "leaving";
            exitTimeout = window.setTimeout(() => {
              if (!stopped) rail.dataset.entrance = "hidden";
            }, 520);
          } else {
            rail.dataset.entrance = entrance;
          }
          rail.setAttribute("aria-hidden", String(!visible));
          rail.inert = !visible;
        };
      };

      const unsubscribe = subscribeViewportFrame(read);
      read()?.();
      document.fonts.addEventListener("loadingdone", schedule);
      void document.fonts.ready.then(schedule);
      stopDesktop = () => {
        stopped = true;
        window.clearTimeout(exitTimeout);
        unsubscribe();
        mutationObserver.disconnect();
        resizeObserver.disconnect();
        document.fonts.removeEventListener("loadingdone", schedule);
      };
    };

    synchronizeDesktop();
    desktop.addEventListener("change", synchronizeDesktop);
    return () => {
      stopDesktop?.();
      desktop.removeEventListener("change", synchronizeDesktop);
      reset();
    };
  }, [railRef, pathname]);
}
