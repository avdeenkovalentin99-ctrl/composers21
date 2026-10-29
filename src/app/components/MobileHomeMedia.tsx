import { ResponsiveImage } from "./ResponsiveImage";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import type { MediaMaterial } from "../data/media";
import { EditorialCta } from "./ui/EditorialCta";
import { MediaSyncText } from "./MediaSyncText";
import { useMediaSyncopation } from "./useMediaSyncopation";
import "./MobileHomeMedia.css";

type MobileHomeMediaProps = {
  reports: (MediaMaterial & { previewImage: string })[];
  articles: MediaMaterial[];
};

export function MobileHomeMedia({ reports, articles }: MobileHomeMediaProps) {
  const mediaRef = useMediaSyncopation("mobile");

  return (
    <section className="mobile-home-media home-desktop:hidden" aria-labelledby="mobile-home-media-title">
      <div ref={mediaRef} className="mobile-home-media__inner">
        <Link to="/media" className="mobile-home-media__heading" data-sync-group="tile">
          <h2 id="mobile-home-media-title"><MediaSyncText id="label">медиа</MediaSyncText></h2>
          <span aria-hidden="true">→</span>
        </Link>
        <div className="mobile-home-media__reports">
          {reports.map((report, index) => (
            <a className="mobile-home-media__report" data-sync-group={index === 0 ? "a" : "b"} key={report.id} href={report.url} target="_blank" rel="noreferrer">
              <div className="mobile-home-media__preview">
                <div data-sync-image-mask>
                  <div data-sync-image-shift>
                    <ResponsiveImage src={report.previewImage} alt="" loading="lazy" decoding="async" />
                  </div>
                </div>
                <span className="mobile-home-media__play" data-sync-play aria-hidden="true"><Play size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" focusable="false" /></span>
              </div>
              <h3><MediaSyncText id="title">{report.title}</MediaSyncText></h3>
              <p className="mobile-home-media__caption"><MediaSyncText id="meta">{report.source} · {report.date}</MediaSyncText></p>
            </a>
          ))}
        </div>
        <div className="mobile-home-media__articles" data-sync-group="articles">
          {articles.map((article) => (
            <a className="mobile-home-media__article" data-sync-row key={article.id} href={article.url} target="_blank" rel="noreferrer">
              <p className="mobile-home-media__source">{article.source}</p>
              <h3>{article.title}</h3>
              <p className="mobile-home-media__caption">{article.date}</p>
            </a>
          ))}
        </div>
        <EditorialCta to="/media" className="mobile-home-media__all" data-sync-all>все публикации</EditorialCta>
      </div>
    </section>
  );
}
