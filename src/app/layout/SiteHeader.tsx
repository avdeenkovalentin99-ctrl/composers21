import { MouseEvent, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { festivalInfo, navigationItems } from "../data/site";
import { PageContainer } from "./PageContainer";

function getNavClassName(isActive: boolean) {
  return [
    "font-editorial-sans relative text-[12px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200",
    isActive
      ? "bg-neutral-900 px-2 py-[1px] !text-white"
      : "text-neutral-600 hover:text-neutral-900",
  ].join(" ");
}

export function SiteHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isParticipantsLeaving, setIsParticipantsLeaving] = useState(false);

  const handleFestivalClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.currentTarget.getAttribute("href") !== "/") {
      return;
    }

    event.preventDefault();
    setMenuOpen(false);

    if (location.pathname !== "/") {
      navigate("/");
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleParticipantsLeave = () => setIsParticipantsLeaving(true);

    window.addEventListener("participants:leave", handleParticipantsLeave);

    return () => {
      window.removeEventListener("participants:leave", handleParticipantsLeave);
    };
  }, []);

  useEffect(() => {
    setIsParticipantsLeaving(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-150",
          isParticipantsLeaving
            ? "border-transparent bg-white"
            : isScrolled
              ? "border-black/70 bg-white"
              : "border-transparent bg-transparent",
        ].join(" ")}
      >
        <PageContainer>
          <div className="mb-1 flex items-center justify-between gap-6 py-4 sm:mb-1">
            <nav className="hidden items-center gap-x-16 lg:flex" aria-label="Основная навигация">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={item.to === "/" ? handleFestivalClick : undefined}
                  className={({ isActive }) => getNavClassName(isActive)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <NavLink
              to="/afisha"
              className={({ isActive }) =>
                [
                  "font-editorial-sans inline-flex items-center border text-[12px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200 sm:hidden",
                  isActive
                    ? "border-transparent bg-neutral-900 px-2 py-2 !text-white"
                    : "border-neutral-400 px-2 py-2 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900",
                ].join(" ")
              }
            >
              Афиша
            </NavLink>

            <div className="ml-auto flex items-center gap-3">
              <NavLink
                to="/afisha"
                className={({ isActive }) =>
                  [
                    "font-editorial-sans hidden items-center border text-[12px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200 sm:inline-flex",
                    isActive
                      ? "border-transparent bg-neutral-900 px-2 py-2 !text-white"
                      : "border-neutral-400 px-2 py-2 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900",
                  ].join(" ")
                }
              >
                Афиша
              </NavLink>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="font-editorial-sans inline-flex items-center gap-2 text-[0.74rem] font-light uppercase tracking-[0.18em] leading-none text-black/72 lg:hidden"
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
              >
                {menuOpen ? <X size={18} strokeWidth={1.6} /> : <Menu size={18} strokeWidth={1.6} />}
                Меню
              </button>
            </div>
          </div>
        </PageContainer>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-0 z-40 bg-[rgba(255,255,255,0.98)] pt-24 lg:hidden"
          >
            <PageContainer className="flex h-full flex-col justify-between pb-10">
              <nav className="flex flex-col items-center gap-5 text-center" aria-label="Мобильная навигация">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={item.to === "/" ? handleFestivalClick : undefined}
                    className={({ isActive }) =>
                      [
                        "font-editorial-sans inline-flex text-[12px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200 sm:text-[13px]",
                        isActive ? "bg-neutral-900 px-2 py-[1px] !text-white" : "text-neutral-600 hover:text-neutral-900",
                      ].join(" ")
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="space-y-2 border-t border-black/10 pt-6 text-sm leading-relaxed text-[var(--color-muted)]">
                <p>{festivalInfo.city}</p>
                <p>{festivalInfo.venue}</p>
                <p>{festivalInfo.dates}</p>
              </div>
            </PageContainer>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
