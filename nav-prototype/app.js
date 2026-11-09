const sections = window.MAVIS_NAV_SECTIONS;

const requestedMethod = new URLSearchParams(window.location.search).get("method");
const state = { method: requestedMethod === "custom" ? "custom" : "native", openId: null, query: "", selected: null };
const navigation = document.querySelector("#navigation");
const methodDescription = document.querySelector("#method-description");
const searchInput = document.querySelector("#nav-search");
const searchSummary = document.querySelector("#search-summary");
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

function filteredSections() {
  const query = state.query.trim().toLowerCase();
  if (!query) return sections;
  return sections.map((section) => {
    if (section.label.toLowerCase().includes(query)) return section;
    if (section.groups) {
      const groups = section.groups
        .map(([label, items]) => [label, items.filter((item) => item.toLowerCase().includes(query))])
        .filter(([, items]) => items.length);
      return groups.length ? { ...section, groups } : null;
    }
    const items = section.items.filter((item) => item.toLowerCase().includes(query));
    return items.length ? { ...section, items } : null;
  }).filter(Boolean);
}

function itemLink(item, index, isLayer = false, sectionId) {
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

function panelMarkup(section) {
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

function nativeSection(section, shouldOpen) {
  return `<details class="nav-section" data-section="${section.id}" name="primary-navigation"${shouldOpen ? " open" : ""}>
    <summary class="nav-summary">${escapeHtml(section.label)}</summary>
    <div class="nav-panel">${panelMarkup(section)}</div>
  </details>`;
}

function customSection(section, shouldOpen) {
  const panelId = `panel-${section.id}`;
  return `<section class="nav-section${shouldOpen ? " is-open" : ""}" data-section="${section.id}">
    <button class="nav-trigger" type="button" aria-expanded="${shouldOpen}" aria-controls="${panelId}">${escapeHtml(section.label)}</button>
    <div class="nav-panel custom-panel" id="${panelId}"${shouldOpen ? "" : " hidden"}>${panelMarkup(section)}</div>
  </section>`;
}

function render({ focusId = null } = {}) {
  const visible = filteredSections();
  if (state.query && visible.length && !visible.some((section) => section.id === state.openId)) state.openId = visible[0].id;
  const renderSection = state.method === "native" ? nativeSection : customSection;
  navigation.innerHTML = visible.length
    ? visible.map((section) => renderSection(section, section.id === state.openId)).join("")
    : `<p class="no-results">No navigation items match “${escapeHtml(state.query)}”.</p>`;
  const resultCount = visible.reduce((count, section) => count + allItems(section).length, 0);
  searchSummary.textContent = state.query ? `${resultCount} result${resultCount === 1 ? "" : "s"}` : "";
  attachAccordionListeners();
  if (focusId) navigation.querySelector(`[data-section="${focusId}"] ${state.method === "native" ? ".nav-summary" : ".nav-trigger"}`)?.focus();
}

function attachAccordionListeners() {
  if (state.method === "native") {
    navigation.querySelectorAll("details").forEach((detail) => {
      detail.addEventListener("toggle", () => {
        if (detail.open) state.openId = detail.dataset.section;
        else if (state.openId === detail.dataset.section) state.openId = null;
      });
    });
  } else {
    navigation.querySelectorAll(".nav-trigger").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.closest("[data-section]").dataset.section;
        const closing = state.openId === id;
        state.openId = closing ? null : id;
        render({ focusId: id });
      });
    });
  }
}

document.querySelectorAll('input[name="method"]').forEach((radio) => {
  radio.checked = radio.value === state.method;
  radio.addEventListener("change", () => {
    state.method = radio.value;
    if (methodDescription) methodDescription.textContent = state.method === "native" ? "Native browser disclosure behaviour" : "Scripted state and focus management";
    render();
  });
});

if (methodDescription) methodDescription.textContent = state.method === "native" ? "Native browser disclosure behaviour" : "Scripted state and focus management";

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  render();
});

navigation.addEventListener("click", (event) => {
  const link = event.target.closest(".nav-link");
  if (link) {
    event.preventDefault();
    state.selected = link.dataset.key;
    navigation.querySelectorAll(".nav-link").forEach((item) => item.removeAttribute("aria-current"));
    link.setAttribute("aria-current", "page");
  }
  const baseMap = event.target.closest(".base-map-button");
  if (baseMap) baseMap.setAttribute("aria-pressed", String(baseMap.getAttribute("aria-pressed") !== "true"));
});

function closeMenu() {
  window.location.href = "index.html";
}

closeButton.addEventListener("click", closeMenu);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

render();
