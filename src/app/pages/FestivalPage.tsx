import { HomeHero } from "../components/hero/HomeHero";
import { PageContainer } from "../layout/PageContainer";

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

export function FestivalPage() {
  return (
    <>
      <HomeHero />

      <section className="pb-20 pt-4 sm:pb-24 sm:pt-6">
        <PageContainer className="space-y-18 sm:space-y-24">
          <div className="mx-auto grid max-w-6xl gap-8 pb-24 pt-5 sm:pb-28 sm:pt-6 lg:grid-cols-[720px_minmax(0,1fr)] lg:items-baseline lg:gap-12">
            <div className={introTextClassName}>
              <p>{festivalIntroLead}</p>
              <p>{festivalIntroParagraphs[0]}</p>
              {festivalIntroParagraphs.slice(1).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="order-first lg:-mr-[28px] lg:order-none lg:text-right">
              <p className={sideLabelClassName}>о проекте</p>
            </div>
          </div>

          <div className="border-t border-black/10 pb-24 pt-8 sm:pb-28">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[220px_720px_minmax(0,1fr)] lg:items-baseline lg:gap-12">
              <div>
                <p className={sideLabelClassName}>идея</p>
              </div>

              <div className={`${bodyTextClassName} lg:pl-[36px]`}>
                {projectParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div aria-hidden="true" />
            </div>
          </div>

          <div className="border-t border-black/10 pt-8">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[720px_minmax(0,1fr)] lg:items-baseline lg:gap-12">
              <div className={`${bodyTextClassName} order-2 lg:order-1`}>
                {spaceParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="order-1 lg:-mr-[28px] lg:order-2 lg:text-right">
                <p className={`${sideLabelClassName} lg:pr-[0px]`}>пространство</p>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
