# Just Us ♡ — v2

A polished mobile-first private-space frontend for two people: onboarding, room codes, presence, chat, moments, WebRTC voice/video controls, Ludo and Carrom, and PWA install support.

## What changed

- WhatsApp-style top header: profile photo, partner name, online/last-seen state, voice/video actions.
- Same 5-digit room code can be used on two devices when Supabase is configured; messages and moments use one shared room timeline.
- Real WebRTC call implementation with microphone mute, camera toggle, front/back camera switching, screen sharing, and decline.
- Custom Moments message: photo + any caption up to 20 words.
- PWA manifest and install prompt. Browser apps cannot create a native Android home-screen widget; native widgets require an Android app. PWA shortcuts are included instead.
- Ludo board with dice, two players, four tokens, six-to-enter, extra six turn, safe cells, captures and home/win state.
- Carrom board with striker aiming, coin/queen visuals, rail collisions, pockets/scoring and turns.
- Haptics and reduced-motion/accessibility fallbacks.

## Run locally

```bash
npm install
npm run dev
```

## Real two-device mode

1. Create a Supabase project.
2. Enable Anonymous Auth.
3. Run `supabase.sql` in the SQL Editor.
4. Enable Realtime for `messages` and `moments`.
5. Create a Storage bucket named `moments` (public for this starter, private storage is recommended for a real private product).
6. Copy `.env.example` to `.env.local` and set:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

7. Build and deploy again.

### GitHub Pages

GitHub Pages serves the built static site; it does not run Vite or a database. Use a GitHub Actions workflow or build locally and publish `dist/`. If you use Actions, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository secrets and expose them to the Vite build.

### Calls

WebRTC media is peer-to-peer. Supabase Realtime is used here as signaling. STUN servers are included; a production deployment should add a TURN service for networks where direct peer connectivity fails.

### Privacy / encryption

The UI intentionally does not claim that it is end-to-end encrypted. Production E2EE needs audited cryptography, authenticated key exchange, device/key verification, secure local key storage, encrypted attachments, metadata considerations, and a backend designed around ciphertext.

### Screenshot detection

Normal mobile browsers do not provide a standard API that tells a website that the operating system took a screenshot. The app therefore does not fake screenshot detection.
