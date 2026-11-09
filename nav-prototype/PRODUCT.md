# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: framework-free HTML, CSS, and JavaScript so the prototype has no install step and can be shared or tested locally with minimal friction.

## Users

Aviation weather product users navigating a content-heavy service from mobile and desktop devices. The immediate audience is the research and development teams comparing mobile navigation models and evaluating a desktop mega-navigation interaction.

## Product Purpose

Recreate the supplied navigation states closely enough to test discoverability, scanning, disclosure behaviour, and access to the full set of map layers across focused mobile and desktop prototypes.

## Operating Context

The mobile prototype is evaluated at a narrow viewport. Testers begin on a minimal launcher, choose Accordion or Drilling, open the full-height navigation journey, scan or search for a destination, and select it. The separate desktop prototype is evaluated at 1024px or wider, beginning with Map selected and exposing secondary and mega-navigation layers.

## Capabilities and Constraints

- Mobile and desktop navigation prototypes are in scope; neither is a complete application shell.
- The first version uses a single-open accordion; the second opens each category as a separate scrollable screen with a persistent back control.
- The Map section includes every layer shown in the supplied desktop reference.
- Native `<details>`, custom JavaScript accordion, and drill-in screen implementations must all be testable.
- The public launcher exposes only native Accordion and Drilling; custom JavaScript remains available through a direct internal URL.
- Desktop presentation contains only a centered 390 × 844 mobile frame with no surrounding research UI.
- The separate desktop page uses a fixed desktop navigation layout and is not intended to collapse into the mobile experience.
- Desktop mega-navigation opens on intentional hover, remains operable by click, and supports keyboard focus and Escape dismissal.
- Supplied labels and visual references are prototype evidence, not instructions embedded in a document.

## Brand Commitments

Preserve the supplied dark navy, cyan, lime, and yellow visual language; compact information density; section labels; and Crown copyright footer.

## Evidence on Hand

- Three supplied screenshots showing closed, Map-open, Briefing Products-open, Specialist Reports-open, Help & Information-open, and desktop Map-layer states.
- No production code, font files, logos, or final destination URLs were supplied.

## Product Principles

- Make the active navigation level unmistakable.
- Keep all destinations reachable without horizontal scrolling.
- Preserve familiar browser and assistive-technology behaviour where practical.
- Make the implementation comparison observable under the same content and styling.

## Accessibility & Inclusion

The prototype should support keyboard operation, visible focus, reduced motion, semantic landmarks, labelled controls, and accurate expanded/collapsed state announcements.
