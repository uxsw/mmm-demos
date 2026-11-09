(function () {
  "use strict";

  const navigation = document.querySelector("[data-navigation]");
  const mapTools = document.getElementById("map-tools");
  const primaryNav = document.querySelector(".primary-nav");
  const navHighlight = document.querySelector(".nav-highlight");
  const triggers = Array.from(document.querySelectorAll("[data-menu-trigger]"));
  const primaryTriggers = triggers.filter((trigger) => trigger.classList.contains("primary-trigger"));
  const panels = Array.from(document.querySelectorAll("[data-menu-panel]"));
  const mapTrigger = document.querySelector('[data-menu-trigger="map"]');
  const layerColumns = document.querySelector("[data-layer-columns]");
  const switchControl = document.querySelector('[role="switch"]');
  let openMenu = "map";
  let pinnedMenu = null;
  let openTimer;
  let closeTimer;
  let highlightTarget = null;

  document.documentElement.classList.add("has-nav-highlight");

  const columns = [
    ["Cloud & visibility"],
    ["Lightning", "Pressure", "Satellite"],
    ["Precipitation"],
    ["Sea conditions"],
    ["Temperature"],
    ["Wind"]
  ];

  const swatches = ["#2e9dbe", "#6d8790", "#88989a", "#72136f", "#2d4df0", "#0b8d3f", "#078733", "#cb9d13", "#dde3e4", "#76878b", "#566569", "#23a666", "#ff9f17", "#e9ecec", "#ff9c17", "#64e53a", "#8cff25", "#8ee93e", "#4acfa3", "#2ed3bd", "#e9f243", "#e2e5e5", "#e4e7e7", "#e4e7e7", "#e4e7e7", "#e4e7e7"];
  let swatchIndex = 0;

  function buildLayers() {
    const mapSection = window.MAVIS_NAV_SECTIONS.find((section) => section.id === "map");
    const groupMap = new Map(mapSection.groups);

    columns.forEach((columnGroups) => {
      const column = document.createElement("div");
      column.className = "layer-column";

      columnGroups.forEach((groupName) => {
        const group = document.createElement("section");
        group.className = "layer-group";
        const heading = document.createElement("h2");
        heading.textContent = groupName;
        group.append(heading);

        groupMap.get(groupName).forEach((label) => {
          const link = document.createElement("a");
          link.className = "layer-link";
          link.href = `#${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
          const swatch = document.createElement("span");
          swatch.className = "layer-swatch";
          swatch.style.setProperty("--swatch", swatches[swatchIndex % swatches.length]);
          swatch.setAttribute("aria-hidden", "true");
          link.append(swatch, document.createTextNode(label));
          group.append(link);
          swatchIndex += 1;
        });

        column.append(group);
      });

      layerColumns.append(column);
    });
  }

  function moveHighlight(target) {
    if (!target || target === mapTrigger) {
      navHighlight.classList.remove("is-visible");
      highlightTarget = null;
      return;
    }

    const navRect = primaryNav.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const isFirstPosition = !navHighlight.classList.contains("is-visible");

    if (isFirstPosition) navHighlight.classList.add("is-instant");
    navHighlight.style.setProperty("--highlight-x", `${targetRect.left - navRect.left}px`);
    navHighlight.style.setProperty("--highlight-width", String(targetRect.width));
    navHighlight.classList.add("is-visible");
    highlightTarget = target;

    if (isFirstPosition) {
      navHighlight.getBoundingClientRect();
      navHighlight.classList.remove("is-instant");
    }
  }

  function setOpen(menu, options = {}) {
    openMenu = menu;
    const showMapTools = menu === "map" || menu === "layers";
    mapTools.hidden = false;
    mapTools.inert = !showMapTools;
    mapTools.setAttribute("aria-hidden", String(!showMapTools));

    panels.forEach((panel) => {
      const isVisible = panel.dataset.menuPanel === menu;
      panel.classList.toggle("is-visible", isVisible);
      panel.inert = !isVisible;
      panel.setAttribute("aria-hidden", String(!isVisible));
    });

    triggers.forEach((trigger) => {
      const triggerMenu = trigger.dataset.menuTrigger;
      trigger.setAttribute("aria-expanded", String(triggerMenu === menu || (triggerMenu === "map" && menu === "layers")));
    });

    if (menu === "briefing" || menu === "regional") {
      moveHighlight(document.querySelector(`[data-menu-trigger="${menu}"]`));
    } else if ((menu === "map" || menu === "layers") && !options.preserveHighlight) {
      moveHighlight(null);
    }

    if (options.focusPanel) {
      const panel = document.querySelector(`[data-menu-panel="${menu}"]`);
      panel?.querySelector("a, button")?.focus();
    }
  }

  function restoreDefault() {
    pinnedMenu = null;
    setOpen("map");
  }

  function scheduleOpen(menu) {
    if (pinnedMenu) return;
    window.clearTimeout(closeTimer);
    window.clearTimeout(openTimer);
    openTimer = window.setTimeout(() => setOpen(menu), 110);
  }

  function scheduleClose() {
    window.clearTimeout(openTimer);
    if (pinnedMenu) return;
    closeTimer = window.setTimeout(restoreDefault, 260);
  }

  triggers.forEach((trigger) => {
    const menu = trigger.dataset.menuTrigger;

    trigger.addEventListener("pointerenter", () => scheduleOpen(menu));
    trigger.addEventListener("focus", () => setOpen(menu));
    trigger.addEventListener("click", () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
      if (pinnedMenu === menu) {
        restoreDefault();
        return;
      }
      pinnedMenu = menu;
      setOpen(menu);
    });

    trigger.addEventListener("keydown", (event) => {
      const index = primaryTriggers.indexOf(trigger);
      if (index >= 0 && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        primaryTriggers[(index + direction + primaryTriggers.length) % primaryTriggers.length].focus();
      }
      if ((event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") && menu !== "map") {
        event.preventDefault();
        pinnedMenu = menu;
        setOpen(menu, { focusPanel: true });
      }
    });
  });

  document.querySelectorAll('.primary-trigger:not([data-menu-trigger="map"])').forEach((item) => {
    item.addEventListener("pointerenter", () => moveHighlight(item));
    item.addEventListener("focus", () => moveHighlight(item));
  });

  document.querySelectorAll(".primary-link").forEach((item) => {
    const showDirectLink = () => {
      if (pinnedMenu) return;
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
      setOpen("map", { preserveHighlight: true });
      moveHighlight(item);
    };
    item.addEventListener("pointerenter", showDirectLink);
    item.addEventListener("focus", showDirectLink);
  });

  mapTrigger.addEventListener("pointerenter", () => moveHighlight(null));
  window.addEventListener("resize", () => {
    if (highlightTarget) moveHighlight(highlightTarget);
  });

  navigation.addEventListener("pointerleave", scheduleClose);
  navigation.addEventListener("pointerenter", () => window.clearTimeout(closeTimer));

  document.addEventListener("click", (event) => {
    if (!navigation.contains(event.target)) restoreDefault();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || openMenu === "map") return;
    const activeTrigger = document.querySelector(`[data-menu-trigger="${openMenu}"]`) || mapTrigger;
    restoreDefault();
    activeTrigger.focus();
  });

  switchControl.addEventListener("click", () => {
    switchControl.setAttribute("aria-checked", String(switchControl.getAttribute("aria-checked") !== "true"));
  });

  panels.forEach((panel) => {
    panel.hidden = false;
  });
  buildLayers();
  setOpen("map");
})();
