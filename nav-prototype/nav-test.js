const sections = window.MAVIS_NAV_SECTIONS;
const navigation = document.querySelector("#test-navigation");
const drawer = document.querySelector("#navigation-drawer");
const openNavigation = document.querySelector("#open-navigation");
const closeNavigation = document.querySelector("#close-navigation");
const avatarButton = document.querySelector("#open-avatar-menu");
const avatarPopover = document.querySelector("#avatar-popover");
const closeAvatar = document.querySelector("#close-avatar-menu");
const appBar = document.querySelector(".app-bar");
const mapPlaceholder = document.querySelector(".map-placeholder");

const escapeHtml = (value) => value.replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
})[character]);

function panelMarkup(section) {
  if (section.groups) {
    return section.groups.map(([label, items]) => `
      <section class="item-group">
        <h3>${escapeHtml(label)}</h3>
        <div class="nav-items">${items.map((item) => `<a class="nav-link" href="#${section.id}">${escapeHtml(item)}</a>`).join("")}</div>
      </section>`).join("");
  }

  return `<div class="simple-list">${section.items.map((item) => `<a class="nav-link" href="#${section.id}">${escapeHtml(item)}</a>`).join("")}</div>`;
}

navigation.innerHTML = sections.map((section) => `
  <details class="nav-section" name="primary-navigation">
    <summary class="nav-summary">${escapeHtml(section.label)}</summary>
    <div class="nav-panel">${panelMarkup(section)}</div>
  </details>`).join("");

function closeAvatarMenu({ restoreFocus = true } = {}) {
  if (!avatarPopover || avatarPopover.hidden) return;
  avatarPopover.hidden = true;
  avatarButton.setAttribute("aria-expanded", "false");
  if (restoreFocus) avatarButton.focus();
}

function openDrawer() {
  closeAvatarMenu({ restoreFocus: false });
  appBar.inert = true;
  mapPlaceholder.inert = true;
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  openNavigation.setAttribute("aria-expanded", "true");
  closeNavigation.focus();
}

function closeDrawer() {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  appBar.inert = false;
  mapPlaceholder.inert = false;
  openNavigation.setAttribute("aria-expanded", "false");
  openNavigation.focus();
}

function drawerFocusables() {
  return [...drawer.querySelectorAll('button, summary, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hidden && element.getClientRects().length);
}

openNavigation.addEventListener("click", openDrawer);
closeNavigation.addEventListener("click", closeDrawer);

if (avatarButton) {
  avatarButton.addEventListener("click", () => {
    const willOpen = avatarPopover.hidden;
    avatarPopover.hidden = !willOpen;
    avatarButton.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) closeAvatar.focus();
  });
  closeAvatar.addEventListener("click", () => closeAvatarMenu());
}

navigation.addEventListener("click", (event) => {
  const link = event.target.closest(".nav-link");
  if (!link) return;
  event.preventDefault();
  navigation.querySelectorAll(".nav-link").forEach((item) => item.removeAttribute("aria-current"));
  link.setAttribute("aria-current", "page");
});

document.addEventListener("click", (event) => {
  if (avatarPopover && !avatarPopover.hidden && !avatarPopover.contains(event.target) && !avatarButton.contains(event.target)) {
    closeAvatarMenu({ restoreFocus: false });
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (avatarPopover && !avatarPopover.hidden) closeAvatarMenu();
    else if (drawer.classList.contains("is-open")) closeDrawer();
    return;
  }

  if (event.key !== "Tab" || !drawer.classList.contains("is-open")) return;
  const focusable = drawerFocusables();
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
