import { Link } from "react-router-dom";
import { PageContainer } from "../layout/PageContainer";

export function NotFoundPage() {
  return (
    <section className="pb-24 pt-32 text-neutral-950 sm:pb-32 sm:pt-40">
      <PageContainer>
        <div className="mx-auto max-w-3xl">
          <p className="font-editorial-sans text-[12px] uppercase tracking-[0.16em] text-neutral-500">404</p>
          <h1 className="font-editorial-serif mt-5 text-[2.8rem] font-normal leading-none sm:text-[4.6rem]">
            Страница не найдена
          </h1>
          <p className="font-editorial-serif mt-8 max-w-xl text-[1.08rem] leading-8 text-neutral-600 sm:text-[1.18rem]">
            Возможно, адрес изменился или страница была убрана из публичной навигации.
          </p>
          <div className="font-editorial-sans mt-10 flex flex-wrap gap-4 text-[12px] uppercase tracking-[0.14em]">
            <Link
              to="/"
              className="border border-black/12 px-4 py-3 text-neutral-700 transition-colors hover:border-black/30 hover:text-neutral-950"
            >
              Главная
            </Link>
            <Link
              to="/afisha"
              className="border border-black/12 px-4 py-3 text-neutral-700 transition-colors hover:border-black/30 hover:text-neutral-950"
            >
              Афиша
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
