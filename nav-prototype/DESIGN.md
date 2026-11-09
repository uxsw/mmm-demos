---
name: MAVIS Navigation Prototype
description: A compact, high-contrast aviation-weather navigation system for focused mobile and desktop research.
colors:
  canvas: "#252626"
  desktop-canvas: "#101619"
  chrome: "#11191d"
  desktop-chrome: "#171b1e"
  desktop-hover: "#243238"
  ink: "#061f2d"
  ink-deep: "#041822"
  ink-raised: "#0b4d73"
  ink-active: "#126695"
  wayfinding-wash: "rgba(18, 102, 149, 0.24)"
  line: "#2c83aa"
  line-soft: "rgba(108, 191, 229, 0.28)"
  text: "#f4f8fb"
  text-muted: "#b8cfda"
  cyan: "#6cc9f3"
  desktop-cyan: "#69c8f2"
  lime: "#c3cf3d"
  brand-lime: "#c9eb13"
  yellow: "#ffdc72"
  focus: "#ffdb4d"
typography:
  display:
    fontFamily: "Trebuchet MS, Segoe UI, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  launcher-option:
    fontFamily: "Trebuchet MS, Segoe UI, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Trebuchet MS, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.02em"
  title:
    fontFamily: "Trebuchet MS, Segoe UI, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.02em"
  body:
    fontFamily: "Trebuchet MS, Segoe UI, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 400
    lineHeight: 1.25
  label:
    fontFamily: "Trebuchet MS, Segoe UI, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.02em"
  desktop-nav:
    fontFamily: "Trebuchet MS, Segoe UI, sans-serif"
    fontSize: "0.98rem"
    fontWeight: 400
    lineHeight: 1.2
  desktop-layer:
    fontFamily: "Trebuchet MS, Segoe UI, sans-serif"
    fontSize: "0.81rem"
    fontWeight: 400
    lineHeight: 1.2
  desktop-layer-label:
    fontFamily: "Trebuchet MS, Segoe UI, sans-serif"
    fontSize: "0.69rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.03em"
rounded:
  chip: "2px"
  switch: "13px"
  search: "24px"
  device: "32px"
  circle: "50%"
spacing:
  hairline: "3px"
  compact: "5px"
  xs: "7px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  launcher-option:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.launcher-option}"
    padding: "8px 10px"
    height: "60px"
  search-field:
    backgroundColor: "{colors.ink-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.search}"
    height: "46px"
    padding: "0 14px"
  profile-button:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.circle}"
    size: "34px"
  nav-trigger:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.headline}"
    padding: "8px 5px"
    height: "44px"
  nav-link:
    backgroundColor: "{colors.ink-raised}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.chip}"
    padding: "7px 8px"
    height: "38px"
  nav-link-hover:
    backgroundColor: "{colors.ink-active}"
    textColor: "{colors.text}"
    rounded: "{rounded.chip}"
  base-map-button:
    backgroundColor: "{colors.ink-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.chip}"
    padding: "6px 7px"
  drill-root-row:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.headline}"
    padding: "8px 5px"
    height: "52px"
  drill-root-row-hover:
    backgroundColor: "{colors.wayfinding-wash}"
    textColor: "{colors.text}"
  drill-screen-header:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.text}"
    typography: "{typography.headline}"
    height: "56px"
    padding: "0 8px"
  desktop-primary-trigger:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.desktop-nav}"
    padding: "0 16px"
    height: "42px"
  desktop-primary-trigger-active:
    backgroundColor: "{colors.desktop-cyan}"
    textColor: "{colors.ink-deep}"
    typography: "{typography.desktop-nav}"
    padding: "0 16px"
    height: "42px"
  desktop-layer-link:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.desktop-layer}"
    height: "34px"
---

# Design System: MAVIS Navigation Prototype

## Overview

**Creative North Star: "The Scannable Flight Deck"**

The interface behaves like a compact operational index: information-rich, dark, and direct, with only the active hierarchy demanding attention. On mobile it supports disclosure-in-place and dedicated drill-in screens; on desktop it extends the same visual language into a persistent two-bar header and wide mega-navigation. Deep navy working surfaces keep the navigation visually continuous while brighter colors act as instruments—cyan points to controls and structure, lime marks categories, and yellow confirms focus, selection, and account identity.

