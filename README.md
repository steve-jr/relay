# Relay frontend

React + TypeScript + Vite + Tailwind CSS 3 frontend for Relay, a creator marketing platform for African community.
The frontend talks to the `/api/v1` endpoints.

## Run it

```bash
cd frontend
npm install
cp .env.example .env.local     # then edit
npm run dev                    # http://localhost:5173
```

### Two modes
- **Demo mode** (`VITE_USE_MOCK_API=true`): runs with built-in sample data, no backend needed. Banner shown on every page. Demo logins (password `password`): `admin@example.test`, `brand@example.test`, `creator@example.test`. Never enable in production.
- **Real API** (`VITE_USE_MOCK_API=false`): set `VITE_API_BASE_URL` to the api root (for example `http://localhost:8000`). Uses Sanctum SPA cookie auth: it calls `/sanctum/csrf-cookie` before login/register and sends `withCredentials` + XSRF header. The backend needs `SANCTUM_STATEFUL_DOMAINS` to include the frontend host, `supports_credentials=true` in CORS, and `SESSION_DOMAIN` set for your topology.

## Scripts
`npm run typecheck`, `npm test` (Vitest), `npm run build` (typecheck + production bundle).

## API shapes the frontend expects
- Single resources: `{ "data": {...} }`. Lists: `{ "data": [...] }`. Paginated: `{ "data": [...], "meta": { current_page, last_page, per_page, total } }`.
- Errors: `{ "message": "...", "errors": { "field": ["..."] } }` with 401/403/404/409/419/422/429.
- Money fields are currency-neutral: `starting_rate`, `budget`, `campaign_budget`, `proposed_rate`, each with a `currency` code (GHS, NGN, KES). Records carry a `country` code (GH, NG, KE). Forms send `country` and `currency`.
- Creators have `industries: string[]` (ticked options plus any the creator wrote in). The directory accepts `industry` and `country` filters.
- Public creator resource must expose only: id, slug, display_name, bio, city, country, currency, primary_niche, secondary_niches, industries, socials[{platform, handle, followers}], average_engagement_rate, starting_rate, profile_image_url.
- Negotiations (multi-round offers): `GET /creator/invitations` and `GET /brand/negotiations` return `{ data: Negotiation[] }` where each has `status` (open|accepted|declined), `turn` (brand|creator|null), `max_rounds` and `offers[]` (round, by, fee, deliverables, deadline, note). `POST .../{id}/offers` sends a counter offer and `POST .../{id}/respond` with `{ response: accepted|declined }`. The backend must enforce turn order, the round limit and that only the two parties can see a thread. Creators are never charged a commission.
- The creator directory (`/creators`, `/creators/{slug}`) is for logged-in brands only: protect these endpoints so only brand and admin users can read them. Logged-in users take the `country` of their account (the user resource should include it).
- Admin CSV: `GET /admin/export/leads` and `/admin/export/creators` (blob responses).
- Query params the directory sends: `q, city, platform, niche, industry, country, min_followers, sort (followers|rate_low), page`.

## Where to change things
- Brand name, contact details, niches, industries: `src/config/brand.ts`.
- Countries, currencies, symbols, cities, phone placeholders and budget breakpoints: `src/config/countries.ts` (add a country there to support it). 
- Money is shown compactly (5000 as 5K, 1200000 as 1.2M) by `formatMoney` in `src/lib/format.ts`. 
- FAQ copy: `src/config/content.ts`. 
- Colors and fonts: `tailwind.config.js`.

## Known limitations
- The landing page "See Relay in action" previews are built from the app's own components with sample data, not browser screenshots. Replace them with real screenshots once the product is live if you prefer.
- Switching country re-mounts the app and clears directory filters. Exchange rates are not used: amounts are shown in the currency they were recorded in.
- The landing page still shows a small featured-creators teaser to visitors. Remove it if creators should be fully hidden from the public.
- Route guards are UI-only; the backend must enforce authorization.
- No image upload UI yet (avatars use initials). No password reset flow (not faked).
- Admin campaign screen is read-only; creator assignment and metrics entry are not built yet.
- Legal pages are draft templates needing review by a counsel.
- Analytics is an optional Plausible-compatible hook; no script is loaded by default.
