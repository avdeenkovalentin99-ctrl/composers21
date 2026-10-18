import { useRef } from "react";
import { useInView } from "motion/react";
import { EditorialCta } from "../ui/EditorialCta";
import { PageContainer } from "../../layout/PageContainer";
import "./FestivalIntro.css";

export function FestivalIntro() {
  const contentRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(contentRef, { once: true, amount: 0.12 });

  return (
    <section className="bg-white text-neutral-950" aria-labelledby="festival-about-title">
      <PageContainer className="py-14 sm:py-18 home-desktop:py-24 home-desktop:xl:py-32 home-desktop:2xl:py-36">
        <div ref={contentRef} data-visible={isInView} className="festival-intro-content mx-auto grid max-w-[1160px] grid-cols-1 gap-y-8 home-desktop:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] home-desktop:gap-x-12 home-desktop:xl:gap-x-16">
          <div className="festival-intro-reveal festival-intro-lead">
            <h2
              id="festival-about-title"
              className="font-editorial-serif max-w-[720px] text-[clamp(27px,6.9vw,38px)] home-desktop:text-[clamp(34px,3.125vw,40px)] font-normal leading-[1.08] tracking-[-0.025em]"
            >
              «Композиторы XXI века» — фестиваль современной академической музыки, объединяющий композиторов,
              исполнителей и слушателей вокруг музыки нашего времени.
            </h2>
          </div>

          <div className="flex flex-col gap-5 home-desktop:min-h-[330px] home-desktop:gap-9 home-desktop:pt-1 home-desktop:xl:gap-11">
            <p className="festival-intro-reveal festival-intro-paragraph festival-intro-paragraph-first font-editorial-sans text-[14px] font-normal leading-[1.65] text-neutral-700 home-desktop:xl:text-[15px]">
              Здесь встречаются разные поколения, художественные языки и традиции — от уже сложившегося
              современного репертуара до музыки, создающейся сегодня.
            </p>
            <p className="festival-intro-reveal festival-intro-paragraph festival-intro-paragraph-second font-editorial-sans text-[14px] font-normal leading-[1.65] text-neutral-700 home-desktop:xl:text-[15px]">
              Фестиваль задуман как пространство живого звучания, внимательного слушания и диалога. Современная
              академическая музыка здесь существует не как закрытая профессиональная территория, а как часть
              сегодняшней культурной реальности.
            </p>
            <EditorialCta
              to="/festival"
              className="festival-intro-reveal festival-intro-cta mt-3 home-desktop:mt-auto self-start"
            >
              О фестивале
            </EditorialCta>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
