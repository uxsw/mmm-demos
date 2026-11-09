const sections = window.MAVIS_NAV_SECTIONS;
const state = { activeId: null, query: "", selected: null, lastRootId: null };
const container = document.querySelector("#screen-container");
const menuOverlay = document.querySelector("#menu-overlay");
const closeButton = document.querySelector("#close-menu");
const reopenButton = document.querySelector("#reopen-menu");

const escapeHtml = (value) => value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const iconPalette = [
  ["#64e358", "#1687dc"], ["#f5c34e", "#3a7458"], ["#c4c9c5", "#657478"], ["#e94c45", "#7d1c83"],
  ["#1563ef", "#f4cf1d"], ["#23b955", "#075829"], ["#00b975", "#082e58"], ["#ffa419", "#fff370"],
  ["#52e55a", "#183d88"], ["#ffe83d", "#9fd945"], ["#64e0c1", "#217a72"], ["#d9dedf", "#929b9d"]
];

function allItems(section) {
  return section.groups ? section.groups.flatMap(([, items]) => items) : section.items;
}

function matchingSection(section) {
  const query = state.query.trim().toLowerCase();
  if (!query || section.label.toLowerCase().includes(query)) return section;
  if (section.groups) {
    const groups = section.groups
      .map(([label, items]) => [label, items.filter((item) => item.toLowerCase().includes(query))])
      .filter(([, items]) => items.length);
    return groups.length ? { ...section, groups } : null;
  }
  const items = section.items.filter((item) => item.toLowerCase().includes(query));
  return items.length ? { ...section, items } : null;
}

function itemLink(item, index, isLayer, sectionId) {
  const palette = iconPalette[index % iconPalette.length];
  const itemKey = `${sectionId}:${item}`;
  const current = state.selected === itemKey ? ' aria-current="page"' : "";
  const icon = isLayer
    ? `<span class="item-icon layer" style="--icon-a:${palette[0]};--icon-b:${palette[1]}"></span>`
    : item === "Contact"
      ? `<span class="item-icon" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M7 13 13 7M8 7h5v5M5 5h4M5 5v10h10v-4" /></svg></span>`
      : `<span class="item-icon" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M5 4h10v12H5zM8 7h4M8 10h4M8 13h3" /></svg></span>`;
  return `<a class="nav-link" href="#${slug(sectionId)}-${slug(item)}" data-key="${escapeHtml(itemKey)}"${current}>${icon}<span>${escapeHtml(item)}</span></a>`;
}

function sectionContent(section) {
  if (section.type === "map") {
    return `<div class="map-settings">
      <button class="base-map-button" type="button" aria-pressed="false">Base map</button>
      <label class="switch-row"><input type="checkbox" /><span class="switch-track" aria-hidden="true"></span><span>Lat/Long</span></label>
    </div>
    <p class="panel-heading">Map layers</p>
    ${section.groups.map(([label, items], groupIndex) => `<section class="item-group"><h3>${escapeHtml(label)}</h3><div class="nav-items">${items.map((item, index) => itemLink(item, groupIndex * 5 + index, true, section.id)).join("")}</div></section>`).join("")}`;
  }
  return `<div class="simple-list">${section.items.map((item, index) => itemLink(item, index, false, section.id)).join("")}</div>`;
}

function rootMarkup() {
  const visible = sections.map(matchingSection).filter(Boolean);
  const resultCount = visible.reduce((count, section) => count + allItems(section).length, 0);
  return `<div class="screen-root">
    <div class="search-row">
      <label class="search-field">
        <span class="sr-only">Search navigation</span>
        <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>
        <input id="nav-search" type="search" placeholder="search" autocomplete="off" value="${escapeHtml(state.query)}" />
      </label>
      <button class="profile-button" type="button" aria-label="Open account menu">M</button>
    </div>
    <p class="search-summary" role="status" aria-live="polite">${state.query ? `${resultCount} result${resultCount === 1 ? "" : "s"}` : ""}</p>
    <nav class="screen-root-list" aria-label="Primary navigation">
      ${visible.length ? visible.map((section) => `<button class="screen-root-button" type="button" data-section="${section.id}"><span>${escapeHtml(section.label)}</span><svg aria-hidden="true" viewBox="0 0 20 20"><path d="m7 4 6 6-6 6" /></svg></button>`).join("") : `<p class="no-results">No navigation items match “${escapeHtml(state.query)}”.</p>`}
    </nav>
  </div>`;
}

function childMarkup(section) {
  return `<section class="screen-view is-entering" aria-labelledby="screen-title">
    <header class="screen-view-header">
      <button class="screen-back-button" type="button" aria-label="Back to main menu">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7" /></svg>
        <span>Back</span>
      </button>
      <h1 id="screen-title" tabindex="-1">${escapeHtml(section.label)}</h1>
    </header>
    <div class="screen-content">${sectionContent(section)}</div>
  </section>`;
}

function render({ focus = true } = {}) {
  const section = sections.find((item) => item.id === state.activeId);
  container.innerHTML = section ? childMarkup(matchingSection(section) || section) : rootMarkup();
  container.scrollTop = 0;
  if (!focus) return;
  if (section) container.querySelector(".screen-back-button")?.focus();
  else if (state.lastRootId) container.querySelector(`[data-section="${state.lastRootId}"]`)?.focus();
}

function openSection(id) {
  state.activeId = id;
  state.lastRootId = id;
  window.history.pushState({ section: id }, "", `#${id}`);
  render();
}

container.addEventListener("click", (event) => {
  const rootButton = event.target.closest(".screen-root-button");
  if (rootButton) openSection(rootButton.dataset.section);

  const backButton = event.target.closest(".screen-back-button");
  if (backButton) window.history.back();

  const link = event.target.closest(".nav-link");
  if (link) {
    event.preventDefault();
    state.selected = link.dataset.key;
    container.querySelectorAll(".nav-link").forEach((item) => item.removeAttribute("aria-current"));
    link.setAttribute("aria-current", "page");
  }

  const baseMap = event.target.closest(".base-map-button");
  if (baseMap) baseMap.setAttribute("aria-pressed", String(baseMap.getAttribute("aria-pressed") !== "true"));
});

container.addEventListener("input", (event) => {
  if (event.target.matches("#nav-search")) {
    state.query = event.target.value;
    render({ focus: false });
    const search = container.querySelector("#nav-search");
    search.focus();
    search.setSelectionRange(state.query.length, state.query.length);
  }
});

window.addEventListener("popstate", () => {
  const id = window.location.hash.slice(1);
  state.activeId = sections.some((section) => section.id === id) ? id : null;
  render({ focus: false });
  window.requestAnimationFrame(() => {
    if (state.activeId) container.querySelector(".screen-back-button")?.focus();
    else if (state.lastRootId) container.querySelector(`[data-section="${state.lastRootId}"]`)?.focus();
  });
});

function closeMenu() {
  window.location.href = "index.html";
}

closeButton.addEventListener("click", closeMenu);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const initialId = window.location.hash.slice(1);
state.activeId = sections.some((section) => section.id === initialId) ? initialId : null;
if (state.activeId) {
  state.lastRootId = state.activeId;
  window.history.replaceState({}, "", window.location.pathname);
  window.history.pushState({ section: state.activeId }, "", `#${state.activeId}`);
} else {
  window.history.replaceState({}, "", window.location.pathname);
}
render({ focus: false });
