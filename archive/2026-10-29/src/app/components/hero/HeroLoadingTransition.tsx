import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { PageContainer } from "../../layout/PageContainer";

// Temporary switch: keep the intro code in place, but skip it during deployment.
export const HERO_LOADING_TRANSITION_ENABLED = false;

const desktopMediaQuery = "(min-width: 1024px)";
const curtainDelayMs = 140;
const curtainDurationSeconds = 4.86;
const curtainEase = [0.2, 0.82, 0.18, 1] as const;
const loadFallbackMs = 2400;
const stripeTravelX = "calc(-100vw - 100%)";

const inversionStripes = [
  { delay: 1.04, duration: 3.34, width: "clamp(132px,12vw,220px)" },
  { delay: 1.34, duration: 3.02, width: "clamp(58px,5vw,96px)" },
  { delay: 1.72, duration: 3.18, width: "clamp(104px,9vw,176px)" },
  { delay: 2.04, duration: 2.92, width: "clamp(46px,4vw,78px)" },
  { delay: 2.4, duration: 3.02, width: "clamp(86px,7vw,148px)" },
  { delay: 2.78, duration: 2.72, width: "clamp(38px,3vw,64px)" },
  { delay: 3.14, duration: 2.94, width: "clamp(70px,6vw,126px)" },
] as const;

const lastInversionStripeEndSeconds = Math.max(...inversionStripes.map((stripe) => stripe.delay + stripe.duration));

type IntroMode = "desktop" | "off";

type RevealProps = {
  initial: false;
  animate: { opacity: number; y: number; filter: string };
  transition: { duration: number };
};

type HeroLoadingTransitionState = {
  introMode: IntroMode;
  showDesktopOverlay: boolean;
  startDesktopCurtain: boolean;
  logoRevealProps: RevealProps;
  posterRevealProps: RevealProps;
  textRevealProps: RevealProps;
  selectorRevealProps: RevealProps;
};

const noRevealProps: RevealProps = {
  initial: false,
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0 },
};

function getInitialIntroMode(): IntroMode {
  if (!HERO_LOADING_TRANSITION_ENABLED || typeof window === "undefined") {
    return "off";
  }

  return window.matchMedia(desktopMediaQuery).matches ? "desktop" : "off";
}

export function useHeroLoadingTransition(posterImageSrc?: string): HeroLoadingTransitionState {
  const [introMode] = useState<IntroMode>(getInitialIntroMode);
  const [showDesktopOverlay, setShowDesktopOverlay] = useState(introMode === "desktop");
  const [startDesktopCurtain, setStartDesktopCurtain] = useState(false);

  useEffect(() => {
    if (introMode !== "desktop") {
      return;
    }

    let disposed = false;
    let pageLoaded = document.readyState === "complete";
    let posterLoaded = !posterImageSrc;
    let startTimeoutId: number | null = null;
    let fallbackTimeoutId: number | null = null;
    const posterImage = posterImageSrc ? new Image() : null;

    const finalizeIntro = () => {
      if (disposed || startDesktopCurtain) {
        return;
      }

      if (!pageLoaded || !posterLoaded) {
        return;
      }

      startTimeoutId = window.setTimeout(() => {
        if (!disposed) {
          setStartDesktopCurtain(true);
        }
      }, curtainDelayMs);
    };

    const handleWindowLoad = () => {
      pageLoaded = true;
      finalizeIntro();
    };

    if (!pageLoaded) {
      window.addEventListener("load", handleWindowLoad, { once: true });
    }

    if (posterImage && posterImageSrc) {
      const handlePosterLoad = () => {
        posterLoaded = true;
        finalizeIntro();
      };

      posterImage.onload = handlePosterLoad;
      posterImage.onerror = handlePosterLoad;
      posterImage.src = posterImageSrc;

      if (posterImage.complete) {
        posterLoaded = true;
      }
    }

    fallbackTimeoutId = window.setTimeout(() => {
      pageLoaded = true;
      posterLoaded = true;
      finalizeIntro();
    }, loadFallbackMs);

    finalizeIntro();

    return () => {
      disposed = true;

      if (!pageLoaded) {
        window.removeEventListener("load", handleWindowLoad);
      }

      if (startTimeoutId !== null) {
        window.clearTimeout(startTimeoutId);
      }

      if (fallbackTimeoutId !== null) {
        window.clearTimeout(fallbackTimeoutId);
      }

      if (posterImage) {
        posterImage.onload = null;
        posterImage.onerror = null;
      }
    };
  }, [introMode, posterImageSrc, startDesktopCurtain]);

  useEffect(() => {
    if (introMode !== "desktop" || !startDesktopCurtain) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowDesktopOverlay(false);
    }, Math.max(curtainDurationSeconds, lastInversionStripeEndSeconds) * 1000 + 180);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [introMode, startDesktopCurtain]);

  return {
    introMode,
    showDesktopOverlay,
    startDesktopCurtain,
    logoRevealProps: noRevealProps,
    posterRevealProps: noRevealProps,
    textRevealProps: noRevealProps,
    selectorRevealProps: noRevealProps,
  };
}

export function HeroDesktopLoadingOverlay({
  show,
  startCurtain,
  logo,
}: {
  show: boolean;
  startCurtain: boolean;
  logo: ReactNode;
}) {
  if (!HERO_LOADING_TRANSITION_ENABLED || !show) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] hidden overflow-hidden lg:block">
      <motion.div
        initial={false}
        animate={startCurtain ? { x: "-100%" } : { x: "0%" }}
        transition={{ duration: curtainDurationSeconds, ease: curtainEase }}
        className="absolute inset-0 z-0 bg-[#0A0A0A]"
      />

      {inversionStripes.map((stripe, index) => (
        <motion.div
          key={`${index}-${stripe.delay}-${stripe.width}`}
          initial={false}
          animate={startCurtain ? { x: stripeTravelX } : { x: "0%" }}
          transition={{ duration: stripe.duration, delay: stripe.delay, ease: curtainEase }}
          className="absolute inset-y-0 left-full z-20"
          style={{
            width: stripe.width,
            backgroundColor: "#ffffff",
            mixBlendMode: "difference",
          }}
        />
      ))}

      <div className="h-full pt-24 sm:pt-28">
        <PageContainer className="relative z-10 h-full py-6 sm:py-10 lg:py-12">
          <div className="grid h-full gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.95fr)] lg:gap-14">
            <div className="flex flex-col lg:min-h-[660px]">
              <div className="pointer-events-none relative flex items-start justify-start overflow-hidden -mt-10 lg:-mt-12 lg:flex-1">
                <motion.div
                  initial={false}
                  animate={startCurtain ? { clipPath: "inset(0 100% 0 0)" } : { clipPath: "inset(0 0% 0 0)" }}
                  transition={{ duration: curtainDurationSeconds, ease: curtainEase }}
                  className="relative w-full max-w-[560px]"
                >
                  {logo}
                </motion.div>
              </div>
            </div>
          </div>
        </PageContainer>
      </div>
    </div>
  );
}