Density is deliberate rather than cramped. Mobile participants begin on a minimal launcher that exposes only Accordion and Drilling, then enter the selected full-height journey. At 1024px and wider, the separate desktop surface begins with Map selected, keeps common map layers one step away in a secondary bar, and places the complete 26-layer inventory in a six-column mega panel. Decoration is subordinate to navigation state, legibility, and journey consistency.

**Key Characteristics:**

- Deep navy operational surfaces within near-black chrome.
- A minimal two-choice participant launcher with no research controls.
- Compact, wrapping destination chips and unmistakable accordion or drill-in state.
- Cyan wayfinding, lime hierarchy labels, and scarce yellow emphasis.
- Square-small content geometry balanced by pill and circular utility controls.
- Restrained motion with a complete reduced-motion path.
- Equivalent visible Back and browser Back behavior with restored keyboard focus.
- A desktop-only primary bar, Map secondary bar, and six-column layer panel at 1024px and wider.
- Intentional hover preview, click-to-pin persistence, and complete keyboard entry and return paths on desktop.

## Colors

The palette reads like aviation instrumentation: dark working fields carry the density while three bright signals divide navigation, hierarchy, and state.

### Primary

- **Instrument Cyan:** The main wayfinding color for launcher chevrons, control icons, open-section rules, focus-within treatments, and toggles.
- **Desktop Instrument Cyan:** The desktop-specific cyan used for the active Map tab, column dividers, secondary-bar structure, and interactive emphasis.

### Secondary

- **Category Lime:** Reserved for the menu identity and compact group labels inside long inventories.
- **Brand Lime:** Reserved for the desktop Met Office wave mark; map-layer group headings continue to use Category Lime.

### Tertiary

- **Attention Yellow:** Identifies the account control, active destination, text selection, and other decisive states.

### Neutral

- **Runway Canvas:** The desktop background surrounding the centered participant frame.
- **Desktop Night Canvas:** The full-browser field beneath the desktop-only navigation and weather-map workspace.
- **Black-box Chrome:** The persistent launcher and menu header above the navy working surface.
- **Desktop Chrome:** The slightly lighter near-black primary bar used only by the desktop mega-navigation.
- **Desktop Hover Slate:** The restrained rollover field for primary desktop navigation.
- **Flight Deck Ink:** The continuous menu, scrollbar track, and footer surface.
- **Deep Ink:** Dark contrast color used against bright yellow and selection backgrounds.
- **Raised Navigation Blue:** The default fill for search, links, and compact map controls.
- **Active Navigation Blue:** The hover response for destination chips.
- **Wayfinding Wash:** A translucent blue hover field for drill-in root rows that preserves the continuous navy surface.
- **Operational White:** Primary text on dark surfaces.
- **Muted Sky:** Secondary status, footer, switch, and empty-state text.
- **Structural Blue:** Strong dividers and scrollbar thumbs; its translucent counterpart separates dense item groups.

### Named Rules

**The Three-Signal Rule.** Cyan means wayfinding and control, lime means hierarchy, and yellow means attention or selection; do not interchange their jobs casually.

**The Dark Continuity Rule.** Mobile menu bodies and the desktop Map layer panel remain uninterrupted navy working fields; structure comes from spacing, type, and selective rules rather than stacked decorative cards.

## Typography

**Display Font:** Trebuchet MS (with Segoe UI and generic sans-serif fallbacks)  
**Body Font:** Trebuchet MS (with Segoe UI and generic sans-serif fallbacks)  
**Label Font:** Trebuchet MS (with Segoe UI and generic sans-serif fallbacks)

**Character:** A single humanist sans-serif stack keeps both prototypes immediate and platform-tolerant. The mobile launcher uses one clear 1.5rem instruction and two firm 1.05rem choices. Desktop navigation stays quieter at 0.98rem, with 0.81rem layer links and tracked 0.69rem uppercase layer-group labels. Across both surfaces, hierarchy comes from weight, compact sizing, and restrained tracking rather than a decorative type pairing.

