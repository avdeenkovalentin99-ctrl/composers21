import { type CSSProperties, useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { HomeHero } from "../components/hero/HomeHero";
import { PageContainer } from "../layout/PageContainer";
import nikoGalleryPianoDetailImage from "../../../tmp_data/niko_refs/8e7dd019db22adc310b92256bb57513b.png";

const nikoGalleryHeroPanoramaImage = "https://nikoartgallery.com/upload/iblock/3e8/3e80a65d6dda9c625e4615380e61724b.png";
const nikoGalleryHeroSecondImage = "https://nikoartgallery.com/upload/iblock/0da/0dabca39ed4a742c2857d6c53e8b85c6.jpg";

const festivalIntroLead =
  "Этот проект посвящён музыке современников — произведениям, ставшим значимыми событиями нашего времени.";

const festivalIntroParagraphs = [
  "Исполнять их будут выдающиеся музыканты, и многие из них являются прямыми адресатами этих музыкальных посланий. В программе лучшее из того, что звучало в последние годы на самых разных площадках: от камерных салонов до главных концертных залов Москвы и других мировых столиц.",
  "Нас ждут 14 концертов, охватывающих самые разные стили и жанры, а также встречи с ярчайшими звёздами российской и мировой сцены — дирижёрами, композиторами и художниками.",
  "Нам было невероятно важно сохранить аутентичную атмосферу и настроение каждого коллектива и каждого солиста. Мы не стремимся подвести искусство под один стандарт: мы хотим дать пространство характерам музыкантов, их предпочтениям и взглядам на вещи. Пусть музыка звучит во всём своём многообразии — родившаяся здесь и сейчас, в исполнении именно этих людей.",
];

const projectParagraphs = [
  "Сама концепция фестиваля во многом выросла из группы Пианисты XXI века. В этом интернет-сообществе когда-то собирались меломаны, завсегдатаи концертов, музыкальные критики, художники, поэты и, что самое главное, сами исполнители. Удивительно, как в этом сообществе умели находить точки соприкосновения даже в самых жарких дискуссиях.",
  "Мы захотели перенести эту идею в реальность, в пространство живого общения композиторов, музыкантов и слушателей. Акцент на диалог внутри искусства, на необходимость такого диалога — основа нашего проекта. Именно он открывает невероятные возможности для развития, совместного творчества и вдохновения.",
  "Кроме того, фестиваль поддерживает молодых авторов и исполнителей, которые уже ярко заявили о себе и получили восторженный отклик от профессионалов. Мы с радостью следим за новыми событиями и постепенно расширяем круг наших общих музыкальных знакомств — как в нашей стране, так и во всём мире.",
];

const spaceParagraphs = [
  "Фестиваль проходит в Галерее НИКО — пространстве, выросшем из мастерской академика Н. Б. Никогосяна, где сегодня сохраняется его художественное наследие и продолжается живая культурная жизнь.",
  "Это место объединяет выставочную практику и концертную деятельность, создавая естественную среду для встречи музыки, пространства и зрителя.",
  "Камерный масштаб и особая атмосфера галереи позволяют воспринимать современную музыку как личное и сосредоточенное переживание.",
];

const introTextClassName =
  "font-editorial-serif text-left text-[17px] leading-[1.62] text-neutral-700 sm:text-[18px] sm:leading-[1.65] [&>p+*]:mt-7";

const bodyTextClassName =
  "font-editorial-serif space-y-6 text-left text-[17px] leading-[1.62] text-neutral-700 sm:text-[18px] sm:leading-[1.65]";

const sideLabelClassName =
  "font-editorial-serif text-[1.9rem] leading-[0.95] font-normal tracking-[0.14em] lowercase text-neutral-900 sm:text-[2.2rem] lg:text-[2.5rem]";

type FestivalCutoutMockProps = {
  align?: "left" | "right";
  frameClassName: string;
  frameStyle?: CSSProperties;
  primaryWindowClassName: string;
  secondaryWindowClassName?: string;
  primaryImageSrc: string;
  secondaryImageSrc?: string;
  primaryImagePosition?: string;
  secondaryImagePosition?: string;
  primaryXRange?: [number, number];
  secondaryXRange?: [number, number];
  secondaryYRange?: [number, number];
  secondaryRevealScaleXRange?: [number, number];
  secondaryRevealOrigin?: "left" | "right";
  smoothMotion?: boolean;
  secondaryUseIndependentMotion?: boolean;
  secondaryUseIndependentPosition?: boolean;
};

function FestivalCutoutMock({
  align = "left",
  frameClassName,
  frameStyle,
  primaryWindowClassName,
  secondaryWindowClassName,
  primaryImageSrc,
  secondaryImageSrc,
  primaryImagePosition = "50% 50%",
  secondaryImagePosition = "50% 50%",
  primaryXRange = [-32, 28],
  secondaryXRange = [22, -18],
  secondaryYRange = [0, 0],
  secondaryRevealScaleXRange = [1, 1],
  secondaryRevealOrigin = "left",
  smoothMotion = false,
  secondaryUseIndependentMotion = false,
  secondaryUseIndependentPosition = false,
}: FestivalCutoutMockProps) {
  const cutoutRef = useRef<HTMLDivElement | null>(null);
  const primaryWindowRef = useRef<HTMLDivElement | null>(null);
  const secondaryWindowRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const [primaryWindowOffset, setPrimaryWindowOffset] = useState({ left: 0, top: 0 });
  const [secondaryWindowOffset, setSecondaryWindowOffset] = useState({ left: 0, top: 0 });
  const { scrollYProgress } = useScroll({
    target: cutoutRef,
    offset: ["start 88%", "end 18%"],
  });

  useEffect(() => {
    const frameElement = cutoutRef.current;
    const primaryWindowElement = primaryWindowRef.current;

    if (!frameElement || !primaryWindowElement) {
      return;
    }

    const updateGeometry = () => {
      const frameRect = frameElement.getBoundingClientRect();
      const primaryRect = primaryWindowElement.getBoundingClientRect();
      const secondaryRect = secondaryWindowRef.current?.getBoundingClientRect();

      setFrameSize({ width: frameRect.width, height: frameRect.height });
      setPrimaryWindowOffset({
        left: primaryRect.left - frameRect.left,
        top: primaryRect.top - frameRect.top,
      });

      if (secondaryRect) {
        setSecondaryWindowOffset({
          left: secondaryRect.left - frameRect.left,
          top: secondaryRect.top - frameRect.top,
        });
      }
    };

    updateGeometry();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => updateGeometry()) : null;

    resizeObserver?.observe(frameElement);
    resizeObserver?.observe(primaryWindowElement);

    if (secondaryWindowRef.current) {
      resizeObserver?.observe(secondaryWindowRef.current);
    }

    window.addEventListener("resize", updateGeometry);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateGeometry);
    };
  }, [secondaryWindowClassName]);

  const primaryXRaw = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : primaryXRange,
  );
  const secondaryXRaw = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : secondaryXRange,
  );
  const secondaryYRaw = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : secondaryYRange,
  );
  const secondaryRevealProgressRaw = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion
      ? [secondaryRevealScaleXRange[1], secondaryRevealScaleXRange[1]]
      : secondaryRevealScaleXRange,
  );
  const primaryXSmooth = useSpring(primaryXRaw, { stiffness: 180, damping: 28, mass: 0.35 });
  const secondaryXSmooth = useSpring(secondaryXRaw, { stiffness: 180, damping: 28, mass: 0.35 });
  const secondaryYSmooth = useSpring(secondaryYRaw, { stiffness: 180, damping: 28, mass: 0.35 });
  const secondaryRevealProgressSmooth = useSpring(secondaryRevealProgressRaw, {
    stiffness: 180,
    damping: 28,
    mass: 0.35,
  });
  const primaryX = smoothMotion ? primaryXSmooth : primaryXRaw;
  const secondaryX = smoothMotion ? secondaryXSmooth : secondaryXRaw;
  const secondaryY = smoothMotion ? secondaryYSmooth : secondaryYRaw;
  const secondaryRevealProgress = smoothMotion ? secondaryRevealProgressSmooth : secondaryRevealProgressRaw;
  const secondaryRevealClipPath = useTransform(secondaryRevealProgress, (value) => {
    const clamped = Math.max(0, Math.min(1, value));
    const hiddenPercent = `${(1 - clamped) * 100}%`;

    return secondaryRevealOrigin === "right"
      ? `inset(0 0 0 ${hiddenPercent})`
      : `inset(0 ${hiddenPercent} 0 0)`;
  });
  const primaryScale = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [1.22, 1.22] : [1.28, 1.18],
  );
  const secondaryScale = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [1.24, 1.24] : [1.3, 1.2],
  );
  const grayscale = useTransform(
    scrollYProgress,
    [0, 0.28, 0.58, 0.82, 1],
    prefersReducedMotion ? [0.38, 0.38, 0.38, 0.38, 0.38] : [0.98, 0.9, 0.7, 0.34, 0.24],
  );
  const saturate = useTransform(
    scrollYProgress,
    [0, 0.28, 0.58, 0.82, 1],
    prefersReducedMotion ? [0.88, 0.88, 0.88, 0.88, 0.88] : [0.7, 0.76, 0.84, 0.94, 0.98],
  );
  const brightness = useTransform(
    scrollYProgress,
    [0, 0.28, 0.58, 0.82, 1],
    prefersReducedMotion ? [0.988, 0.988, 0.988, 0.988, 0.988] : [0.96, 0.97, 0.98, 0.992, 0.998],
  );
  const contrast = useTransform(
    scrollYProgress,
    [0, 0.28, 0.58, 0.82, 1],
    prefersReducedMotion ? [1.02, 1.02, 1.02, 1.02, 1.02] : [1.01, 1.016, 1.024, 1.032, 1.036],
  );
  const sharedFilter = useMotionTemplate`grayscale(${grayscale}) saturate(${saturate}) brightness(${brightness}) contrast(${contrast})`;
  const isContinuousSecondaryImage = secondaryImageSrc === undefined || secondaryImageSrc === primaryImageSrc;
  const useIndependentSecondaryLayer = secondaryUseIndependentMotion || secondaryUseIndependentPosition;
  const resolvedSecondaryX = useIndependentSecondaryLayer
    ? secondaryX
    : isContinuousSecondaryImage
      ? primaryX
      : secondaryX;
  const resolvedSecondaryY = useIndependentSecondaryLayer ? secondaryY : 0;
  const resolvedSecondaryScale = useIndependentSecondaryLayer
    ? primaryScale
    : isContinuousSecondaryImage
      ? primaryScale
      : secondaryScale;
  const resolvedSecondaryPosition = (isContinuousSecondaryImage && !secondaryUseIndependentPosition)
    ? primaryImagePosition
    : secondaryImagePosition;

  return (
    <div
      className={`flex ${align === "right" ? "justify-start lg:justify-end" : "justify-start"}`}
    >
      <div
        ref={cutoutRef}
        aria-hidden="true"
        className={["relative", frameClassName].join(" ")}
        style={frameStyle}
      >
        <div
          ref={primaryWindowRef}
          className={[
            "absolute overflow-hidden",
            primaryWindowClassName,
          ].join(" ")}
        >
          <motion.img
            src={primaryImageSrc}
            alt=""
            aria-hidden="true"
            className="absolute max-w-none will-change-transform"
            style={{
              width: frameSize.width || undefined,
              height: frameSize.height || undefined,
              left: -(primaryWindowOffset.left || 0),
              top: -(primaryWindowOffset.top || 0),
              x: primaryX,
              scale: primaryScale,
              filter: sharedFilter,
              objectPosition: primaryImagePosition,
              objectFit: "cover",
              transformOrigin: "0 0",
            }}
          />
        </div>
        {secondaryWindowClassName ? (
          <motion.div
            ref={secondaryWindowRef}
            className={[
              "absolute overflow-hidden",
              secondaryWindowClassName,
            ].join(" ")}
            style={{
              clipPath: secondaryRevealClipPath,
            }}
          >
            <motion.img
              src={secondaryImageSrc ?? primaryImageSrc}
              alt=""
              aria-hidden="true"
              className="absolute max-w-none will-change-transform"
              style={{
                width: frameSize.width || undefined,
                height: frameSize.height || undefined,
              left: -(secondaryWindowOffset.left || 0),
              top: -(secondaryWindowOffset.top || 0),
              x: resolvedSecondaryX,
              y: resolvedSecondaryY,
              scale: resolvedSecondaryScale,
              filter: sharedFilter,
              objectPosition: resolvedSecondaryPosition,
                objectFit: "cover",
                transformOrigin: "0 0",
              }}
            />
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

export function FestivalPage() {
  const festivalSectionRef = useRef<HTMLElement | null>(null);
  const projectIntroBodyRef = useRef<HTMLDivElement | null>(null);
  const projectVisualRef = useRef<HTMLDivElement | null>(null);
  const projectMainWindowRef = useRef<HTMLDivElement | null>(null);
  const projectStripWindowRef = useRef<HTMLDivElement | null>(null);
  const ideaLabelRef = useRef<HTMLParagraphElement | null>(null);
  const ideaTextBodyRef = useRef<HTMLDivElement | null>(null);
  const [projectFrameSize, setProjectFrameSize] = useState({ width: 0, height: 0 });
  const [projectMainWindowOffset, setProjectMainWindowOffset] = useState({ left: 0, top: 0 });
  const [projectStripWindowOffset, setProjectStripWindowOffset] = useState({ left: 0, top: 0 });
  const [projectVisualHeightPx, setProjectVisualHeightPx] = useState<number | null>(null);
  const [ideaFrameHeightPx, setIdeaFrameHeightPx] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress: projectImageProgress } = useScroll({
    target: projectVisualRef,
    offset: ["start 88%", "end 18%"],
  });
  const projectImageX = useTransform(
    projectImageProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [28, -36],
  );
  const projectImageScale = useTransform(
    projectImageProgress,
    [0, 1],
    prefersReducedMotion ? [1.22, 1.22] : [1.28, 1.18],
  );
  const projectStripRevealProgressRaw = useTransform(
    projectImageProgress,
    [0, 0.32, 0.78, 1],
    prefersReducedMotion ? [1, 1, 1, 1] : [0, 0, 1, 1],
  );
  const projectStripClipPath = useTransform(projectStripRevealProgressRaw, (value) => {
    const clamped = Math.max(0, Math.min(1, value));

    return `inset(0 0 0 ${(1 - clamped) * 100}%)`;
  });
  const projectImageGrayscale = useTransform(
    projectImageProgress,
    [0, 0.28, 0.58, 0.82, 1],
    prefersReducedMotion ? [0.38, 0.38, 0.38, 0.38, 0.38] : [0.98, 0.9, 0.7, 0.34, 0.24],
  );
  const projectImageSaturate = useTransform(
    projectImageProgress,
    [0, 0.28, 0.58, 0.82, 1],
    prefersReducedMotion ? [0.88, 0.88, 0.88, 0.88, 0.88] : [0.7, 0.76, 0.84, 0.94, 0.98],
  );
  const projectImageBrightness = useTransform(
    projectImageProgress,
    [0, 0.28, 0.58, 0.82, 1],
    prefersReducedMotion ? [0.988, 0.988, 0.988, 0.988, 0.988] : [0.96, 0.97, 0.98, 0.992, 0.998],
  );
  const projectImageContrast = useTransform(
    projectImageProgress,
    [0, 0.28, 0.58, 0.82, 1],
    prefersReducedMotion ? [1.02, 1.02, 1.02, 1.02, 1.02] : [1.01, 1.016, 1.024, 1.032, 1.036],
  );
  const projectImageFilter = useMotionTemplate`grayscale(${projectImageGrayscale}) saturate(${projectImageSaturate}) brightness(${projectImageBrightness}) contrast(${projectImageContrast})`;
  const projectImageLayerWidth = projectFrameSize.width ? projectFrameSize.width * 1.7 : undefined;

  useEffect(() => {
    const introTextElement = projectIntroBodyRef.current;

    if (!introTextElement) {
      return;
    }

    const desktopBreakpointPx = 1024;
    const mainWindowBottomInsetPx = 68;
    const targetBottomOffsetPx = 56;

    const updateProjectHeight = () => {
      if (window.innerWidth < desktopBreakpointPx) {
        setProjectVisualHeightPx(null);
        return;
      }

      const introTextRect = introTextElement.getBoundingClientRect();
      const nextHeight = Math.max(
        576,
        Math.round(introTextRect.height + mainWindowBottomInsetPx + targetBottomOffsetPx),
      );

      setProjectVisualHeightPx(nextHeight);
    };

    updateProjectHeight();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => updateProjectHeight()) : null;

    resizeObserver?.observe(introTextElement);
    window.addEventListener("resize", updateProjectHeight);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateProjectHeight);
    };
  }, []);

  useEffect(() => {
    const frameElement = projectVisualRef.current;
    const mainWindowElement = projectMainWindowRef.current;
    const stripWindowElement = projectStripWindowRef.current;

    if (!frameElement || !mainWindowElement || !stripWindowElement) {
      return;
    }

    const updateProjectGeometry = () => {
      const frameRect = frameElement.getBoundingClientRect();
      const mainWindowRect = mainWindowElement.getBoundingClientRect();
      const stripWindowRect = stripWindowElement.getBoundingClientRect();

      setProjectFrameSize({ width: frameRect.width, height: frameRect.height });
      setProjectMainWindowOffset({
        left: mainWindowRect.left - frameRect.left,
        top: mainWindowRect.top - frameRect.top,
      });
      setProjectStripWindowOffset({
        left: stripWindowRect.left - frameRect.left,
        top: stripWindowRect.top - frameRect.top,
      });
    };

    updateProjectGeometry();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => updateProjectGeometry()) : null;

    resizeObserver?.observe(frameElement);
    resizeObserver?.observe(mainWindowElement);
    resizeObserver?.observe(stripWindowElement);
    window.addEventListener("resize", updateProjectGeometry);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateProjectGeometry);
    };
  }, []);

  useEffect(() => {
    const ideaLabelElement = ideaLabelRef.current;
    const ideaTextElement = ideaTextBodyRef.current;

    if (!ideaLabelElement || !ideaTextElement) {
      return;
    }

    const desktopBreakpointPx = 1024;
    const cutoutTopGapPx = 48;
    const targetBottomOffsetPx = 70;

    const updateIdeaGeometry = () => {
      if (window.innerWidth < desktopBreakpointPx) {
        setIdeaFrameHeightPx(null);
        return;
      }

      const labelRect = ideaLabelElement.getBoundingClientRect();
      const textRect = ideaTextElement.getBoundingClientRect();
      const nextHeight = Math.max(
        360,
        Math.round(textRect.height + targetBottomOffsetPx - labelRect.height - cutoutTopGapPx),
      );

      setIdeaFrameHeightPx(nextHeight);
    };

    updateIdeaGeometry();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => updateIdeaGeometry()) : null;

    resizeObserver?.observe(ideaLabelElement);
    resizeObserver?.observe(ideaTextElement);
    window.addEventListener("resize", updateIdeaGeometry);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateIdeaGeometry);
    };
  }, []);

  return (
    <>
      <HomeHero />

      <section ref={festivalSectionRef} className="relative pb-20 pt-4 sm:pb-24 sm:pt-6">
        <PageContainer className="space-y-18 sm:space-y-24">
          <div className="mx-auto grid max-w-6xl gap-8 pb-24 pt-5 sm:pb-28 sm:pt-6 md:px-4 lg:grid-cols-[minmax(0,520px)_minmax(280px,1fr)] lg:items-start lg:gap-8 lg:px-0 xl:grid-cols-[720px_minmax(0,1fr)] xl:gap-12">
            <div>
              <p className={`${sideLabelClassName} mb-8 sm:mb-10 lg:mb-12`}>
                о проекте
              </p>
              <div ref={projectIntroBodyRef} className={introTextClassName}>
                <p>{festivalIntroLead}</p>
                <p>{festivalIntroParagraphs[0]}</p>
                {festivalIntroParagraphs.slice(1).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="hidden md:block lg:hidden">
                <div className="relative ml-auto mt-12 h-[320px] w-[78%] max-w-[520px]">
                  <div className="pointer-events-none absolute bottom-[38px] left-[6%] right-0 top-[58px]">
                    <div className="absolute inset-0 overflow-hidden">
                      <motion.img
                        src={nikoGalleryHeroSecondImage}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover will-change-transform"
                        style={{
                          x: projectImageX,
                          scale: projectImageScale,
                          filter: projectImageFilter,
                          objectPosition: "8% 68%",
                        }}
                      />
                    </div>
                    <div className="absolute bottom-[-18px] right-[calc(100%+0.375rem)] top-[32px] w-[12px] overflow-hidden">
                      <motion.img
                        src={nikoGalleryHeroSecondImage}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover will-change-transform"
                        style={{
                          x: projectImageX,
                          scale: projectImageScale,
                          filter: projectImageFilter,
                          objectPosition: "8% 68%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-first hidden lg:order-none lg:block">
              <div
                ref={projectVisualRef}
                className="relative h-[388px] sm:h-[466px] lg:h-[520px] xl:h-[576px]"
                style={projectVisualHeightPx ? { height: `${projectVisualHeightPx}px` } : undefined}
              >
                <div
                  className="pointer-events-none absolute bottom-[52px] left-[8%] right-[-1.25rem] top-[78px] sm:bottom-[60px] sm:left-[10%] sm:right-[-2rem] sm:top-[96px] lg:bottom-[56px] lg:left-[8%] lg:right-[-2rem] lg:top-[92px] xl:bottom-[68px] xl:left-[10%] xl:right-[clamp(-6rem,calc((1248px-100vw)/2),0px)] xl:top-[118px]"
                >
                  <div ref={projectMainWindowRef} className="absolute inset-0 overflow-hidden">
                    <motion.img
                      src={nikoGalleryHeroSecondImage}
                      alt=""
                      aria-hidden="true"
                      className="absolute max-w-none will-change-transform"
                      style={{
                        width: projectImageLayerWidth,
                        height: projectFrameSize.height || undefined,
                        left: -(projectMainWindowOffset.left || 0),
                        top: -(projectMainWindowOffset.top || 0),
                        x: projectImageX,
                        scale: projectImageScale,
                        filter: projectImageFilter,
                        objectPosition: "8% 68%",
                        objectFit: "cover",
                        transformOrigin: "0 0",
                      }}
                    />
                  </div>
                  <motion.div
                    ref={projectStripWindowRef}
                    className="absolute bottom-[-28px] right-[calc(100%+0.375rem)] top-[44px] w-[12px] overflow-hidden sm:bottom-[-30px] sm:right-[calc(100%+0.5rem)] sm:top-[54px] sm:w-[16px] lg:bottom-[-28px] lg:right-[calc(100%+0.5rem)] lg:top-[48px] lg:w-[16px] xl:bottom-[-34px] xl:right-[calc(100%+0.625rem)] xl:top-[62px] xl:w-[18px]"
                    style={{ clipPath: projectStripClipPath }}
                  >
                    <motion.img
                      src={nikoGalleryHeroSecondImage}
                      alt=""
                      aria-hidden="true"
                      className="absolute max-w-none will-change-transform"
                      style={{
                        width: projectImageLayerWidth,
                        height: projectFrameSize.height || undefined,
                        left: -(projectStripWindowOffset.left || 0),
                        top: -(projectStripWindowOffset.top || 0),
                        x: projectImageX,
                        scale: projectImageScale,
                        filter: projectImageFilter,
                        objectPosition: "8% 68%",
                        objectFit: "cover",
                        transformOrigin: "0 0",
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          <div className="pb-10 pt-8 sm:pb-14 md:px-4 lg:px-0">
            <div className="mx-auto grid max-w-6xl gap-10 sm:gap-12 lg:grid-cols-[minmax(260px,1fr)_minmax(0,520px)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(320px,1fr)_720px] xl:gap-12">
              <div className="hidden md:block lg:hidden">
                <FestivalCutoutMock
                  frameClassName="-mt-[8px] h-[300px] w-[78%] max-w-[500px] -ml-[2%]"
                  primaryWindowClassName="bottom-0 left-0 right-[26px] top-[18px]"
                  secondaryWindowClassName="right-[-6px] top-[12px] bottom-[14px] w-[12px]"
                  primaryImageSrc={nikoGalleryPianoDetailImage}
                  primaryImagePosition="56% 68%"
                  secondaryImageSrc={nikoGalleryPianoDetailImage}
                  primaryXRange={[-22, 28]}
                  secondaryRevealScaleXRange={[0, 1]}
                  secondaryRevealOrigin="left"
                />
              </div>
              <div className="hidden lg:flex lg:flex-col">
                <FestivalCutoutMock
                  frameClassName="-mt-[10px] h-[296px] w-[128%] max-w-none -ml-[10%] sm:-mt-[14px] sm:h-[372px] sm:w-[132%] sm:-ml-[14%] lg:-mt-[18px] lg:w-[112%] lg:-ml-[6vw] xl:-mt-[26px] xl:w-[138%] xl:-ml-[16vw]"
                  frameStyle={ideaFrameHeightPx ? { height: `${ideaFrameHeightPx}px` } : undefined}
                  primaryWindowClassName="bottom-0 left-0 right-[26px] top-[20px] sm:right-[34px] sm:top-[24px] lg:right-[42px] lg:top-[30px]"
                  secondaryWindowClassName="right-[-6px] top-[10px] bottom-[14px] w-[12px] sm:right-[-8px] sm:top-[14px] sm:bottom-[18px] sm:w-[16px] lg:right-[-10px] lg:top-[18px] lg:bottom-[20px] lg:w-[18px]"
                  primaryImageSrc={nikoGalleryPianoDetailImage}
                  primaryImagePosition="56% 68%"
                  secondaryImageSrc={nikoGalleryPianoDetailImage}
                  primaryXRange={[-28, 36]}
                  secondaryRevealScaleXRange={[0, 1]}
                  secondaryRevealOrigin="left"
                />
              </div>

              <div className="lg:pl-[16px] xl:pl-[36px]">
                <p ref={ideaLabelRef} className={`${sideLabelClassName} mb-8 sm:mb-10 lg:mb-12`}>
                  идея
                </p>
                <div ref={ideaTextBodyRef} className={bodyTextClassName}>
                  {projectParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 md:px-4 lg:px-0">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,500px)_minmax(320px,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[720px_minmax(0,1fr)] xl:gap-12">
              <div className="order-2 lg:order-1">
                <p className={`${sideLabelClassName} mb-8 sm:mb-10 lg:mb-12`}>
                  пространство
                </p>
                <div className={bodyTextClassName}>
                  {spaceParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <div className="hidden md:block lg:hidden">
                  <FestivalCutoutMock
                    align="right"
                    frameClassName="-mt-[8px] ml-auto mt-12 h-[468px] w-[92%] max-w-[680px]"
                    primaryWindowClassName="bottom-[10px] left-[14px] right-0 top-[12px]"
                    secondaryWindowClassName="bottom-[10px] left-[-6px] top-[22px] w-[12px]"
                    primaryImageSrc={nikoGalleryHeroPanoramaImage}
                    primaryImagePosition="46% 62%"
                    secondaryImageSrc={nikoGalleryHeroPanoramaImage}
                    primaryXRange={[24, -28]}
                  />
                </div>
              </div>

              <div className="order-1 hidden w-full flex-col lg:order-2 lg:flex lg:items-end lg:text-right xl:-mr-[28px]">
                <FestivalCutoutMock
                  align="right"
                  frameClassName="-mt-[10px] h-[248px] w-full max-w-[360px] sm:-mt-[14px] sm:h-[292px] sm:max-w-[416px] lg:-mt-[18px] lg:h-[360px] lg:w-[420px] lg:max-w-none lg:-mr-[12px] xl:-mt-[26px] xl:h-[360px] xl:w-[468px] xl:-mr-[96px]"
                  primaryWindowClassName="bottom-[18px] left-[22px] right-0 top-[20px] sm:bottom-[22px] sm:left-[28px] sm:top-[24px] lg:bottom-[28px] lg:left-[28px] lg:right-0 lg:top-[30px]"
                  secondaryWindowClassName="bottom-[14px] left-[-6px] top-[34px] w-[12px] sm:bottom-[18px] sm:left-[-8px] sm:top-[42px] sm:w-[16px] lg:bottom-[20px] lg:left-[-10px] lg:top-[50px] lg:w-[18px]"
                  primaryImageSrc={nikoGalleryHeroPanoramaImage}
                  primaryImagePosition="46% 62%"
                  secondaryImageSrc={nikoGalleryHeroPanoramaImage}
                  primaryXRange={[28, -36]}
                />
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
