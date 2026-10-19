import { useLayoutEffect, useState } from "react";
import { homeDesktopQuery } from "./homeViewport";
import { requestViewportFrame, subscribeViewportFrame } from "./viewportFrame";

export function useMobileMenuEntrance(pathname: string) {
  const [hasPassedLogo, setHasPassedLogo] = useState(false);

  useLayoutEffect(() => {
    setHasPassedLogo(false);
    if (pathname !== "/") return;

    const desktop = window.matchMedia(homeDesktopQuery);
    const resizeObserver = new ResizeObserver(requestViewportFrame);
    const contentObserver = new MutationObserver(requestViewportFrame);
    let logo: HTMLElement | null = null;
    let previousVisible = false;

    const read = () => {
      if (!logo?.isConnected) {
        resizeObserver.disconnect();
        logo = document.querySelector<HTMLElement>("[data-mobile-menu-boundary]");
        if (logo) resizeObserver.observe(logo);
      }
      const visible = !desktop.matches && logo !== null && logo.getBoundingClientRect().bottom <= 0;
      if (visible === previousVisible) return;
      return () => {
        previousVisible = visible;
        setHasPassedLogo(visible);
      };
    };

    const unsubscribe = subscribeViewportFrame(read);
    contentObserver.observe(document.querySelector("main") ?? document.body, { childList: true, subtree: true });
    desktop.addEventListener("change", requestViewportFrame);
    read()?.();
    return () => {
      unsubscribe();
      resizeObserver.disconnect();
      contentObserver.disconnect();
      desktop.removeEventListener("change", requestViewportFrame);
    };
  }, [pathname]);

  return pathname !== "/" || hasPassedLogo;
}
