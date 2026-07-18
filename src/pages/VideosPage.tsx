import { useScrollTop } from "../hooks/useScrollTop";
import { useAppContext } from "../context/AppContext";
import { PHASE_ICON } from "../constants/appConfig";
import { logoNode } from "../components/common/LogoAsset";
import { Breadcrumb } from "../components/common/Breadcrumb";

function ytSearch(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function LangBadge({ lang, tx }) {
  const txt = lang === "ar" ? tx("videos.lang_ar") : lang === "en" ? tx("videos.lang_en") : tx("videos.lang_both");
  return <span className={`vid-lang vid-${lang || "both"}`}>{txt}</span>;
}

export function VideosPage({ curriculum }) {
  const { CHANNELS, VIDEOS, PHASES, UI } = curriculum;
  const { t, tx } = useAppContext();

  useScrollTop([]);

  return (
    <>
      <Breadcrumb
        parts={[
          { label: t(UI.nav_overview), to: "/" },
          { label: t(UI.nav_videos) }
        ]}
      />

      <section className="page-header">
        <h1>🎬 {t(UI.nav_videos)}</h1>
        <p className="lead">{t(UI.videos_lead)}</p>
        <p className="muted small">{t(UI.videos_note)}</p>
      </section>

      <section>
        <h2 className="section-title">{t(UI.trusted_channels)}</h2>
        <div className="channel-grid">
          {CHANNELS.map((channel) => (
            <a className="channel-card" href={channel.url} target="_blank" rel="noopener noreferrer" key={channel.name}>
              <span className="logo-tile">{logoNode(channel.slug, 20)}</span>
              <div className="channel-meta">
                <strong>{channel.name}</strong>
                <div className="muted small">{t(channel.note)}</div>
              </div>
              <LangBadge lang={channel.lang} tx={tx} />
            </a>
          ))}
        </div>
      </section>

      <h2 className="section-title">{t(UI.by_phase)}</h2>
      {VIDEOS.map((group) => {
        const phase = PHASES.find((item) => item.id === group.phase);
        if (!phase) return null;

        return (
          <section className="video-phase" key={`phase-v-${phase.id}`}>
            <div className={`video-phase-head ${phase.color}`}>
              <span className="phase-logo sm">{logoNode(PHASE_ICON[phase.id], 22)}</span>
              <h3>{t(UI.phase_word)} {phase.id} · {t(phase.title)}</h3>
            </div>

            <div className="video-list">
              {group.items.map((video, idx) => (
                <a
                  className="video-card"
                  href={video.url || ytSearch(video.q)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t(UI.watch_yt)}
                  key={`${phase.id}-${idx}`}
                >
                  <span className="yt-badge">▶</span>
                  <div className="video-meta">
                    <strong>{t(video.name)}</strong>
                    <span className="muted small">{video.url ? tx("videos.youtube") : t(UI.watch_yt)}</span>
                  </div>
                  <LangBadge lang={video.lang} tx={tx} />
                </a>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
