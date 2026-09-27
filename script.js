const yearEl = document.getElementById('year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


const episodesEl = document.getElementById('episodes');


/* =========================================================
   FUNCIONES GENERALES
   ========================================================= */

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

  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}


function cleanDescription(value) {
  return String(value)
    .replace(/\s+/g, ' ')
    .trim();
}


/* =========================================================
   DETECTAR TEMPORADA
   ========================================================= */

function getSeason(title = '') {

  const text = String(title);

  const match = text.match(
    /\bT(?:emporada)?\s*(\d+)\b/i
  );

  if (match) {
    return parseInt(match[1], 10);
  }

  return 0;
}


/* =========================================================
   DETECTAR NÚMERO DE EPISODIO
   ========================================================= */

function getEpisodeNumber(title = '') {

  const text = String(title);

  const match = text.match(
    /\bE(?:pisodio)?\s*(\d+)\b/i
  );

  if (match) {
    return parseInt(match[1], 10);
  }

  return 0;
}


/* =========================================================
   QUITAR T4 E30 DEL TÍTULO
   ========================================================= */

function cleanEpisodeTitle(title = '') {

  return String(title)
    .replace(
      /^\s*T(?:emporada)?\s*\d+\s*[-–—:]?\s*E(?:pisodio)?\s*\d+\s*[-–—:]?\s*/i,
      ''
    )
    .trim();

}


/* =========================================================
   CREAR FILA COMPACTA
   ========================================================= */

function createArchiveEpisode(ep) {

  const season = getSeason(ep.title);

  const episodeNumber = getEpisodeNumber(ep.title);

  const cleanTitle = cleanEpisodeTitle(ep.title);

  const date = formatDate(ep.date);

  const duration = ep.duration
    ? ` · ${escapeHtml(ep.duration)}`
    : '';

  const episodeLabel =
    season
      ? `T${season} E${episodeNumber}`
      : 'EPISODIO';


  return `
    <article class="archive-episode">

      <div class="archive-episode-main">

        <div class="archive-episode-number">
          ${escapeHtml(episodeLabel)}
        </div>

        <div class="archive-episode-info">

          <h2>
            ${escapeHtml(cleanTitle || ep.title || 'Episodio')}
          </h2>

          <div class="archive-episode-meta">

            <time datetime="${escapeHtml(ep.date || '')}">
              ${escapeHtml(date)}
            </time>

            ${duration}

          </div>

        </div>

      </div>


      <div class="archive-episode-action">

        ${
          ep.audio
            ? `
              <a
                class="archive-listen"
                href="${escapeHtml(ep.audio)}"
                target="_blank"
                rel="noopener"
              >
                ESCUCHAR
              </a>
            `
            : ''
        }

        ${
          ep.link
            ? `
              <a
                class="archive-external"
                href="${escapeHtml(ep.link)}"
                target="_blank"
                rel="noopener"
                aria-label="Abrir episodio"
              >
                ↗
              </a>
            `
            : ''
        }

      </div>

    </article>
  `;
}


/* =========================================================
   ARCHIVO COMPLETO AGRUPADO POR TEMPORADAS
   ========================================================= */

function renderArchive(episodes) {

  if (!episodesEl) {
    return;
  }


  if (!episodes.length) {

    episodesEl.innerHTML = `
      <div class="archive-loading">
        No hay episodios disponibles.
      </div>
    `;

    return;
  }


  const seasons = {};


  episodes.forEach(ep => {

    const season = getSeason(ep.title);

    const key = season || 0;

    if (!seasons[key]) {
      seasons[key] = [];
    }

    seasons[key].push(ep);

  });


  const seasonNumbers = Object.keys(seasons)
    .map(Number)
    .sort((a, b) => b - a);


  let html = '';


  seasonNumbers.forEach(seasonNumber => {

    const seasonEpisodes = seasons[seasonNumber];


    seasonEpisodes.sort((a, b) => {

      const episodeA = getEpisodeNumber(a.title);
      const episodeB = getEpisodeNumber(b.title);

      if (episodeA !== episodeB) {
        return episodeB - episodeA;
      }

      return new Date(b.date || 0) - new Date(a.date || 0);

    });


    const seasonTitle =
      seasonNumber > 0
        ? `Temporada ${seasonNumber}`
        : 'Otros episodios';


    html += `

      <section class="archive-season">

        <div class="archive-season-heading">

          <div>

            <span class="archive-season-kicker">
              TEMPORADA
            </span>

            <h2>
              ${escapeHtml(seasonTitle)}
            </h2>

          </div>

          <span class="archive-season-count">
            ${seasonEpisodes.length}
            ${seasonEpisodes.length === 1 ? 'episodio' : 'episodios'}
          </span>

        </div>


        <div class="archive-season-list">

          ${seasonEpisodes
            .map(createArchiveEpisode)
            .join('')
          }

        </div>

      </section>

    `;

  });


  episodesEl.innerHTML = html;

}


/* =========================================================
   TARJETAS DE LA PORTADA
   ========================================================= */

function renderHomeEpisodes(episodes) {

  if (!episodesEl) {
    return;
  }


  const recentEpisodes = episodes.slice(0, 5);


  if (!recentEpisodes.length) {

    episodesEl.innerHTML = `
      <div class="loading-card">
        No hay episodios disponibles.
      </div>
    `;

    return;
  }


  episodesEl.innerHTML = recentEpisodes.map((ep, index) => {

    const description =
      cleanDescription(ep.description || '');


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
      ? `<span>${escapeHtml(ep.duration)}</span>`
      : '';


    const label =
      index === 0
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
                  src="${escapeHtml(ep.audio)}"
                ></audio>

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
                  rel="noopener"
                >
                  Ver episodio ↗
                </a>
              `
              : ''
          }


          <a
            href="https://open.spotify.com/s/gckqUoL"
            target="_blank"
            rel="noopener"
          >
            Spotify ↗
          </a>


          <a
            href="https://www.ivoox.com/podcast-hasta-el-rabo-todo-es-toro_sq_f11846541_amp_1.html"
            target="_blank"
            rel="noopener"
          >
            iVoox ↗
          </a>

        </div>

      </article>

    `;

  }).join('');

}


/* =========================================================
   CARGAR EPISODIOS
   ========================================================= */

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

      const allEpisodes =
        Array.isArray(data.episodes)
          ? data.episodes
          : [];


      const showAll =
        document.body.getAttribute(
          'data-all-episodes'
        ) === 'true';


      if (showAll) {

        renderArchive(allEpisodes);

      } else {

        renderHomeEpisodes(allEpisodes);

      }

    })


    .catch(error => {

      console.error(
        'Error cargando episodios:',
        error
      );


      episodesEl.innerHTML = `

        <div class="archive-loading">

          <strong>
            No se han podido cargar los episodios.
          </strong>

          <p>
            Puedes escucharlos en
            <a
              href="https://open.spotify.com/s/gckqUoL"
              target="_blank"
              rel="noopener"
            >
              Spotify
            </a>
            o
            <a
              href="https://www.ivoox.com/podcast-hasta-el-rabo-todo-es-toro_sq_f11846541_amp_1.html"
              target="_blank"
              rel="noopener"
            >
              iVoox
            </a>.
          </p>

        </div>

      `;

    });

}
