const DATA_URL = "data/anime.json";

async function getAnimeList() {
  const res = await fetch(DATA_URL);
  return res.json();
}

function starRating(r) {
  return `★ ${r.toFixed(1)}`;
}

function cardHTML(a) {
  return `
    <a class="card glass" href="anime.html?id=${a.id}">
      <img src="${a.image}" alt="${a.title}" loading="lazy">
      <div class="card-body">
        <h3>${a.title}</h3>
        <div class="card-meta">
          <span>${a.year}</span>
          <span>${starRating(a.rating)}</span>
        </div>
      </div>
    </a>`;
}

function renderGrid(container, list) {
  container.innerHTML = list.map(cardHTML).join("") ||
    `<p style="color:var(--ink-soft)">No anime found.</p>`;
}

function wireSearchForm() {
  const form = document.getElementById("nav-search-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = form.querySelector(".search-input").value.trim();
    window.location.href = `search.html?q=${encodeURIComponent(q)}`;
  });
}

function fallbackLogo() {
  document.querySelectorAll(".logo img").forEach((img) => {
    img.addEventListener("error", () => {
      const span = document.createElement("span");
      span.className = "logo-fallback";
      span.textContent = "AC";
      img.replaceWith(span);
    });
  });
}

async function initHome() {
  const grid = document.getElementById("anime-grid");
  const trending = document.getElementById("trending-grid");
  if (!grid) return;
  const list = await getAnimeList();
  renderGrid(grid, list);
  const top = [...list].sort((a, b) => b.rating - a.rating).slice(0, 4);
  renderGrid(trending, top);
}

async function initDetail() {
  const wrap = document.getElementById("anime-detail");
  if (!wrap) return;
  const id = Number(new URLSearchParams(window.location.search).get("id"));
  const list = await getAnimeList();
  const a = list.find((x) => x.id === id);
  if (!a) {
    wrap.innerHTML = `<p>Anime not found. <a class="back-link" href="index.html">Go back home</a></p>`;
    return;
  }
  document.title = `${a.title} - AnimeCo`;
  wrap.innerHTML = `
    <a class="back-link" href="index.html">&larr; Back to all anime</a>
    <div class="detail-wrap glass">
      <img src="${a.image}" alt="${a.title}">
      <div class="detail-info">
        <h1>${a.title}</h1>
        <div class="card-meta">
          <span>${a.year} · ${a.episodes} episodes · ${a.status}</span>
          <span>${starRating(a.rating)}</span>
        </div>
        <div class="tags">${a.genres.map((g) => `<span class="tag">${g}</span>`).join("")}</div>
        <p class="synopsis">${a.synopsis}</p>
      </div>
    </div>`;
}

async function initSearch() {
  const results = document.getElementById("search-results");
  if (!results) return;
  const q = (new URLSearchParams(window.location.search).get("q") || "").toLowerCase();
  document.getElementById("search-heading").textContent = q
    ? `Results for "${q}"`
    : "All Anime";
  const list = await getAnimeList();
  const filtered = q
    ? list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.genres.some((g) => g.toLowerCase().includes(q))
      )
    : list;
  renderGrid(results, filtered);
  const input = document.querySelector(".search-input");
  if (input) input.value = q;
}

document.addEventListener("DOMContentLoaded", () => {
  fallbackLogo();
  wireSearchForm();
  initHome();
  initDetail();
  initSearch();
});