# The No. 7 Archive — Frontend

Responsive Next.js frontend for the Ronaldo photo gallery. Product flows and API behavior follow the backend project's `README.md`, `use_case.md`, and `api_contract.md`.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to the backend origin if it differs from `http://localhost:8080`. The backend must allow the exact frontend origin through `CORS_ALLOWED_ORIGINS` and credentialed CORS. If port 3000 is already occupied, start the frontend with `npm run dev -- --port 3001` and add `http://localhost:3001` to the backend's allowed origins.

Never put credentials, Supabase keys, or other secrets in this frontend or in a `NEXT_PUBLIC_*` variable.

## Pages

- `/gallery` — public image gallery with cursor pagination, automatic loading, a manual load-more control, and loading, empty, and error states.
- `/admin/login` — accessible admin sign-in with CSRF token retrieval and feedback for authentication errors.
- `/admin/gallery` — session check, cursor-paginated image management, local image preview, format/size checks, upload, image deletion, and logout.

The UI uses local Inter variable fonts and the project's red, gold, light-gold, and green palette. Layouts were reviewed at 360, 768, and 1280 px with no horizontal overflow on the three routes.

## API and security

The browser calls the Spring Boot API, never Supabase directly. Requests that need authentication use `credentials: "include"`; state-changing requests first obtain the `XSRF-TOKEN` cookie and echo its value in the `X-XSRF-TOKEN` header. The browser manages the HttpOnly admin session cookie.

Gallery requests omit `nextCursor` on the first page, then pass the server-provided opaque cursor. The API limits each page to 10 images. Upload uses multipart field `file`; the UI accepts JPG/JPEG, PNG, HEIC/HEIF, WebP, and AVIF up to 15 MB, while the backend remains authoritative for validation.

## Commands

```bash
npm run lint
npm run build
npm run start
```

## Current verification and limits

ESLint and the production build pass. The three routes were opened and reviewed at 360, 768, and 1280 px. During that browser review the backend was unavailable, so live gallery data, successful login/session handling, upload, delete, and logout have not been verified against a running API.
