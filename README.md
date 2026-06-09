# 🌴 Indonesia — Henri & Elisa

A simple, single-file travel planner for our Indonesia trip.

- **Itinerary** — flights, hotels, transfers, activities, food. Each item shows local time with the time zone and the equivalent "home" time, so zone changes are always clear.
- **Interactive map** — every located stop is pinned, with one-tap copyable addresses and "open in Google Maps" links.
- **Travel times** — distance + drive estimate between consecutive stops, plus a one-tap Google Maps route link with live + predicted times. Add a Google Maps API key in **Settings** to pull real Google live/predicted times into each leg.
- **Documents** — link the shared Google Drive folder and individual booking PDFs; attach them to itinerary items.
- **Sharing** — data is saved in your browser (localStorage). Use **Settings → Export** to send a share code to load the same trip on another device.

Everything lives in `index.html` — no build step, no dependencies beyond Leaflet (maps) and Google Fonts via CDN.
