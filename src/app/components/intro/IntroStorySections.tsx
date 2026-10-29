import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import "./IntroStorySections.css";

const statistics = [
  { number: "15", label: "концертов" },
  { number: "43", label: "композитора" },
  { number: "40", label: "солистов", prefix: "более" },
  { number: "7", label: "коллективов" },
];

function useFirstActivation(active: boolean) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) setVisible(true);
  }, [active]);

  return visible;
}

function FestivalSummary({ active }: { active: boolean }) {
  const visible = useFirstActivation(active);
  const reducedMotion = useReducedMotion();

  return (
    <section
      className={`intro-story intro-story-summary${visible ? " intro-story--visible" : ""}${reducedMotion ? " intro-story--reduced" : ""}`}
      data-active={active}
      inert={!active}
      aria-hidden={!active}
      aria-labelledby="intro-story-summary-title"
      tabIndex={active ? 0 : -1}
    >
      <div className="intro-story-statistics">
        <dl className="intro-story-statistics-list">
          {statistics.map(({ number, label, prefix }) => (
            <div className="intro-story-statistic intro-story-reveal" key={number}>
              <dt>
                {prefix && <span className="intro-story-statistic-prefix">{prefix}</span>}
                <span className="intro-story-statistic-number">{number}</span>
              </dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="intro-story-summary-content">
        <h2 id="intro-story-summary-title" className="intro-story-title intro-story-reveal">
          первый фестиваль
        </h2>
        <p className="intro-story-paragraph intro-story-paragraph--first intro-story-reveal">
          В программах прозвучала музыка российских и зарубежных авторов разных поколений — от
          признанных композиторов до молодых. Многие сочинения исполнили музыканты, которым они
          посвящены. Концерты дополнили три встречи фестивальной академии и вечер импровизации.
        </p>
        <p className="intro-story-paragraph intro-story-paragraph--second intro-story-reveal">
          Каждая программа сохраняла характер своих исполнителей — их предпочтения и собственный
          взгляд на музыку. Разные художественные миры сосуществовали, не подчиняясь единому стилю.
        </p>
        <figure className="intro-story-review intro-story-reveal">
          <blockquote>
            <p>
              «…искушенная публика дополнила свою картину мира современной музыки, а неискушенная
              ушла с ощущением подарка-сюрприза…»
            </p>
          </blockquote>
          <figcaption>
            Марина Бляшон
            <br />
            «Московский комсомолец»
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function FestivalOrigin({ active }: { active: boolean }) {
  const visible = useFirstActivation(active);
  const reducedMotion = useReducedMotion();

  return (
    <section
      className={`intro-story intro-story-origin${visible ? " intro-story--visible" : ""}${reducedMotion ? " intro-story--reduced" : ""}`}
      data-active={active}
      inert={!active}
      aria-hidden={!active}
      aria-labelledby="intro-story-origin-title"
      tabIndex={active ? 0 : -1}
    >
      <div className="intro-story-origin-content">
        <h2 id="intro-story-origin-title" className="intro-story-title intro-story-reveal">
          как возник{" "}
          <br />
          фестиваль
        </h2>
        <p className="intro-story-paragraph intro-story-paragraph--first intro-story-reveal">
          Концепция фестиваля во многом выросла из группы «Пианисты XXI века» — интернет-сообщества
          меломанов, завсегдатаев концертов, музыкальных критиков, художников, поэтов и самих
          исполнителей.
        </p>
        <p className="intro-story-paragraph intro-story-paragraph--second intro-story-reveal">
          Даже в самых жарких дискуссиях здесь умели находить точки соприкосновения. Эту идею
          фестиваль переносит в реальность — в пространство живого общения композиторов,
          музыкантов и слушателей.
        </p>
      </div>

      {/* The matching original portrait is absent from the project. Keep the exact, authorised
          reference crop, including its lettering, until a separate source photo is available. */}
      <figure className="intro-story-portrait">
        <div className="intro-story-portrait-crop intro-story-reveal">
          <img
            className="intro-story-portrait-reference"
            src="/assets/hero/intro3w.png"
            width="1672"
            height="941"
            loading="lazy"
            decoding="async"
            alt="Чёрно-белый портрет Варвары Мягковой"
          />
        </div>
        <figcaption className="intro-story-visually-hidden">
          <p>Варвара Мягкова</p>
          <p>Художественный руководитель фестиваля</p>
          <blockquote>
            «Обществу необходимо увидеть со стороны то, что собиралось годами»
          </blockquote>
          <p>ClassicalMusicNews, 09.05.2026</p>
        </figcaption>
      </figure>
    </section>
  );
}

export function IntroStorySections({ activeScene }: { activeScene: 1 | 2 | 3 }) {
  return (
    <>
      <FestivalSummary active={activeScene === 2} />
      <FestivalOrigin active={activeScene === 3} />
    </>
  );
}
