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
  return String(value)
    .replace(/\s+/g, ' ')
    .trim();
}

function renderEpisodes(data) {
  if (!episodesEl) return;

  const allEpisodes = Array.isArray(data.episodes)
    ? data.episodes
    : [];

  const showAll =
    document.body.getAttribute('data-all-episodes') === 'true';

  // En la página principal mostramos solo los 5 últimos.
  // En Todos los episodios mostramos todos.
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

    const description = cleanDescription(
      ep.description || ''
    );

    // En la portada: máximo 100 caracteres.
    // En Todos los episodios: máximo 50 caracteres.
    const maxDescriptionLength = showAll ? 50 : 100;

    const shortDescription =
      description.length > maxDescriptionLength
        ? description.slice(
