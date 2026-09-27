const yearEl = document.getElementById('year');

if (yearEl) {
yearEl.textContent = new Date().getFullYear();
}

const episodesEl = document.getElementById('episodes');

function escapeHtml(value = '') {
return String(value).replace(
/[&<>'"]/g,
char => ({
'&': '&',
'<': '<',
'>': '>',
"'": ''',
'"': '"'
}[char])
);
}

function formatDate(value) {

if (!value) {
return '';
}

const date = new Date(value);

if (Number.isNaN(date.getTime())) {
return '';
}

return new Intl.DateTimeFormat(
'es-ES',
{
day: 'numeric',
month: 'long',
year: 'numeric'
}
).format(date);
}

function cleanDescription(value) {

return String(value)
.replace(/\s+/g, ' ')
.trim();

}

/*

* RECORTAR DESCRIPCIÓN
* 
* El límite incluye la elipsis.
  */

function limitDescription(text, maxLength) {

if (text.length <= maxLength) {
return text;
}

return (
text
.slice(0, maxLength - 1)
.trimEnd()
+ '…'
);

}

/*

* ICONO SPOTIFY
  */

function spotifyIcon() {

return "<svg class="episode-platform-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" > <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.58 14.42a.75.75 0 0 1-1.03.25c-2.83-1.73-6.39-2.12-10.58-1.16a.75.75 0 1 1-.34-1.46c4.59-1.05 8.52-.61 11.7 1.33.35.21.46.67.25 1.04Zm1.38-3.07a.94.94 0 0 1-1.29.31c-3.24-1.99-8.18-2.57-12.01-1.4a.94.94 0 1 1-.55-1.8c4.38-1.33 9.84-.68 13.54 1.59.44.27.58.85.31 1.3Zm.12-3.2C14.19 7.86 7.4 7.64 3.47 8.83a1.13 1.13 0 1 1-.65-2.16c4.52-1.37 12.04-1.09 16.61 1.62a1.13 1.13 0 0 1-1.35 1.86Z" /> </svg>";

}

/*

* ICONO IVOOX
  */

function ivooxIcon() {

return "<span class="episode-ivoox-icon" aria-hidden="true" > iV </span>";

}

/*

* RENDERIZAR EPISODIOS
  */

function renderEpisodes(data) {

if (!episodesEl) {
return;
}

const allEpisodes =
Array.isArray(data.episodes)
? data.episodes
: [];

/*

* Detectamos si estamos
* en episodios.html.
  */

const showAll =
document.body.getAttribute(
'data-all-episodes'
) === 'true';

/*

* PORTADA:
* solo 5 episodios.
* 
* ARCHIVO:
* todos.
  */

const episodes =
showAll
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

episodesEl.innerHTML =
episodes.map(
(ep, index) => {

    /*
     * DESCRIPCIÓN
     */

    const description =
      cleanDescription(
        ep.description || ''
      );


    const maxDescriptionLength =
      showAll
        ? 50
        : 100;


    const shortDescription =
      limitDescription(
        description,
        maxDescriptionLength
      );


    /*
     * IMAGEN
     */

    const image =
      ep.image

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


    /*
     * DURACIÓN
     */

    const duration =
      ep.duration

        ? `
          <span>
            ${escapeHtml(ep.duration)}
          </span>
        `

        : '';


    /*
     * ETIQUETA
     */

    const label =
      !showAll && index === 0
        ? 'ÚLTIMO EPISODIO'
        : 'EPISODIO';


    /*
     * TARJETA
     */

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
              datetime="${escapeHtml(
                ep.date || ''
              )}"
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


        ${
          ep.audio

            ? `
              <div class="episode-player">

                <audio
                  controls
                  preload="none"
                  src="${escapeHtml(
                    ep.audio
                  )}"
                >
                  Tu navegador no admite
                  el reproductor de audio.
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
                  class="episode-link-main"
                  href="${escapeHtml(
                    ep.link
                  )}"
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
            href="https://open.spotify.com/s/gckqUoL"
            target="_blank"
            rel="noopener"
            aria-label="Escuchar en Spotify"
          >

            <span class="episode-platform-icon">
              ${spotifyIcon()}
            </span>

            <span>
              Spotify
            </span>

          </a>


          <a
            class="episode-platform-link episode-ivoox-link"
            href="https://www.ivoox.com/podcast-hasta-el-rabo-todo-es-toro_sq_f11846541_amp_1.html"
            target="_blank"
            rel="noopener"
            aria-label="Escuchar en iVoox"
          >

            <span class="episode-platform-icon">
              ${ivooxIcon()}
            </span>

            <span>
              iVoox
            </span>

          </a>


        </div>

      </article>

    `;

  }
).join('');

}

/*

* CARGAR EPISODIOS
* 
* Usamos Date.now()
* para evitar caché.
  */

if (episodesEl) {

fetch(
'episodes.json?v=' + Date.now(),
{
cache: 'no-store'
}
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

  renderEpisodes(data);

})


.catch(error => {

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

      </span>

    </div>

  `;

});

}