### Hierarchy

- **Display:** Bold at 1.5rem with tight leading; used only for the launcher instruction “Open menu.”
- **Launcher Option:** Extra-bold at 1.05rem with slight tracking; used for the Accordion and Drilling journey links.
- **Headline:** Extra-bold with slight tracking; used for top-level accordion triggers and drill-in root rows.
- **Title:** Bold and compact; used for the menu identity, drill-in screen title, and panel headings.
- **Body:** Regular, compact, and readable; used for destination chips and operational copy.
- **Label:** Medium-weight, tracked, and uppercase where it names map-layer groups; used to create structure without increasing size.
- **Desktop Navigation:** Regular at 0.98rem; used for primary tabs, the secondary Map bar, and quick-layer shortcuts.
- **Desktop Layer:** Regular at 0.81rem with compact leading; used for the 26 links in the mega panel.
- **Desktop Layer Label:** Medium at 0.69rem with 0.03em tracking and uppercase treatment; used for the eight layer groups distributed across six columns.

### Named Rules

**The Weight-Before-Size Rule.** Inside the menu, create hierarchy through weight, color, and case before enlarging text; compact scanning is part of the product identity.

## Layout

### Mobile Participant Surface

The participant surface is always one mobile frame. On desktop, center only the 390px by 844px frame on the runway canvas; do not add surrounding copy, controls, or a second column. On mobile, remove the outer border, radius, shadow, and padding so the frame becomes the full viewport edge to edge. The launcher and both journeys use a fixed 44px header, a flexible middle region, and a persistent 40px Crown copyright footer.

The launcher centers its content vertically within the middle region, with 20px horizontal padding and 28px top, 44px bottom padding. “Open menu” sits 24px above two stacked 60px journey links. Each row has a cyan forward chevron and a structural divider, exposing only Accordion and Drilling. The custom JavaScript accordion is an unlinked internal route available through `accordion.html?method=custom`.

Within the menu, use an 8px working inset, 12–16px structural insets, and 5–8px gaps for dense item groups. Destination links wrap as a flexible row rather than forcing a fixed grid. Primary accordion targets remain at least 44px tall; drill-in root rows are 52px tall, the pinned child-screen header is 56px tall, and the search field is 46px tall.

The drill-in root contains search, account access, and six full-width category rows. Selecting a category replaces that root list inside the existing scroll region. The child screen keeps its Back control and centered category title sticky at the top while the grouped inventory scrolls underneath; the global menu header and Crown copyright footer remain in place.

### Desktop Mega-navigation Surface

The separate desktop prototype is desktop-only and begins at a hard 1024px minimum width; it does not collapse into the mobile frame or inherit the mobile page composition. Its primary navigation bar is 58px high with 8px vertical inset, brand lockup on the left, and navigation, utility, and profile controls aligned to the right. Map is selected by default with a cyan filled tab.

Map selection reveals a 48px secondary bar beneath the primary bar. “All layers” anchors the left edge and is followed by the supplied quick layers: Surface Visibility, Cloud Base, and Surface Temperature. Opening All layers produces a full-width navy mega panel with a compact Lat/Long switch and exactly 26 layer links arranged across six equal columns. Eight groups flow in the supplied column order: Cloud & visibility; Lightning, Pressure, and Satellite; Precipitation; Sea conditions; Temperature; and Wind. Columns use 14px internal padding, cyan-toned vertical separators, compact 34px links, and 25px visual swatches.

Briefing Products and Regional Report open compact, full-width navy content panels rather than the full layer inventory. Briefing uses three columns; Regional uses two columns capped at 440px each. Each compact panel begins directly with a cyan top border and its link columns; there is no external grey caption or charcoal surround. Desktop labels, ordering, and panel composition follow the desktop surface's own supplied reference and implementation; do not normalize them to the mobile navigation inventory when the two references differ.

**The Desktop Threshold Rule.** The primary bar, Map secondary bar, and mega panels exist only at 1024px and wider; they are a separate evaluation surface, not a responsive state of the 390px mobile prototype.

