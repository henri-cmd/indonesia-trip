# 🌴 INDO 2026 — Henri & Elisa

A simple, single-file travel app for our Indonesia trip. Live: **https://henri-cmd.github.io/indonesia-trip/**

Built to feel like an iOS app — on iPhone, open in Safari → Share → **Add to Home Screen** to launch it full-screen.

## What's in it
- **Today** — a day-by-day view you swipe through. Each day has a side timeline with colour-coded stops, the current day/item highlighted live during the trip, and a countdown before it starts.
- **Plan** — the full itinerary (flights, hotels, transfers, activities, food). Every item shows its local time, the equivalent "home" time, and flags time-zone changes so it's always clear.
- **Map** — every located stop pinned, with one-tap copyable addresses and "open in Google Maps" links. On desktop the map sits beside the itinerary; on mobile it's its own tab.
- **Travel times** — distance + drive estimate between consecutive stops, plus a one-tap Google Maps route link (live + predicted). Add a Google Maps API key in **Settings** to pull real Google live/predicted times into each leg.
- **Documents** — link the shared Google Drive folder and individual booking PDFs; attach them to itinerary items.
- **Live sync** — the trip syncs in real time between devices (Firebase Realtime Database, anonymous auth, per-trip data tree keyed by an unguessable trip id). Send the invite link from **Settings** to add Elisa; her edits appear on your phone within ~a second. A localStorage cache keeps it working offline, and there's still an export/backup code.

## Tech
Everything lives in `index.html` — no build step. Dependencies (via CDN): Leaflet for the map, Firebase compat SDK for sync, DM Sans / DM Mono fonts. The app icon and web-app manifest are generated at runtime, so it stays a single file. The Firebase web config is public by design — data is protected by the database security rules + the unguessable trip id in the invite link.
