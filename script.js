const yearEl = document.getElementById('year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const episodesEl = document.getElementById('episodes');

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, function(char) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#039;',
      '"': '&quot;'
    };
    return map[char];
  });
}

function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function cleanDescription(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function limitDescription(text, maxLength) {
  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength - 1).trimEnd() + '…';
}

function renderEpisodes(data) {

  if (!episodesEl) return;

  const allEpisodes = Array.isArray(data.episodes)
    ? data.episodes
    : [];

  const showAll =
    document.body.getAttribute('data-all-episodes') === 'true';

  const episodes = showAll
    ? allEpisodes
    : allEpisodes.slice(0, 5);

  if (!episodes.length) {

    episodesEl.innerHTML = `
      <div class="loading-card">
        No hay episodios disponibles.
      </div>
    `;

    return;
  }

  episodesEl.innerHTML = episodes.map(function(ep, index) {

    const description =
      cleanDescription(ep.description || '');

    const maxDescriptionLength =
      showAll ? 50 : 100;

    const shortDescription =
      limitDescription(
        description,
        maxDescriptionLength
      );

    const image = ep.image
      ? `
        <img
          src="${escapeHtml(ep.image)}"
          alt=""
          loading="lazy"
        >
      `
      : `
        <div class="episode-art">
          <span>HRT</span>
        </div>
      `;

    const duration = ep.duration
      ? `
        <span>
          ${escapeHtml(ep.duration)}
        </span>
      `
      : '';

    const audio = ep.audio
      ? `
        <div class="episode-player">
          <audio
            controls
            preload="metadata"
            src="${escapeHtml(ep.audio)}"
          >
            Tu navegador no admite el reproductor de audio.
          </audio>
        </div>
      `
      : '';

    const label =
      !showAll && index === 0
        ? 'ÚLTIMO EPISODIO'
        : 'EPISODIO';

    return `
      <article
        class="episode-card ${
          index === 0
            ? 'episode-featured'
            : ''
        }"
      >

        <div class="episode-top">

          <div class="episode-cover">
            ${image}
          </div>

          <div class="episode-meta">

            <span class="episode-label">
              ${label}
            </span>

            <time
              datetime="${escapeHtml(ep.date || '')}"
            >
              ${escapeHtml(
                formatDate(ep.date)
              )}
            </time>

            ${duration}

          </div>

        </div>

        <h3>
          ${escapeHtml(
            ep.title || 'Episodio'
          )}
        </h3>

        ${
          shortDescription
            ? `
              <p>
                ${escapeHtml(
                  shortDescription
                )}
              </p>
            `
            : ''
        }

        ${audio}

        <div class="episode-links">

          ${
            ep.link
              ? `
                <a
                  class="episode-link-main"
                  href="${escapeHtml(ep.link)}"
                  target="_blank"
                  rel="noopener"
                >
                  Ver episodio ↗
                </a>
              `
              : ''
          }

          <a
            class="episode-platform-link episode-spotify-link"
            href="https://creators.spotify.com/pod/show/hastaelrabo"
            target="_blank"
            rel="noopener"
          >
            <span class="episode-platform-icon">
              Spotify
            </span>
          </a>

          <a
            class="episode-platform-link episode-ivoox-link"
            href="https://www.ivoox.com/"
            target="_blank"
            rel="noopener"
          >
            <span class="episode-platform-icon">
              iVoox
            </span>
          </a>

        </div>

      </article>
    `;

  }).join('');
}

if (episodesEl) {

  fetch(
    'episodes.json?v=' + Date.now(),
    {
      cache: 'no-store'
    }
  )

  .then(function(response) {

    if (!response.ok) {
      throw new Error(
        'No se pudo cargar episodes.json'
      );
    }

    return response.json();

  })

  .then(function(data) {

    renderEpisodes(data);

  })

  .catch(function(error) {

    console.error(
      'Error cargando episodios:',
      error
    );

    episodesEl.innerHTML = `
      <div class="loading-card error-card">

        <strong>
          No se han podido cargar los episodios.
        </strong>

        <span>
          Puedes escucharlos en
          <a
            href="https://creators.spotify.com/pod/show/hastaelrabo"
            target="_blank"
            rel="noopener"
          >
            Spotify
          </a>.
        </span>

      </div>
    `;

  });

}
