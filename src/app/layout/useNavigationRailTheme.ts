import { homeDesktopQuery } from "./homeViewport";
import { type RefObject, useLayoutEffect } from "react";
import { requestViewportFrame, subscribeViewportFrame } from "./viewportFrame";

export type NavTheme = "light" | "dark";

export function useNavigationRailTheme({
  railRef,
  clipRef,
  pathname,
  navTheme,
}: {
  railRef: RefObject<HTMLElement | null>;
  clipRef: RefObject<SVGClipPathElement | null>;
  pathname: string;
  navTheme?: NavTheme;
}) {
  useLayoutEffect(() => {
    const desktop = window.matchMedia(pathname === "/" ? homeDesktopQuery : "(min-width: 64rem)");
    let stopDesktop: (() => void) | undefined;

    const synchronizeDesktop = () => {
      stopDesktop?.();
      stopDesktop = undefined;
      const rail = railRef.current;
      const clip = clipRef.current;
      if (!desktop.matches || !rail || !clip) return;

      const followsMedia = pathname === "/" && navTheme === undefined;
      const nativeScroll = followsMedia
        && CSS.supports("animation-timeline", "--home-rail-media")
        && CSS.supports("animation-range", "entry 0% exit-crossing 0%")
        && CSS.supports("timeline-scope", "--home-rail-media");

      if (nativeScroll) {
        // Section backgrounds remain visible beneath the transparent rail.
        // Native timelines only reveal the contrasting labels and divider.
        rail.dataset.nativeScroll = "true";
        stopDesktop = () => {
          delete rail.dataset.nativeScroll;
        };
        return;
      }

      // Geometry-based fallback for browsers without native scroll timelines.
      const rectangle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      const footerRectangle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      let stopped = false;
      let main: HTMLElement | null = null;
      let boundary: HTMLElement | null = null;
      let footerBoundary: HTMLElement | null = null;
      let contentDirty = true;
      let rectangleAttached = false;
      let width = 0;
      let height = 0;
      let previousWidth = -1;
      let previousHeight = -1;
      let footerTop = 0;
      let footerHeight = 0;
      let previousFooterTop = -1;
      let previousFooterHeight = -1;

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
        const nextMain = followsMedia ? document.querySelector<HTMLElement>("main") : null;
        if (main !== nextMain) {
          main?.removeEventListener("load", schedule, true);
          main?.removeEventListener("loadedmetadata", schedule, true);
          main = nextMain;
          main?.addEventListener("load", schedule, true);
          main?.addEventListener("loadedmetadata", schedule, true);
        }
        boundary = main?.querySelector<HTMLElement>("[data-nav-light-start]") ?? null;
        footerBoundary = main?.querySelector<HTMLElement>("[data-nav-dark-start]") ?? null;

        mutationObserver.disconnect();
        if (followsMedia) {
          // The route may still be loading. Only DOM changes refresh this cache.
          mutationObserver.observe(main ?? document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["data-nav-light-start", "data-nav-dark-start"],
          });
        }
        resizeObserver.disconnect();
        resizeObserver.observe(rail);
        if (main) {
          resizeObserver.observe(main);
          // A preceding section can move Media without changing Media's size.
          for (const section of main.querySelectorAll("section, footer")) resizeObserver.observe(section);
        }
      };

      const commit = () => {
        if (stopped) return;
        if (!rectangleAttached) {
          clip.replaceChildren(rectangle, footerRectangle);
          rectangleAttached = true;
        }
        if (width !== previousWidth) {
          rectangle.setAttribute("width", String(width));
          footerRectangle.setAttribute("width", String(width));
        }
        if (height !== previousHeight) {
          rectangle.setAttribute("height", String(height));
          rail.style.setProperty("--rail-light-top", height + "px");
        }
        if (footerTop !== previousFooterTop) footerRectangle.setAttribute("y", String(footerTop));
        if (footerHeight !== previousFooterHeight) {
          footerRectangle.setAttribute("height", String(footerHeight));
          rail.style.setProperty("--rail-light-bottom", footerHeight + "px");
        }
        previousWidth = width;
        previousHeight = height;
        previousFooterTop = footerTop;
        previousFooterHeight = footerHeight;
      };

      const read = () => {
        if (stopped) return;
        if (contentDirty) refreshContent();
        const railRect = rail.getBoundingClientRect();
        const viewportHeight = Math.max(0, Math.min(window.innerHeight, railRect.bottom) - railRect.top);
        width = railRect.width;
        // Dark above Media and below the footer's top; white between them.
        height = followsMedia
          ? Math.max(0, Math.min(viewportHeight, (boundary?.getBoundingClientRect().top ?? railRect.bottom) - railRect.top))
          : navTheme === "dark" ? viewportHeight : 0;
        footerTop = followsMedia && footerBoundary
          ? Math.max(0, Math.min(viewportHeight, footerBoundary.getBoundingClientRect().top - railRect.top))
          : viewportHeight;
        footerHeight = viewportHeight - footerTop;
        return commit;
      };

      const unsubscribe = subscribeViewportFrame(read);
      read()?.();
      if (followsMedia) {
        void document.fonts.ready.then(schedule);
        document.fonts.addEventListener("loadingdone", schedule);
      }

      stopDesktop = () => {
        stopped = true;
        unsubscribe();
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        main?.removeEventListener("load", schedule, true);
        main?.removeEventListener("loadedmetadata", schedule, true);
        document.fonts.removeEventListener("loadingdone", schedule);
        clip.replaceChildren();
        rail.style.removeProperty("--rail-light-top");
        rail.style.removeProperty("--rail-light-bottom");
      };
    };

    synchronizeDesktop();
    desktop.addEventListener("change", synchronizeDesktop);
    return () => {
      desktop.removeEventListener("change", synchronizeDesktop);
      stopDesktop?.();
    };
  }, [railRef, clipRef, pathname, navTheme]);
}
