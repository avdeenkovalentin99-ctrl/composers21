import { MouseEvent, useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { navigationGroups, navigationItems } from "../data/navigation";
import type { NavGroup, NavItem } from "../data/types";
import { PageContainer } from "./PageContainer";

const HEADER_ROUTE_SETTLE_MS = 560;
const MOBILE_NAVIGATION_DELAY_MS = 250;
function getNavClassName(isActive: boolean, isLightOnHero = false) {
  return [
    "font-editorial-sans relative text-[12px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200",
    isActive
      ? "bg-neutral-900 px-2 py-[1px] !text-white"
      : isLightOnHero
        ? "text-white/72 hover:text-white"
        : "text-neutral-600 hover:text-neutral-900",
  ].join(" ");
}

function getNavGroupClassName(isActive: boolean, isLightOnHero = false) {
  return [
    "font-editorial-sans relative inline-flex text-[12px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200",
    isActive
      ? "bg-neutral-900 px-2 py-[1px] !text-white"
      : isLightOnHero
        ? "text-white/72 hover:text-white"
        : "text-neutral-600 hover:text-neutral-900",
  ].join(" ");
}

function isNavItemActive(item: NavItem, pathname: string) {
  if (item.to === "/") {
    return pathname === "/";
  }

  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function isNavGroupActive(group: NavGroup, pathname: string) {
  return group.children.some((item) => isNavItemActive(item, pathname));
}

function DropdownNavItem({
  group,
  pathname,
  onHomeClick,
  isOpen,
  onOpen,
  onClose,
  onToggle,
  onItemClick,
  useHoverInteraction,
  isLightOnHero,
}: {
  group: NavGroup;
  pathname: string;
  onHomeClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  onItemClick: () => void;
  useHoverInteraction: boolean;
  isLightOnHero?: boolean;
}) {
  const isActive = isNavGroupActive(group, pathname);
  const activeChild = group.children.find((item) => isNavItemActive(item, pathname));
  const showActiveChildAsGroup = activeChild?.to === "/media";
  const groupTarget = showActiveChildAsGroup
    ? activeChild.to
    : group.to ?? group.children[0]?.to ?? "/";
  const groupLabel = showActiveChildAsGroup ? activeChild.label : group.label;
  const dropdownId = `desktop-navigation-${group.children
    .map((item) => item.to.replace(/[^a-z0-9]+/gi, "-"))
    .join("-")}`;

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={useHoverInteraction ? onOpen : undefined}
      onMouseLeave={useHoverInteraction ? onClose : undefined}
    >
      <a
        href={groupTarget}
        className={getNavGroupClassName(isActive, isLightOnHero)}
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        aria-haspopup="true"
        onClick={(event) => {
          if (useHoverInteraction) {
            return;
          }

          event.preventDefault();
          onToggle();
        }}
      >
        {groupLabel}
      </a>
      {isOpen ? (
        <motion.div
          id={dropdownId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-1/2 top-full z-[60] inline-flex w-fit max-w-[calc(100vw-2.5rem)] -translate-x-[38%] pt-4"
        >
          <div
            className={[
              "inline-flex w-fit px-1 py-0.5",
              isLightOnHero ? "bg-transparent" : "bg-white",
            ].join(" ")}
          >
            <div className="inline-flex w-fit flex-nowrap items-center gap-x-5 gap-y-1.5">
              {group.children.map((item, index) => (
                <motion.span
                  key={`${group.label}-${item.to}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: index * 0.035, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NavLink
                    to={item.to}
                    onClick={(event) => {
                      if (item.to === "/") {
                        onHomeClick(event);
                      }
                      onItemClick();
                    }}
                    className={({ isActive: isChildActive }) =>
                      [
                        "font-editorial-sans whitespace-nowrap text-[10px] font-normal uppercase tracking-[0.12em] leading-none transition-colors duration-200",
                        isLightOnHero
                          ? isChildActive
                            ? "text-white"
                            : "text-white/72 hover:text-white"
                          : isChildActive
                            ? "text-neutral-950"
                            : "text-neutral-500 hover:text-neutral-900",
                      ].join(" ")
                    }
                  >
                    {item.label}
                  </NavLink>
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

function MobileNavGroup({
  group,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, to: string) => void;
}) {
  const isMediaChildActive = pathname === "/media" && group.children.some((item) => item.to === "/media");
  const isActive = isNavGroupActive(group, pathname) && !isMediaChildActive;
  const labelClassName = [
    "font-editorial-sans inline-flex text-[13px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200 sm:text-[14px]",
    isActive ? "!text-neutral-900" : "!text-neutral-900",
  ].join(" ");
  const labelContent = isActive ? (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true">|</span>
      <span>{group.label}</span>
      <span aria-hidden="true">|</span>
    </span>
  ) : (
    group.label
  );

  return (
    <div className="flex w-full flex-col items-start gap-4">
      {group.to ? (
        <NavLink to={group.to} onClick={(event) => onNavigate(event, group.to!)} className={labelClassName}>
          {labelContent}
        </NavLink>
      ) : (
        <span className={labelClassName}>{labelContent}</span>
      )}
      <div className="flex translate-x-8 flex-col items-start gap-4 text-left">
        {group.children.map((item) => (
          <NavLink
            key={`${group.label}-${item.to}`}
            to={item.to}
            onClick={(event) => onNavigate(event, item.to)}
            className={({ isActive: isChildActive }) =>
              [
                "font-editorial-sans inline-flex text-[11px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200 sm:text-[12px]",
                isChildActive ? "bg-neutral-900 px-2 py-[1px] !text-white" : "!text-neutral-600 hover:!text-neutral-900",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

type SiteHeaderMode = "default" | "home-old-hero" | "home-old-solid";

export function SiteHeader({ mode = "default" }: { mode?: SiteHeaderMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomeOldMode = mode === "home-old-hero" || mode === "home-old-solid";
  const isHomeOldHeroMode = mode === "home-old-hero";
  const isHomeOldSolidMode = mode === "home-old-solid";
  const [useHoverInteraction, setUseHoverInteraction] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDesktopGroup, setOpenDesktopGroup] = useState<string | null>(null);
  const [isParticipantsLeaving, setIsParticipantsLeaving] = useState(false);
  const [isRouteSettling, setIsRouteSettling] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const previousPathnameRef = useRef(location.pathname);
  const mobileNavigationTimeoutRef = useRef<number | null>(null);
  const hasSolidHeaderBackground =
    isHomeOldSolidMode || isParticipantsLeaving || isScrolled || (isRouteSettling && !isHomeOldMode);
  const hasHeaderBorder = (isHomeOldSolidMode || isScrolled) && !isParticipantsLeaving;
  const isLightOnHero = isHomeOldHeroMode && !isScrolled && !menuOpen;
  const [homeItem, partnersItem] = navigationItems;
  const [festivalGroup, archiveGroup] = navigationGroups;

  const handleFestivalClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.currentTarget.getAttribute("href") !== "/") {
      return;
    }

    event.preventDefault();
    setMenuOpen(false);
    setOpenDesktopGroup(null);

    if (location.pathname !== "/") {
      navigate("/");
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  const handleMobileNavigation = (event: MouseEvent<HTMLAnchorElement>, to: string) => {
    event.preventDefault();
    setMenuOpen(false);

    if (mobileNavigationTimeoutRef.current !== null) {
      window.clearTimeout(mobileNavigationTimeoutRef.current);
    }

    mobileNavigationTimeoutRef.current = window.setTimeout(() => {
      mobileNavigationTimeoutRef.current = null;

      if (location.pathname !== to) {
        navigate(to);
        return;
      }

      window.scrollTo({ top: 0, behavior: "auto" });
    }, MOBILE_NAVIGATION_DELAY_MS);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateInteractionMode = () => {
      setUseHoverInteraction(mediaQuery.matches);
      setOpenDesktopGroup(null);
    };

    updateInteractionMode();
    mediaQuery.addEventListener("change", updateInteractionMode);

    return () => {
      mediaQuery.removeEventListener("change", updateInteractionMode);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!isHomeOldMode) {
        setIsScrolled(window.scrollY > 48);
        return;
      }

      const heroElement = document.getElementById("home-old-hero");
      if (!heroElement) {
        setIsScrolled(false);
        return;
      }

      const headerHeight = headerRef.current?.offsetHeight ?? 64;
      const heroBottom = heroElement.getBoundingClientRect().bottom;
      setIsScrolled(heroBottom <= headerHeight);
    };

    onScroll();
    const animationFrameId = window.requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHomeOldMode]);

  useEffect(() => {
    setMenuOpen(false);
    setOpenDesktopGroup(null);

    if (previousPathnameRef.current === location.pathname) {
      return;
    }

    previousPathnameRef.current = location.pathname;
    setIsRouteSettling(true);

    const settleTimeoutId = window.setTimeout(() => {
      setIsRouteSettling(false);
    }, HEADER_ROUTE_SETTLE_MS);

    return () => {
      window.clearTimeout(settleTimeoutId);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!openDesktopGroup) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const headerElement = headerRef.current;

      if (headerElement?.contains(event.target as Node)) {
        return;
      }

      setOpenDesktopGroup(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDesktopGroup(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openDesktopGroup]);

  useEffect(() => {
    const handleParticipantsLeave = () => setIsParticipantsLeaving(true);

    window.addEventListener("participants:leave", handleParticipantsLeave);

    return () => {
      if (mobileNavigationTimeoutRef.current !== null) {
        window.clearTimeout(mobileNavigationTimeoutRef.current);
      }

      window.removeEventListener("participants:leave", handleParticipantsLeave);
    };
  }, []);

  useEffect(() => {
    setIsParticipantsLeaving(false);
  }, [location.pathname]);

  return (
    <>
      <header
        ref={headerRef}
        className={[
          "inset-x-0 top-0 z-50 border-b transition-[opacity,transform,background-color,border-color] duration-300 ease-out",
          isHomeOldHeroMode ? "absolute" : "fixed",
          isHomeOldHeroMode && isScrolled ? "pointer-events-none opacity-0" : "",
          isHomeOldSolidMode && !isScrolled ? "pointer-events-none opacity-0" : "",
          isHomeOldSolidMode && isScrolled ? "opacity-100" : "",
          hasSolidHeaderBackground ? "bg-white duration-300" : "bg-transparent duration-500",
          hasHeaderBorder ? "border-black/70" : "border-transparent",
          isLightOnHero ? "site-header-light-on-hero" : "",
        ].join(" ")}
      >
        <PageContainer>
          <div className="mb-1 flex items-center justify-between gap-6 pb-4 pt-6">
            <NavLink
              to="/"
              onClick={handleFestivalClick}
              className={[
                "shrink-0 items-center gap-1.5",
                isLightOnHero ? "hidden" : "hidden text-neutral-800 lg:inline-flex",
              ].join(" ")}
              aria-label="Композиторы XXI века — главная"
            >
              <span className="block h-[9px] w-[9px] shrink-0 bg-[#952733]" aria-hidden="true" />
              <span className="font-editorial-sans whitespace-nowrap text-[11px] font-normal uppercase leading-none tracking-[0.13em]">
                Композиторы XXI века
              </span>
            </NavLink>

            <nav className="hidden items-center gap-x-16 lg:ml-auto lg:flex xl:gap-x-24 2xl:gap-x-32" aria-label="Основная навигация">
              {homeItem ? (
                <NavLink
                  to={homeItem.to}
                  onClick={homeItem.to === "/" ? handleFestivalClick : undefined}
                  className={({ isActive }) => getNavClassName(isActive, isLightOnHero)}
                >
                  {homeItem.label}
                </NavLink>
              ) : null}
              {festivalGroup ? (
                <DropdownNavItem
                  group={festivalGroup}
                  pathname={location.pathname}
                  onHomeClick={handleFestivalClick}
                  isOpen={openDesktopGroup === festivalGroup.label}
                  onOpen={() => setOpenDesktopGroup(festivalGroup.label)}
                  onClose={() => setOpenDesktopGroup(null)}
                  onToggle={() => setOpenDesktopGroup((current) => (current === festivalGroup.label ? null : festivalGroup.label))}
                  onItemClick={() => setOpenDesktopGroup(null)}
                  useHoverInteraction={useHoverInteraction}
                  isLightOnHero={isLightOnHero}
                />
              ) : null}
              {archiveGroup ? (
                <DropdownNavItem
                  group={archiveGroup}
                  pathname={location.pathname}
                  onHomeClick={handleFestivalClick}
                  isOpen={openDesktopGroup === archiveGroup.label}
                  onOpen={() => setOpenDesktopGroup(archiveGroup.label)}
                  onClose={() => setOpenDesktopGroup(null)}
                  onToggle={() => setOpenDesktopGroup((current) => (current === archiveGroup.label ? null : archiveGroup.label))}
                  onItemClick={() => setOpenDesktopGroup(null)}
                  useHoverInteraction={useHoverInteraction}
                  isLightOnHero={isLightOnHero}
                />
              ) : null}
              {partnersItem ? (
                <NavLink to={partnersItem.to} className={({ isActive }) => getNavClassName(isActive, isLightOnHero)}>
                  {partnersItem.label}
                </NavLink>
              ) : null}
            </nav>

            <div className="-mr-2 ml-auto flex items-center gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className={[
                  "font-editorial-sans inline-flex items-center gap-2 text-[0.74rem] font-light uppercase tracking-[0.18em] leading-none transition-colors duration-200 lg:hidden",
                  isLightOnHero ? "text-white/72" : "text-black/72",
                ].join(" ")}
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
            className="fixed inset-0 z-40 bg-white/99 pt-24 lg:hidden"
          >
            <PageContainer className="flex h-full flex-col pb-10">
              <nav className="mx-auto flex w-[190px] translate-x-12 flex-col items-start gap-8 text-left" aria-label="Мобильная навигация">
                {homeItem ? (
                  <NavLink
                    to={homeItem.to}
                    onClick={(event) => handleMobileNavigation(event, homeItem.to)}
                    className={({ isActive }) =>
                      [
                        "font-editorial-sans inline-flex text-[13px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200 sm:text-[14px]",
                        isActive ? "bg-neutral-900 px-2 py-[1px] !text-white" : "!text-neutral-900 hover:!text-neutral-950",
                      ].join(" ")
                    }
                  >
                    {homeItem.label}
                  </NavLink>
                ) : null}
                {festivalGroup ? (
                  <MobileNavGroup
                    group={festivalGroup}
                    pathname={location.pathname}
                    onNavigate={handleMobileNavigation}
                  />
                ) : null}
                {archiveGroup ? (
                  <MobileNavGroup
                    group={archiveGroup}
                    pathname={location.pathname}
                    onNavigate={handleMobileNavigation}
                  />
                ) : null}
                {partnersItem ? (
                  <NavLink
                    to={partnersItem.to}
                    onClick={(event) => handleMobileNavigation(event, partnersItem.to)}
                    className={({ isActive }) =>
                      [
                        "font-editorial-sans inline-flex text-[13px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200 sm:text-[14px]",
                        isActive ? "bg-neutral-900 px-2 py-[1px] !text-white" : "!text-neutral-900 hover:!text-neutral-950",
                      ].join(" ")
                    }
                  >
                    {partnersItem.label}
                  </NavLink>
                ) : null}
              </nav>
            </PageContainer>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
