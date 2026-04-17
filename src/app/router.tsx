import { useLayoutEffect } from "react";
import { Navigate, Outlet, createBrowserRouter, useLocation } from "react-router-dom";
import { SiteFooter } from "./layout/SiteFooter";
import { SiteHeader } from "./layout/SiteHeader";
import { AfishaPage } from "./pages/AfishaPage";
import { ComposerPage } from "./pages/ComposerPage";
import { EnsemblePage } from "./pages/EnsemblePage";
import { FestivalPage } from "./pages/FestivalPage";
import { ParticipantsPage } from "./pages/ParticipantsPage";
import { PartnersPage } from "./pages/PartnersPage";
import { SoloistPage } from "./pages/SoloistPage";

function RootLayout() {
  const location = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--color-bg)] text-[var(--color-text)]">
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <FestivalPage /> },
      { path: "festival", element: <Navigate to="/" replace /> },
      { path: "afisha", element: <AfishaPage /> },
      { path: "participants", element: <ParticipantsPage /> },
      { path: "participants/composers/:slug", element: <ComposerPage /> },
      { path: "participants/ensembles/:slug", element: <EnsemblePage /> },
      { path: "participants/soloists/:slug", element: <SoloistPage /> },
      { path: "partners", element: <PartnersPage /> },
    ],
  },
]);
