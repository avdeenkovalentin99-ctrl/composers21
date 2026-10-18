import type { CSSProperties } from "react";
import { EditorialCta } from "./ui/EditorialCta";
import type { BroadcastItem } from "../data/broadcasts";
import { useBroadcastEntrance } from "./useBroadcastEntrance";
import "./MobileHomeBroadcasts.css";

type HomepageBroadcast = BroadcastItem & { number: string; previewImage: string };

type MobileHomeBroadcastsProps = {
  broadcasts: HomepageBroadcast[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function MobileHomeBroadcasts({ broadcasts, activeIndex, onSelect }: MobileHomeBroadcastsProps) {
  const broadcastRef = useBroadcastEntrance("mobile");
  const activeBroadcast = broadcasts[activeIndex];
  if (!activeBroadcast) return null;

  return (
    <section className="mobile-home-broadcasts home-desktop:hidden" aria-labelledby="mobile-home-broadcasts-title">
      <div ref={broadcastRef} className="mobile-home-broadcasts__inner">
        <h2 data-broadcast-title id="mobile-home-broadcasts-title">трансляции</h2>
        <a className="mobile-home-broadcasts__preview" href={activeBroadcast.url} target="_blank" rel="noreferrer"
          aria-label={`Смотреть запись: ${activeBroadcast.title}`}>
          <div data-broadcast-photo>
          <img src={activeBroadcast.previewImage} alt="" loading="lazy" decoding="async" />
          <span className="mobile-home-broadcasts__watch">смотреть запись <span aria-hidden="true">→</span></span>
          </div>
        </a>
        <div data-broadcast-list className="mobile-home-broadcasts__list" aria-label="Выбор концерта">
          {broadcasts.map((broadcast, index) => (
            <button data-broadcast-row style={{ "--broadcast-row": index } as CSSProperties} className="mobile-home-broadcasts__item" key={broadcast.id} type="button"
              aria-pressed={activeIndex === index} onClick={() => onSelect(index)}>
              <span data-broadcast-copy data-broadcast-number className="mobile-home-broadcasts__number">{broadcast.number}</span>
              <span data-broadcast-copy data-broadcast-details className="mobile-home-broadcasts__details">
                <span className="mobile-home-broadcasts__name">{broadcast.title}</span>
                <span className="mobile-home-broadcasts__date">{broadcast.date} {broadcast.dateTime.slice(0, 4)}</span>
              </span>
            </button>
          ))}
        </div>
        <EditorialCta data-broadcast-all to="/translyatsii" className="editorial-cta--light mobile-home-broadcasts__all">
          все трансляции
        </EditorialCta>
      </div>
    </section>
  );
}
