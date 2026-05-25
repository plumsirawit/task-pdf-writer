# Migration: Next.js 12 → 14 / Node.js 26

## Background

`yarn dev` failed on Node.js 26 with:

```
TypeError: Cannot read properties of undefined (reading 'prototype')
    at ... next/dist/compiled/jsonwebtoken/index.js
```

Root cause: Next.js 12 bundles an old `jsonwebtoken` build that uses a `crypto` API removed in Node.js 21+. The fix was to upgrade Next.js and remove the abandoned `next-firebase-auth` package that was blocking the upgrade.

---

## Packages changed

| Package | Before | After | Reason |
|---|---|---|---|
| `next` | 12.2.5 | ^14.2.0 | Node.js 26 compatibility |
| `firebase` | 8.7.1 | ^10.0.0 | v8 not designed for Node.js 26 |
| `firebase-admin` | 9.11.0 | ^12.0.0 | Node.js 26 compatibility |
| `next-firebase-auth` | 0.13.2 | **removed** | Abandoned (2021), incompatible with Next.js 13+ |
| `next-transpile-modules` | 9.0.0 | **removed** | Built into Next.js 13.1+ |
| `@types/react` | 17.0.14 | ^18.0.0 | Match React 18 |
| `eslint` | 7.30.0 | ^8.0.0 | Required by Next.js 14 |
| `eslint-config-next` | 11.0.1 | ^14.2.0 | Match Next.js version |
| `typescript` | 4.3.5 | ^5.0.0 | Next.js 14 recommendation |

---

## Files removed

- `initAuth.ts` — was the `next-firebase-auth` initialization entry point, called in every API route and `_app.tsx`

---

## New files

### `utils/firebase.ts`
Client-side Firebase singleton using the v10 compat API (`firebase/compat/*`). Replaces the scattered `firebase.initializeApp()` calls that `next-firebase-auth` previously managed. The compat API is API-identical to Firebase v8, so no call sites needed to change.

### `utils/firebaseAdmin.ts`
Server-side `firebase-admin` singleton. Replaces `getFirebaseAdmin()` from `next-firebase-auth`. Reads credentials from the same environment variables as before (`FIREBASE_PRIVATE_KEY`).

### `utils/AuthContext.tsx`
React context that wraps `firebase.auth().onAuthStateChanged`. Provides `{ user: firebase.User | null, loading: boolean }` to the component tree. Mounted in `_app.tsx` via `<AuthProvider>`.

### `utils/withAuthGuard.tsx`
Two HOC replacements for `next-firebase-auth`'s `withAuthUser`:

- `withAuthGuard` — protects pages that require login. Redirects to `/login` if unauthenticated. Replaces `withAuthUser({ whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN })`.
- `withGuestGuard` — for login/register pages. Redirects to `/contests` if already authenticated. Replaces `withAuthUser({ whenAuthed: AuthAction.REDIRECT_TO_APP })`.

The main behavioral difference from the old HOC: auth state is now determined client-side only (no SSR cookie check), so protected pages briefly render `null` while Firebase initializes (~100–200ms). The old approach used signed cookies to resolve auth state on the server, avoiding that flash.

---

## Changes per file

### `pages/_app.tsx`
- Removed `initAuth()` call
- Wrapped `<Component>` in `<AuthProvider>`

### `utils/withAuth.ts` (API middleware)
- Removed `verifyIdToken()` from `next-firebase-auth`
- Now calls `admin.auth().verifyIdToken(token)` directly
- `AuthApiRequest.authUser` shape preserved as `{ id: string }` so all API route call sites were unchanged

### `utils/apiWrapper.ts`
- Replaced `AuthUser` type from `next-firebase-auth` with `firebase.User | null`
- `authUser.getIdToken()` → `authUser?.getIdToken()` (handles null for public routes like register)

### `utils/useFetcher.ts`
- Replaced `AuthUser` type with `firebase.User | null`
- Added missing `import { saveAs } from 'file-saver'` (pre-existing bug fixed opportunistically)

### All API routes (`pages/api/**`)
Each route had three mechanical changes:
1. Removed `import initAuth from '...'` and `initAuth()` call
2. Removed `import { getFirebaseAdmin } from 'next-firebase-auth'` and `const admin = getFirebaseAdmin()`
3. Added `import admin from '...utils/firebaseAdmin'`

Routes using `FieldValue` (`adduser`, `removeuser`, `task/create`, `task/delete`, `task/duplicate`, `task/move`) additionally replaced the `// @ts-ignore admin.firestore.FieldValue` hack with a proper import:
```ts
import { FieldValue } from 'firebase-admin/firestore';
```

### `pages/api/register.ts`
Rewritten significantly. The old version used the Firebase client SDK on the server to call `createUserWithEmailAndPassword`. Replaced with `admin.auth().createUser({ email, password, displayName })`, which is the correct server-side approach.

### `pages/api/login.ts` / `pages/api/logout.ts`
Now return `{ success: true }` immediately. These endpoints were only called internally by `next-firebase-auth` to manage signed cookies. Cookies are no longer used for auth.

### All pages (`pages/**`)
Uniform replacements:
- `import { withAuthUser, useAuthUser, AuthAction } from 'next-firebase-auth'` → `import { withAuthGuard } from '../utils/withAuthGuard'; import { useAuth } from '../utils/AuthContext'`
- `import firebase from 'firebase/app'; import 'firebase/auth'` (etc.) → `import firebase from '../utils/firebase'`
- `const authUser = useAuthUser()` → `const { user } = useAuth()`
- `authUser.id` → `user?.uid`
- `callXxxApi(authUser, payload)` → `callXxxApi(user, payload)`
- `withAuthUser({ whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN })(Component)` → `withAuthGuard(Component)`
- `withAuthUser({ whenAuthed: AuthAction.REDIRECT_TO_APP })(Component)` → `withGuestGuard(Component)`

### `pages/index.tsx`
Fixed Next.js 13 breaking change: removed `<a>` children from `<Link>` components.

```diff
- <Link href="/register"><a className={styles.card}>...</a></Link>
+ <Link href="/register" className={styles.card}>...</Link>
```

### `pages/contest/[contest]/settings.tsx` and `assets.tsx`
Fixed Next.js 13 breaking change: `next/image` removed the `layout` and `objectFit` props.

```diff
- <Image src={logo} layout="fill" objectFit="contain" alt="..." />
+ <Image src={logo} fill style={{ objectFit: 'contain' }} alt="..." />
```

### `next.config.js`
Updated deprecated `images.domains` to `images.remotePatterns`:

```diff
- domains: ["picsum.photos", "firebasestorage.googleapis.com"]
+ remotePatterns: [
+   { hostname: "picsum.photos" },
+   { hostname: "firebasestorage.googleapis.com" },
+ ]
```

---

## Pre-existing errors not fixed

Two files had TypeScript errors that pre-dated this migration and were not introduced by it:

- `pages/editor.tsx` — `Buffer` type mismatch and `react-modal` JSX component type conflict
- `utils/initMarked.ts` — variable used before assignment

These are unrelated to the Node.js / Next.js upgrade path.

---

## Environment variables

No changes to required environment variables. The same `.env.local` values work:

- `FIREBASE_PRIVATE_KEY` — firebase-admin service account private key (JSON stringified)
- `COOKIE_SECRET_CURRENT` / `COOKIE_SECRET_PREVIOUS` — no longer needed (cookie auth removed), safe to leave or delete
