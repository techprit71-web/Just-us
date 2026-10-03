# Just Us — compatibility + room-code fix

This package is a clean replacement frontend designed around your goal:
**a simple private two-person website that still works on much older phones.**

## What changed

1. **Exact room-code connection**
   - `23456`, `23456 ` and ` 23456` are normalized safely.
   - Join is done against the same canonical `rooms.code` value.
   - The joined room ID is saved in the current browser session.
   - A room is limited to two members.
   - Messages are loaded from the same `room_id`.

2. **Older-device strategy**
   - No React/Vite/build step.
   - No ES modules.
   - No optional chaining.
   - No dependency on the Supabase JS SDK.
   - Uses `XMLHttpRequest` + normal HTTP REST/RPC calls.
   - Chat uses 2.5-second polling instead of requiring WebSockets.
   - Uses responsive CSS and reduced animation.
   - Very old phones may still fail because of their browser's HTTPS/TLS support; no website can guarantee compatibility with every 2012 handset.

3. **New home page**
   - Cleaner Gen-Z style.
   - Large simple hero.
   - Create-room + join-code cards.
   - Feature cards for Chat, Moments, Play and Private.
   - Mobile-first bottom navigation.

## Files

- `index.html`
- `styles.css`
- `app.js`
- `config.js`
- `supabase.sql`

## Setup

### A. Supabase

1. Open your existing **Just us** Supabase project.
2. Back up/export the existing database before changing anything.
3. If your current project already has `rooms`, `messages` or related tables, **do not run `supabase.sql` blindly**. Send me your existing table/schema SQL and I will adapt the migration.
4. Otherwise run `supabase.sql` in Supabase SQL Editor.
5. Get your project URL and **publishable/anon browser key**.

### B. config.js

Open `config.js` and replace:

`https://YOUR-PROJECT.supabase.co`

and

`YOUR-PUBLISHABLE-OR-ANON-KEY`

Do NOT paste a `service_role` or secret key.

### C. GitHub Pages

Upload all five files to the same folder/repository that serves your site:

- index.html
- styles.css
- app.js
- config.js
- supabase.sql

GitHub Pages should serve `index.html`.

## Important

This package fixes room-code matching at the backend level. If your existing Supabase schema is different, the only safe way to preserve your existing data is to adapt the SQL/functions to that schema rather than overwrite it.

Voice/video calls are a separate compatibility problem: WebRTC is not available on many 2012-era browsers. The safe UX is to detect support and show a fallback instead of pretending a call connected.