**The Desktop Reference Rule.** Desktop content follows its own supplied reference, including its wording, quick layers, and compact-panel composition; shared mobile content is not the authority for this surface.

**The Compact Panel Rule.** Briefing and Regional are full-width navy content panels with a cyan top border; never add an external grey caption or charcoal surround.

**The One-Level Rule.** Accordions expose only one top-level section at a time; drill-in navigation replaces the root list with one child screen. In both patterns, the visible inventory stays within one vertically scrolling region.

**The Same Exit Rule.** Visible Back and browser Back return to the same root state and restore focus to the category row that opened the child screen.

**The Participant Exit Rule.** Close and Escape leave either journey and return to the minimal launcher; they do not reveal an in-page test harness.

**The Launcher Boundary Rule.** The participant launcher exposes only Accordion and Drilling; the custom JavaScript accordion remains available solely through its direct internal query route.

## Elevation & Depth

The navigation is flat and structurally layered. Navy tonal changes distinguish raised controls from the working surface; cyan rules and translucent dividers organize depth inside the menu. A single ambient shadow belongs to the desktop device frame, while the switch thumb uses a small functional shadow to remain legible against its track. Mobile presentation removes the device shadow entirely.

The desktop-only site header and any open mega panel use restrained structural shadows to separate navigation from the map workspace. These shadows communicate overlay depth; they do not turn links or columns into floating cards.

### Shadow Vocabulary

- **Device Ambient** (`0 18px 44px rgba(0, 0, 0, 0.28)`): Separates the framed desktop prototype from the surrounding canvas only.
- **Switch Thumb** (`0 2px 5px rgba(0, 0, 0, 0.3)`): Keeps the white toggle thumb distinct from both switch states.
- **Desktop Header** (`0 5px 20px rgba(0, 0, 0, 0.32)`): Separates the persistent desktop navigation stack from the weather-map workspace.
- **Desktop Mega Panel** (`0 12px 22px rgba(0, 0, 0, 0.36)`): Places an open Briefing, Regional, or All Layers panel above the workspace.

### Named Rules

**The Flat Working Surface Rule.** Never use card shadows inside the menu; hierarchy there is tonal, typographic, and structural.

## Shapes

The system mixes two deliberate shape families. Content-heavy navigation is nearly square: launcher rows, destination chips, layer icons, and map controls use straight edges or a restrained 2px radius. Utility controls are friendlier and more isolated: the search field is a 24px pill and the profile control is circular. The 32px device radius exists only around the centered desktop frame and disappears on mobile.

The desktop extension follows the same semantics. Primary and secondary bars, compact panels, columns, and link fields remain square. The MAVIS product tag and 25px layer swatches use the restrained 2px radius; the profile control and Lat/Long thumb are circular.

Borders are sparse. Use strong cyan rules for meaningful section state, translucent cyan rules for dense grouping, and visible outlines for focus or selection. Do not wrap every region in a border.

**The Shape-Semantics Rule.** Small square corners belong to dense destinations; pills and circles belong to singular controls.

## Components

### Buttons

- **Shape:** Compact content buttons use a nearly square 2px radius; icon buttons remain visually unboxed.
- **Primary:** Yellow fill with deep-ink text is reserved for decisive controls such as the circular account control.
- **Hover / Focus:** Focus uses a 2px yellow outline with a 2px offset globally. Pressed map controls use the same outline at a tighter 1px offset.
- **Icon:** Close and menu icons use 40px square targets with 20px stroked SVG artwork.

### Chips

- **Style:** Destination chips use raised-navigation blue, operational white text, compact 7px by 8px padding, and a 2px radius. Optional 20px icons sit inside the chip rather than outside it.
- **State:** Hover deepens the blue. The current destination keeps the same fill and gains a yellow 2px outline, preserving layout while making selection unmistakable.

### Cards / Containers

- **Corner Style:** The desktop frame uses a 32px radius; it becomes a square edge-to-edge region on mobile.
- **Background:** Containers use black-box chrome or flight-deck ink, not light cards.
- **Shadow Strategy:** Only the desktop device frame is elevated; internal working surfaces remain flat.
- **Border:** Desktop framing uses quiet gray borders; internal inventory groups use translucent cyan dividers.
- **Internal Padding:** Structural container insets range from 8px to 16px.

