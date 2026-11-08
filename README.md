# Wander & Revel Event Services

A private, interactive concept demo for Wander & Revel Event Services, covering wedding coordination, mobile bartending, private celebrations, styling, and customized event support. The tagline is **A Place for Every Story.** The supplied brand identity is used throughout; event imagery and content are illustrative, and the demo does not create real bookings or send messages.

## Demo walkthrough

1. Open `/demo-access` and enter the owner-provided access code.
2. Explore Home, About us, Services, Gallery, and Inquire. Food menu, journal, event planner, and owner studio remain available through the footer.
3. Add sample inquiries and edit planning, food menu, journal and gallery content. Each browser session receives its own isolated workspace.

The homepage uses a static editorial photograph and a simple service-to-inquiry flow. Forms validate inputs, mutations use optimistic version checks, and state is persisted in SQLite. No email, SMS, payment, external calendar or real reservation is triggered.

The sun/moon button on the access page and site header switches between light and dark mode. New visitors start in the approved ivory light theme; a manual selection is saved in that browser and existing choices are respected. The planner's printed report stays light.

## Food menu walkthrough

- Open **Food menu** in the footer to browse the sample appetizers, mains, sides and desserts. Only published dishes appear on this page.
- In **Owner studio → Food menu**, add or edit dishes, descriptions, categories and dietary notes, and choose whether each dish is published. Changes belong to the current browser's demo workspace.
- In **My event planner → Food menu**, choose a sample dish or add a custom idea. Adjust dish names, categories and event-specific notes, then choose **Save plan**. The printed event plan includes the food menu alongside the bar menu.
- Saved event choices retain their own details when a menu dish is later edited or removed. Existing workspaces receive the new food fields without resetting their inquiries, plans or other content.

All supplied dishes are fictional planning examples. They do not establish an actual catering offer, price, availability or dietary certification.

## Railway deployment

This fork runs as a standard Node.js 24 Next.js standalone server. Railway builds the included Dockerfile and starts `node server.js` on `0.0.0.0:$PORT`. `railway.toml` configures one replica, `/api/health`, and bounded restart attempts.

Create a Railway volume mounted at `/data` and configure these service variables:

- `DATABASE_PATH=/data/demo.sqlite`
- `APP_ORIGIN=https://your-exact-public-hostname` (optional when Railway supplies `RAILWAY_PUBLIC_DOMAIN`)
- `DEMO_ACCESS_CODE=<private passcode, at least 8 characters>`
- `DEMO_SESSION_SECRET=<random secret, at least 32 bytes>`
- `NEXT_TELEMETRY_DISABLED=1`

When `APP_ORIGIN` is unset, the app uses `https://` plus Railway's automatically provided [`RAILWAY_PUBLIC_DOMAIN`](https://docs.railway.com/variables/reference). An explicit `APP_ORIGIN` takes precedence. Only the exact configured origin is accepted; request headers never determine the trusted origin. Generate a public service domain before opening the demo. Local development still uses an explicit loopback origin.

Keep the volume attached to the single replica. SQLite is configured for WAL and a 5 second busy timeout; table creation is idempotent. Changing replicas above one is unsupported because a local SQLite file cannot coordinate across instances. Railway Serverless/App Sleep is a dashboard setting; enable it in the service's Deploy settings if desired. A sleeping service can have a cold-start delay.

Do not commit `.env`, secrets, SQLite state, or logs containing access codes. `/api/health` returns only a minimal 200 for platform health checks. The session cookie is HttpOnly, SameSite=Lax, signed with HMAC, unique per browser and expires after seven days. In production it is Secure. OAI identity headers are ignored.

## Local development and verification

Use Node.js 24. Install with `npm ci`, then set local-only environment values in the current shell:

```powershell
$env:APP_ORIGIN = 'http://127.0.0.1:8877'
$env:DEMO_ACCESS_CODE = 'local-test-code-change-me'
$env:DEMO_SESSION_SECRET = 'local-only-secret-at-least-32-bytes-long'
$env:DEMO_INSECURE_COOKIES = 'true'
$env:DATABASE_PATH = '.data/qa.sqlite'
$env:PORT = '8877'
npm run dev -- --webpack --port 8877
```

`DEMO_INSECURE_COOKIES=true` works only outside production and when `APP_ORIGIN` is loopback. Production always uses Secure cookies. For API verification, set the same `APP_ORIGIN`, `DEMO_ACCESS_CODE` and `DEMO_SESSION_SECRET` in another PowerShell window, then run `node scripts/verify-demo-api.mjs`. The integration script refuses non-loopback origins, performs a real code login, exercises the authenticated API, checks forged/tampered identity rejection and isolates two browser sessions. Its Node client carries the session cookie explicitly, so production Secure-cookie behavior can be tested over local HTTP without weakening that setting. Use a disposable DB path; the test writes synthetic QA content.

`npx tsc --noEmit --pretty false` performs the TypeScript check. `npm run lint` runs ESLint.

After a production build, `npm run verify:demo` runs the API checks using a temporary SQLite database, random local-only credentials and a loopback-only server. The runner stops its server and removes its temporary data on completion, with a two-minute overall deadline. It also checks food-menu editing, event choices, and compatibility with older saved workspaces.

## Project identity and assets

`.openai/hosting.json` is retained as project identity metadata only; this fork is deployed through Railway and must not be published through Sites. Generated concept photographs are local optimized WebP. DM Sans and Gloock are local fonts with Open Font Licenses.

## Production follow-up

Before using for real clients, confirm the domain/service areas, package scope, approved imagery/copy, operational permissions and business details; define staff/client access roles; connect booking/calendar and notification providers; agree reservation and payment terms; complete production security, accessibility and browser/device acceptance checks. None of those integrations are represented as enabled by this demo.

## Editing the approved brand content

`components/BrandPages.tsx` contains the home, about, and service copy; `app/brand.css` contains the six supplied palette values and public-page layout. The one-page inquiry lives in `components/demo/Booking.tsx`. The five service categories are accepted alongside legacy inquiry service values; no saved data migration is required. Older `#book` and `#highlights` links continue to resolve. The existing owner studio edits gallery, journal, and food-menu content within its private demo workspace. About copy uses the supplied philosophy only; no founder biography, credentials, service area, prices, or client work have been invented.
