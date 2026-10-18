import { useLayoutEffect, useRef } from "react";
import { homeDesktopQuery } from "../layout/homeViewport";
import "./BroadcastEntrance.css";

// Share one entrance across responsive layouts and SPA route returns.
const played = { intro: false, list: false };

export function useBroadcastEntrance(variant: "desktop" | "mobile") {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const desktop = window.matchMedia(homeDesktopQuery);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disconnect: (() => void) | undefined;

    const synchronize = () => {
      disconnect?.();
      disconnect = undefined;
      delete root.dataset.broadcastIntro;
      delete root.dataset.broadcastListState;
      root.style.removeProperty("--broadcast-list-start");
      root.style.removeProperty("--broadcast-last-row");
      if (desktop.matches !== (variant === "desktop")) return;

      const finish = () => {
        played.intro = true;
        played.list = true;
        root.dataset.broadcastIntro = "complete";
        root.dataset.broadcastListState = "complete";
      };
      if (reduced.matches) {
        finish();
        return;
      }

      root.dataset.broadcastIntro = played.intro ? "complete" : "pending";
      root.dataset.broadcastListState = played.list ? "complete" : "pending";
      root.style.setProperty("--broadcast-list-start", variant === "desktop" ? "700ms" : "0ms");
      root.style.setProperty("--broadcast-last-row", String(Math.max(0, root.querySelectorAll("[data-broadcast-row]").length - 1)));

      const beginList = () => {
        if (root.dataset.broadcastListState !== "pending") return;
        played.list = true;
        root.dataset.broadcastListState = "visible";
      };
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          if (entry.target.hasAttribute("data-broadcast-title")) {
            if (root.dataset.broadcastIntro === "pending") {
              played.intro = true;
              root.dataset.broadcastIntro = "visible";
            }
            if (variant === "desktop") beginList();
          } else {
            beginList();
          }
        }
      }, { threshold: 0.05, rootMargin: "0px 0px -10% 0px" });

      const title = root.querySelector("[data-broadcast-title]");
      const list = root.querySelector("[data-broadcast-list]");
      if (title) observer.observe(title);
      if (variant === "mobile" && list) observer.observe(list);
      root.addEventListener("focusin", finish);
      disconnect = () => {
        observer.disconnect();
        root.removeEventListener("focusin", finish);
      };
    };

    synchronize();
    desktop.addEventListener("change", synchronize);
    reduced.addEventListener("change", synchronize);
    return () => {
      disconnect?.();
      desktop.removeEventListener("change", synchronize);
      reduced.removeEventListener("change", synchronize);
      delete root.dataset.broadcastIntro;
      delete root.dataset.broadcastListState;
      root.style.removeProperty("--broadcast-list-start");
      root.style.removeProperty("--broadcast-last-row");
    };
  }, [variant]);

  return ref;
}
