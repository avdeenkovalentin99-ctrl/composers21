import { Link } from "react-router-dom";
import { LogoVideoHero } from "../components/hero/LogoVideoHero";
import { FestivalIntro } from "../components/hero/FestivalIntro";

export function HeroVariantPage({ variant = "graphite" }: { variant?: "graphite" | "paper" }) {
  return (
    <>
      <LogoVideoHero variant={variant} />
      <FestivalIntro />
      <div className="font-editorial-sans flex justify-center border-t border-black/10 px-6 py-8 text-xs uppercase tracking-[0.12em]">
        <Link to="/" className="border-b border-black/30 pb-1 transition-colors hover:text-neutral-500">
          На главную →
        </Link>
      </div>
    </>
  );
}
