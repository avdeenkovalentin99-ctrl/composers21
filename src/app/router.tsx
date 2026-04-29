import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createBrowserRouter, useLocation, useOutlet } from "react-router-dom";
import { SiteFooter } from "./layout/SiteFooter";
import { SiteHeader } from "./layout/SiteHeader";
import {
  initializeYandexMetrika,
  isYandexMetrikaEnabled,
  reachYandexMetrikaGoal,
  trackYandexMetrikaPageView,
} from "./utils/yandexMetrika";
import { AboutFestivalPage } from "./pages/AboutFestivalPage";
import { AfishaPage } from "./pages/AfishaPage";
import { ComposerPage } from "./pages/ComposerPage";
import { EnsemblePage } from "./pages/EnsemblePage";
import { FestivalLabPage } from "./pages/FestivalLabPage";
import { FestivalPage } from "./pages/FestivalPage";
import { ParticipantsPage } from "./pages/ParticipantsPage";
import { PartnersPage } from "./pages/PartnersPage";
import { SoloistPage } from "./pages/SoloistPage";

const PAGE_GOAL_BY_PATHNAME: Record<string, string> = {
  "/afisha": "afisha_page_view",
  "/participants": "participants_page_view",
};

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
      reachYandexMetrikaGoal(pageGoal);
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
            {outlet}
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
      { path: "festival-lab", element: <FestivalLabPage /> },
      { path: "afisha", element: <AfishaPage /> },
      { path: "participants", element: <ParticipantsPage /> },
      { path: "participants/composers/:slug", element: <ComposerPage /> },
      { path: "participants/ensembles/:slug", element: <EnsemblePage /> },
      { path: "participants/soloists/:slug", element: <SoloistPage /> },
      { path: "partners", element: <PartnersPage /> },
    ],
  },
]);
