# MAVIS navigation prototypes

A framework-free set of mobile and desktop navigation prototypes based on the supplied references. The mobile version compares accordion and drill-in models; the desktop version tests a large hover-and-click mega-navigation.

## Run it

Open `index.html` to launch the phone-sized chooser. It offers the two public journeys: **Accordion** and **Drilling**. The files can be opened directly, or served locally:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000` and use a mobile viewport around 390 × 844.

For the desktop mega-navigation, visit `http://localhost:8000/desktop.html` at a viewport of 1024px or wider.

## What to test

- Choose **Accordion** or **Drilling** from the initial Open menu screen.
- Expand each top-level section; only one section remains open.
- Search across destination and map-layer labels.
- Select a destination and confirm the current-item state.
- Close the overlay with the close button or Escape, then reopen it.
- Use Tab, Shift+Tab, Enter, Space, and arrow-key browser scrolling.
- In `screen.html`, open every category as a new view and confirm the back/title row remains visible while the list scrolls.
- Use both the visible Back control and browser Back, then confirm focus returns to the category that opened the screen.
- Close either journey and confirm it returns to the two-option launcher.

### Desktop page

- Begin with Map selected and use its three quick layer links.
- Open All layers to scan the full 26-layer inventory.
- Hover Briefing Products or Regional Report to preview its mega-menu.
- Click a menu trigger to keep its panel open while moving the pointer elsewhere.
- Use Left/Right Arrow between dropdown triggers, Down Arrow to enter an open content panel, and Escape to dismiss it.
- Move the pointer from a trigger into its panel and confirm the panel remains available.

## Drill-in screen version

The drill-in version replaces the root category list with the chosen category. Its content uses the full navigation viewport, while a sticky row keeps the category title and Back control available during long Map-list scrolling. Browser history mirrors the visible transition so browser Back and the on-screen Back control follow the same route.

This pattern reduces competition between top-level categories and child links, but it introduces an extra navigation step and temporarily hides sibling categories. The separate prototype keeps content and styling consistent so testing can focus on that interaction trade-off.

## Implementation comparison

The shared launcher intentionally exposes only the two core research options. The custom JavaScript accordion remains available internally at `accordion.html?method=custom`, but is not linked from the participant-facing interface.

### Native `<details>`

The native version uses `<details name="primary-navigation">` and `<summary>`. The shared `name` gives supporting browsers exclusive accordion behaviour without scripting.

Benefits:

- Built-in expanded/collapsed semantics and keyboard activation.
- In a server-rendered implementation, disclosure behaviour remains usable if JavaScript fails. This prototype generates shared test content with JavaScript, so that resilience is not demonstrated here.
- Less state-management code and a smaller maintenance surface.

Trade-offs:

- Exact animation and focus behaviour are harder to control consistently.
- Browser styling and assistive-technology announcements can vary.
- The exclusive `name` behaviour is relatively new; older browsers may allow multiple sections open.

### Custom JavaScript

The custom version uses buttons with `aria-expanded`, `aria-controls`, labelled panels, and explicit single-open state.

Benefits:

- Predictable single-open behaviour and full control over transitions, focus, analytics, and URL state.
- Easier to add product-specific rules such as restoring the last open section.

Trade-offs:

- Accessibility depends on every state change being implemented correctly.
- More code, more regression risk, and less resilience if JavaScript fails.

## Suggested research stance

Start the usability study with native `<details>`. The core interaction is a conventional disclosure pattern, and the native implementation supplies most of the required behaviour with less code. Use the custom version only if testing reveals a concrete need for behaviour the native element cannot provide—such as carefully choreographed panel animation, deep-linkable accordion state, or bespoke focus movement.