### Inputs / Fields

- **Style:** Search is a 46px raised-blue pill with a cyan 22px search icon, white input text, and a pale cyan placeholder. The field has no inner border.
- **Focus:** The entire pill receives a 2px cyan focus-within outline with a 2px offset; the caret is yellow.
- **State:** Search results are announced in muted text beneath the field; no-results copy occupies the working surface without an extra card.

### Navigation

The launcher is a minimal root navigation surface. It shows “Open menu” and exactly two 60px links—Accordion and Drilling—under the persistent menu header. Rows are extra-bold, separated by cyan-toned rules, and end in cyan forward chevrons. No implementation labels, status copy, or auxiliary controls appear to participants.

Accordion triggers are full-width, extra-bold 44px rows with a CSS chevron that rotates on expansion. An open section gains a cyan top rule. Panels use compact section headings, wrapping chips, and translucent group dividers. The participant route uses native `<details>` disclosure. The visually equivalent custom button/panel implementation remains available only through its direct internal query route and is not linked from the launcher.

Drill-in root rows use the same extra-bold heading treatment on 52px full-width targets, with a cyan forward chevron and a quiet translucent-blue hover field. Selecting a row pushes a history entry and replaces the root with a child screen. The 56px child header is pinned inside the scroller: a cyan Back control occupies the left track and the category title remains centered independently. Back returns through browser history; both the visible control and browser Back restore focus to the originating root row. Direct hash entry is normalized into the same root-to-child history path.

The child screen enters with a restrained 180ms right-to-left settle using the standard expressive easing. Under `prefers-reduced-motion: reduce`, the entrance animation is removed and all state transitions are effectively immediate. The footer remains fixed while either root or child content scrolls. From either journey, the visible Close control and Escape both return to the launcher.

#### Desktop Mega-navigation

The desktop primary bar keeps Balloon Forecasts as a direct link and presents Briefing Products, Regional Report, and Map as adjacent navigation controls. Map is the default selected page; its cyan active tab reveals the secondary bar. Previewing or opening Briefing or Regional shows that trigger's dropdown state without removing Map's cyan selected-page state. Their compact full-width navy panels occupy the dropdown region, while All layers opens the complete six-column panel below the Map bar.

**The Persistent Selected Page Rule.** Map remains cyan as the selected page while Briefing or Regional is previewed, open, or pinned; dropdown state supplements page state rather than replacing it.

Briefing and Regional use static downward chevrons in every state; opening a dropdown does not rotate its indicator. Their panels reveal as overlays with a restrained clip-and-fade transition: approximately 210ms on entrance and 150ms on exit. The Map secondary navigation remains rendered and visually in place behind the dropdown overlay, preventing the header or workspace from jumping as previews change. Under `prefers-reduced-motion: reduce`, the reveal and dismissal become near-instant.

**The Stationary Desktop Chrome Rule.** Keep primary chevrons pointing down and the Map sub-navigation in place behind dropdown overlays; communicate opening through the panel's clip-and-fade reveal, not rotating indicators or layout movement.

Balloon Forecasts, Briefing Products, and Regional Report share one dark hover-and-focus highlight behind their primary-bar targets. On first entry the highlight appears directly beneath the entered target without travelling from an arbitrary origin. Subsequent movement glides the same highlight between targets using a transform-driven transition of approximately 260ms with the standard expressive easing, preserving spatial continuity across pointer and keyboard focus changes. Map keeps its independent cyan selected-page fill and never participates in the dark shared highlight.

Moving the shared highlight to the Balloon Forecasts direct link closes any Briefing or Regional dropdown while the highlight itself continues its glide. Under `prefers-reduced-motion: reduce`, highlight appearance and movement become near-instant without changing target, dropdown, or selected-page state.

**The One Shared Highlight Rule.** Use one transform-driven dark layer for Balloon, Briefing, and Regional hover/focus continuity; first entry appears in place, later moves glide in about 260ms, and Map remains independently cyan.

