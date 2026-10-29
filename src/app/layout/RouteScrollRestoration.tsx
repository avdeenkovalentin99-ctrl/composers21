import { type ReactNode, useLayoutEffect } from "react";

const positions = new Map<string, number>();

export function hasSavedScrollPosition(entryKey: string) {
  return positions.has(entryKey);
}

// Mounted inside Suspense, after the incoming page exists and the outgoing
// animation has finished. The key belongs to a history entry, not a pathname.
export function RouteScrollRestoration({ entryKey, pathname, search, hash, navigationType, children }: {
  entryKey: string;
  pathname: string;
  search: string;
  hash: string;
  navigationType: string;
  children: ReactNode;
}) {
  useLayoutEffect(() => {
    const saved = navigationType === "POP" ? positions.get(entryKey) : undefined;
    const ownDeepLink = pathname === "/afisha" && new URLSearchParams(search).has("concert");
    const target = saved ?? (ownDeepLink || hash ? undefined : 0);
    let frame = 0;
    let resize: ResizeObserver | undefined;
    const stop = () => { resize?.disconnect(); cancelAnimationFrame(frame); };
    const restore = () => {
      if (target !== undefined) window.scrollTo({ top: target, behavior: "instant" });
      else if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: "instant" });
    };
    restore();
    frame = requestAnimationFrame(() => {
      restore();
      if (target !== undefined && Math.abs(window.scrollY - target) > 1) {
        resize = new ResizeObserver(() => {
          restore();
          if (Math.abs(window.scrollY - target) <= 1) resize?.disconnect();
        });
        resize.observe(document.body);
      }
    });
    const timeout = window.setTimeout(stop, 2500);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    return () => {
      positions.set(entryKey, window.scrollY);
      if (positions.size > 200) positions.delete(positions.keys().next().value!);
      stop();
      clearTimeout(timeout);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [entryKey, pathname, search, hash, navigationType]);
  return children;
}
