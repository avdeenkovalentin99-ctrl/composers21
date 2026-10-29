import { lazy, Suspense, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createBrowserRouter, useLocation, useNavigationType, useOutlet } from "react-router-dom";
import { RouteScrollRestoration } from "./layout/RouteScrollRestoration";
import { SiteFooter } from "./layout/SiteFooter";
import "./layout/HomePhoneLandscape.css";
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
const BroadcastsPage = lazy(() => import("./pages/BroadcastsPage").then((module) => ({ default: module.BroadcastsPage })));
const ComposerPage = lazy(() => import("./pages/ComposerPage").then((module) => ({ default: module.ComposerPage })));
const EnsemblePage = lazy(() => import("./pages/EnsemblePage").then((module) => ({ default: module.EnsemblePage })));
const FestivalLabPage = lazy(() => import("./pages/FestivalLabPage").then((module) => ({ default: module.FestivalLabPage })));
const FestivalPageLegacy = lazy(() => import("./pages/FestivalPageLegacy").then((module) => ({ default: module.FestivalPageLegacy })));
const HeroVariantPage = lazy(() => import("./pages/HeroVariantPage").then((module) => ({ default: module.HeroVariantPage })));
const IntroTestPage = lazy(() => import("./pages/IntroTestPage").then((module) => ({ default: module.IntroTestPage })));
const MediaPage = lazy(() => import("./pages/MediaPage").then((module) => ({ default: module.MediaPage })));
const ParticipantsPage = lazy(() => import("./pages/ParticipantsPage").then((module) => ({ default: module.ParticipantsPage })));
const PartnersPage = lazy(() => import("./pages/PartnersPage").then((module) => ({ default: module.PartnersPage })));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage").then((module) => ({ default: module.PrivacyPage })));
const SoloistPage = lazy(() => import("./pages/SoloistPage").then((module) => ({ default: module.SoloistPage })));
const TeamPage = lazy(() => import("./pages/TeamPage").then((module) => ({ default: module.TeamPage })));

const PAGE_GOAL_BY_PATHNAME: Record<string, string> = {
  "/afisha": "afisha_page_view",
  "/participants": "participants_page_view",
};

const PAGE_META_BY_PATHNAME: Record<string, PageMeta> = {
  "/": {
    title: "Фестиваль современной музыки",
    description: "10–31 мая · Москва · Галерея НИКО · 15 концертов",
    canonicalPath: "/",
  },
  "/hero2": {
    title: "Композиторы XXI века — графитовый hero",
    description: "Второй вариант главного экрана фестиваля.",
    canonicalPath: "/hero2",
    robots: "noindex, nofollow",
  },
  "/hero3": {
    title: "Композиторы XXI века — белый hero",
    description: "Третий вариант главного экрана фестиваля.",
    canonicalPath: "/hero3",
    robots: "noindex, nofollow",
  },
  "/festival": {
    title: "О фестивале",
    description: "О проекте, идее и пространстве фестиваля современной академической музыки «Композиторы XXI века».",
    canonicalPath: "/festival",
  },
  "/academies": {
    title: "Академии",
    description: "Встречи с композиторами и музыкантами.",
    canonicalPath: "/academies",
  },
  "/festival-lab": {
    title: "Festival Lab",
    description: "Пробный интерактивный раздел фестивального сайта.",
    canonicalPath: "/festival-lab",
    robots: "noindex, nofollow",
  },
  "/afisha": {
    title: "Афиша",
    description: "Афиша концертов фестиваля «Композиторы XXI века»: программа, даты, исполнители и билеты.",
    canonicalPath: "/afisha",
  },
  "/translyatsii": {
    title: "Трансляции",
    description: "Записи концертов фестиваля «Композиторы XXI века» на портале «Культура.РФ».",
    canonicalPath: "/translyatsii",
  },
  "/media": {
    title: "Медиа",
    description: "Публикации, анонсы, репортажи и афиша первого сезона фестиваля «Композиторы XXI века».",
    canonicalPath: "/media",
  },
  "/participants": {
    title: "Участники",
    description: "Композиторы, солисты, ансамбли и оркестры фестиваля «Композиторы XXI века».",
    canonicalPath: "/participants",
  },
  "/team": {
    title: "Команда",
    description: "Команда фестиваля «Композиторы XXI века»: организация, видео, трансляции и звукозапись.",
    canonicalPath: "/team",
  },
  "/partners": {
    title: "Партнёры",
    description: "Генеральные партнёры, медиа-партнёры и партнёры фестиваля «Композиторы XXI века».",
    canonicalPath: "/partners",
  },
  "/privacy": {
    title: "Политика конфиденциальности",
    description: "Политика конфиденциальности сайта фестиваля «Композиторы XXI века».",
    canonicalPath: "/privacy",
  },
};