Pointer hover is a preview, not an immediate trap: wait about 110ms before opening a hovered menu and about 260ms after leaving the navigation before returning to the default Map state. Moving back into the navigation cancels the close timer. Clicking a trigger pins that menu so pointer departure cannot dismiss it; clicking the pinned trigger again, clicking outside, or pressing Escape returns to Map. When reduced motion is requested, visual transitions become effectively immediate, but the interaction timing and states remain coherent.

Keyboard users move between primary dropdown triggers with Left and Right Arrow. Down Arrow, Enter, or Space opens Briefing or Regional, pins it, and moves focus to its first actionable item. Focus previews a trigger without delay. Escape closes any non-default menu, returns to Map, and restores focus to the trigger that owned the dismissed panel. All Layers supports the same Enter and Space activation path and exposes accurate `aria-expanded` state; its first link receives focus when entered through the keyboard. Visible focus uses the global 3px gold outline, with a positive offset inside mega panels so the ring is not clipped.

**The Preview-Then-Pin Rule.** Hover and focus may preview desktop menus, but only activation pins a panel. Preserve the 110ms open and 260ms close intent windows so incidental pointer travel does not churn the navigation.

**The Escape Return Rule.** Escape always restores the default Map context and returns focus to the trigger responsible for the dismissed desktop panel.

### Toggle

The mobile latitude/longitude control uses a 40px by 22px light track and a 24px white thumb. Checked state changes the track to cyan and translates the thumb 18px. Its desktop counterpart is denser at 34px by 18px with a 14px thumb and 16px checked translation. Keyboard focus receives the global yellow outline on both surfaces.

## Do's and Don'ts

### Do:

- **Do** keep top-level accordion targets at least 44px tall and preserve one-open-at-a-time behavior.
- **Do** use 52px drill-in root rows and keep the 56px Back/title header pinned above child-screen content.
- **Do** let destination chips wrap naturally inside the vertical scrolling region.
- **Do** use cyan, lime, and yellow according to the Three-Signal Rule.
- **Do** preserve visible keyboard focus, accurate expanded state, reduced-motion behavior, and semantic control structure.
- **Do** make visible Back and browser Back restore the originating drill-in row's focus.
- **Do** expose only Accordion and Drilling on the participant launcher.
- **Do** center only the 390px by 844px frame on desktop and use the full viewport on mobile.
- **Do** make Close and Escape return to the launcher from either journey.
- **Do** keep the desktop mega-navigation at 1024px and wider, with Map selected and its secondary bar visible by default.
- **Do** preserve all 26 supplied map layers in the six-column desktop panel and keep Briefing and Regional compact.
- **Do** preserve desktop hover intent, click-to-pin behavior, Arrow/Enter/Space entry, and Escape focus return.
- **Do** keep desktop chevrons static and reveal dropdown overlays in about 210ms, dismissing them in about 150ms.
- **Do** use one continuous dark highlight across Balloon, Briefing, and Regional hover and focus states.
- **Do** treat the desktop reference as the content authority for desktop labels, ordering, and panel composition.

### Don't:

- **Don't** add light cards, decorative gradients, or internal shadows that compete with the navigation inventory.
- **Don't** use horizontal scrolling for destinations or map layers.
- **Don't** turn every group into a bordered container; spacing and selective rules carry the structure.
- **Don't** enlarge menu typography to manufacture hierarchy when weight, case, and color can do the job.
- **Don't** animate state in a way that survives the user's reduced-motion preference.
- **Don't** put explanatory copy or auxiliary controls around the participant frame.
- **Don't** link the custom JavaScript accordion from the participant launcher.
- **Don't** collapse the desktop navigation into the mobile frame or treat the two prototypes as one responsive document.
- **Don't** open desktop menus on zero-delay pointer transit or dismiss a clicked-and-pinned panel on pointer leave.
- **Don't** rotate Briefing or Regional chevrons or remove the Map sub-navigation to make room for their overlays.
- **Don't** animate the first highlight entry from an unrelated origin or merge Map into the shared highlight.
- **Don't** replace the desktop six-column layer panel with mobile wrapping chips or normalize desktop-specific copy to the mobile inventory.
