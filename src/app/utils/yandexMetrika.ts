type YmFunction = (id: number, method: string, ...args: unknown[]) => void;

declare global {
  interface Window {
    ym?: YmFunction & {
      a?: unknown[][];
      l?: number;
    };
  }

  interface ImportMetaEnv {
    readonly VITE_YANDEX_METRIKA_ID?: string;
  }
}

const METRIKA_SCRIPT_BASE_SRC = "https://mc.yandex.ru/metrika/tag.js";
const METRIKA_SCRIPT_ID = "yandex-metrika-tag";
const METRIKA_ID = Number(import.meta.env.VITE_YANDEX_METRIKA_ID);

let initialized = false;

function getMetrikaId() {
  return Number.isInteger(METRIKA_ID) && METRIKA_ID > 0 ? METRIKA_ID : null;
}

function ensureYmBootstrap(metrikaId: number) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  if (!window.ym) {
    const ymBootstrap = function (...args: unknown[]) {
      (ymBootstrap.a = ymBootstrap.a || []).push(args);
    } as NonNullable<Window["ym"]>;

    ymBootstrap.l = Date.now();
    window.ym = ymBootstrap;
  }

  if (!document.getElementById(METRIKA_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = METRIKA_SCRIPT_ID;
    script.async = true;
    script.src = `${METRIKA_SCRIPT_BASE_SRC}?id=${metrikaId}`;
    document.head.appendChild(script);
  }

  return window.ym;
}

export function initializeYandexMetrika() {
  const metrikaId = getMetrikaId();

  if (initialized || metrikaId === null) {
    return false;
  }

  const ym = ensureYmBootstrap(metrikaId);

  if (!ym) {
    return false;
  }

  ym(metrikaId, "init", {
    defer: true,
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
  });

  initialized = true;

  return true;
}

export function trackYandexMetrikaPageView(url?: string) {
  const metrikaId = getMetrikaId();

  initializeYandexMetrika();

  const ym = metrikaId === null ? null : ensureYmBootstrap(metrikaId);

  if (metrikaId === null || typeof window === "undefined" || typeof document === "undefined" || !ym) {
    return;
  }

  ym(metrikaId, "hit", url ?? window.location.href, {
    title: document.title,
    referer: document.referrer,
  });
}

export function sendMetrikaGoal(goalId: string, params?: Record<string, unknown>) {
  const metrikaId = getMetrikaId();

  initializeYandexMetrika();

  const ym = metrikaId === null ? null : ensureYmBootstrap(metrikaId);

  if (metrikaId === null || !ym) {
    return false;
  }

  if (params) {
    ym(metrikaId, "reachGoal", goalId, params);
    return true;
  }

  ym(metrikaId, "reachGoal", goalId);
  return true;
}

export function isYandexMetrikaEnabled() {
  return getMetrikaId() !== null;
}