async function getPageMeta(pathname: string): Promise<PageMeta> {
  if (PAGE_META_BY_PATHNAME[pathname]) {
    return PAGE_META_BY_PATHNAME[pathname];
  }

  const profile = pathname.match(/^\/participants\/(composers|soloists|ensembles)\/([^/]+)\/?$/);
  if (profile) {
    const { composers } = await import("./data/composers");
    const { soloists, ensembles } = await import("./data/participants");
    const people = profile[1] === "composers" ? composers : profile[1] === "soloists" ? soloists : ensembles;
    const person = people.find(item => item.slug === profile[2]);
    if (person) return {
      title: person.name + " — Композиторы XXI века",
      description: person.description,
      canonicalPath: pathname,
    };
  }

  return {
    title: "Страница не найдена",
    description: "Страница не найдена.",
    canonicalPath: pathname,
    robots: "noindex, follow",
  };
}

function PageLoadingSpace() {
  return <div aria-hidden="true" className="min-h-[calc(100svh-5rem)] bg-[var(--color-bg)]" />;
}

function RootLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const navigationType = useNavigationType();
  const lastTrackedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useEffect(() => {
    initializeYandexMetrika();
  }, []);

  useEffect(() => {
    let active = true;
    void getPageMeta(location.pathname).then(meta => { if (active) applyPageMeta(meta); });
    return () => { active = false; };
  }, [location.pathname]);

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

  return (
    <div className={`site-shell ${location.pathname === "/" ? "site-shell--home" : ""} min-h-screen overflow-x-clip bg-[var(--color-bg)] text-[var(--color-text)]`}>
      {(location.pathname === "/" || location.pathname === "/hero2" || location.pathname === "/hero3") ? (
        <>
          <SiteHeader mode="home-old-hero" />
          <SiteHeader mode="home-old-solid" />
        </>
      ) : (
        <SiteHeader />
      )}
      <main data-homepage={location.pathname === "/" ? "" : undefined}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.42, 0, 0.58, 1] }}
          >
            <Suspense fallback={<PageLoadingSpace />}>
              <RouteScrollRestoration entryKey={location.key} pathname={location.pathname} search={location.search} hash={location.hash} navigationType={navigationType}>
                {outlet}
                <SiteFooter />
              </RouteScrollRestoration>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/intro-test",
    element: <Suspense fallback={<PageLoadingSpace />}><IntroTestPage /></Suspense>,
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <FestivalPageLegacy /> },
      { path: "hero2", element: <HeroVariantPage /> },
      { path: "hero3", element: <HeroVariantPage variant="paper" /> },
      { path: "festival", element: <AboutFestivalPage /> },
      { path: "academies", element: <AcademiesPage /> },
      { path: "festival-lab", element: <FestivalLabPage /> },
      { path: "afisha", element: <AfishaPage /> },
      { path: "translyatsii", element: <BroadcastsPage /> },
      { path: "media", element: <MediaPage /> },
      { path: "participants", element: <ParticipantsPage /> },
      { path: "team", element: <TeamPage /> },
      { path: "participants/composers/:slug", element: <ComposerPage /> },
      { path: "participants/ensembles/:slug", element: <EnsemblePage /> },
      { path: "participants/soloists/:slug", element: <SoloistPage /> },
      { path: "partners", element: <PartnersPage /> },
      { path: "privacy", element: <PrivacyPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
