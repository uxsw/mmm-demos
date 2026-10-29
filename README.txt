FORECAST TIMELINE PROTOTYPE

From this folder, run:

  python3 -m http.server 8000 --bind 127.0.0.1

Then open http://127.0.0.1:8000 in your browser.
The map needs internet access. Serve over HTTP/HTTPS (including localhost), rather than opening a file:// URL, so map requests carry the Referer required by OpenStreetMap.

Editable source: index.html, styles.css, timeline.js and map.js. No package installation or build is required.

Shareable export: timeline-prototype.html inlines our CSS and JavaScript but still loads Leaflet and map tiles online. Serve it over HTTP/HTTPS too. Regenerate it with python3 build-prototype.py.

The HTML export contains a snapshot of the source. If editing, work in the source files first.

The sample UTC forecast begins Tuesday 15 September 2026 at 12:00 and covers 120 hours. Forecast steps are 10 minutes for the first 4 hours, 20 minutes for the next 12 hours (hours 4–16), then 3 hours for the remainder. Only full intervals are included: the final selectable step is hour 118 within the 120-hour forecast window. Day navigation snaps to the nearest available time, choosing the earlier step on ties. Playback takes 800 milliseconds per forecast step and stops at the end.

The ribbon uses a fixed display scale: the first 16 hours retain the original spacing, then later times are compressed 2:1. A three-hour interval occupies 1.5 times the width of an earlier hour. The visible elapsed-time span therefore varies across the ribbon. Day markers, hover previews, dragging and snapping share the same continuous mapping. The green time control and indicator stay fixed at the horizontal centre. Selection, previous/next, playback and day shortcuts animate the ribbon beneath them. Dragging moves the ribbon directly and release snaps to the nearest forecast step. Empty space beyond the forecast boundaries keeps the first and last steps centred.

The full-page map uses Leaflet 1.9.4 and OpenStreetMap standard tiles, with muted colours, pan, scroll/pinch zoom, keyboard navigation and zoom buttons. The timeline floats above the map at the bottom; its gestures do not pan the map. The basemap does not represent the selected forecast; no weather layer is connected. No API key is needed. Attribution stays visible below the timeline.

Tile service policy: https://operations.osmfoundation.org/policies/tiles/
Leaflet: https://leafletjs.com/
The public tile service is best-effort; review its usage policy before production deployment.

Motion: focus enters in 260 ms and exits over 340 ms after a 160 ms grace period. Hover previews fade and the highlight eases over 150 ms; time text updates immediately. Ribbon selection eases out over 500 ms; drag release settles over 300 ms. Reduced-motion preferences disable these transitions.

Keyboard focus uses a contrasting charcoal-and-white indicator. Pointer interaction suppresses this outline while retaining hover and pressed feedback. This prototype has not undergone a full WCAG AA audit.

Arrow feedback: a subtle darker-lime hover and a short click pulse stay inside the 30px visual strip. A subtle gray-gradient section (rail gray #888b85 at both edges, shading to #747871 at the crest) of the idle rail swells and flows into the centre over 700 ms, then flattens and fades. The swell stays entirely right of centre when stepping forward, or left when stepping backward, with its inner edge fixed at the current-time marker. Repeated clicks replace the cue. The already-expanded mobile ribbon does not show this idle-rail effect. Reduced-motion mode omits the swell and pulse.

Day jumps use a bounded 76px-wide gray ripple, sweeping towards centre from the direction of travel over 950 ms. This is directional feedback rather than a depiction of every intervening hour. The selected time still snaps to the nearest available forecast step.

Timeline polish: the day shortcuts share the ribbon height, position and background colour. Hover labels stay clear of the shortcuts. Time numerals have fixed widths, and play/pause and step controls use SVG icons. Tick nodes persist during animation. Dragging keeps the ribbon expanded and clears on cancellation or lost capture. The mobile marker stays fixed through playback. The day picker supports arrow keys, Home/End, Escape and focus restoration; its list scrolls in short landscape windows.

Time entry: click the centred timestamp to open a combined day list and UTC time field, with the field closest to the timestamp. The current time is selected so four digits such as 1830, or a colon-formatted time such as 18:30, can replace it directly. A complete valid time jumps immediately to the nearest available forecast step on the selected day, with the reached time shown in the popover; no Enter key is needed. Invalid and incomplete entries do not move the timeline. With keyboard focus on the timestamp, typing a digit also opens the field. Arrow Up moves from the field into the day list; Arrow Down from its last item returns to the field. Escape closes the popover and restores focus.

Tactile ribbon: forecast grains subtly lengthen and brighten within 100px of the fixed centre as the ribbon moves, without changing time spacing. Stepping and day jumps retain the idle rail and show only the directional swell; they do not reveal the black ribbon, ticks or day markers. Hovering or keyboard-focusing the track reveals the full ribbon, as do playback and direct dragging. UTC midnight boundaries have a stroke matching the Forecast footer and a single-letter weekday label, independent of forecast sampling. Day markers fade with the black ribbon and stay hidden in the desktop idle state. On mobile and touch layouts they remain visible with the persistent black ribbon; ordinary steps remain unlabelled. Reduced motion removes grain scaling and animated travel while preserving day markers and selected-time feedback.
