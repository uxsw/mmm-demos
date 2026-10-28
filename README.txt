FORECAST TIMELINE PROTOTYPE

From this folder, run:

  python3 -m http.server 8000 --bind 127.0.0.1

Then open http://127.0.0.1:8000 in your browser.
The map needs internet access. Serve over HTTP/HTTPS (including localhost), rather than opening a file:// URL, so map requests carry the Referer required by OpenStreetMap.

Editable source: index.html, styles.css, timeline.js and map.js. No package installation or build is required.

Shareable export: timeline-prototype.html inlines our CSS and JavaScript but still loads Leaflet and map tiles online. Serve it over HTTP/HTTPS too. Regenerate it with python3 build-prototype.py.

The HTML export contains a snapshot of the source. If editing, work in the source files first.

The sample UTC forecast begins Tuesday 15 September 2026 at 12:00 and covers 120 hours. Forecast steps become coarser with lead time. Day navigation snaps to the nearest available time, choosing the earlier step on ties. Playback takes 800 milliseconds per forecast step and stops at the end.

The visible time span selector is a prototype exploration control. Within a given span, horizontal distance is always proportional to elapsed time. The green time control and indicator stay fixed at the horizontal centre. Selection, previous/next, playback and day shortcuts animate the ribbon beneath them. Dragging moves the ribbon directly and release snaps to the nearest forecast step. Empty space beyond the forecast boundaries keeps the first and last steps centred.

The full-page map uses Leaflet 1.9.4 and OpenStreetMap standard tiles, with muted colours, pan, scroll/pinch zoom, keyboard navigation and zoom buttons. The timeline floats above the map at the bottom; its gestures do not pan the map. The basemap does not represent the selected forecast; no weather layer is connected. No API key is needed. Attribution stays visible below the timeline.

Tile service policy: https://operations.osmfoundation.org/policies/tiles/
Leaflet: https://leafletjs.com/
The public tile service is best-effort; review its usage policy before production deployment.

Motion: focus enters in 260 ms and exits over 340 ms after a 160 ms grace period. Hover previews fade and the highlight eases over 150 ms; time text updates immediately. Ribbon selection eases out over 500 ms; drag release settles over 300 ms. Reduced-motion preferences disable these transitions.

Keyboard focus uses a contrasting charcoal-and-white indicator. Pointer interaction suppresses this outline while retaining hover and pressed feedback. This prototype has not undergone a full WCAG AA audit.

Arrow feedback: a subtle darker-lime hover and a short click pulse stay inside the 30px visual strip. A subtle gray-gradient section (rail gray #888b85 at both edges, shading to #747871 at the crest) of the idle rail swells and flows into the centre over 700 ms, then flattens and fades. The swell stays entirely right of centre when stepping forward, or left when stepping backward, with its inner edge fixed at the current-time marker. Repeated clicks replace the cue. The already-expanded mobile ribbon does not show this idle-rail effect. Reduced-motion mode omits the swell and pulse.

Day jumps use a bounded 76px-wide gray ripple, sweeping towards centre from the direction of travel over 950 ms. This is directional feedback rather than a depiction of every intervening hour. The selected time still snaps to the nearest available forecast step.
