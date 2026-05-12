import { lazy, Suspense, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createBrowserRouter, useLocation, useOutlet } from "react-router-dom";
import { SiteFooter } from "./layout/SiteFooter";
import { SiteHeader } from "./layout/SiteHeader";
import { NotFoundPage } from "./pages/NotFoundPage";
import { applyPageMeta, type PageMeta } from "./utils/pageMeta";
import {
  initializeYandexMetrika,
  isYandexMetrikaEnabled,
  sendMetrikaGoal,
  trackYandexMetrikaPageView,
} from "./utils/yandexMetrika";

const AboutFestivalPage = lazy(() => import("./pages/AboutFestivalPage").then((module) => ({ default: module.AboutFestivalPage })));
const AcademiesPage = lazy(() => import("./pages/AcademiesPage").then((module) => ({ default: module.AcademiesPage })));
const AfishaPage = lazy(() => import("./pages/AfishaPage").then((module) => ({ default: module.AfishaPage })));
const ComposerPage = lazy(() => import("./pages/ComposerPage").then((module) => ({ default: module.ComposerPage })));
const EnsemblePage = lazy(() => import("./pages/EnsemblePage").then((module) => ({ default: module.EnsemblePage })));
const FestivalLabPage = lazy(() => import("./pages/FestivalLabPage").then((module) => ({ default: module.FestivalLabPage })));
const FestivalPage = lazy(() => import("./pages/FestivalPage").then((module) => ({ default: module.FestivalPage })));
const ParticipantsPage = lazy(() => import("./pages/ParticipantsPage").then((module) => ({ default: module.ParticipantsPage })));
const PartnersPage = lazy(() => import("./pages/PartnersPage").then((module) => ({ default: module.PartnersPage })));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage").then((module) => ({ default: module.PrivacyPage })));
const SoloistPage = lazy(() => import("./pages/SoloistPage").then((module) => ({ default: module.SoloistPage })));

const PAGE_GOAL_BY_PATHNAME: Record<string, string> = {
  "/afisha": "afisha_page_view",
  "/participants": "participants_page_view",
};

const PAGE_META_BY_PATHNAME: Record<string, PageMeta> = {
  "/": {
    title: "КОМПОЗИТОРЫ XXI ВЕКА — фестиваль современной музыки",
    description: "Фестиваль современной академической музыки в Москве. Галерея Нико. 10-31 мая 2026.",
    canonicalPath: "/",
  },
  "/festival": {
    title: "О фестивале — Композиторы XXI века",
    description: "О проекте, идее и пространстве фестиваля современной академической музыки «Композиторы XXI века».",
    canonicalPath: "/festival",
  },
  "/academies": {
    title: "Встречи с композиторами и музыкантами",
    description: "Встречи с композиторами и музыкантами.",
    canonicalPath: "/academies",
  },
  "/festival-lab": {
    title: "Festival Lab — Композиторы XXI века",
    description: "Пробный интерактивный раздел фестивального сайта.",
    canonicalPath: "/festival-lab",
    robots: "noindex, nofollow",
  },
  "/afisha": {
    title: "Программа и билеты — Композиторы XXI века",
    description: "Афиша концертов фестиваля «Композиторы XXI века»: программа, даты, исполнители и билеты.",
    canonicalPath: "/afisha",
  },
  "/participants": {
    title: "Участники — Композиторы XXI века",
    description: "Композиторы, солисты, ансамбли и оркестры фестиваля «Композиторы XXI века».",
    canonicalPath: "/participants",
  },
  "/partners": {
    title: "Партнёры — Композиторы XXI века",
    description: "Генеральные партнёры, медиа-партнёры и партнёры фестиваля «Композиторы XXI века».",
    canonicalPath: "/partners",
  },
  "/privacy": {
    title: "Политика конфиденциальности — Композиторы XXI века",
    description: "Политика конфиденциальности сайта фестиваля «Композиторы XXI века».",
    canonicalPath: "/privacy",
  },
};

function getPageMeta(pathname: string): PageMeta {
  if (PAGE_META_BY_PATHNAME[pathname]) {
    return PAGE_META_BY_PATHNAME[pathname];
  }

  if (pathname.startsWith("/participants/composers/")) {
    return {
      title: "Композитор — Композиторы XXI века",
      description: "Страница композитора фестиваля «Композиторы XXI века».",
      canonicalPath: pathname,
    };
  }

  if (pathname.startsWith("/participants/ensembles/")) {
    return {
      title: "Ансамбль — Композиторы XXI века",
      description: "Страница ансамбля или оркестра фестиваля «Композиторы XXI века».",
      canonicalPath: pathname,
    };
  }

  if (pathname.startsWith("/participants/soloists/")) {
    return {
      title: "Солист — Композиторы XXI века",
      description: "Страница солиста фестиваля «Композиторы XXI века».",
      canonicalPath: pathname,
    };
  }

  return {
    title: "Страница не найдена — Композиторы XXI века",
    description: "Страница не найдена.",
    canonicalPath: pathname,
    robots: "noindex, follow",
  };
}

function RootLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const showFooter = location.pathname !== "/";
  const previousPathnameRef = useRef(location.pathname);
  const transitionPendingRef = useRef(false);
  const lastTrackedUrlRef = useRef<string | null>(null);

  function resetScroll() {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function lockViewportAtCurrentScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    document.body.style.position = "fixed";
    document.body.style.top = `${-scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
  }

  function unlockViewport() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
  }

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    initializeYandexMetrika();
  }, []);

  useEffect(() => {
    applyPageMeta(getPageMeta(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    if (previousPathnameRef.current === location.pathname) {
      return;
    }

    previousPathnameRef.current = location.pathname;
    transitionPendingRef.current = true;
    lockViewportAtCurrentScroll();
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      unlockViewport();
    };
  }, []);

  useEffect(() => {
    if (!isYandexMetrikaEnabled()) {
      return;
    }

    const currentUrl = window.location.href;

    if (lastTrackedUrlRef.current === currentUrl) {
      return;
    }

    lastTrackedUrlRef.current = currentUrl;
    trackYandexMetrikaPageView(currentUrl);

    const pageGoal = PAGE_GOAL_BY_PATHNAME[location.pathname];
    if (pageGoal) {
      sendMetrikaGoal(pageGoal);
    }
  }, [location.hash, location.pathname, location.search]);

  function handleExitComplete() {
    if (!transitionPendingRef.current) {
      return;
    }

    transitionPendingRef.current = false;
    unlockViewport();
    resetScroll();
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--color-bg)] text-[var(--color-text)]">
      <SiteHeader />
      <main>
        <AnimatePresence mode="wait" initial={false} onExitComplete={handleExitComplete}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.42, 0, 0.58, 1] }}
          >
            <Suspense fallback={null}>{outlet}</Suspense>
            {showFooter ? <SiteFooter /> : null}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <FestivalPage /> },
      { path: "festival", element: <AboutFestivalPage /> },
      { path: "academies", element: <AcademiesPage /> },
      { path: "festival-lab", element: <FestivalLabPage /> },
      { path: "afisha", element: <AfishaPage /> },
      { path: "participants", element: <ParticipantsPage /> },
      { path: "participants/composers/:slug", element: <ComposerPage /> },
      { path: "participants/ensembles/:slug", element: <EnsemblePage /> },
      { path: "participants/soloists/:slug", element: <SoloistPage /> },
      { path: "partners", element: <PartnersPage /> },
      { path: "privacy", element: <PrivacyPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
