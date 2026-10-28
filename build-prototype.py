"""Refresh the shareable HTML; Leaflet and map tiles still require internet."""
from pathlib import Path

root = Path(__file__).resolve().parent
html = (root / 'index.html').read_text()
html = html.replace('<link rel="stylesheet" href="styles.css">',
                    '<style>' + (root / 'styles.css').read_text() + '</style>')
for name in ('map.js', 'timeline.js'):
    html = html.replace(f'<script src="{name}" defer></script>', '')
    # Wait for the deferred Leaflet script and document to be ready.
    html = html.replace('</body>', '<script>document.addEventListener("DOMContentLoaded", () => {\n'
                        + (root / name).read_text() + '\n});</script>\n</body>')
(root / 'timeline-prototype.html').write_text(html)
