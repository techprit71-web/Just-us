# Orbit Communication Platform

A production-style React + TypeScript + Vite front-end foundation for a communication + games product.

## Run

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## What is implemented

- Responsive mobile-first onboarding flow
- Profile photo selection + circular preview
- Generated private code + random room IDs
- Toasts, loading/interaction feedback, safe haptic fallback
- Chat with sent/delivered/read state transitions
- Context-menu reply interaction
- Photo/file attachment UI and shared media surface
- Local playable Ludo with dice, turns, token movement, captures-ready board architecture and win state
- Canvas-based Carrom with touch/mouse striker physics, collision/pocket scoring
- Presence toggle
- Profile/settings surface
- Accessibility labels/focus states and reduced-motion support
- iPhone safe-area padding and viewport-aware sizing
- Conservative screenshot-event hook; browsers do not provide a universal OS screenshot event

## Important production boundaries

This package intentionally does **not** fake network features.

### Real multi-user chat / rooms
Connect an authenticated backend such as Supabase/Firebase or a WebSocket service. Persist users, room membership, messages, presence, attachments, and game state with authorization rules.

### Real E2E encryption
Do not add a home-grown encryption algorithm. Use an audited protocol/library, authenticated identity, verified key exchange, secure key storage, rotation/revocation, and server-side access controls. The UI explicitly says this demo is not E2E encrypted.

### Voice/video calls
Use WebRTC `RTCPeerConnection` with a real signaling service. Add ICE/STUN/TURN infrastructure and call permissions. The current call buttons explain that signaling/peer infrastructure is required instead of pretending a call connected.

### Screen sharing
Use `navigator.mediaDevices.getDisplayMedia()` where supported. Mobile browser support is inconsistent; feature-detect and show a clear unsupported state.

### Screenshot detection
There is no universal web API that lets a site know whenever the OS takes a screenshot. The app only listens for an optional custom `orbit:screenshot` event so a future supported/native wrapper can notify the UI without falsely claiming browser coverage.

## Suggested next production layer

1. Supabase Auth + Postgres + Storage + Realtime
2. WebRTC signaling endpoint + TURN
3. Audited cryptographic messaging protocol
4. Server-side image/file validation and malware scanning
5. CSP, secure headers, rate limits, abuse reporting
6. Automated tests (Vitest/Playwright) and device testing
