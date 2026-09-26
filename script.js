document.getElementById('year').textContent = new Date().getFullYear();

const episodesEl = document.getElementById('episodes');

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function cleanDescription(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function renderEpisodes(data) {
  const episodes = Array.isArray(data?.episodes) ? data.episodes : [];
  if (!episodes.length) {
    episodesEl.innerHTML = '<div class="loading-card">Todavía no hay episodios disponibles. Vuelve a intentarlo en unos minutos.</div>';
    return;
  }

  episodesEl.innerHTML = episodes.map((ep, index) => {
    const description = cleanDescription(ep.description || '');
    const image = ep.image ? `<img src="${escapeHtml(ep.image)}" alt="" loading="lazy">` : '<div class="episode-art"><span>HRT</span></div>';
    const duration = ep.duration ? `<span>${escapeHtml(ep.duration)}</span>` : '';
    return `
      <article class="episode-card ${index === 0 ? 'episode-featured' : ''}">
        <div class="episode-top">
          <div class="episode-cover">${image}</div>
          <div class="episode-meta">
            <span class="episode-label">${index === 0 ? 'ÚLTIMO EPISODIO' : 'EPISODIO'}</span>
            <time datetime="${escapeHtml(ep.date || '')}">${escapeHtml(formatDate(ep.date))}</time>
            ${duration}
          </div>
        </div>
        <h3>${escapeHtml(ep.title)}</h3>
        ${description ? `<p>${escapeHtml(description).slice(0, 360)}${description.length > 360 ? '…' : ''}</p>` : ''}
        <div class="episode-player">
          <audio controls preload="none" src="${escapeHtml(ep.audio)}"></audio>
        </div>
        <div class="episode-links">
          ${ep.link ? `<a href="${escapeHtml(ep.link)}" target="_blank" rel="noopener">Ver episodio ↗</a>` : ''}
          <a href="https://open.spotify.com/s/gckqUoL" target="_blank" rel="noopener">Spotify ↗</a>
          <a href="https://www.ivoox.com/podcast-hasta-el-rabo-todo-es-toro_sq_f11846541_amp_1.html" target="_blank" rel="noopener">iVoox ↗</a>
        </div>
      </article>`;
  }).join('');
}

fetch('episodes.json?v=' + Date.now())
  .then(response => {
    if (!response.ok) throw new Error('No se pudo cargar episodes.json');
    return response.json();
  })
  .then(renderEpisodes)
  .catch(() => {
    episodesEl.innerHTML = `
      <div class="loading-card error-card">
        <strong>Estamos preparando los episodios.</strong>
        <span>La web se actualiza automáticamente desde el RSS. También puedes escucharlos ahora en <a href="https://open.spotify.com/s/gckqUoL" target="_blank" rel="noopener">Spotify</a> o <a href="https://www.ivoox.com/podcast-hasta-el-rabo-todo-es-toro_sq_f11846541_amp_1.html" target="_blank" rel="noopener">iVoox</a>.</span>
      </div>`;
  });
