(() => {
  'use strict';
  const message = document.getElementById('map-message');
  function showMessage(text) {
    message.textContent = text;
    message.hidden = false;
  }
  if (!window.L) {
    showMessage('The map could not load. Check your internet connection and reload. You can still explore the timeline.');
    return;
  }
  const map = L.map('map', {
    zoomControl: false,
    minZoom: 3,
    maxZoom: 19,
    worldCopyJump: true
  }).setView([54.2, -3.5], 6);
  L.control.zoom({position: 'topright'}).addTo(map);
  map.attributionControl.setPosition('bottomleft');
  // OSM requires an HTTP Referer: serve the prototype over localhost or HTTPS.
  if (location.protocol === 'file:') {
    return;
  }
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  tiles.on('tileerror', () => showMessage('Some map tiles could not load. Check your connection, then pan or zoom to try again.'));
  tiles.on('loading', () => { message.hidden = true; });
  tiles.addTo(map);
  new ResizeObserver(() => map.invalidateSize({pan: false})).observe(document.getElementById('map'));
})();
