# RSU Shuttle Public Web — Sprint 1

Public Web implementation for the RSU Shuttle Tracking System.

## Sprint 1 scope

- Load routes from Backend
- Select a route
- Load stops for the selected route
- Display stops in `stopOrder` / `sequence`
- Display basic stop information
- Display stops on a map
- Display basic route information
- Responsive mobile/desktop UI
- Loading, empty, and API error states

Realtime vehicle tracking, ETA, and user location are intentionally outside Sprint 1.

## Requirements

- Node.js 20+
- Backend running locally

## Setup

```bash
npm install
printf 'NEXT_PUBLIC_API_BASE_URL=http://localhost:5000\n' > .env.local
npm run dev
```

Open http://localhost:3000.

## Backend contract

The UI currently expects:

- `GET /api/routes`
- `GET /api/routes/:routeId/stops`

If the backend team uses different endpoints or response shapes, update only `lib/api.ts`.

The frontend supports both:
- `stopOrder` (Sprint requirement)
- `sequence` (current backend schema during transition)

## Git

Create a feature branch before working:

```bash
git checkout -b feature/S01-PUBLIC-01-public-web-setup
```

Do not commit directly to `main`.
