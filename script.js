const yearEl = document.getElementById('year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


const episodesEl = document.getElementById('episodes');


/* =========================================================
   FUNCIONES
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


/* =========================================================
   TEMPORADA
   ========================================================= */

function getSeason(title = '') {

  const match = String(title).match(
    /\bT(?:emporada)?\s*(\d+)\b/i
  );

  return match
    ? parseInt(match[1], 10)
    : 0;

}


/* =========================================================
   NÚMERO DE EPISODIO
   ========================================================= */

function getEpisodeNumber(title = '') {

  const match = String(title).match(
    /\bE(?:pisodio)?\s*(\d+)\b/i
  );

  return match
    ? parseInt(match[1], 10)
    : 0;

}


/* =========================================================
   TÍTULO SIN T4 E30
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
   PRIMEROS 50 CARACTERES
   ========================================================= */

function shortTitle(title = '') {

  const text = String(title).trim();

  if (text.length <= 50) {
    return text;
  }

  return text.substring(0, 50).trimEnd() + '…';

}


/* =========================================================
   CREAR UN EPISODIO COMPACTO
   ========================================================= */

function createCompactEpisode(ep) {

  const season = getSeason(ep.title);

  const number = getEpisodeNumber(ep.title);

  const originalTitle =
    cleanEpisodeTitle(ep.title || 'Episodio');

  const title =
    shortTitle(originalTitle);


  const label =
    season > 0
      ? `T${season} E${number}`
      : 'EPISODIO';


  const image = ep.image
    ? `
      <img
        src="${escapeHtml(ep.image)}"
        alt=""
        loading="lazy"
      >
    `
    : `
      <div class="compact-episode-placeholder">
        HRT
      </div>
    `;


  return `

    <article class="compact-episode">


      <div class="compact-episode-image">

        ${image}

      </div>


      <div class="compact-episode-content">


        <div class="compact-episode-title">

          <span class="compact-episode-number">
            ${escapeHtml(label)}
          </span>

          <span class="compact-episode-name">
            ${escapeHtml(title)}
          </span>

        </div>


        <div class="compact-episode-date">

          ${escapeHtml(formatDate(ep.date))}

        </div>


        ${
          ep.audio
            ? `
              <audio
                class="compact-audio"
                controls
                preload="none"
                src="${escapeHtml(ep.audio)}"
                aria-label="Reproducir ${escapeHtml(ep.title || 'episodio')}"
              ></audio>
            `
            : ''
        }


      </div>


      ${
        ep.audio
          ? `
            <button
              class="compact-play"
              type="button"
              aria-label="Reproducir episodio"
              title="Reproducir episodio"
            >
              <span aria-hidden="true">▶</span>
            </button>
          `
          : ''
      }


    </article>

  `;

}


/* =========================================================
   AGRUPAR POR TEMPORADA
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

      const numberA =
        getEpisodeNumber(a.title);

      const numberB =
        getEpisodeNumber(b.title);


      if (numberA !== numberB) {
        return numberB - numberA;
      }


      return new Date(b.date || 0) -
             new Date(a.date || 0);

    });


    const seasonTitle =
      seasonNumber > 0
        ? `Temporada ${seasonNumber}`
        : 'Otros episodios';


    html += `

      <section class="compact-season">


        <div class="compact-season-heading">

          <h2>
            ${escapeHtml(seasonTitle)}
          </h2>

          <span>
            ${seasonEpisodes.length}
            episodios
          </span>

        </div>


        <div class="compact-season-list">

          ${seasonEpisodes
            .map(createCompactEpisode)
            .join('')
          }

        </div>


      </section>

    `;

  });


  episodesEl.innerHTML = html;


  /* =======================================================
     BOTONES PLAY
     ======================================================= */

  const episodeCards =
    episodesEl.querySelectorAll(
      '.compact-episode'
    );


  episodeCards.forEach(card => {

    const audio =
      card.querySelector('.compact-audio');

    const button =
      card.querySelector('.compact-play');


    if (!audio || !button) {
      return;
    }


    button.addEventListener('click', () => {

      document
        .querySelectorAll('.compact-audio')
        .forEach(otherAudio => {

          if (otherAudio !== audio) {
            otherAudio.pause();
          }

        });


      if (audio.paused) {

        audio.play()
          .catch(error => {
            console.error(
              'No se pudo reproducir el episodio:',
              error
            );
          });

        button.classList.add(
          'is-playing'
        );

        button.innerHTML =
          '<span aria-hidden="true">Ⅱ</span>';

      } else {

        audio.pause();

        button.classList.remove(
          'is-playing'
        );

        button.innerHTML =
          '<span aria-hidden="true">▶</span>';

      }

    });


    audio.addEventListener(
      'play',
      () => {

        button.classList.add(
          'is-playing'
        );

        button.innerHTML =
          '<span aria-hidden="true">Ⅱ</span>';

      }
    );


    audio.addEventListener(
      'pause',
      () => {

        button.classList.remove(
          'is-playing'
        );

        button.innerHTML =
          '<span aria-hidden="true">▶</span>';

      }
    );


    audio.addEventListener(
      'ended',
      () => {

        button.classList.remove(
          'is-playing'
        );

        button.innerHTML =
          '<span aria-hidden="true">▶</span>';

      }
    );

  });

}


/* =========================================================
   PORTADA
   ========================================================= */

function renderHomeEpisodes(episodes) {

  if (!episodesEl) {
    return;
  }


  const recentEpisodes =
    episodes.slice(0, 5);


  if (!recentEpisodes.length) {

    episodesEl.innerHTML = `
      <div class="loading-card">
        No hay episodios disponibles.
      </div>
    `;

    return;

  }


  episodesEl.innerHTML =
    recentEpisodes.map((ep, index) => {

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


      const label =
        index === 0
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

              <time datetime="${escapeHtml(ep.date || '')}">
                ${escapeHtml(formatDate(ep.date))}
              </time>

              ${
                ep.duration
                  ? `<span>${escapeHtml(ep.duration)}</span>`
                  : ''
              }

            </div>

          </div>


          <h3>
            ${escapeHtml(ep.title || 'Episodio')}
          </h3>


          ${
            ep.description
              ? `
                <p>
                  ${escapeHtml(
                    String(ep.description)
                      .replace(/\s+/g, ' ')
                      .trim()
                  ).slice(0, 360)}
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

  fetch(
    'episodes.json?v=' +
    Date.now()
  )

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

        renderArchive(
          allEpisodes
        );

      } else {

        renderHomeEpisodes(
          allEpisodes
        );

      }

    })


    .catch(error => {

      console.error(
        'Error cargando episodios:',
        error
      );


      episodesEl.innerHTML = `

        <div class="archive-loading">

          No se han podido cargar
          los episodios.

        </div>

      `;

    });

}
