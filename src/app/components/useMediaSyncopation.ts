import { useLayoutEffect, useRef } from "react";
import { cancelFrame, frame } from "motion";
import { homeDesktopQuery } from "../layout/homeViewport";
import { mediaSyncopation as score, progressAt, revealAt, type AnimationInterval } from "./mediaSyncopation";
import "./MediaSyncopation.css";

type GroupId = "tile" | "a" | "b" | "articles";
type Phase = "pending" | "running" | "complete";
type TextPart = { mask: HTMLElement; content: HTMLElement; distance: number };
type Group = {
  id: GroupId;
  element: HTMLElement;
  phase: Phase;
  start: number | null;
  offset: number;
  deferred: boolean;
  texts: Map<string, TextPart>;
  mask: HTMLElement | null;
  shift: HTMLElement | null;
  play: HTMLElement | null;
  rows: HTMLElement[];
  all: HTMLElement | null;
  styled: Set<HTMLElement>;
};

// Memory belongs to this SPA document, not localStorage/sessionStorage.
// Returning from another route completes groups that already started.
const played = new Set<GroupId>();

export function useMediaSyncopation(variant: "desktop" | "mobile") {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const desktop = window.matchMedia(homeDesktopQuery);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let initialized = false;
    let sceneStarted = false;
    let ticking = false;
    let devHold = false;
    let runtimeCleanup: (() => void) | undefined;
    const groups: Group[] = [];
    const isActive = () => desktop.matches === (variant === "desktop");

    function setStyle(group: Group, element: HTMLElement | null, property: string, value: string) {
      if (!element) return;
      group.styled.add(element);
      element.style.setProperty(property, value);
    }

    function clearGroup(group: Group) {
      for (const element of group.styled) {
        for (const property of ["clip-path", "transform", "opacity", "will-change"]) {
          element.style.removeProperty(property);
        }
      }
      group.styled.clear();
      delete group.element.dataset.syncActive;
      if (group.all) delete group.all.dataset.syncAllActive;
    }

    function stopClock() {
      cancelFrame(tick);
      ticking = false;
    }

    function finish(group: Group, remember = true) {
      clearGroup(group);
      group.phase = "complete";
      group.element.dataset.syncState = "complete";
      if (remember) played.add(group.id);
    }

    function stopWhenComplete() {
      if (groups.every((group) => group.phase === "complete")) {
        stopClock();
        runtimeCleanup?.();
        runtimeCleanup = undefined;
        root!.dataset.syncState = "complete";
      }
    }

    function finishAll() {
      groups.forEach((group) => finish(group));
      stopWhenComplete();
    }

    function measureText() {
      // Only initialization, font readiness, resize and group start read layout.
      for (const group of groups) {
        for (const text of group.texts.values()) {
          text.distance = Math.max(score.text.minOffset, text.content.offsetHeight + score.text.padding);
        }
      }
    }

    function renderText(group: Group, name: string, time: number, interval: AnimationInterval) {
      const text = group.texts.get(name);
      if (!text) return;
      const u = progressAt(time, interval);
      setStyle(group, text.content, "transform", `translateY(${text.distance * (1 - u)}px)`);
      setStyle(group, text.content, "opacity", String(Math.min(1, score.text.opacityRate * u)));
    }

    function render(group: Group, time: number) {
      if (group.id === "tile") {
        const r = revealAt(time, score.tile.reveal);
        setStyle(group, group.element, "clip-path", `inset(${100 * (1 - r)}% 0 0 0)`);
        renderText(group, "label", time, score.tile.label);
      } else if (group.id === "articles") {
        group.rows.forEach((row, index) => {
          const u = progressAt(time, score.articles.rows[Math.min(index, score.articles.rows.length - 1)]);
          setStyle(group, row, "clip-path", `inset(0 0 ${100 * (1 - u)}% 0)`);
          setStyle(group, row, "transform", `translateY(${score.articleShift * (1 - u)}px)`);
        });
        setStyle(group, group.all, "opacity", String(progressAt(time, score.articles.all)));
      } else {
        const card = score.cards[group.id === "a" ? 0 : 1];
        const r = revealAt(time, card.reveal);
        setStyle(group, group.mask, "clip-path", card.axis === "x"
          ? `inset(0 ${100 * (1 - r)}% 0 0)`
          : `inset(${100 * (1 - r)}% 0 0 0)`);
        setStyle(group, group.shift, "transform",
          `translate${card.axis.toUpperCase()}(${card.shift * (1 - r)}px)`);
        renderText(group, "title", time, card.title);
        renderText(group, "meta", time, card.meta);
        setStyle(group, group.play, "opacity", String(progressAt(time, card.play)));
      }
    }

    function endTime(group: Group) {
      if (group.id === "tile") return score.tile.label[1];
      if (group.id === "articles") return score.duration;
      return score.cards[group.id === "a" ? 0 : 1].meta[1];
    }

    function tick({ timestamp }: { timestamp: number }) {
      try {
        for (const group of groups) {
          if (group.phase !== "running") continue;
          if (group.start === null) {
            group.start = timestamp;
            played.add(group.id);
          }
          const time = timestamp - group.start + group.offset;
          if (time >= endTime(group)) finish(group);
          else render(group, time);
        }
        stopWhenComplete();
        if (!groups.some((group) => group.phase === "running")) stopClock();
      } catch {
        finishAll();
      }
    }

    function start(group: Group, offset = 0) {
      if (group.phase !== "pending") return;
      group.phase = "running";
      group.offset = offset;
      group.start = null;
      group.element.dataset.syncState = "running";
      for (const element of group.styled) {
        const properties = ["clip-path", "transform", "opacity"].filter((name) => element.style.getPropertyValue(name));
        setStyle(group, element, "will-change", properties.join(", "));
      }
      root!.dataset.syncState = "running";
      if (!ticking) {
        ticking = true;
        // Motion supplies the shared monotonic clock. No per-element timers.
        frame.update(tick, true);
      }
    }

    function prepareImages() {
      for (const group of groups) {
        const image = group.element.querySelector<HTMLImageElement>("img");
        if (!image || image.dataset.syncPrepared) continue;
        image.dataset.syncPrepared = "true";
        image.loading = "eager";
        // Decode in advance when approaching. Loading never blocks the text clock.
        void image.decode().catch(() => {
          if (!disposed && image.complete && image.naturalWidth === 0) {
            if (group.mask) group.mask.dataset.syncImageError = "";
            finish(group);
            stopWhenComplete();
          }
        });
      }
    }

    function checkPosition() {
      if (disposed || !initialized || devHold || !isActive()) return;
      try {
        const rect = root!.getBoundingClientRect();
        if (!rect.height) return; // The alternate responsive DOM is display:none.
        if (rect.bottom <= 0) {
          finishAll();
          return;
        }
        if (rect.top < innerHeight * 2) prepareImages();
        if (!sceneStarted && rect.top <= innerHeight * score.triggerRatio) {
          sceneStarted = true;
          measureText();
          const a = groups.find((group) => group.id === "a")?.element.getBoundingClientRect();
          for (const group of groups) {
            const box = group.element.getBoundingClientRect();
            group.deferred = variant === "mobile" && box.top >= innerHeight
              && (group.id === "articles" || (group.id === "b" && !!a && Math.abs(a.left - box.left) < 1));
            if (!group.deferred) start(group);
          }
        }
        for (const group of groups) {
          if (group.phase !== "pending" || !group.deferred) continue;
          const box = group.element.getBoundingClientRect();
          if (box.bottom <= 0) finish(group);
          else if (box.top <= innerHeight * score.triggerRatio) {
            measureText();
            start(group, group.id === "b" ? score.cards[1].mobileOffset : score.articles.mobileOffset);
          }
        }
        // A fast pass over the section, or scrolling back above it, leaves no
        // partially revealed group behind. Pending lower mobile groups wait.
        if (sceneStarted && rect.top >= innerHeight) {
          groups.filter((group) => group.phase === "running").forEach((group) => finish(group));
        }
        stopWhenComplete();
      } catch {
        finishAll();
      }
    }

    const scheduleCheck = () => frame.read(checkPosition);
    const onResize = () => {
      if (sceneStarted) finishAll();
      else {
        measureText();
        scheduleCheck();
      }
    };
    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      const group = groups.find((item) => item.element.contains(target) || item.all?.contains(target));
      if (group) {
        finish(group);
        stopWhenComplete();
      }
    };
    const onVisibility = () => {
      if (document.hidden) {
        groups.filter((group) => group.phase === "running").forEach((group) => finish(group));
        stopClock();
        stopWhenComplete();
      } else scheduleCheck();
    };
    const onFonts = () => {
      if (disposed || !initialized) return;
      measureText();
      scheduleCheck();
    };

    function attachRuntime() {
      runtimeCleanup?.();
      const nearby = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) prepareImages();
        scheduleCheck();
      }, { rootMargin: "100% 0px" });
      nearby.observe(root!);
      groups.forEach((group) => nearby.observe(group.element));
      window.addEventListener("scroll", scheduleCheck, { passive: true });
      window.addEventListener("resize", onResize);
      window.addEventListener("orientationchange", onResize);
      root!.addEventListener("focusin", onFocus);
      document.addEventListener("visibilitychange", onVisibility);
      document.fonts.addEventListener("loadingdone", onFonts);
      const errorCleanups = groups.flatMap((group) => {
        const image = group.element.querySelector<HTMLImageElement>("img");
        if (!image) return [];
        const failed = () => {
          if (group.mask) group.mask.dataset.syncImageError = "";
          finish(group);
          stopWhenComplete();
        };
        image.addEventListener("error", failed);
        return [() => image.removeEventListener("error", failed)];
      });
      runtimeCleanup = () => {
        nearby.disconnect();
        cancelFrame(checkPosition);
        window.removeEventListener("scroll", scheduleCheck);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("orientationchange", onResize);
        root!.removeEventListener("focusin", onFocus);
        document.removeEventListener("visibilitychange", onVisibility);
        document.fonts.removeEventListener("loadingdone", onFonts);
        errorCleanups.forEach((cleanup) => cleanup());
      };
    }

    function initialize() {
      if (disposed || !isActive()) return;
      if (initialized) {
        if (reduced.matches) finishAll();
        else {
          groups.filter((group) => played.has(group.id)).forEach((group) => finish(group));
          stopWhenComplete();
        }
        return;
      }
      try {
        measureText();
        // Establish every observer and handler before hiding any content.
        attachRuntime();
        initialized = true;
        for (const group of groups) {
          if (reduced.matches || played.has(group.id)) {
            finish(group);
          } else {
            group.element.dataset.syncActive = "";
            group.element.dataset.syncState = "pending";
            if (group.all) group.all.dataset.syncAllActive = "";
            render(group, 0);
          }
        }
        root!.dataset.syncState = "pending";
        // Layout effect prevents a visible -> hidden flash on initial mount.
        checkPosition();
        stopWhenComplete();
        void document.fonts.ready.then(onFonts);
      } catch {
        initialized = true;
        finishAll();
      }
    }

    function onModeChange() {
      if (!isActive()) {
        if (initialized && sceneStarted) finishAll();
        return;
      }
      initialize();
      scheduleCheck();
    }

    function replay(event: Event) {
      if (!import.meta.env.DEV || !isActive()) return;
      stopClock();
      runtimeCleanup?.();
      runtimeCleanup = undefined;
      devHold = false;
      initialized = false;
      sceneStarted = false;
      for (const group of groups) {
        clearGroup(group);
        played.delete(group.id);
        group.phase = "pending";
        group.start = null;
        group.offset = 0;
        group.deferred = false;
      }
      const at = (event as CustomEvent<{ at?: number }>).detail?.at;
      initialize();
      if (typeof at === "number" && Number.isFinite(at) && !reduced.matches) {
        // Development-only deterministic inspection; no controls in site UI.
        devHold = true;
        stopClock();
        for (const group of groups) {
          if (at >= endTime(group)) finish(group, false);
          else render(group, Math.max(0, at));
        }
        stopWhenComplete();
      }
    }

    try {
      root.querySelectorAll<HTMLElement>("[data-sync-group]").forEach((element) => {
        const id = element.dataset.syncGroup as GroupId;
        const texts = new Map<string, TextPart>();
        element.querySelectorAll<HTMLElement>("[data-sync-text]").forEach((mask) => {
          const content = mask.firstElementChild as HTMLElement | null;
          if (content) texts.set(mask.dataset.syncText!, { mask, content, distance: score.text.minOffset });
        });
        groups.push({
          id, element, phase: "pending", start: null, offset: 0, deferred: false, texts,
          mask: element.querySelector<HTMLElement>("[data-sync-image-mask]"),
          shift: element.querySelector<HTMLElement>("[data-sync-image-shift]"),
          play: element.querySelector<HTMLElement>("[data-sync-play]"),
          rows: [...element.querySelectorAll<HTMLElement>("[data-sync-row]")],
          all: id === "articles" ? root.querySelector<HTMLElement>("[data-sync-all]") : null,
          styled: new Set(),
        });
      });
      desktop.addEventListener("change", onModeChange);
      reduced.addEventListener("change", onModeChange);
      if (import.meta.env.DEV) root.addEventListener("media-syncopation:replay", replay);
      initialize();
    } catch {
      groups.forEach((group) => finish(group, false));
      runtimeCleanup?.();
    }

    return () => {
      disposed = true;
      stopClock();
      runtimeCleanup?.();
      cancelFrame(checkPosition);
      desktop.removeEventListener("change", onModeChange);
      reduced.removeEventListener("change", onModeChange);
      root.removeEventListener("media-syncopation:replay", replay);
      groups.forEach(clearGroup);
      delete root.dataset.syncState;
    };
  }, [variant]);

  return ref;
}
