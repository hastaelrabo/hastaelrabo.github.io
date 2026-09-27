const yearEl = document.getElementById('year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const episodesEl = document.getElementById('episodes');

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
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
  return String(value).replace(/\s+/g, ' ').trim();
}

function renderEpisodes(data) {

  if (!episodesEl) {
    return;
  }

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

  episodesEl.innerHTML = episodes.map((ep, index) => {

    const description = cleanDescription(ep.description || '');

    const image = ep.image
      ? `<img src="${escapeHtml(ep.image)}" alt="" loading="lazy">`
      : `<div class="episode-art"><span>HRT</span></div>`;

    const duration = ep.duration
      ? `<span>${escapeHtml(ep.duration)}</span>`
      : '';

    const label =
      !showAll && index === 0
        ? 'ÚLTIMO EPISODIO'
        : 'EPISODIO';

    return `
      <article class="episode-card ${index === 0 ? 'episode-featured' : ''}">

        <div class="episode-top">

          <div class="episode-cover">
            ${image}
          </div>

          <div class="episode-meta">

            <span class="episode-label">
              ${label}
            </span>

            <time datetime="${escapeHtml(ep.date || '')}">
              ${escapeHtml(formatDate(ep.date))}
            </time>

            ${duration}

          </div>

        </div>

        <h3>
          ${escapeHtml(ep.title || 'Episodio')}
        </h3>

        ${
          description
            ? `
              <p>
                ${escapeHtml(description).slice(0, 360)}
                ${description.length > 360 ? '…' : ''}
              </p>
            `
            : ''
        }

        ${
          ep.audio
            ? `
              <div class="episode-player">
                <audio
                  controls
                  preload="none"
                  src="${escapeHtml(ep.audio)}">
                </audio>
              </div>
            `
            : ''
        }

        <div class="episode-links">

          ${
            ep.link
              ? `
                <a
                  href="${escapeHtml(ep.link)}"
                  target="_blank"
                  rel="noopener">
                  Ver episodio ↗
                </a>
              `
              : ''
          }

          <a
            href="https://open.spotify.com/s/gckqUoL"
            target="_blank"
            rel="noopener">
            Spotify ↗
          </a>

          <a
            href="https://www.ivoox.com/podcast-hasta-el-rabo-todo-es-toro_sq_f11846541_amp_1.html"
            target="_blank"
            rel="noopener">
            iVoox ↗
          </a>

        </div>

      </article>
    `;

  }).join('');
}

if (episodesEl) {

  fetch('episodes.json?v=' + Date.now())

    .then(response => {

      if (!response.ok) {
        throw new Error(
          'No se pudo cargar episodes.json'
        );
      }

      return response.json();

    })

    .then(data => {

      renderEpisodes(data);

    })

    .catch(error => {

      console.error('Error cargando episodios:', error);

      episodesEl.innerHTML = `
        <div class="loading-card error-card">

          <strong>
            No se han podido cargar los episodios.
          </strong>

          <span>
            Puedes escucharlos en
            <a
              href="https://open.spotify.com/s/gckqUoL"
              target="_blank"
              rel="noopener">
              Spotify
            </a>
            o
            <a
              href="https://www.ivoox.com/podcast-hasta-el-rabo-todo-es-toro_sq_f11846541_amp_1.html"
              target="_blank"
              rel="noopener">
              iVoox
            </a>.
          </span>

        </div>
      `;

    });

}
