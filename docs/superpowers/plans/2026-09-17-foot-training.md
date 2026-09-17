# Foot Training — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an offline-first installable web app (PWA) that guides an 8-year-old's football training with generated sessions, measurable challenges, XP, levels and badges.

**Architecture:** Vite + React + TypeScript single-page app. Pure, fully unit-tested logic lives in `src/engine` (session building, tiers, XP, badges, stats) and `src/storage` (persistence, migrations, backup); static content lives in `src/data`; React screens in `src/ui` call engine/storage through pure state transitions in `src/ui/actions.ts`. All data is kept in `localStorage` on the phone.

**Tech Stack:** Node 24, npm 11, Vite, React 18+, TypeScript (strict), Vitest, vite-plugin-pwa, @vite-pwa/assets-generator.

**Spec:** `docs/superpowers/specs/2026-09-17-foot-training-design.md` (read it before starting any task).

## Global Constraints

- All user-facing text is in French.
- Mobile-first, portrait; every tappable element is at least 48px tall.
- `src/engine/*` and `src/storage/*` never import from `src/ui/*`, never touch the DOM, and never call `Date.now()` / `new Date()` without an argument — the current date is always passed in as a parameter.
- `src/data/*` contains data only (plus types); no logic besides constants.
- localStorage key: `foot-training:state`. State `version: 1`.
- No network access at runtime: no CDN, no external fonts, no analytics.
- XP: 1 XP per done exercise minute; +20 per new personal record (not on first result); first time reaching bronze +15, argent +25, or +40, each Or+n +40; +50 per successful week (≥ 3 sessions Monday→Sunday).
- Levels: Poussin 0, Espoir 250, Titulaire 700, Capitaine 1400, Star 2500, Légende 4000.
- Session structure: 30 min = warmup 5 / 2 blocks / challenge 5 / cooldown 3; 45 min = 5 / 3 blocks / 5 / 5; 60 min = 7 / 4 blocks / 5 / 5.
- Run tests with `npm test`, types with `npm run typecheck`. Both must pass before each commit.
- Every commit message ends with a blank line then `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

## File Structure

```
index.html
package.json
tsconfig.json
vite.config.ts
public/icon.svg                      # app icon source (Task 17)
.github/workflows/deploy.yml         # GitHub Pages deploy (Task 17)
src/
  main.tsx                           # React entry
  App.tsx                            # tab navigation, onboarding, banners
  data/
    types.ts                         # Exercise, Challenge, BadgeDef
    exercises.ts                     # 40 exercises
    challenges.ts                    # 10 challenges
    badges.ts                        # 12 badge definitions (display)
    levels.ts                        # level thresholds
  engine/
    week.ts                          # date keys, Monday-based weeks
    levels.ts                        # levelFor(xp)
    tiers.ts                         # tier steps, records, result sanity checks
    xp.ts                            # XP computation, successful weeks
    badges.ts                        # badge predicates
    sessionBuilder.ts                # buildSession
    stats.ts                         # minutes per domain
  storage/
    schema.ts                        # AppState & session types, initialState
    store.ts                         # load/save/migrate/validate
    backup.ts                        # export/import, backup reminder
  ui/
    styles.css
    actions.ts                       # pure state transitions used by screens
    useAppState.ts                   # React hook wrapping store
    useCountdown.ts                  # timer hook
    lib/sound.ts                     # beep + vibrate
    lib/wakeLock.ts                  # screen wake lock hook
    lib/download.ts                  # file download helper
    components/XpBar.tsx
    components/WeekDots.tsx
    components/ChallengeInput.tsx
    components/ProgressChart.tsx
    screens/Onboarding.tsx
    screens/Home.tsx
    screens/Session.tsx
    screens/Challenges.tsx
    screens/Progress.tsx
    screens/Settings.tsx
```

Tests sit next to the file they test: `src/engine/week.test.ts`, etc.

---

### Task 1: Project scaffold + week utilities

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`, `src/main.tsx`, `src/App.tsx`
- Create: `src/engine/week.ts`
- Test: `src/engine/week.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `toDateKey(d: Date): string` — local `YYYY-MM-DD`
  - `startOfWeek(d: Date): Date` — local Monday 00:00
  - `addDays(d: Date, n: number): Date` — local midnight of d + n days
  - `weekKey(d: Date): string` — `toDateKey(startOfWeek(d))`
  - `parseDateKey(key: string): Date` — local midnight of a `YYYY-MM-DD` key

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "foot-training",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "tsc && vite build",
    "preview": "vite preview --host",
    "test": "vitest run",
    "typecheck": "tsc"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install react react-dom
npm install -D vite @vitejs/plugin-react typescript vitest @types/react @types/react-dom
```
Expected: both commands finish without `ERR!`.

- [ ] **Step 3: Create config files**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

`vite.config.ts`:
```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
```

`.gitignore`:
```
node_modules
dist
dev-dist
```

`index.html`:
```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#15803d" />
    <title>Foot Training</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`src/App.tsx`:
```tsx
export default function App() {
  return (
    <main>
      <h1>Foot Training ⚽</h1>
    </main>
  );
}
```

- [ ] **Step 4: Write the failing test** — `src/engine/week.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { addDays, parseDateKey, startOfWeek, toDateKey, weekKey } from './week';

describe('week', () => {
  it('formats local date keys', () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('starts weeks on Monday', () => {
    // 2026-09-17 is a Thursday
    expect(toDateKey(startOfWeek(new Date(2026, 8, 17, 15, 0)))).toBe('2026-09-14');
    expect(weekKey(new Date(2026, 8, 14, 0, 0))).toBe('2026-09-14');
    expect(weekKey(new Date(2026, 8, 20, 22, 0))).toBe('2026-09-14');
    expect(weekKey(new Date(2026, 8, 21, 8, 0))).toBe('2026-09-21');
  });

  it('crosses month and year boundaries', () => {
    expect(weekKey(new Date(2027, 0, 1))).toBe('2026-12-28');
    expect(toDateKey(addDays(new Date(2026, 8, 28), 7))).toBe('2026-10-05');
  });

  it('parses date keys to local midnight', () => {
    const d = parseDateKey('2026-09-14');
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 8, 14, 0]);
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm test -- src/engine/week.test.ts`
Expected: FAIL — cannot resolve `./week`.

- [ ] **Step 6: Implement** — `src/engine/week.ts`

```ts
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() + n);
  return r;
}

export function startOfWeek(d: Date): Date {
  const diffToMonday = (d.getDay() + 6) % 7;
  return addDays(d, -diffToMonday);
}

export function weekKey(d: Date): string {
  return toDateKey(startOfWeek(d));
}
```

- [ ] **Step 7: Run tests and typecheck**

Run: `npm test` then `npm run typecheck`
Expected: 4 tests PASS; typecheck exits 0.

- [ ] **Step 8: Check the production build**

Run: `npm run build`
Expected: `dist/index.html` produced, no errors.

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "chore: scaffold Vite React app and add week utilities"
```

---

### Task 2: Types, levels data and `levelFor`

**Files:**
- Create: `src/storage/schema.ts`, `src/data/types.ts`, `src/data/levels.ts`, `src/engine/levels.ts`
- Test: `src/engine/levels.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces (`src/storage/schema.ts`):
  - `type Domain = 'technique' | 'passes-tirs' | 'physique' | 'gardien'`
  - `type ExerciseKind = Domain | 'echauffement' | 'retour-calme'`
  - `type Equipment = 'ballon' | 'plots' | 'grand-espace'`
  - `type Duration = 30 | 45 | 60`
  - `ALL_DOMAINS: Domain[]`, `ALL_EQUIPMENT: Equipment[]`, `DURATIONS: Duration[]`
  - `DOMAIN_LABELS: Record<ExerciseKind, string>`, `EQUIPMENT_LABELS: Record<Equipment, string>`
  - `interface SessionItem { exerciseId: string; domain: ExerciseKind; durationMin: number }`
  - `interface SessionPlan { durationMin: Duration; items: SessionItem[]; challengeId: string | null }`
  - `interface CompletedItem extends SessionItem { done: boolean }`
  - `interface CompletedSession { id: string; date: string; plannedMin: Duration; items: CompletedItem[] }`
  - `interface ChallengeResult { challengeId: string; date: string; value: number }`
  - `interface EarnedBadge { id: string; earnedAt: string }`
  - `type SessionPhase = 'preview' | 'exercises' | 'challenge'`
  - `interface InProgressSession { plan: SessionPlan; phase: SessionPhase; currentIndex: number; remainingSec: number; done: boolean[]; startedAt: string }`
  - `interface Profile { name: string; avatar: string; equipment: Equipment[] }`
  - `interface AppState { version: 1; profile: Profile | null; sessions: CompletedSession[]; results: ChallengeResult[]; badges: EarnedBadge[]; inProgress?: InProgressSession; lastBackupAt?: string }`
  - `STATE_VERSION = 1`, `initialState(): AppState`
- Produces (`src/data/types.ts`): `Exercise`, `Challenge`, `BadgeDef` (below)
- Produces (`src/data/levels.ts`): `interface Level { name: string; emoji: string; minXp: number }`, `LEVELS: Level[]`
- Produces (`src/engine/levels.ts`): `interface LevelInfo { level: Level; index: number; next: Level | null; progress: number }`, `levelFor(xp: number): LevelInfo`

All dates stored in state are ISO strings from `Date.prototype.toISOString()`.

- [ ] **Step 1: Create `src/storage/schema.ts`**

```ts
export type Domain = 'technique' | 'passes-tirs' | 'physique' | 'gardien';
export type ExerciseKind = Domain | 'echauffement' | 'retour-calme';
export type Equipment = 'ballon' | 'plots' | 'grand-espace';
export type Duration = 30 | 45 | 60;

export const ALL_DOMAINS: Domain[] = ['technique', 'passes-tirs', 'physique', 'gardien'];
export const ALL_EQUIPMENT: Equipment[] = ['ballon', 'plots', 'grand-espace'];
export const DURATIONS: Duration[] = [30, 45, 60];

export const DOMAIN_LABELS: Record<ExerciseKind, string> = {
  technique: 'Technique',
  'passes-tirs': 'Passes et tirs',
  physique: 'Physique',
  gardien: 'Gardien',
  echauffement: 'Échauffement',
  'retour-calme': 'Retour au calme',
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  ballon: 'Ballon',
  plots: 'Plots',
  'grand-espace': 'Grand espace (terrain, parc)',
};

export interface SessionItem {
  exerciseId: string;
  domain: ExerciseKind;
  durationMin: number;
}

export interface SessionPlan {
  durationMin: Duration;
  items: SessionItem[];
  challengeId: string | null;
}

export interface CompletedItem extends SessionItem {
  done: boolean;
}

export interface CompletedSession {
  id: string;
  date: string;
  plannedMin: Duration;
  items: CompletedItem[];
}

export interface ChallengeResult {
  challengeId: string;
  date: string;
  value: number;
}

export interface EarnedBadge {
  id: string;
  earnedAt: string;
}

export type SessionPhase = 'preview' | 'exercises' | 'challenge';

export interface InProgressSession {
  plan: SessionPlan;
  phase: SessionPhase;
  currentIndex: number;
  remainingSec: number;
  done: boolean[];
  startedAt: string;
}

export interface Profile {
  name: string;
  avatar: string;
  equipment: Equipment[];
}

export const STATE_VERSION = 1;

export interface AppState {
  version: 1;
  profile: Profile | null;
  sessions: CompletedSession[];
  results: ChallengeResult[];
  badges: EarnedBadge[];
  inProgress?: InProgressSession;
  lastBackupAt?: string;
}

export function initialState(): AppState {
  return { version: 1, profile: null, sessions: [], results: [], badges: [] };
}
```

- [ ] **Step 2: Create `src/data/types.ts`**

```ts
import type { Domain, Equipment, ExerciseKind } from '../storage/schema';

export interface Exercise {
  id: string;
  name: string;
  domain: ExerciseKind;
  durationMin: number;
  equipment: Equipment[];
  steps: string[];
  tip?: string;
}

export interface Challenge {
  id: string;
  name: string;
  domain: Domain;
  unit: string;
  better: 'higher' | 'lower';
  tiers: { bronze: number; argent: number; or: number };
  maxValue?: number;
  minValue?: number;
  equipment: Equipment[];
  howTo: string[];
}

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
}
```

- [ ] **Step 3: Create `src/data/levels.ts`**

```ts
export interface Level {
  name: string;
  emoji: string;
  minXp: number;
}

export const LEVELS: Level[] = [
  { name: 'Poussin', emoji: '🐣', minXp: 0 },
  { name: 'Espoir', emoji: '🌱', minXp: 250 },
  { name: 'Titulaire', emoji: '👕', minXp: 700 },
  { name: 'Capitaine', emoji: '🎖️', minXp: 1400 },
  { name: 'Star', emoji: '⭐', minXp: 2500 },
  { name: 'Légende', emoji: '🏆', minXp: 4000 },
];
```

- [ ] **Step 4: Write the failing test** — `src/engine/levels.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { levelFor } from './levels';

describe('levelFor', () => {
  it('starts at Poussin', () => {
    const info = levelFor(0);
    expect(info.level.name).toBe('Poussin');
    expect(info.index).toBe(0);
    expect(info.next?.name).toBe('Espoir');
    expect(info.progress).toBe(0);
  });

  it('computes progress inside a level', () => {
    expect(levelFor(125).progress).toBeCloseTo(0.5);
    expect(levelFor(249).level.name).toBe('Poussin');
  });

  it('switches level exactly at the threshold', () => {
    expect(levelFor(250).level.name).toBe('Espoir');
    expect(levelFor(250).progress).toBe(0);
    expect(levelFor(1400).level.name).toBe('Capitaine');
  });

  it('caps at Légende', () => {
    const info = levelFor(9999);
    expect(info.level.name).toBe('Légende');
    expect(info.next).toBeNull();
    expect(info.progress).toBe(1);
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm test -- src/engine/levels.test.ts`
Expected: FAIL — cannot resolve `./levels`.

- [ ] **Step 6: Implement** — `src/engine/levels.ts`

```ts
import { LEVELS, type Level } from '../data/levels';

export interface LevelInfo {
  level: Level;
  index: number;
  next: Level | null;
  progress: number;
}

export function levelFor(xp: number): LevelInfo {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) index = i;
  }
  const level = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  const progress = next ? (xp - level.minXp) / (next.minXp - level.minXp) : 1;
  return { level, index, next, progress };
}
```

- [ ] **Step 7: Run tests and typecheck**

Run: `npm test` then `npm run typecheck`
Expected: all PASS; typecheck exits 0.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "feat: add state schema, content types and levels"
```

---
### Task 3: Challenges and badge definitions

**Files:**
- Create: `src/data/challenges.ts`, `src/data/badges.ts`
- Test: `src/data/challenges.test.ts`

**Interfaces:**
- Consumes: `Challenge`, `BadgeDef` from `src/data/types.ts`; `ALL_DOMAINS`, `ALL_EQUIPMENT` from `src/storage/schema.ts`
- Produces:
  - `CHALLENGES: Challenge[]` with ids `jongles`, `jongles-pied-faible`, `slalom-plots`, `controles`, `passes-a-deux`, `tirs-cadres`, `tirs-pied-faible`, `sprint-20m`, `navette-5-10-5`, `arrets-gardien`
  - `getChallenge(id: string): Challenge | undefined`
  - `BADGES: BadgeDef[]` with ids `premier-pas`, `regulier`, `acharne`, `semaine-or`, `serie-4`, `jongles-50`, `pied-gauche`, `fusee`, `sniper`, `mur`, `touche-a-tout`, `collectionneur`
  - `getBadge(id: string): BadgeDef | undefined`

Note: no wall was listed in the available equipment, so the spec's "passes contre le mur en 30 s" becomes "Passes à deux en 30 s" (child ↔ parent), same tiers.

- [ ] **Step 1: Write the failing test** — `src/data/challenges.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { ALL_DOMAINS, ALL_EQUIPMENT } from '../storage/schema';
import { BADGES, getBadge } from './badges';
import { CHALLENGES, getChallenge } from './challenges';

describe('challenges data', () => {
  it('has 10 challenges with unique ids', () => {
    expect(CHALLENGES).toHaveLength(10);
    expect(new Set(CHALLENGES.map((c) => c.id)).size).toBe(10);
  });

  it('covers every domain', () => {
    for (const d of ALL_DOMAINS) {
      expect(CHALLENGES.some((c) => c.domain === d)).toBe(true);
    }
  });

  it.each(CHALLENGES.map((c) => [c.id, c] as const))('%s has consistent tiers and bounds', (_id, c) => {
    const { bronze, argent, or } = c.tiers;
    if (c.better === 'higher') {
      expect(bronze).toBeLessThan(argent);
      expect(argent).toBeLessThan(or);
      if (c.maxValue !== undefined) expect(c.maxValue).toBeGreaterThanOrEqual(or);
      expect(c.minValue).toBeUndefined();
    } else {
      expect(bronze).toBeGreaterThan(argent);
      expect(argent).toBeGreaterThan(or);
      if (c.minValue !== undefined) expect(c.minValue).toBeLessThanOrEqual(or);
      expect(c.maxValue).toBeUndefined();
    }
    expect(c.equipment.every((e) => ALL_EQUIPMENT.includes(e))).toBe(true);
    expect(c.howTo.length).toBeGreaterThanOrEqual(2);
  });

  it('finds challenges by id', () => {
    expect(getChallenge('jongles')?.name).toBe("Jongles d'affilée");
    expect(getChallenge('nope')).toBeUndefined();
  });
});

describe('badges data', () => {
  it('has 12 badges with unique ids', () => {
    expect(BADGES).toHaveLength(12);
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(12);
    expect(getBadge('sniper')?.emoji).toBe('🎯');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/challenges.test.ts`
Expected: FAIL — cannot resolve `./badges` / `./challenges`.

- [ ] **Step 3: Implement** — `src/data/challenges.ts`

```ts
import type { Challenge } from './types';

export const CHALLENGES: Challenge[] = [
  {
    id: 'jongles',
    name: "Jongles d'affilée",
    domain: 'technique',
    unit: 'jongles',
    better: 'higher',
    tiers: { bronze: 10, argent: 25, or: 50 },
    equipment: ['ballon'],
    howTo: ['Lâche le ballon et jongle avec les pieds, les cuisses ou la tête.', 'Compte les touches jusqu’à ce que le ballon tombe.', 'Garde ton meilleur essai sur 3.'],
  },
  {
    id: 'jongles-pied-faible',
    name: 'Jongles pied faible',
    domain: 'technique',
    unit: 'jongles',
    better: 'higher',
    tiers: { bronze: 5, argent: 10, or: 20 },
    equipment: ['ballon'],
    howTo: ['Jongle uniquement avec ton pied le moins fort.', 'Compte les touches jusqu’à ce que le ballon tombe.', 'Garde ton meilleur essai sur 3.'],
  },
  {
    id: 'slalom-plots',
    name: 'Slalom 6 plots aller-retour',
    domain: 'technique',
    unit: 's',
    better: 'lower',
    tiers: { bronze: 20, argent: 16, or: 13 },
    minValue: 8,
    equipment: ['ballon', 'plots'],
    howTo: ['Aligne 6 plots espacés de 2 grands pas.', 'Slalome ballon au pied jusqu’au bout puis reviens en slalomant.', 'Papa chronomètre. Un plot renversé = +2 s.'],
  },
  {
    id: 'controles',
    name: 'Contrôles réussis sur 10',
    domain: 'technique',
    unit: '/10',
    better: 'higher',
    tiers: { bronze: 5, argent: 7, or: 9 },
    maxValue: 10,
    equipment: ['ballon'],
    howTo: ['Papa lance le ballon en l’air à 3 m de toi, 10 fois.', 'Un contrôle est réussi si le ballon reste à moins d’un pas de toi.'],
  },
  {
    id: 'passes-a-deux',
    name: 'Passes à deux en 30 s',
    domain: 'passes-tirs',
    unit: 'passes',
    better: 'higher',
    tiers: { bronze: 10, argent: 15, or: 20 },
    equipment: ['ballon'],
    howTo: ['Place-toi à 5 grands pas de papa.', 'Faites-vous des passes le plus vite possible pendant 30 s.', 'Compte seulement tes passes qui arrivent dans les pieds de papa.'],
  },
  {
    id: 'tirs-cadres',
    name: 'Tirs cadrés sur 10',
    domain: 'passes-tirs',
    unit: '/10',
    better: 'higher',
    tiers: { bronze: 5, argent: 7, or: 9 },
    maxValue: 10,
    equipment: ['ballon', 'plots'],
    howTo: ['Fais un but avec 2 plots écartés de 3 grands pas.', 'Tire 10 fois à 8 pas du but.', 'Compte les tirs qui passent entre les plots.'],
  },
  {
    id: 'tirs-pied-faible',
    name: 'Tirs cadrés pied faible sur 10',
    domain: 'passes-tirs',
    unit: '/10',
    better: 'higher',
    tiers: { bronze: 3, argent: 5, or: 7 },
    maxValue: 10,
    equipment: ['ballon', 'plots'],
    howTo: ['Même but qu’aux tirs cadrés, à 8 pas.', 'Tire 10 fois avec ton pied le moins fort.', 'Compte les tirs qui passent entre les plots.'],
  },
  {
    id: 'sprint-20m',
    name: 'Sprint 20 m',
    domain: 'physique',
    unit: 's',
    better: 'lower',
    tiers: { bronze: 5.0, argent: 4.5, or: 4.1 },
    minValue: 3.5,
    equipment: ['grand-espace', 'plots'],
    howTo: ['Place 2 plots à 20 m (environ 25 grands pas d’adulte).', 'Pars au signal de papa et cours jusqu’au 2e plot.', 'Garde le meilleur de 2 essais.'],
  },
  {
    id: 'navette-5-10-5',
    name: 'Navette 5-10-5',
    domain: 'physique',
    unit: 's',
    better: 'lower',
    tiers: { bronze: 7.5, argent: 6.8, or: 6.2 },
    minValue: 5,
    equipment: ['plots'],
    howTo: ['Aligne 3 plots espacés de 5 m ; pars de celui du milieu.', 'Cours toucher le plot de droite, puis celui de gauche, puis reviens au milieu.', 'Garde le meilleur de 2 essais.'],
  },
  {
    id: 'arrets-gardien',
    name: 'Arrêts sur 10 tirs',
    domain: 'gardien',
    unit: '/10',
    better: 'higher',
    tiers: { bronze: 4, argent: 6, or: 8 },
    maxValue: 10,
    equipment: ['ballon', 'plots'],
    howTo: ['Garde un but de 3 grands pas fait avec 2 plots.', 'Papa tire 10 fois à 6 pas, pas trop fort.', 'Compte les ballons arrêtés ou détournés.'],
  },
];

export function getChallenge(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}
```

- [ ] **Step 4: Implement** — `src/data/badges.ts`

```ts
import type { BadgeDef } from './types';

export const BADGES: BadgeDef[] = [
  { id: 'premier-pas', name: 'Premier pas', emoji: '👟', description: 'Termine ta première séance.' },
  { id: 'regulier', name: 'Régulier', emoji: '📅', description: 'Termine 10 séances.' },
  { id: 'acharne', name: 'Acharné', emoji: '💪', description: 'Termine 50 séances.' },
  { id: 'semaine-or', name: 'Semaine en or', emoji: '🌟', description: 'Fais au moins 3 séances dans une semaine.' },
  { id: 'serie-4', name: 'Série de 4', emoji: '🔥', description: 'Réussis 4 semaines de suite.' },
  { id: 'jongles-50', name: '50 jongles', emoji: '🤹', description: 'Fais 50 jongles d’affilée.' },
  { id: 'pied-gauche', name: 'Pied gauche en feu', emoji: '🦶', description: 'Atteins l’or en jongles ou en tirs avec ton pied faible.' },
  { id: 'fusee', name: 'Fusée', emoji: '🚀', description: 'Atteins l’or au sprint 20 m.' },
  { id: 'sniper', name: 'Sniper', emoji: '🎯', description: 'Cadre 10 tirs sur 10.' },
  { id: 'mur', name: 'Mur infranchissable', emoji: '🧤', description: 'Atteins l’or aux arrêts de gardien.' },
  { id: 'touche-a-tout', name: 'Touche-à-tout', emoji: '🧩', description: 'Obtiens au moins le bronze dans les 4 domaines.' },
  { id: 'collectionneur', name: 'Collectionneur', emoji: '🥇', description: 'Atteins l’or sur 5 défis différents.' },
];

export function getBadge(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}
```

- [ ] **Step 5: Run tests and typecheck**

Run: `npm test` then `npm run typecheck`
Expected: all PASS; typecheck exits 0.

- [ ] **Step 6: Commit**

```bash
git add src/data
git commit -m "feat: add challenges and badge definitions"
```

---

### Task 4: Exercise library

**Files:**
- Create: `src/data/exercises.ts`
- Test: `src/data/exercises.test.ts`

**Interfaces:**
- Consumes: `Exercise` from `src/data/types.ts`; `ALL_DOMAINS`, `ALL_EQUIPMENT`, `ExerciseKind` from `src/storage/schema.ts`
- Produces: `EXERCISES: Exercise[]` (40 items: 4 échauffement, 9 technique, 10 passes-tirs, 8 physique, 5 gardien, 4 retour au calme), `getExercise(id: string): Exercise | undefined`

- [ ] **Step 1: Write the failing test** — `src/data/exercises.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { ALL_DOMAINS, ALL_EQUIPMENT, type ExerciseKind } from '../storage/schema';
import { EXERCISES, getExercise } from './exercises';

const count = (kind: ExerciseKind) => EXERCISES.filter((e) => e.domain === kind).length;

describe('exercises data', () => {
  it('has 40 exercises with unique ids', () => {
    expect(EXERCISES).toHaveLength(40);
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(40);
  });

  it('has the expected mix', () => {
    expect(count('echauffement')).toBeGreaterThanOrEqual(4);
    expect(count('retour-calme')).toBeGreaterThanOrEqual(3);
    expect(count('technique')).toBeGreaterThanOrEqual(8);
    expect(count('passes-tirs')).toBeGreaterThanOrEqual(8);
    expect(count('physique')).toBeGreaterThanOrEqual(8);
    expect(count('gardien')).toBeGreaterThanOrEqual(5);
  });

  it('is usable with only a ball', () => {
    const ballOnly = (kind: ExerciseKind) =>
      EXERCISES.filter((e) => e.domain === kind && e.equipment.every((q) => q === 'ballon')).length;
    for (const kind of [...ALL_DOMAINS, 'echauffement', 'retour-calme'] as ExerciseKind[]) {
      expect(ballOnly(kind), kind).toBeGreaterThanOrEqual(2);
    }
  });

  it('has well-formed entries', () => {
    for (const e of EXERCISES) {
      expect(e.steps.length, e.id).toBeGreaterThanOrEqual(2);
      expect(e.steps.length, e.id).toBeLessThanOrEqual(4);
      expect(e.durationMin, e.id).toBeGreaterThan(0);
      expect(e.equipment.every((q) => ALL_EQUIPMENT.includes(q)), e.id).toBe(true);
    }
  });

  it('finds exercises by id', () => {
    expect(getExercise('ech-trottinage-ballon')?.domain).toBe('echauffement');
    expect(getExercise('nope')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/exercises.test.ts`
Expected: FAIL — cannot resolve `./exercises`.

- [ ] **Step 3: Implement** — `src/data/exercises.ts`

```ts
import type { Exercise } from './types';

export const EXERCISES: Exercise[] = [
  // Échauffement (4)
  { id: 'ech-trottinage-ballon', name: 'Trottinage ballon au pied', domain: 'echauffement', durationMin: 5, equipment: ['ballon'],
    steps: ['Avance doucement en touchant le ballon à chaque pas.', 'Change de pied toutes les 10 touches.', 'Accélère un peu sur la fin.'] },
  { id: 'ech-toe-taps', name: 'Toe taps', domain: 'echauffement', durationMin: 5, equipment: ['ballon'],
    steps: ['Pose la semelle sur le ballon, pied gauche puis pied droit, en rythme.', '30 secondes rapide, 15 secondes de repos.'],
    tip: 'Reste sur la pointe des pieds.' },
  { id: 'ech-mobilite', name: 'Réveil du corps', domain: 'echauffement', durationMin: 5, equipment: [],
    steps: ['Montées de genoux sur place, puis talons-fesses.', 'Grands cercles de bras en avant et en arrière.', 'Pas chassés à gauche puis à droite.'] },
  { id: 'ech-passes-douces', name: 'Passes douces avec papa', domain: 'echauffement', durationMin: 5, equipment: ['ballon'],
    steps: ['Faites-vous des passes à 4 pas, sans forcer.', 'Contrôle avant de repasser, alterne les pieds.'] },

  // Technique (9)
  { id: 'tech-jongles-series', name: 'Séries de jongles', domain: 'technique', durationMin: 8, equipment: ['ballon'],
    steps: ['Jongle et essaie de battre ton score à chaque essai.', 'Si c’est trop dur, laisse le ballon rebondir une fois entre deux touches.'],
    tip: 'Cheville bloquée, pointe du pied légèrement levée.' },
  { id: 'tech-jongles-pied-faible', name: 'Jongles pied faible', domain: 'technique', durationMin: 6, equipment: ['ballon'],
    steps: ['Jongle seulement avec ton pied le moins fort.', 'Laisse rebondir si besoin, puis essaie sans rebond.'] },
  { id: 'tech-conduite-semelle', name: 'Conduite à la semelle', domain: 'technique', durationMin: 6, equipment: ['ballon'],
    steps: ['Fais rouler le ballon sous ta semelle en avançant.', 'Puis en reculant, puis sur le côté.'] },
  { id: 'tech-slalom', name: 'Slalom entre les plots', domain: 'technique', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ['Slalome aller avec le pied droit, retour avec le gauche.', 'Puis les deux pieds, de plus en plus vite.'],
    tip: 'Petites touches, ballon collé au pied.' },
  { id: 'tech-crochets', name: 'Crochets et demi-tours', domain: 'technique', durationMin: 6, equipment: ['ballon', 'plots'],
    steps: ['Conduis jusqu’au plot, fais un crochet intérieur et reviens.', 'Recommence avec un crochet extérieur, puis une semelle.'] },
  { id: 'tech-controle-lance', name: 'Contrôles de balles lancées', domain: 'technique', durationMin: 8, equipment: ['ballon'],
    steps: ['Papa lance le ballon en l’air.', 'Contrôle avec le pied, la cuisse ou la poitrine.', 'Garde le ballon près de toi.'] },
  { id: 'tech-controle-oriente', name: 'Contrôle orienté', domain: 'technique', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ['Papa te passe le ballon.', 'Contrôle en envoyant le ballon vers le plot de gauche ou de droite (papa annonce le côté).'] },
  { id: 'tech-dribble-1c1', name: 'Dribble contre papa', domain: 'technique', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ['Papa défend devant un but de 2 plots.', 'Essaie de passer avec une feinte et de marquer.', 'Papa défend doucement au début.'] },
  { id: 'tech-feintes', name: 'Feintes sur place', domain: 'technique', durationMin: 6, equipment: ['ballon'],
    steps: ['Passement de jambe à gauche, puis à droite, 10 fois.', 'Feinte de frappe puis crochet, 10 fois.'] },

  // Passes et tirs (10)
  { id: 'pt-passes-interieur', name: 'Passes intérieur du pied', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon'],
    steps: ['Passes avec papa à 6 pas.', '10 passes pied droit, 10 pied gauche.'],
    tip: 'Pied d’appui à côté du ballon, pointe vers papa.' },
  { id: 'pt-passes-une-touche', name: 'Passes en une touche', domain: 'passes-tirs', durationMin: 6, equipment: ['ballon'],
    steps: ['Renvoie le ballon à papa sans le contrôler.', 'Recule d’un pas toutes les 10 passes réussies.'] },
  { id: 'pt-passes-porte', name: 'Passes dans la porte', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ['Fais une porte avec 2 plots écartés d’un pas.', 'Passe le ballon à papa à travers la porte.', 'Recule quand tu réussis 5 fois d’affilée.'] },
  { id: 'pt-tirs-cadres', name: 'Tirs cadrés', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ['Fais un but avec 2 plots.', 'Tire à 8 pas, ballon arrêté.', 'Vise un poteau, puis l’autre.'] },
  { id: 'pt-tirs-pied-faible', name: 'Tirs pied faible', domain: 'passes-tirs', durationMin: 6, equipment: ['ballon', 'plots'],
    steps: ['Même but, à 6 pas.', 'Tire seulement avec ton pied le moins fort.'] },
  { id: 'pt-tirs-apres-conduite', name: 'Conduite puis tir', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ['Pars à 15 pas du but ballon au pied.', 'Accélère et tire avant la ligne des 8 pas.'] },
  { id: 'pt-volee', name: 'Reprises de volée', domain: 'passes-tirs', durationMin: 6, equipment: ['ballon'],
    steps: ['Papa lance le ballon à la main vers ton pied.', 'Renvoie-le directement dans ses mains, sans rebond.'] },
  { id: 'pt-passes-longues', name: 'Passes longues', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon', 'grand-espace'],
    steps: ['Passes avec papa à 15 pas.', 'Frappe avec le lacet, bien au milieu du ballon.'] },
  { id: 'pt-une-deux', name: 'Une-deux et tir', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ['Passe à papa, il te remet le ballon en une touche.', 'Tire directement ou après un contrôle.'] },
  { id: 'pt-precision-cible', name: 'Tir sur cible', domain: 'passes-tirs', durationMin: 6, equipment: ['ballon'],
    steps: ['Choisis une cible (un arbre, un seau, un sac).', 'Tire 10 fois à 6 pas et compte les touches.'] },

  // Physique / coordination (8)
  { id: 'phy-sprints', name: 'Sprints courts', domain: 'physique', durationMin: 6, equipment: ['grand-espace'],
    steps: ['Sprint de 15 pas, retour en marchant.', '6 sprints, départ debout puis départ assis.'] },
  { id: 'phy-navette', name: 'Navettes', domain: 'physique', durationMin: 6, equipment: ['plots'],
    steps: ['3 plots espacés de 5 pas.', 'Va toucher chaque plot et reviens au départ entre chaque.'] },
  { id: 'phy-pas-chasses', name: 'Pas chassés et appuis', domain: 'physique', durationMin: 5, equipment: [],
    steps: ['Pas chassés sur 5 pas à gauche puis à droite.', 'Petits pas rapides sur place 10 secondes, repos 10 secondes.'] },
  { id: 'phy-cloche-pied', name: 'Cloche-pied', domain: 'physique', durationMin: 5, equipment: [],
    steps: ['10 sauts sur le pied gauche, 10 sur le droit.', 'Puis sauts pieds joints en avant et en arrière.'],
    tip: 'Atterris en douceur, genoux souples.' },
  { id: 'phy-equilibre', name: 'Équilibre flamant rose', domain: 'physique', durationMin: 5, equipment: ['ballon'],
    steps: ['Tiens sur un pied 20 secondes, la semelle de l’autre pied posée sur le ballon.', 'Change de pied. Puis les yeux fermés !'] },
  { id: 'phy-reaction', name: 'Jeu de réaction', domain: 'physique', durationMin: 6, equipment: ['plots'],
    steps: ['Pose un plot à gauche et un à droite, à 4 pas.', 'Au signal « gauche » ou « droite » de papa, cours toucher le bon plot.'] },
  { id: 'phy-chat-ballon', name: 'Chat ballon', domain: 'physique', durationMin: 6, equipment: ['ballon'],
    steps: ['Conduis ton ballon et échappe à papa qui essaie de te toucher.', 'Si tu es touché, on inverse les rôles.'] },
  { id: 'phy-parcours', name: 'Parcours d’agilité', domain: 'physique', durationMin: 8, equipment: ['plots'],
    steps: ['Slalom sans ballon, saut par-dessus un plot couché, sprint jusqu’au dernier plot.', 'Chronomètre-toi et essaie de t’améliorer.'] },

  // Gardien (5)
  { id: 'gar-prise-balle', name: 'Prises de balle', domain: 'gardien', durationMin: 6, equipment: ['ballon'],
    steps: ['Papa lance le ballon à hauteur du ventre, de la poitrine, puis au-dessus de la tête.', 'Bloque le ballon en faisant un W avec tes mains.'] },
  { id: 'gar-balles-basses', name: 'Balles au sol', domain: 'gardien', durationMin: 6, equipment: ['ballon'],
    steps: ['Papa fait rouler le ballon vers toi.', 'Descends jambes serrées, ramasse le ballon et serre-le contre toi.'] },
  { id: 'gar-plongeons', name: 'Plongeons à genoux', domain: 'gardien', durationMin: 6, equipment: ['ballon'],
    steps: ['À genoux, papa lance le ballon sur le côté.', 'Tombe sur le côté en attrapant le ballon.', 'Sur l’herbe uniquement !'] },
  { id: 'gar-arrets', name: 'Arrêts dans le but', domain: 'gardien', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ['Garde un but de 2 plots.', 'Papa tire doucement, de plus en plus loin de tes mains.'] },
  { id: 'gar-relances', name: 'Relances', domain: 'gardien', durationMin: 6, equipment: ['ballon', 'plots'],
    steps: ['Relance à la main en faisant rouler le ballon jusqu’à un plot à 10 pas.', 'Puis dégagement au pied.'] },

  // Retour au calme (4)
  { id: 'calme-marche-respiration', name: 'Marche et respiration', domain: 'retour-calme', durationMin: 3, equipment: [],
    steps: ['Marche tranquillement en inspirant par le nez.', 'Souffle lentement par la bouche.'] },
  { id: 'calme-etirements', name: 'Étirements doux', domain: 'retour-calme', durationMin: 5, equipment: [],
    steps: ['Attrape ton pied derrière toi, 15 secondes chaque jambe.', 'Assis jambes tendues, essaie de toucher tes pieds.'] },
  { id: 'calme-jongles-mains', name: 'Jonglage à la main', domain: 'retour-calme', durationMin: 3, equipment: ['ballon'],
    steps: ['Lance le ballon en l’air et rattrape-le.', 'Tape dans tes mains avant de le rattraper.'] },
  { id: 'calme-bilan', name: 'Bilan avec papa', domain: 'retour-calme', durationMin: 3, equipment: ['ballon'],
    steps: ['Assis sur le ballon, dis ce que tu as le mieux réussi.', 'Choisis ce que tu veux travailler la prochaine fois.'] },
];

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}
```

- [ ] **Step 4: Run tests and typecheck**

Run: `npm test` then `npm run typecheck`
Expected: all PASS; typecheck exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/data
git commit -m "feat: add exercise library"
```

---

### Task 5: Tiers, records and result checks

**Files:**
- Create: `src/engine/tiers.ts`
- Test: `src/engine/tiers.test.ts`

**Interfaces:**
- Consumes: `Challenge` from `src/data/types.ts`; `getChallenge` from `src/data/challenges.ts` (tests only)
- Produces:
  - `interface TierStep { rank: number; label: string; value: number }` — rank 1 = bronze, 2 = argent, 3 = or, 4 = Or +1, …
  - `rankLabel(rank: number): string` — `'Bronze' | 'Argent' | 'Or' | 'Or +n'`; `''` for rank 0
  - `meets(ch: Challenge, value: number, target: number): boolean`
  - `isBetter(ch: Challenge, a: number, b: number): boolean` — strictly better
  - `stepValue(ch: Challenge, rank: number): number | null` — null when beyond `maxValue`/`minValue`
  - `reachedRank(ch: Challenge, value: number): number` — 0 if bronze not reached
  - `nextStep(ch: Challenge, best: number | null): TierStep | null`
  - `bestValue(ch: Challenge, values: number[]): number | null`
  - `isValidResultValue(ch: Challenge, value: number): boolean`
  - `isSuspiciousResult(ch: Challenge, value: number, best: number | null): boolean`

Rules beyond gold: gap = |or − argent|; Or+n = or ± gap·n, rounded to 2 decimals. If that value crosses the bound, the bound itself becomes the final step (once), then `null`.

Result validity: finite; `>= 0` for `higher` (0/10 is a real score), `> 0` for `lower`; `<= maxValue` when set.
Suspicious: `higher` → `value > 2 × best` **and** `value − best >= 10` (so 3 → 8 jongles doesn't nag); `lower` → `value < best / 1.5`. Never suspicious without a previous best.

- [ ] **Step 1: Write the failing test** — `src/engine/tiers.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { getChallenge } from '../data/challenges';
import {
  bestValue, isBetter, isSuspiciousResult, isValidResultValue, meets, nextStep, rankLabel, reachedRank, stepValue,
} from './tiers';

const jongles = getChallenge('jongles')!;
const tirs = getChallenge('tirs-cadres')!;
const sprint = getChallenge('sprint-20m')!;

describe('tiers', () => {
  it('labels ranks', () => {
    expect([0, 1, 2, 3, 4, 6].map(rankLabel)).toEqual(['', 'Bronze', 'Argent', 'Or', 'Or +1', 'Or +3']);
  });

  it('compares according to direction', () => {
    expect(meets(jongles, 10, 10)).toBe(true);
    expect(meets(sprint, 4.6, 4.5)).toBe(false);
    expect(isBetter(sprint, 4.4, 4.5)).toBe(true);
    expect(isBetter(jongles, 10, 10)).toBe(false);
  });

  it('extends steps beyond gold', () => {
    expect([1, 2, 3, 4, 5].map((r) => stepValue(jongles, r))).toEqual([10, 25, 50, 75, 100]);
    expect(stepValue(jongles, 0)).toBeNull();
  });

  it('clamps steps to bounds once', () => {
    expect(stepValue(tirs, 4)).toBe(10);
    expect(stepValue(tirs, 5)).toBeNull();
    expect(stepValue(sprint, 4)).toBe(3.7);
    expect(stepValue(sprint, 5)).toBe(3.5);
    expect(stepValue(sprint, 6)).toBeNull();
  });

  it('computes reached rank', () => {
    expect(reachedRank(jongles, 9)).toBe(0);
    expect(reachedRank(jongles, 10)).toBe(1);
    expect(reachedRank(jongles, 60)).toBe(3);
    expect(reachedRank(jongles, 100)).toBe(5);
    expect(reachedRank(sprint, 4.6)).toBe(1);
    expect(reachedRank(sprint, 3.5)).toBe(5);
    expect(reachedRank(tirs, 10)).toBe(4);
  });

  it('finds the next step', () => {
    expect(nextStep(jongles, null)).toEqual({ rank: 1, label: 'Bronze', value: 10 });
    expect(nextStep(jongles, 30)).toEqual({ rank: 3, label: 'Or', value: 50 });
    expect(nextStep(tirs, 10)).toBeNull();
  });

  it('finds the best value', () => {
    expect(bestValue(sprint, [5, 4.2, 4.8])).toBe(4.2);
    expect(bestValue(jongles, [12, 30, 8])).toBe(30);
    expect(bestValue(jongles, [])).toBeNull();
  });

  it('validates result values', () => {
    expect(isValidResultValue(tirs, 0)).toBe(true);
    expect(isValidResultValue(tirs, 11)).toBe(false);
    expect(isValidResultValue(sprint, 0)).toBe(false);
    expect(isValidResultValue(jongles, Number.NaN)).toBe(false);
    expect(isValidResultValue(jongles, -1)).toBe(false);
  });

  it('flags suspicious results', () => {
    expect(isSuspiciousResult(jongles, 45, 20)).toBe(true);
    expect(isSuspiciousResult(jongles, 35, 20)).toBe(false);
    expect(isSuspiciousResult(jongles, 8, 3)).toBe(false);
    expect(isSuspiciousResult(jongles, 5000, null)).toBe(false);
    expect(isSuspiciousResult(sprint, 2.9, 4.5)).toBe(true);
    expect(isSuspiciousResult(sprint, 3.5, 4.5)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/engine/tiers.test.ts`
Expected: FAIL — cannot resolve `./tiers`.

- [ ] **Step 3: Implement** — `src/engine/tiers.ts`

```ts
import type { Challenge } from '../data/types';

export interface TierStep {
  rank: number;
  label: string;
  value: number;
}

const MAX_RANK = 1000;
const round2 = (v: number) => Math.round(v * 100) / 100;

export function rankLabel(rank: number): string {
  if (rank <= 0) return '';
  if (rank === 1) return 'Bronze';
  if (rank === 2) return 'Argent';
  if (rank === 3) return 'Or';
  return `Or +${rank - 3}`;
}

export function meets(ch: Challenge, value: number, target: number): boolean {
  return ch.better === 'higher' ? value >= target : value <= target;
}

export function isBetter(ch: Challenge, a: number, b: number): boolean {
  return ch.better === 'higher' ? a > b : a < b;
}

export function stepValue(ch: Challenge, rank: number): number | null {
  if (rank < 1) return null;
  const { bronze, argent, or } = ch.tiers;
  if (rank === 1) return bronze;
  if (rank === 2) return argent;
  if (rank === 3) return or;
  const prev = stepValue(ch, rank - 1);
  if (prev === null) return null;
  const gap = Math.abs(or - argent);
  if (ch.better === 'higher') {
    const v = round2(or + gap * (rank - 3));
    if (ch.maxValue === undefined || v <= ch.maxValue) return v;
    return prev < ch.maxValue ? ch.maxValue : null;
  }
  const v = round2(or - gap * (rank - 3));
  if (ch.minValue === undefined || v >= ch.minValue) return v;
  return prev > ch.minValue ? ch.minValue : null;
}

export function reachedRank(ch: Challenge, value: number): number {
  let rank = 0;
  for (let r = 1; r < MAX_RANK; r++) {
    const target = stepValue(ch, r);
    if (target === null || !meets(ch, value, target)) break;
    rank = r;
  }
  return rank;
}

export function nextStep(ch: Challenge, best: number | null): TierStep | null {
  const rank = best === null ? 1 : reachedRank(ch, best) + 1;
  const value = stepValue(ch, rank);
  return value === null ? null : { rank, label: rankLabel(rank), value };
}

export function bestValue(ch: Challenge, values: number[]): number | null {
  let best: number | null = null;
  for (const v of values) {
    if (best === null || isBetter(ch, v, best)) best = v;
  }
  return best;
}

export function isValidResultValue(ch: Challenge, value: number): boolean {
  if (!Number.isFinite(value)) return false;
  if (ch.better === 'higher' ? value < 0 : value <= 0) return false;
  return ch.maxValue === undefined || value <= ch.maxValue;
}

export function isSuspiciousResult(ch: Challenge, value: number, best: number | null): boolean {
  if (best === null) return false;
  if (ch.better === 'higher') return value > best * 2 && value - best >= 10;
  return value < best / 1.5;
}
```

- [ ] **Step 4: Run tests and typecheck**

Run: `npm test` then `npm run typecheck`
Expected: all PASS; typecheck exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat: add tier steps, records and result checks"
```

---

### Task 6: XP computation

**Files:**
- Create: `src/engine/xp.ts`
- Test: `src/engine/xp.test.ts`

**Interfaces:**
- Consumes: `getChallenge` (`src/data/challenges.ts`); `reachedRank`, `isBetter` (`src/engine/tiers.ts`); `weekKey` (`src/engine/week.ts`); `AppState`, `ChallengeResult`, `CompletedSession` (`src/storage/schema.ts`)
- Produces:
  - `XP_RULES` constants
  - `interface XpBreakdown { sessions: number; records: number; tiers: number; weeks: number; total: number }`
  - `sessionMinutes(s: CompletedSession): number` — minutes of `done` items
  - `successfulWeeks(sessions: CompletedSession[]): string[]` — sorted week keys with ≥ 3 sessions
  - `sortResults(results: ChallengeResult[]): ChallengeResult[]` — by date, stable
  - `computeXp(state: Pick<AppState, 'sessions' | 'results'>): XpBreakdown`

XP is always recomputed from history (never stored).

- [ ] **Step 1: Write the failing test** — `src/engine/xp.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import type { ChallengeResult, CompletedSession } from '../storage/schema';
import { computeXp, sessionMinutes, successfulWeeks } from './xp';

function session(date: Date, doneMin: number, skippedMin = 0): CompletedSession {
  const items = [{ exerciseId: 'tech-feintes', domain: 'technique' as const, durationMin: doneMin, done: true }];
  if (skippedMin) items.push({ exerciseId: 'phy-sprints', domain: 'technique', durationMin: skippedMin, done: false });
  return { id: date.toISOString(), date: date.toISOString(), plannedMin: 30, items };
}

const result = (challengeId: string, day: number, value: number): ChallengeResult => ({
  challengeId,
  date: new Date(2026, 8, day, 18).toISOString(),
  value,
});

describe('xp', () => {
  it('counts only done minutes', () => {
    expect(sessionMinutes(session(new Date(2026, 8, 14), 20, 8))).toBe(20);
  });

  it('detects successful weeks', () => {
    const sessions = [
      session(new Date(2026, 8, 14, 17), 10),
      session(new Date(2026, 8, 16, 17), 10),
      session(new Date(2026, 8, 20, 17), 10),
      session(new Date(2026, 8, 21, 17), 10),
      session(new Date(2026, 8, 22, 17), 10),
    ];
    expect(successfulWeeks(sessions)).toEqual(['2026-09-14']);
  });

  it('gives 1 XP per done minute', () => {
    const xp = computeXp({ sessions: [session(new Date(2026, 8, 14), 25, 5), session(new Date(2026, 8, 15), 40)], results: [] });
    expect(xp).toEqual({ sessions: 65, records: 0, tiers: 0, weeks: 0, total: 65 });
  });

  it('rewards records (not the first result) and first-time tiers', () => {
    const xp = computeXp({ sessions: [], results: [result('jongles', 16, 8), result('jongles', 14, 12), result('jongles', 17, 30)] });
    // sorted: 12 (first, bronze +15), 8 (no), 30 (record +20, argent +25)
    expect(xp.records).toBe(20);
    expect(xp.tiers).toBe(40);
    expect(xp.total).toBe(60);
  });

  it('awards every tier crossed in one jump', () => {
    const xp = computeXp({ sessions: [], results: [result('jongles', 14, 80)] });
    // bronze 15 + argent 25 + or 40 + Or+1 (75) 40
    expect(xp.tiers).toBe(120);
    expect(xp.records).toBe(0);
  });

  it('does not re-award a tier already reached', () => {
    const xp = computeXp({ sessions: [], results: [result('sprint-20m', 14, 4.9), result('sprint-20m', 15, 4.95), result('sprint-20m', 16, 4.8)] });
    expect(xp.tiers).toBe(15);
    expect(xp.records).toBe(20);
  });

  it('adds the successful week bonus', () => {
    const sessions = [14, 15, 16].map((d) => session(new Date(2026, 8, d, 17), 10));
    expect(computeXp({ sessions, results: [] })).toEqual({ sessions: 30, records: 0, tiers: 0, weeks: 50, total: 80 });
  });

  it('ignores unknown challenges', () => {
    expect(computeXp({ sessions: [], results: [result('ancien-defi', 14, 5)] }).total).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/engine/xp.test.ts`
Expected: FAIL — cannot resolve `./xp`.

- [ ] **Step 3: Implement** — `src/engine/xp.ts`

```ts
import { getChallenge } from '../data/challenges';
import type { AppState, ChallengeResult, CompletedSession } from '../storage/schema';
import { isBetter, reachedRank } from './tiers';
import { weekKey } from './week';

export const XP_RULES = {
  perMinute: 1,
  record: 20,
  tierBronze: 15,
  tierArgent: 25,
  tierOr: 40,
  week: 50,
  weekMinSessions: 3,
};

export interface XpBreakdown {
  sessions: number;
  records: number;
  tiers: number;
  weeks: number;
  total: number;
}

export function sessionMinutes(s: CompletedSession): number {
  return s.items.filter((i) => i.done).reduce((sum, i) => sum + i.durationMin, 0);
}

export function successfulWeeks(sessions: CompletedSession[]): string[] {
  const counts = new Map<string, number>();
  for (const s of sessions) {
    const key = weekKey(new Date(s.date));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts]
    .filter(([, n]) => n >= XP_RULES.weekMinSessions)
    .map(([key]) => key)
    .sort();
}

export function sortResults(results: ChallengeResult[]): ChallengeResult[] {
  return results
    .map((r, i) => ({ r, i }))
    .sort((a, b) => (a.r.date < b.r.date ? -1 : a.r.date > b.r.date ? 1 : a.i - b.i))
    .map(({ r }) => r);
}

function tierXp(rank: number): number {
  if (rank === 1) return XP_RULES.tierBronze;
  if (rank === 2) return XP_RULES.tierArgent;
  return XP_RULES.tierOr;
}

export function computeXp(state: Pick<AppState, 'sessions' | 'results'>): XpBreakdown {
  const sessions = state.sessions.reduce((sum, s) => sum + sessionMinutes(s) * XP_RULES.perMinute, 0);

  let records = 0;
  let tiers = 0;
  const best = new Map<string, number>();
  const ranks = new Map<string, number>();
  for (const r of sortResults(state.results)) {
    const ch = getChallenge(r.challengeId);
    if (!ch) continue;
    const prev = best.get(ch.id);
    if (prev === undefined || isBetter(ch, r.value, prev)) {
      if (prev !== undefined) records += XP_RULES.record;
      best.set(ch.id, r.value);
    }
    const prevRank = ranks.get(ch.id) ?? 0;
    const rank = reachedRank(ch, r.value);
    if (rank > prevRank) {
      for (let k = prevRank + 1; k <= rank; k++) tiers += tierXp(k);
      ranks.set(ch.id, rank);
    }
  }

  const weeks = successfulWeeks(state.sessions).length * XP_RULES.week;
  return { sessions, records, tiers, weeks, total: sessions + records + tiers + weeks };
}
```

- [ ] **Step 4: Run tests and typecheck**

Run: `npm test` then `npm run typecheck`
Expected: all PASS; typecheck exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat: compute XP from sessions and challenge results"
```

---

### Task 7: Badge rules

**Files:**
- Create: `src/engine/badges.ts`
- Test: `src/engine/badges.test.ts`

**Interfaces:**
- Consumes: `BADGES` (`src/data/badges.ts`); `CHALLENGES`, `getChallenge` (`src/data/challenges.ts`); `bestValue`, `reachedRank` (`src/engine/tiers.ts`); `successfulWeeks` (`src/engine/xp.ts`); `addDays`, `parseDateKey`, `toDateKey` (`src/engine/week.ts`); `ALL_DOMAINS`, `AppState`, `EarnedBadge` (`src/storage/schema.ts`)
- Produces:
  - `BADGE_RULES: Record<string, (f: BadgeFacts) => boolean>`
  - `longestWeekStreak(weekKeys: string[]): number`
  - `earnedBadgeIds(state: Pick<AppState, 'sessions' | 'results'>): string[]`
  - `awardNewBadges(state: AppState, now: Date): EarnedBadge[]` — only badges not already in `state.badges`, with `earnedAt = now.toISOString()`

- [ ] **Step 1: Write the failing test** — `src/engine/badges.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { BADGES } from '../data/badges';
import { initialState, type AppState, type ChallengeResult, type CompletedSession } from '../storage/schema';
import { awardNewBadges, BADGE_RULES, earnedBadgeIds, longestWeekStreak } from './badges';

const session = (d: Date): CompletedSession => ({
  id: d.toISOString(),
  date: d.toISOString(),
  plannedMin: 30,
  items: [{ exerciseId: 'tech-feintes', domain: 'technique', durationMin: 10, done: true }],
});

const res = (challengeId: string, value: number): ChallengeResult => ({
  challengeId,
  value,
  date: new Date(2026, 8, 14, 18).toISOString(),
});

const state = (patch: Partial<AppState>): AppState => ({ ...initialState(), ...patch });

describe('badge rules', () => {
  it('has one rule per badge definition', () => {
    expect(Object.keys(BADGE_RULES).sort()).toEqual(BADGES.map((b) => b.id).sort());
  });

  it('earns nothing on an empty state', () => {
    expect(earnedBadgeIds(state({}))).toEqual([]);
  });

  it('counts sessions', () => {
    expect(earnedBadgeIds(state({ sessions: [session(new Date(2026, 8, 14))] }))).toEqual(['premier-pas']);
    const ten = Array.from({ length: 10 }, (_, i) => session(new Date(2026, 0, 1 + i * 7)));
    expect(earnedBadgeIds(state({ sessions: ten }))).toContain('regulier');
  });

  it('computes week streaks', () => {
    expect(longestWeekStreak(['2026-08-31', '2026-09-07', '2026-09-14', '2026-09-21'])).toBe(4);
    expect(longestWeekStreak(['2026-08-31', '2026-09-07', '2026-09-21', '2026-09-28'])).toBe(2);
    expect(longestWeekStreak([])).toBe(0);
  });

  it('awards successful week badges', () => {
    const weeks = (n: number, skipSecond = false) =>
      Array.from({ length: n }, (_, w) => w)
        .filter((w) => !(skipSecond && w === 1))
        .flatMap((w) => [0, 1, 2].map((d) => session(new Date(2026, 7, 31 + 7 * w + d, 17))));
    expect(earnedBadgeIds(state({ sessions: weeks(1) }))).toContain('semaine-or');
    expect(earnedBadgeIds(state({ sessions: weeks(4) }))).toContain('serie-4');
    expect(earnedBadgeIds(state({ sessions: weeks(5, true) }))).not.toContain('serie-4');
  });

  it('awards challenge badges', () => {
    const ids = earnedBadgeIds(state({
      results: [res('jongles', 50), res('tirs-pied-faible', 7), res('sprint-20m', 4.0), res('tirs-cadres', 10), res('arrets-gardien', 8)],
    }));
    expect(ids).toEqual(expect.arrayContaining(['jongles-50', 'pied-gauche', 'fusee', 'sniper', 'mur']));
  });

  it('requires bronze in every domain for touche-a-tout', () => {
    const three = [res('jongles', 10), res('passes-a-deux', 10), res('navette-5-10-5', 7.5)];
    expect(earnedBadgeIds(state({ results: three }))).not.toContain('touche-a-tout');
    expect(earnedBadgeIds(state({ results: [...three, res('arrets-gardien', 4)] }))).toContain('touche-a-tout');
  });

  it('requires gold on 5 challenges for collectionneur', () => {
    const golds = [res('jongles', 50), res('controles', 9), res('passes-a-deux', 20), res('tirs-cadres', 9)];
    expect(earnedBadgeIds(state({ results: golds }))).not.toContain('collectionneur');
    expect(earnedBadgeIds(state({ results: [...golds, res('navette-5-10-5', 6.2)] }))).toContain('collectionneur');
  });

  it('returns only new badges', () => {
    const now = new Date(2026, 8, 17, 18);
    const s = state({
      sessions: [session(new Date(2026, 8, 14))],
      results: [res('tirs-cadres', 10)],
      badges: [{ id: 'premier-pas', earnedAt: '2026-09-14T17:00:00.000Z' }],
    });
    expect(awardNewBadges(s, now)).toEqual([{ id: 'sniper', earnedAt: now.toISOString() }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/engine/badges.test.ts`
Expected: FAIL — cannot resolve `./badges`.

- [ ] **Step 3: Implement** — `src/engine/badges.ts`

```ts
import { CHALLENGES, getChallenge } from '../data/challenges';
import { ALL_DOMAINS, type AppState, type EarnedBadge } from '../storage/schema';
import { bestValue, reachedRank } from './tiers';
import { addDays, parseDateKey, toDateKey } from './week';
import { successfulWeeks } from './xp';

export interface BadgeFacts {
  sessionCount: number;
  weeks: string[];
  best: (challengeId: string) => number | null;
  rank: (challengeId: string) => number;
}

export function longestWeekStreak(weekKeys: string[]): number {
  const sorted = [...weekKeys].sort();
  let longest = 0;
  let current = 0;
  for (let i = 0; i < sorted.length; i++) {
    const follows = i > 0 && toDateKey(addDays(parseDateKey(sorted[i - 1]), 7)) === sorted[i];
    current = follows ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

export const BADGE_RULES: Record<string, (f: BadgeFacts) => boolean> = {
  'premier-pas': (f) => f.sessionCount >= 1,
  regulier: (f) => f.sessionCount >= 10,
  acharne: (f) => f.sessionCount >= 50,
  'semaine-or': (f) => f.weeks.length >= 1,
  'serie-4': (f) => longestWeekStreak(f.weeks) >= 4,
  'jongles-50': (f) => (f.best('jongles') ?? 0) >= 50,
  'pied-gauche': (f) => f.rank('jongles-pied-faible') >= 3 || f.rank('tirs-pied-faible') >= 3,
  fusee: (f) => f.rank('sprint-20m') >= 3,
  sniper: (f) => (f.best('tirs-cadres') ?? 0) >= 10,
  mur: (f) => f.rank('arrets-gardien') >= 3,
  'touche-a-tout': (f) =>
    ALL_DOMAINS.every((d) => CHALLENGES.some((c) => c.domain === d && f.rank(c.id) >= 1)),
  collectionneur: (f) => CHALLENGES.filter((c) => f.rank(c.id) >= 3).length >= 5,
};

function facts(state: Pick<AppState, 'sessions' | 'results'>): BadgeFacts {
  const best = (id: string) => {
    const ch = getChallenge(id);
    if (!ch) return null;
    return bestValue(ch, state.results.filter((r) => r.challengeId === id).map((r) => r.value));
  };
  const rank = (id: string) => {
    const ch = getChallenge(id);
    const b = best(id);
    return ch && b !== null ? reachedRank(ch, b) : 0;
  };
  return { sessionCount: state.sessions.length, weeks: successfulWeeks(state.sessions), best, rank };
}

export function earnedBadgeIds(state: Pick<AppState, 'sessions' | 'results'>): string[] {
  const f = facts(state);
  return Object.keys(BADGE_RULES).filter((id) => BADGE_RULES[id](f));
}

export function awardNewBadges(state: AppState, now: Date): EarnedBadge[] {
  const owned = new Set(state.badges.map((b) => b.id));
  return earnedBadgeIds(state)
    .filter((id) => !owned.has(id))
    .map((id) => ({ id, earnedAt: now.toISOString() }));
}
```

- [ ] **Step 4: Run tests and typecheck**

Run: `npm test` then `npm run typecheck`
Expected: all PASS; typecheck exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat: add badge rules"
```

---

### Task 8: Session builder

**Files:**
- Create: `src/engine/sessionBuilder.ts`
- Test: `src/engine/sessionBuilder.test.ts`

**Interfaces:**
- Consumes: `EXERCISES`, `getExercise` (`src/data/exercises.ts`); `CHALLENGES`, `getChallenge` (`src/data/challenges.ts`); `Exercise`, `Challenge` (`src/data/types.ts`); `ALL_DOMAINS`, `ChallengeResult`, `CompletedSession`, `Domain`, `Duration`, `Equipment`, `ExerciseKind`, `SessionItem`, `SessionPlan` (`src/storage/schema.ts`)
- Produces:
  - `type Rng = () => number`
  - `CHALLENGE_MIN = 5`, `SPLIT_BLOCK_MIN = 10`
  - `STRUCTURE: Record<Duration, { warmup: number; blocks: number; cooldown: number }>`
  - `splitMinutes(total: number, parts: number): number[]` — equal parts, remainder on the last
  - `interface BuildInput { durationMin: Duration; equipment: Equipment[]; history: CompletedSession[]; results: ChallengeResult[]; rng?: Rng; exercises?: Exercise[]; challenges?: Challenge[] }`
  - `buildSession(input: BuildInput): SessionPlan`

Algorithm (implements spec rules 1–6):
1. Keep only exercises/challenges whose equipment is all owned.
2. History sorted newest first. `lastSeen(domain)` = index of the newest session containing it, `Infinity` if never.
3. Gardien is allowed only if none of the 2 newest sessions contains gardien (so at most 1 in any 3 consecutive sessions).
4. Candidate domains = allowed domains having at least one exercise, sorted by `lastSeen` descending (stable → `ALL_DOMAINS` order breaks ties).
5. Block minutes = `duration − warmup − cooldown − CHALLENGE_MIN`, split over `STRUCTURE.blocks`. Walk candidates cyclically (at most `candidates × blocks` attempts); each attempt picks 2 exercises if that block's planned minutes ≥ `SPLIT_BLOCK_MIN`, else 1; empty picks are skipped. Minutes are then re-split over the blocks actually built.
6. Picking never reuses an exercise in the same session and prefers exercises absent from the newest session (fresh ones first, then the rest, each group shuffled with `rng`).
7. Challenge = among allowed challenges whose domain is a block domain, the one with the oldest last attempt (never attempted first; ties by `CHALLENGES` order); `null` if none.

- [ ] **Step 1: Write the failing test** — `src/engine/sessionBuilder.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { getChallenge } from '../data/challenges';
import { EXERCISES, getExercise } from '../data/exercises';
import { DURATIONS, type CompletedSession, type Domain, type Equipment, type SessionPlan } from '../storage/schema';
import { buildSession, CHALLENGE_MIN, splitMinutes, STRUCTURE } from './sessionBuilder';

const ALL: Equipment[] = ['ballon', 'plots', 'grand-espace'];
const zero = () => 0;

const blockItems = (p: SessionPlan) => p.items.filter((i) => i.domain !== 'echauffement' && i.domain !== 'retour-calme');
const blockDomains = (p: SessionPlan) => [...new Set(blockItems(p).map((i) => i.domain))];
const total = (p: SessionPlan) => p.items.reduce((s, i) => s + i.durationMin, 0);

const asHistory = (plan: SessionPlan, date: string): CompletedSession => ({
  id: date,
  date,
  plannedMin: plan.durationMin,
  items: plan.items.map((i) => ({ ...i, done: true })),
});

const fakeSession = (date: string, domains: Domain[]): CompletedSession => ({
  id: date,
  date,
  plannedMin: 30,
  items: domains.map((d) => ({ exerciseId: `x-${d}`, domain: d, durationMin: 8, done: true })),
});

describe('splitMinutes', () => {
  it('splits evenly with the remainder last', () => {
    expect(splitMinutes(17, 2)).toEqual([8, 9]);
    expect(splitMinutes(43, 4)).toEqual([10, 10, 10, 13]);
    expect(splitMinutes(5, 0)).toEqual([]);
  });
});

describe('buildSession', () => {
  it.each(DURATIONS)('builds a complete %i-minute session', (d) => {
    const plan = buildSession({ durationMin: d, equipment: ALL, history: [], results: [], rng: zero });
    expect(plan.durationMin).toBe(d);
    expect(total(plan) + CHALLENGE_MIN).toBe(d);
    expect(plan.items[0].domain).toBe('echauffement');
    expect(plan.items[0].durationMin).toBe(STRUCTURE[d].warmup);
    expect(plan.items.at(-1)!.domain).toBe('retour-calme');
    expect(blockDomains(plan)).toHaveLength(STRUCTURE[d].blocks);
    expect(plan.challengeId).not.toBeNull();
    expect(new Set(plan.items.map((i) => i.exerciseId)).size).toBe(plan.items.length);
  });

  it('only uses available equipment', () => {
    const plan = buildSession({ durationMin: 60, equipment: ['ballon'], history: [], results: [], rng: zero });
    for (const item of plan.items) {
      expect(getExercise(item.exerciseId)!.equipment.every((q) => q === 'ballon'), item.exerciseId).toBe(true);
    }
    expect(getChallenge(plan.challengeId!)!.equipment.every((q) => q === 'ballon')).toBe(true);
  });

  it('still works without any equipment', () => {
    const plan = buildSession({ durationMin: 30, equipment: [], history: [], results: [], rng: zero });
    expect(blockDomains(plan)).toEqual(['physique']);
    expect(plan.challengeId).toBeNull();
  });

  it('rotates to the least recently worked domains', () => {
    const history = [fakeSession('2026-09-16T17:00:00.000Z', ['technique', 'passes-tirs'])];
    const plan = buildSession({ durationMin: 30, equipment: ALL, history, results: [], rng: zero });
    expect(blockDomains(plan)).toEqual(['physique', 'gardien']);
  });

  it('keeps gardien to at most 1 session in 3', () => {
    const recent = [
      fakeSession('2026-09-16T17:00:00.000Z', ['technique']),
      fakeSession('2026-09-15T17:00:00.000Z', ['gardien']),
    ];
    const blocked = buildSession({ durationMin: 60, equipment: ALL, history: recent, results: [], rng: zero });
    expect(blockDomains(blocked)).not.toContain('gardien');

    const older = [...recent.slice(0, 1), fakeSession('2026-09-15T17:00:00.000Z', ['technique']), fakeSession('2026-09-14T17:00:00.000Z', ['gardien'])];
    const allowed = buildSession({ durationMin: 60, equipment: ALL, history: older, results: [], rng: zero });
    expect(blockDomains(allowed)).toContain('gardien');
  });

  it('avoids exercises from the previous session', () => {
    const first = buildSession({ durationMin: 45, equipment: ALL, history: [], results: [], rng: zero });
    const firstIds = new Set(first.items.map((i) => i.exerciseId));
    const second = buildSession({ durationMin: 45, equipment: ALL, history: [asHistory(first, '2026-09-16T17:00:00.000Z')], results: [], rng: zero });
    for (const item of second.items) expect(firstIds.has(item.exerciseId), item.exerciseId).toBe(false);
  });

  it('falls back when a domain has no exercises', () => {
    const exercises = EXERCISES.filter((e) => e.domain !== 'physique' && e.domain !== 'gardien');
    const plan = buildSession({ durationMin: 60, equipment: ALL, history: [], results: [], rng: zero, exercises });
    expect(blockDomains(plan).every((d) => d === 'technique' || d === 'passes-tirs')).toBe(true);
    expect(total(plan) + CHALLENGE_MIN).toBe(60);
  });

  it('picks the least recently attempted challenge of a session domain', () => {
    const results = [{ challengeId: 'jongles', date: '2026-09-16T18:00:00.000Z', value: 12 }];
    const plan = buildSession({ durationMin: 30, equipment: ALL, history: [], results, rng: zero });
    const ch = getChallenge(plan.challengeId!)!;
    expect(ch.id).not.toBe('jongles');
    expect(blockDomains(plan)).toContain(ch.domain);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/engine/sessionBuilder.test.ts`
Expected: FAIL — cannot resolve `./sessionBuilder`.

- [ ] **Step 3: Implement** — `src/engine/sessionBuilder.ts`

```ts
import { CHALLENGES } from '../data/challenges';
import { EXERCISES } from '../data/exercises';
import type { Challenge, Exercise } from '../data/types';
import {
  ALL_DOMAINS,
  type ChallengeResult,
  type CompletedSession,
  type Domain,
  type Duration,
  type Equipment,
  type ExerciseKind,
  type SessionItem,
  type SessionPlan,
} from '../storage/schema';

export type Rng = () => number;

export const CHALLENGE_MIN = 5;
export const SPLIT_BLOCK_MIN = 10;

export const STRUCTURE: Record<Duration, { warmup: number; blocks: number; cooldown: number }> = {
  30: { warmup: 5, blocks: 2, cooldown: 3 },
  45: { warmup: 5, blocks: 3, cooldown: 5 },
  60: { warmup: 7, blocks: 4, cooldown: 5 },
};

export interface BuildInput {
  durationMin: Duration;
  equipment: Equipment[];
  history: CompletedSession[];
  results: ChallengeResult[];
  rng?: Rng;
  exercises?: Exercise[];
  challenges?: Challenge[];
}

export function splitMinutes(total: number, parts: number): number[] {
  if (parts <= 0) return [];
  const base = Math.floor(total / parts);
  return Array.from({ length: parts }, (_, i) => (i === parts - 1 ? total - base * (parts - 1) : base));
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const hasEquipment = (needed: Equipment[], owned: Equipment[]) => needed.every((q) => owned.includes(q));

export function buildSession(input: BuildInput): SessionPlan {
  const rng = input.rng ?? Math.random;
  const structure = STRUCTURE[input.durationMin];
  const exercises = (input.exercises ?? EXERCISES).filter((e) => hasEquipment(e.equipment, input.equipment));
  const challenges = (input.challenges ?? CHALLENGES).filter((c) => hasEquipment(c.equipment, input.equipment));
  const history = [...input.history].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const lastIds = new Set(history[0]?.items.map((i) => i.exerciseId) ?? []);
  const used = new Set<string>();

  const pick = (kind: ExerciseKind, count: number): Exercise[] => {
    const pool = exercises.filter((e) => e.domain === kind && !used.has(e.id));
    const fresh = pool.filter((e) => !lastIds.has(e.id));
    const repeats = pool.filter((e) => lastIds.has(e.id));
    const chosen = [...shuffle(fresh, rng), ...shuffle(repeats, rng)].slice(0, count);
    chosen.forEach((e) => used.add(e.id));
    return chosen;
  };

  const lastSeen = (d: Domain) => {
    const i = history.findIndex((s) => s.items.some((it) => it.domain === d));
    return i === -1 ? Number.POSITIVE_INFINITY : i;
  };
  const gardienAllowed = !history.slice(0, 2).some((s) => s.items.some((i) => i.domain === 'gardien'));
  const candidates = ALL_DOMAINS.filter(
    (d) => (d !== 'gardien' || gardienAllowed) && exercises.some((e) => e.domain === d),
  ).sort((a, b) => {
    const la = lastSeen(a);
    const lb = lastSeen(b);
    return la === lb ? 0 : la > lb ? -1 : 1;
  });

  const blockTotal = input.durationMin - structure.warmup - structure.cooldown - CHALLENGE_MIN;
  const planned = splitMinutes(blockTotal, structure.blocks);
  const blocks: { domain: Domain; exercises: Exercise[] }[] = [];
  const maxAttempts = candidates.length * structure.blocks;
  for (let attempt = 0; attempt < maxAttempts && blocks.length < structure.blocks; attempt++) {
    const domain = candidates[attempt % candidates.length];
    const count = planned[blocks.length] >= SPLIT_BLOCK_MIN ? 2 : 1;
    const picked = pick(domain, count);
    if (picked.length > 0) blocks.push({ domain, exercises: picked });
  }

  const items: SessionItem[] = [];
  const warmup = pick('echauffement', 1)[0];
  if (warmup) items.push({ exerciseId: warmup.id, domain: 'echauffement', durationMin: structure.warmup });

  const blockMinutes = splitMinutes(blockTotal, blocks.length);
  blocks.forEach((block, i) => {
    splitMinutes(blockMinutes[i], block.exercises.length).forEach((minutes, j) => {
      items.push({ exerciseId: block.exercises[j].id, domain: block.domain, durationMin: minutes });
    });
  });

  const cooldown = pick('retour-calme', 1)[0];
  if (cooldown) items.push({ exerciseId: cooldown.id, domain: 'retour-calme', durationMin: structure.cooldown });

  const domains = new Set(blocks.map((b) => b.domain));
  const lastAttempt = (id: string) =>
    input.results.filter((r) => r.challengeId === id).reduce((latest, r) => (r.date > latest ? r.date : latest), '');
  const challenge =
    challenges
      .filter((c) => domains.has(c.domain))
      .map((c) => ({ c, last: lastAttempt(c.id) }))
      .sort((a, b) => (a.last < b.last ? -1 : a.last > b.last ? 1 : 0))[0]?.c ?? null;

  return { durationMin: input.durationMin, items, challengeId: challenge?.id ?? null };
}
```

- [ ] **Step 4: Run tests and typecheck**

Run: `npm test` then `npm run typecheck`
Expected: all PASS; typecheck exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat: build training sessions from history and equipment"
```

---

### Task 9: Persistent store

**Files:**
- Create: `src/storage/store.ts`
- Test: `src/storage/store.test.ts`

**Interfaces:**
- Consumes: `ALL_EQUIPMENT`, `DURATIONS`, `STATE_VERSION`, `initialState`, `AppState` (`src/storage/schema.ts`)
- Produces:
  - `interface KV { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }` (browser `localStorage` satisfies it)
  - `STORAGE_KEY = 'foot-training:state'`
  - `type LoadStatus = 'ok' | 'empty' | 'corrupt' | 'unavailable'`
  - `interface LoadResult { status: LoadStatus; state: AppState; corruptKey?: string }`
  - `MIGRATIONS: Record<number, (s: Record<string, unknown>) => Record<string, unknown>>` — `MIGRATIONS[n]` upgrades version n → n + 1 (empty for now)
  - `isAppState(x: unknown): x is AppState`
  - `migrate(raw: unknown): AppState` — throws `Error` with a French message
  - `loadState(kv: KV | null, now: Date): LoadResult`
  - `saveState(kv: KV | null, state: AppState): boolean`

- [ ] **Step 1: Write the failing test** — `src/storage/store.test.ts`

```ts
import { afterEach, describe, expect, it } from 'vitest';
import { initialState, type AppState } from './schema';
import { isAppState, loadState, migrate, MIGRATIONS, saveState, STORAGE_KEY, type KV } from './store';

class MemoryKV implements KV {
  data = new Map<string, string>();
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.data.set(k, v); }
  removeItem(k: string) { this.data.delete(k); }
}

const now = new Date('2026-09-17T10:00:00.000Z');

const sample = (): AppState => ({
  ...initialState(),
  profile: { name: 'Léo', avatar: '⚽', equipment: ['ballon', 'plots'] },
  sessions: [{ id: 's1', date: now.toISOString(), plannedMin: 30, items: [{ exerciseId: 'tech-feintes', domain: 'technique', durationMin: 8, done: true }] }],
  results: [{ challengeId: 'jongles', date: now.toISOString(), value: 12 }],
  badges: [{ id: 'premier-pas', earnedAt: now.toISOString() }],
});

describe('store', () => {
  afterEach(() => { delete MIGRATIONS[0]; });

  it('reports unavailable storage', () => {
    expect(loadState(null, now)).toEqual({ status: 'unavailable', state: initialState() });
    expect(saveState(null, initialState())).toBe(false);
  });

  it('starts empty', () => {
    expect(loadState(new MemoryKV(), now)).toEqual({ status: 'empty', state: initialState() });
  });

  it('round-trips a saved state', () => {
    const kv = new MemoryKV();
    expect(saveState(kv, sample())).toBe(true);
    expect(loadState(kv, now)).toEqual({ status: 'ok', state: sample() });
  });

  it('keeps a copy of corrupt data and starts fresh', () => {
    const kv = new MemoryKV();
    kv.setItem(STORAGE_KEY, '{nope');
    const result = loadState(kv, now);
    expect(result.status).toBe('corrupt');
    expect(result.state).toEqual(initialState());
    expect(kv.getItem(result.corruptKey!)).toBe('{nope');
    expect(kv.getItem(STORAGE_KEY)).toBeNull();
  });

  it('treats structurally invalid data as corrupt', () => {
    const kv = new MemoryKV();
    kv.setItem(STORAGE_KEY, JSON.stringify({ ...initialState(), sessions: 'oops' }));
    expect(loadState(kv, now).status).toBe('corrupt');
  });

  it('validates app states', () => {
    expect(isAppState(sample())).toBe(true);
    expect(isAppState({ ...sample(), results: [{ challengeId: 'jongles', date: 'x', value: 'douze' }] })).toBe(false);
    expect(isAppState({ ...sample(), profile: { name: 'Léo', avatar: '⚽', equipment: ['mur'] } })).toBe(false);
  });

  it('rejects newer versions', () => {
    expect(() => migrate({ ...sample(), version: 2 })).toThrow(/plus récente/);
  });

  it('applies migrations in order', () => {
    MIGRATIONS[0] = (s) => ({ ...s, version: 1, badges: [] });
    const migrated = migrate({ version: 0, profile: null, sessions: [], results: [] });
    expect(migrated).toEqual(initialState());
  });

  it('returns false when writing fails', () => {
    const kv = new MemoryKV();
    kv.setItem = () => { throw new Error('QuotaExceededError'); };
    expect(saveState(kv, sample())).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/storage/store.test.ts`
Expected: FAIL — cannot resolve `./store`.

- [ ] **Step 3: Implement** — `src/storage/store.ts`

```ts
import { ALL_EQUIPMENT, DURATIONS, initialState, STATE_VERSION, type AppState } from './schema';

export interface KV {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const STORAGE_KEY = 'foot-training:state';

export type LoadStatus = 'ok' | 'empty' | 'corrupt' | 'unavailable';

export interface LoadResult {
  status: LoadStatus;
  state: AppState;
  corruptKey?: string;
}

type Migration = (s: Record<string, unknown>) => Record<string, unknown>;

/** MIGRATIONS[n] upgrades a version-n state to version n + 1. */
export const MIGRATIONS: Record<number, Migration> = {};

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isStr = (x: unknown): x is string => typeof x === 'string';

export function isAppState(x: unknown): x is AppState {
  if (!isObj(x) || x.version !== STATE_VERSION) return false;
  const p = x.profile;
  const validProfile =
    p === null ||
    (isObj(p) && isStr(p.name) && isStr(p.avatar) && Array.isArray(p.equipment) &&
      p.equipment.every((e) => ALL_EQUIPMENT.includes(e as never)));
  if (!validProfile) return false;
  const validSessions =
    Array.isArray(x.sessions) &&
    x.sessions.every((s) => isObj(s) && isStr(s.id) && isStr(s.date) && DURATIONS.includes(s.plannedMin as never) && Array.isArray(s.items));
  if (!validSessions) return false;
  const validResults =
    Array.isArray(x.results) &&
    x.results.every((r) => isObj(r) && isStr(r.challengeId) && isStr(r.date) && typeof r.value === 'number' && Number.isFinite(r.value));
  if (!validResults) return false;
  const validBadges = Array.isArray(x.badges) && x.badges.every((b) => isObj(b) && isStr(b.id) && isStr(b.earnedAt));
  if (!validBadges) return false;
  if (x.lastBackupAt !== undefined && !isStr(x.lastBackupAt)) return false;
  if (x.inProgress !== undefined && !(isObj(x.inProgress) && isObj(x.inProgress.plan))) return false;
  return true;
}

export function migrate(raw: unknown): AppState {
  if (!isObj(raw) || typeof raw.version !== 'number') throw new Error('Données illisibles.');
  if (raw.version > STATE_VERSION) {
    throw new Error('Cette sauvegarde vient d’une version plus récente de l’application.');
  }
  let current = raw;
  for (let v = raw.version; v < STATE_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (!step) throw new Error(`Migration manquante depuis la version ${v}.`);
    current = step(current);
  }
  if (!isAppState(current)) throw new Error('Données invalides.');
  return current;
}

export function loadState(kv: KV | null, now: Date): LoadResult {
  if (!kv) return { status: 'unavailable', state: initialState() };
  const raw = kv.getItem(STORAGE_KEY);
  if (raw === null) return { status: 'empty', state: initialState() };
  try {
    return { status: 'ok', state: migrate(JSON.parse(raw)) };
  } catch {
    const corruptKey = `foot-training:corrupt-${now.toISOString().replace(/[:.]/g, '-')}`;
    kv.setItem(corruptKey, raw);
    kv.removeItem(STORAGE_KEY);
    return { status: 'corrupt', state: initialState(), corruptKey };
  }
}

export function saveState(kv: KV | null, state: AppState): boolean {
  if (!kv) return false;
  try {
    kv.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Run tests and typecheck**

Run: `npm test` then `npm run typecheck`
Expected: all PASS; typecheck exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/storage
git commit -m "feat: persist state with validation and migrations"
```

---

### Task 10: Backup export/import and reminder

**Files:**
- Create: `src/storage/backup.ts`
- Test: `src/storage/backup.test.ts`

**Interfaces:**
- Consumes: `migrate` (`src/storage/store.ts`); `toDateKey` (`src/engine/week.ts`); `AppState` (`src/storage/schema.ts`)
- Produces:
  - `BACKUP_REMINDER_DAYS = 30`, `BACKUP_REMINDER_MIN_SESSIONS = 5`
  - `exportFileName(now: Date): string` — `foot-training-YYYY-MM-DD.json`
  - `serializeBackup(state: AppState): string`
  - `type ImportResult = { ok: true; state: AppState } | { ok: false; error: string }`
  - `parseBackup(text: string): ImportResult`
  - `needsBackupReminder(state: AppState, now: Date): boolean`

- [ ] **Step 1: Write the failing test** — `src/storage/backup.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { exportFileName, needsBackupReminder, parseBackup, serializeBackup } from './backup';
import { initialState, type AppState, type CompletedSession } from './schema';

const now = new Date(2026, 8, 17, 10);

const sessions = (n: number): CompletedSession[] =>
  Array.from({ length: n }, (_, i) => ({ id: `s${i}`, date: new Date(2026, 8, i + 1).toISOString(), plannedMin: 30, items: [] }));

const withSessions = (n: number, lastBackupAt?: string): AppState => ({ ...initialState(), sessions: sessions(n), lastBackupAt });

describe('backup', () => {
  it('names export files by local date', () => {
    expect(exportFileName(now)).toBe('foot-training-2026-09-17.json');
  });

  it('round-trips a backup', () => {
    const state: AppState = { ...withSessions(2), profile: { name: 'Léo', avatar: '⚽', equipment: ['ballon'] } };
    expect(parseBackup(serializeBackup(state))).toEqual({ ok: true, state });
  });

  it('rejects files that are not JSON', () => {
    expect(parseBackup('hello')).toEqual({ ok: false, error: 'Ce fichier n’est pas une sauvegarde valide.' });
  });

  it('rejects JSON with the wrong shape', () => {
    const result = parseBackup(JSON.stringify({ version: 1, sessions: 3 }));
    expect(result.ok).toBe(false);
  });

  it('reminds to back up after 5 sessions when never or long ago', () => {
    expect(needsBackupReminder(withSessions(4), now)).toBe(false);
    expect(needsBackupReminder(withSessions(5), now)).toBe(true);
    expect(needsBackupReminder(withSessions(5, new Date(2026, 8, 7).toISOString()), now)).toBe(false);
    expect(needsBackupReminder(withSessions(5, new Date(2026, 7, 15).toISOString()), now)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/storage/backup.test.ts`
Expected: FAIL — cannot resolve `./backup`.

- [ ] **Step 3: Implement** — `src/storage/backup.ts`

```ts
import { toDateKey } from '../engine/week';
import type { AppState } from './schema';
import { migrate } from './store';

export const BACKUP_REMINDER_DAYS = 30;
export const BACKUP_REMINDER_MIN_SESSIONS = 5;
const DAY_MS = 86_400_000;

export function exportFileName(now: Date): string {
  return `foot-training-${toDateKey(now)}.json`;
}

export function serializeBackup(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export type ImportResult = { ok: true; state: AppState } | { ok: false; error: string };

export function parseBackup(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Ce fichier n’est pas une sauvegarde valide.' };
  }
  try {
    return { ok: true, state: migrate(raw) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Sauvegarde invalide.' };
  }
}

export function needsBackupReminder(state: AppState, now: Date): boolean {
  if (state.sessions.length < BACKUP_REMINDER_MIN_SESSIONS) return false;
  if (!state.lastBackupAt) return true;
  return now.getTime() - new Date(state.lastBackupAt).getTime() > BACKUP_REMINDER_DAYS * DAY_MS;
}
```

- [ ] **Step 4: Run tests and typecheck**

Run: `npm test` then `npm run typecheck`
Expected: all PASS; typecheck exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/storage
git commit -m "feat: add backup export, import and reminder"
```

---

### Task 11: State actions, app shell and onboarding

**Files:**
- Create: `src/ui/actions.ts`, `src/ui/useAppState.ts`, `src/ui/avatars.ts`, `src/ui/styles.css`, `src/ui/components/EquipmentPicker.tsx`, `src/ui/screens/Onboarding.tsx`
- Modify: `src/App.tsx` (full replacement), `src/main.tsx` (add CSS import)
- Test: `src/ui/actions.test.ts`

**Interfaces:**
- Consumes: `awardNewBadges` (engine/badges), `computeXp` (engine/xp), `levelFor` (engine/levels), `bestValue`, `isBetter` (engine/tiers), `getChallenge` (data/challenges), `loadState`, `saveState`, `KV`, `LoadStatus` (storage/store), schema types
- Produces (`src/ui/actions.ts`) — all pure, all return a new `AppState` (or the same object when nothing changes):
  - `RESUME_MAX_MS = 12 * 3_600_000`
  - `withBadges(s: AppState, now: Date): AppState`
  - `setProfile(s: AppState, profile: Profile): AppState`
  - `startSession(s: AppState, plan: SessionPlan, now: Date): AppState` — phase `'preview'`
  - `beginExercises(s: AppState): AppState` — phase `'exercises'`
  - `updateProgress(s: AppState, patch: Partial<InProgressSession>): AppState`
  - `completeCurrent(s: AppState, done: boolean): AppState` — marks current item, moves on; after the last item phase becomes `'challenge'`
  - `finishSession(s: AppState, now: Date, challengeValue: number | null): AppState`
  - `abandonSession(s: AppState): AppState`
  - `addResult(s: AppState, challengeId: string, value: number, now: Date): AppState`
  - `markBackup(s: AppState, now: Date): AppState`
  - `canResume(ip: InProgressSession, now: Date): boolean`
  - `interface ChangeSummary { xpGained: number; levelUp: string | null; newBadgeIds: string[]; newRecord: boolean }`
  - `summarizeChange(before: AppState, after: AppState, challengeId: string | null): ChangeSummary`
- Produces (`src/ui/useAppState.ts`): `getBrowserStorage(): KV | null`, `useAppState(): { state: AppState; update: (fn: (s: AppState) => AppState) => void; loadStatus: LoadStatus; saveFailed: boolean }`
- Produces (`src/ui/avatars.ts`): `AVATARS: string[]`
- Produces (`src/ui/components/EquipmentPicker.tsx`): `EquipmentPicker({ value, onChange }: { value: Equipment[]; onChange: (v: Equipment[]) => void })`
- Produces (`src/App.tsx`): a `renderTab()` switch whose cases later tasks replace one line at a time, and a `// SESSION_SCREEN` marker line replaced in Task 13.

- [ ] **Step 1: Write the failing test** — `src/ui/actions.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { initialState, type AppState, type SessionPlan } from '../storage/schema';
import {
  abandonSession, addResult, beginExercises, canResume, completeCurrent, finishSession, startSession, summarizeChange,
} from './actions';

const now = new Date('2026-09-17T16:00:00.000Z');
const later = (min: number) => new Date(now.getTime() + min * 60_000);

const plan: SessionPlan = {
  durationMin: 30,
  challengeId: 'jongles',
  items: [
    { exerciseId: 'ech-toe-taps', domain: 'echauffement', durationMin: 5 },
    { exerciseId: 'tech-feintes', domain: 'technique', durationMin: 17 },
    { exerciseId: 'calme-bilan', domain: 'retour-calme', durationMin: 3 },
  ],
};

const base = (): AppState => ({ ...initialState(), profile: { name: 'Léo', avatar: '⚽', equipment: ['ballon'] } });

function runThrough(s: AppState, flags: boolean[]): AppState {
  let cur = beginExercises(startSession(s, plan, now));
  for (const f of flags) cur = completeCurrent(cur, f);
  return cur;
}

describe('session actions', () => {
  it('starts in preview with the first timer loaded', () => {
    const ip = startSession(base(), plan, now).inProgress!;
    expect(ip).toEqual({ plan, phase: 'preview', currentIndex: 0, remainingSec: 300, done: [false, false, false], startedAt: now.toISOString() });
  });

  it('advances through exercises then to the challenge', () => {
    const mid = runThrough(base(), [true]);
    expect(mid.inProgress).toMatchObject({ phase: 'exercises', currentIndex: 1, remainingSec: 17 * 60, done: [true, false, false] });
    const end = runThrough(base(), [true, false, true]);
    expect(end.inProgress).toMatchObject({ phase: 'challenge', done: [true, false, true] });
  });

  it('ignores completeCurrent outside the exercises phase', () => {
    const s = startSession(base(), plan, now);
    expect(completeCurrent(s, true)).toBe(s);
  });

  it('finishes a session with its challenge result and badges', () => {
    const done = finishSession(runThrough(base(), [true, false, true]), later(40), 12);
    expect(done.inProgress).toBeUndefined();
    expect(done.sessions).toHaveLength(1);
    expect(done.sessions[0].items.map((i) => i.done)).toEqual([true, false, true]);
    expect(done.results).toEqual([{ challengeId: 'jongles', date: later(40).toISOString(), value: 12 }]);
    expect(done.badges.map((b) => b.id)).toEqual(['premier-pas']);
  });

  it('finishes without a result when the challenge is skipped', () => {
    expect(finishSession(runThrough(base(), [true, true, true]), later(40), null).results).toEqual([]);
  });

  it('abandons a session', () => {
    expect(abandonSession(startSession(base(), plan, now)).inProgress).toBeUndefined();
  });

  it('allows resuming for 12 hours', () => {
    const ip = startSession(base(), plan, now).inProgress!;
    expect(canResume(ip, later(11 * 60))).toBe(true);
    expect(canResume(ip, later(13 * 60))).toBe(false);
  });

  it('summarizes XP, level, badges and records', () => {
    const before = runThrough(base(), [true, false, true]);
    const after = finishSession(before, later(40), 12);
    // 8 done minutes + bronze 15
    expect(summarizeChange(before, after, 'jongles')).toEqual({ xpGained: 23, levelUp: null, newBadgeIds: ['premier-pas'], newRecord: false });
    const again = addResult(after, 'jongles', 300, later(60));
    const summary = summarizeChange(after, again, 'jongles');
    expect(summary.newRecord).toBe(true);
    expect(summary.levelUp).toBe('Espoir');
  });
});
```

(300 jongles: record +20, argent 25, or 40, Or+1…Or+10 10×40 → 485 XP total → Espoir.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/ui/actions.test.ts`
Expected: FAIL — cannot resolve `./actions`.

- [ ] **Step 3: Implement** — `src/ui/actions.ts`

```ts
import { getChallenge } from '../data/challenges';
import { awardNewBadges } from '../engine/badges';
import { levelFor } from '../engine/levels';
import { bestValue, isBetter } from '../engine/tiers';
import { computeXp } from '../engine/xp';
import type { AppState, CompletedSession, InProgressSession, Profile, SessionPlan } from '../storage/schema';

export const RESUME_MAX_MS = 12 * 3_600_000;

export function withBadges(s: AppState, now: Date): AppState {
  const fresh = awardNewBadges(s, now);
  return fresh.length ? { ...s, badges: [...s.badges, ...fresh] } : s;
}

export function setProfile(s: AppState, profile: Profile): AppState {
  return { ...s, profile };
}

export function startSession(s: AppState, plan: SessionPlan, now: Date): AppState {
  return {
    ...s,
    inProgress: {
      plan,
      phase: 'preview',
      currentIndex: 0,
      remainingSec: (plan.items[0]?.durationMin ?? 0) * 60,
      done: plan.items.map(() => false),
      startedAt: now.toISOString(),
    },
  };
}

export function updateProgress(s: AppState, patch: Partial<InProgressSession>): AppState {
  return s.inProgress ? { ...s, inProgress: { ...s.inProgress, ...patch } } : s;
}

export function beginExercises(s: AppState): AppState {
  return updateProgress(s, { phase: 'exercises' });
}

export function completeCurrent(s: AppState, done: boolean): AppState {
  const ip = s.inProgress;
  if (!ip || ip.phase !== 'exercises') return s;
  const flags = ip.done.map((d, i) => (i === ip.currentIndex ? done : d));
  const next = ip.currentIndex + 1;
  if (next >= ip.plan.items.length) {
    return { ...s, inProgress: { ...ip, done: flags, currentIndex: next, remainingSec: 0, phase: 'challenge' } };
  }
  return { ...s, inProgress: { ...ip, done: flags, currentIndex: next, remainingSec: ip.plan.items[next].durationMin * 60 } };
}

export function abandonSession(s: AppState): AppState {
  const { inProgress: _dropped, ...rest } = s;
  return rest;
}

export function finishSession(s: AppState, now: Date, challengeValue: number | null): AppState {
  const ip = s.inProgress;
  if (!ip) return s;
  const session: CompletedSession = {
    id: `s-${now.getTime().toString(36)}`,
    date: now.toISOString(),
    plannedMin: ip.plan.durationMin,
    items: ip.plan.items.map((item, i) => ({ ...item, done: ip.done[i] ?? false })),
  };
  const results =
    challengeValue !== null && ip.plan.challengeId
      ? [...s.results, { challengeId: ip.plan.challengeId, date: now.toISOString(), value: challengeValue }]
      : s.results;
  return withBadges({ ...abandonSession(s), sessions: [...s.sessions, session], results }, now);
}

export function addResult(s: AppState, challengeId: string, value: number, now: Date): AppState {
  return withBadges({ ...s, results: [...s.results, { challengeId, date: now.toISOString(), value }] }, now);
}

export function markBackup(s: AppState, now: Date): AppState {
  return { ...s, lastBackupAt: now.toISOString() };
}

export function canResume(ip: InProgressSession, now: Date): boolean {
  return now.getTime() - new Date(ip.startedAt).getTime() < RESUME_MAX_MS;
}

export interface ChangeSummary {
  xpGained: number;
  levelUp: string | null;
  newBadgeIds: string[];
  newRecord: boolean;
}

export function summarizeChange(before: AppState, after: AppState, challengeId: string | null): ChangeSummary {
  const xpBefore = computeXp(before).total;
  const xpAfter = computeXp(after).total;
  const levelBefore = levelFor(xpBefore);
  const levelAfter = levelFor(xpAfter);
  const owned = new Set(before.badges.map((b) => b.id));

  let newRecord = false;
  const ch = challengeId ? getChallenge(challengeId) : undefined;
  if (ch) {
    const valuesOf = (s: AppState) => s.results.filter((r) => r.challengeId === ch.id).map((r) => r.value);
    const prev = bestValue(ch, valuesOf(before));
    const next = bestValue(ch, valuesOf(after));
    newRecord = prev !== null && next !== null && isBetter(ch, next, prev);
  }

  return {
    xpGained: xpAfter - xpBefore,
    levelUp: levelAfter.index > levelBefore.index ? levelAfter.level.name : null,
    newBadgeIds: after.badges.filter((b) => !owned.has(b.id)).map((b) => b.id),
    newRecord,
  };
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/ui/actions.test.ts`
Expected: PASS.

- [ ] **Step 5: Create `src/ui/useAppState.ts`**

```ts
import { useCallback, useRef, useState } from 'react';
import type { AppState } from '../storage/schema';
import { loadState, saveState, type KV, type LoadStatus } from '../storage/store';

export function getBrowserStorage(): KV | null {
  try {
    const storage = window.localStorage;
    const probe = 'foot-training:probe';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function useAppState() {
  const [kv] = useState(getBrowserStorage);
  const [initial] = useState(() => loadState(kv, new Date()));
  const [state, setState] = useState<AppState>(initial.state);
  const [saveFailed, setSaveFailed] = useState(false);
  const current = useRef(initial.state);

  const update = useCallback(
    (fn: (s: AppState) => AppState) => {
      const next = fn(current.current);
      if (next === current.current) return;
      current.current = next;
      setSaveFailed(kv !== null && !saveState(kv, next));
      setState(next);
    },
    [kv],
  );

  return { state, update, loadStatus: initial.status as LoadStatus, saveFailed };
}
```

- [ ] **Step 6: Create `src/ui/avatars.ts`**

```ts
export const AVATARS = ['⚽', '🦁', '🐯', '🚀', '⚡', '🦅', '🐺', '🔥'];
```

- [ ] **Step 7: Create `src/ui/components/EquipmentPicker.tsx`**

```tsx
import { ALL_EQUIPMENT, EQUIPMENT_LABELS, type Equipment } from '../../storage/schema';

export default function EquipmentPicker({ value, onChange }: { value: Equipment[]; onChange: (v: Equipment[]) => void }) {
  const toggle = (e: Equipment) =>
    onChange(value.includes(e) ? value.filter((x) => x !== e) : ALL_EQUIPMENT.filter((x) => x === e || value.includes(x)));
  return (
    <div className="choice-list">
      {ALL_EQUIPMENT.map((e) => (
        <label key={e} className={`choice ${value.includes(e) ? 'selected' : ''}`}>
          <input type="checkbox" checked={value.includes(e)} onChange={() => toggle(e)} />
          {EQUIPMENT_LABELS[e]}
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Create `src/ui/screens/Onboarding.tsx`**

```tsx
import { useState } from 'react';
import type { Equipment, Profile } from '../../storage/schema';
import { AVATARS } from '../avatars';
import EquipmentPicker from '../components/EquipmentPicker';

export default function Onboarding({ onDone }: { onDone: (p: Profile) => void }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [equipment, setEquipment] = useState<Equipment[]>(['ballon']);

  return (
    <main className="screen">
      <h1>Bienvenue ! ⚽</h1>
      <label className="field">
        Ton prénom
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} autoFocus />
      </label>
      <h2>Ton avatar</h2>
      <div className="avatar-grid">
        {AVATARS.map((a) => (
          <button key={a} className={`avatar ${a === avatar ? 'selected' : ''}`} onClick={() => setAvatar(a)} aria-label={`Avatar ${a}`}>
            {a}
          </button>
        ))}
      </div>
      <h2>Ton matériel</h2>
      <EquipmentPicker value={equipment} onChange={setEquipment} />
      <button className="btn btn-primary" disabled={!name.trim()} onClick={() => onDone({ name: name.trim(), avatar, equipment })}>
        C’est parti !
      </button>
    </main>
  );
}
```

- [ ] **Step 9: Replace `src/App.tsx`**

```tsx
import { useState } from 'react';
import { setProfile } from './ui/actions';
import Onboarding from './ui/screens/Onboarding';
import { useAppState } from './ui/useAppState';

type Tab = 'home' | 'challenges' | 'progress' | 'settings';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Accueil', icon: '🏠' },
  { id: 'challenges', label: 'Défis', icon: '🎯' },
  { id: 'progress', label: 'Progrès', icon: '📈' },
  { id: 'settings', label: 'Réglages', icon: '⚙️' },
];

export default function App() {
  const { state, update, loadStatus, saveFailed } = useAppState();
  const [tab, setTab] = useState<Tab>('home');
  const [inSession, setInSession] = useState(false);
  const [corruptDismissed, setCorruptDismissed] = useState(false);

  const banners = (
    <>
      {(loadStatus === 'unavailable' || saveFailed) && (
        <div className="banner">⚠️ La progression ne peut pas être enregistrée sur ce téléphone (navigation privée ?).</div>
      )}
      {loadStatus === 'corrupt' && !corruptDismissed && (
        <div className="banner">
          Les données enregistrées étaient abîmées : une copie a été gardée et l’app repart de zéro. Tu peux importer une sauvegarde dans Réglages.{' '}
          <button className="link" onClick={() => setCorruptDismissed(true)}>OK</button>
        </div>
      )}
    </>
  );

  if (!state.profile) {
    return (
      <>
        {banners}
        <Onboarding onDone={(p) => update((s) => setProfile(s, p))} />
      </>
    );
  }

  // SESSION_SCREEN

  function renderTab() {
    switch (tab) {
      case 'home':
        return <p className="muted">Accueil</p>;
      case 'challenges':
        return <p className="muted">Défis</p>;
      case 'progress':
        return <p className="muted">Progrès</p>;
      case 'settings':
        return <p className="muted">Réglages</p>;
    }
  }

  return (
    <>
      {banners}
      <main className="screen with-tabs">{renderTab()}</main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={t.id === tab ? 'active' : ''} onClick={() => setTab(t.id)}>
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}
```

`inSession`/`setInSession` are wired in Tasks 12–13; the `// SESSION_SCREEN` comment line is replaced in Task 13.

- [ ] **Step 10: Create `src/ui/styles.css`**

```css
:root {
  --green: #15803d;
  --green-dark: #166534;
  --green-light: #dcfce7;
  --bg: #f6f7f4;
  --card: #ffffff;
  --text: #1c1917;
  --muted: #78716c;
  --border: #e7e5e4;
  --gold: #ca8a04;
  --silver: #71717a;
  --bronze: #b45309;
  --warn-bg: #fef3c7;
  --radius: 16px;
  color-scheme: light;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

* { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); color: var(--text); }
body { -webkit-tap-highlight-color: transparent; }
h1 { font-size: 1.6rem; margin: 0.5rem 0 1rem; }
h2 { font-size: 1.15rem; margin: 1.25rem 0 0.5rem; }
p { line-height: 1.45; }

.screen { max-width: 560px; margin: 0 auto; padding: 16px 16px 32px; }
.screen.with-tabs { padding-bottom: 96px; }
.muted { color: var(--muted); }
.row { display: flex; gap: 8px; align-items: center; }
.row.spread { justify-content: space-between; }
.stack { display: flex; flex-direction: column; gap: 12px; }

.card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 52px; padding: 0 20px; border-radius: 14px; border: 1px solid var(--border);
  background: var(--card); color: var(--text); font-size: 1.05rem; font-weight: 600; cursor: pointer; width: 100%;
}
.btn:disabled { opacity: 0.5; }
.btn-primary { background: var(--green); border-color: var(--green); color: #fff; }
.btn-primary:active { background: var(--green-dark); }
.btn-big { min-height: 72px; font-size: 1.3rem; }
.btn-danger { color: #b91c1c; }
.link { background: none; border: none; color: var(--green); font-weight: 600; padding: 8px; min-height: 48px; cursor: pointer; }

.field { display: flex; flex-direction: column; gap: 6px; font-weight: 600; margin-bottom: 12px; }
.field input { min-height: 52px; font-size: 1.1rem; padding: 0 14px; border: 1px solid var(--border); border-radius: 12px; }

.choice-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.choice { display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--card); }
.choice.selected { border-color: var(--green); background: var(--green-light); }
.choice input { width: 22px; height: 22px; accent-color: var(--green); }

.avatar-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 8px; }
.avatar { min-height: 64px; font-size: 2rem; border-radius: 14px; border: 2px solid var(--border); background: var(--card); }
.avatar.selected { border-color: var(--green); background: var(--green-light); }

.banner { background: var(--warn-bg); padding: 12px 16px; font-size: 0.95rem; }

.tabbar {
  position: fixed; bottom: 0; left: 0; right: 0; display: grid; grid-template-columns: repeat(4, 1fr);
  background: var(--card); border-top: 1px solid var(--border); padding-bottom: env(safe-area-inset-bottom);
}
.tabbar button {
  display: flex; flex-direction: column; align-items: center; gap: 2px; min-height: 64px;
  background: none; border: none; font-size: 0.8rem; color: var(--muted); cursor: pointer;
}
.tabbar button span { font-size: 1.4rem; }
.tabbar button.active { color: var(--green); font-weight: 700; }

.xpbar { height: 14px; border-radius: 999px; background: var(--border); overflow: hidden; }
.xpbar > div { height: 100%; background: var(--green); border-radius: 999px; transition: width 0.4s; }

.week-dots { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; text-align: center; font-size: 0.75rem; color: var(--muted); }
.week-dots .dot { width: 34px; height: 34px; margin: 4px auto 0; border-radius: 50%; border: 2px solid var(--border); display: grid; place-items: center; }
.week-dots .dot.on { background: var(--green); border-color: var(--green); color: #fff; }
.week-dots .dot.today { border-color: var(--green); }

.chip { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 0.8rem; font-weight: 700; background: var(--border); }
.chip.rank-1 { background: #fde7cf; color: var(--bronze); }
.chip.rank-2 { background: #e4e4e7; color: var(--silver); }
.chip.rank-3 { background: #fef08a; color: var(--gold); }

.timer { font-size: 4.5rem; font-weight: 800; text-align: center; font-variant-numeric: tabular-nums; margin: 12px 0; }
.timer.over { color: var(--green); }
.steps { padding-left: 1.2rem; font-size: 1.15rem; }
.steps li { margin-bottom: 8px; }
.tip { background: var(--green-light); border-radius: 12px; padding: 10px 14px; }
.progress-line { height: 6px; background: var(--border); border-radius: 999px; overflow: hidden; }
.progress-line > div { height: 100%; background: var(--green); }

.badge-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.badge { text-align: center; padding: 12px 6px; border-radius: 14px; background: var(--card); border: 1px solid var(--border); font-size: 0.8rem; }
.badge .emoji { font-size: 2rem; display: block; }
.badge.locked { opacity: 0.4; filter: grayscale(1); }

.celebrate { text-align: center; }
.celebrate .big { font-size: 4rem; }

.list-button { display: flex; justify-content: space-between; align-items: center; width: 100%; min-height: 64px; padding: 10px 14px; text-align: left; background: var(--card); border: 1px solid var(--border); border-radius: 14px; font-size: 1rem; cursor: pointer; }

.chart { width: 100%; height: auto; }
.chart .line { fill: none; stroke: var(--green); stroke-width: 3; }
.chart .point { fill: var(--green); }
.chart .goal { stroke: var(--gold); stroke-dasharray: 6 4; }
.chart text { font-size: 11px; fill: var(--muted); }

.bars .bar-row { display: grid; grid-template-columns: 110px 1fr 48px; gap: 8px; align-items: center; margin-bottom: 8px; font-size: 0.9rem; }
.bars .bar { height: 12px; background: var(--green); border-radius: 999px; }
```

- [ ] **Step 11: Import the stylesheet in `src/main.tsx`**

Add after `import App from './App';`:
```tsx
import './ui/styles.css';
```

- [ ] **Step 12: Verify**

Run: `npm test`, `npm run typecheck`, then `npm run dev` and open the printed URL in a mobile viewport (375×812).
Expected: tests and typecheck pass; onboarding shows; after entering a name and tapping « C’est parti ! », the tab bar appears; reloading the page keeps the profile (no onboarding).

- [ ] **Step 13: Commit**

```bash
git add src
git commit -m "feat: add state actions, app shell and onboarding"
```

---

### Task 12: Home screen

**Files:**
- Create: `src/engine/stats.ts`, `src/ui/components/XpBar.tsx`, `src/ui/components/WeekDots.tsx`, `src/ui/screens/Home.tsx`
- Modify: `src/App.tsx`
- Test: `src/engine/stats.test.ts`

**Interfaces:**
- Consumes: `computeXp` (engine/xp), `levelFor` (engine/levels), `addDays`, `startOfWeek`, `toDateKey` (engine/week), `needsBackupReminder` (storage/backup), `canResume`, `abandonSession`, `startSession` (ui/actions), `buildSession` (engine/sessionBuilder), `DURATIONS`, `Duration`, `AppState`, `CompletedSession` (storage/schema)
- Produces:
  - `interface DayActivity { dateKey: string; count: number; isToday: boolean }`
  - `weekActivity(sessions: CompletedSession[], now: Date): DayActivity[]` — 7 entries, Monday first
  - `XpBar({ progress }: { progress: number })` — progress 0..1
  - `WeekDots({ days }: { days: DayActivity[] })`
  - `Home(props: { state: AppState; onStart: (d: Duration) => void; onResume: () => void; onAbandon: () => void; onBackup: () => void })`

- [ ] **Step 1: Write the failing test** — `src/engine/stats.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import type { CompletedSession } from '../storage/schema';
import { weekActivity } from './stats';

const s = (d: Date): CompletedSession => ({ id: d.toISOString(), date: d.toISOString(), plannedMin: 30, items: [] });

describe('weekActivity', () => {
  it('counts sessions per day of the current week', () => {
    const now = new Date(2026, 8, 17, 12); // Thursday
    const sessions = [s(new Date(2026, 8, 13, 18)), s(new Date(2026, 8, 14, 18)), s(new Date(2026, 8, 17, 9)), s(new Date(2026, 8, 17, 18))];
    const days = weekActivity(sessions, now);
    expect(days.map((d) => d.dateKey)).toEqual(['2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20']);
    expect(days.map((d) => d.count)).toEqual([1, 0, 0, 2, 0, 0, 0]);
    expect(days.findIndex((d) => d.isToday)).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/engine/stats.test.ts`
Expected: FAIL — cannot resolve `./stats`.

- [ ] **Step 3: Implement** — `src/engine/stats.ts`

```ts
import type { CompletedSession } from '../storage/schema';
import { addDays, startOfWeek, toDateKey } from './week';

export interface DayActivity {
  dateKey: string;
  count: number;
  isToday: boolean;
}

export function weekActivity(sessions: CompletedSession[], now: Date): DayActivity[] {
  const monday = startOfWeek(now);
  const todayKey = toDateKey(now);
  const sessionKeys = sessions.map((s) => toDateKey(new Date(s.date)));
  return Array.from({ length: 7 }, (_, i) => {
    const dateKey = toDateKey(addDays(monday, i));
    return { dateKey, count: sessionKeys.filter((k) => k === dateKey).length, isToday: dateKey === todayKey };
  });
}
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 5: Create `src/ui/components/XpBar.tsx`**

```tsx
export default function XpBar({ progress }: { progress: number }) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <div className="xpbar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}
```

- [ ] **Step 6: Create `src/ui/components/WeekDots.tsx`**

```tsx
import type { DayActivity } from '../../engine/stats';

const LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function WeekDots({ days }: { days: DayActivity[] }) {
  return (
    <div className="week-dots">
      {days.map((d, i) => (
        <div key={d.dateKey}>
          {LETTERS[i]}
          <div className={`dot ${d.count > 0 ? 'on' : ''} ${d.isToday ? 'today' : ''}`}>{d.count > 0 ? '✓' : ''}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Create `src/ui/screens/Home.tsx`**

```tsx
import { levelFor } from '../../engine/levels';
import { weekActivity } from '../../engine/stats';
import { computeXp } from '../../engine/xp';
import { needsBackupReminder } from '../../storage/backup';
import { DURATIONS, type AppState, type Duration } from '../../storage/schema';
import { canResume } from '../actions';
import WeekDots from '../components/WeekDots';
import XpBar from '../components/XpBar';

interface Props {
  state: AppState;
  onStart: (d: Duration) => void;
  onResume: () => void;
  onAbandon: () => void;
  onBackup: () => void;
}

export default function Home({ state, onStart, onResume, onAbandon, onBackup }: Props) {
  const now = new Date();
  const xp = computeXp(state).total;
  const level = levelFor(xp);
  const days = weekActivity(state.sessions, now);
  const weekCount = days.reduce((sum, d) => sum + d.count, 0);
  const ip = state.inProgress;

  return (
    <div className="stack">
      <h1>
        {state.profile?.avatar} Salut {state.profile?.name} !
      </h1>

      <section className="card stack">
        <div className="row spread">
          <strong>
            {level.level.emoji} {level.level.name}
          </strong>
          <span className="muted">{xp} XP</span>
        </div>
        <XpBar progress={level.progress} />
        <span className="muted">
          {level.next ? `Encore ${level.next.minXp - xp} XP pour devenir ${level.next.name}` : 'Niveau maximum atteint, bravo !'}
        </span>
      </section>

      <section className="card stack">
        <strong>Cette semaine</strong>
        <WeekDots days={days} />
        <span className="muted">
          {weekCount >= 3 ? `Semaine réussie ! 🌟 (${weekCount} séances)` : `${weekCount} séance${weekCount > 1 ? 's' : ''} — objectif : 3 à 5`}
        </span>
      </section>

      {needsBackupReminder(state, now) && (
        <section className="card stack">
          <span>💾 Pense à sauvegarder ta progression.</span>
          <button className="btn" onClick={onBackup}>Sauvegarder</button>
        </section>
      )}

      {ip && canResume(ip, now) ? (
        <section className="card stack">
          <strong>Séance en cours ({ip.plan.durationMin} min)</strong>
          <button className="btn btn-primary btn-big" onClick={onResume}>▶ Reprendre</button>
          <button className="btn btn-danger" onClick={onAbandon}>Abandonner</button>
        </section>
      ) : ip ? (
        <section className="card stack">
          <span>Ta dernière séance n’a pas été terminée.</span>
          <button className="btn" onClick={onAbandon}>La laisser tomber</button>
        </section>
      ) : (
        <section className="stack">
          <h2>Commencer une séance</h2>
          {DURATIONS.map((d) => (
            <button key={d} className="btn btn-primary btn-big" onClick={() => onStart(d)}>
              ⚽ {d} minutes
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Wire Home in `src/App.tsx`**

Replace the import block at the top with:
```tsx
import { useState } from 'react';
import { buildSession } from './engine/sessionBuilder';
import type { Duration } from './storage/schema';
import { abandonSession, setProfile, startSession } from './ui/actions';
import Home from './ui/screens/Home';
import Onboarding from './ui/screens/Onboarding';
import { useAppState } from './ui/useAppState';
```

Replace the line `  // SESSION_SCREEN` with:
```tsx
  const startNew = (durationMin: Duration) => {
    update((s) =>
      startSession(s, buildSession({ durationMin, equipment: s.profile!.equipment, history: s.sessions, results: s.results }), new Date()),
    );
    setInSession(true);
  };

  // SESSION_SCREEN
```

Replace:
```tsx
        return <p className="muted">Accueil</p>;
```
with:
```tsx
        return (
          <Home
            state={state}
            onStart={startNew}
            onResume={() => setInSession(true)}
            onAbandon={() => update(abandonSession)}
            onBackup={() => setTab('settings')}
          />
        );
```

- [ ] **Step 9: Verify**

Run: `npm test`, `npm run typecheck`, then `npm run dev` (mobile viewport).
Expected: home shows level Poussin, 0 XP, 7 empty week dots and three duration buttons. Tapping « 30 minutes » swaps them for the « Séance en cours » card (the session screen arrives in Task 13); « Abandonner » brings the buttons back; a reload keeps whichever state was last shown.

- [ ] **Step 10: Commit**

```bash
git add src
git commit -m "feat: add home screen with level, week and session start"
```

---

### Task 13: Session screen (preview, timer, challenge, recap)

**Files:**
- Create: `src/ui/format.ts`, `src/ui/lib/sound.ts`, `src/ui/lib/wakeLock.ts`, `src/ui/useCountdown.ts`, `src/ui/components/ChallengeInput.tsx`, `src/ui/screens/Session.tsx`
- Modify: `src/App.tsx`
- Test: `src/ui/format.test.ts`

**Interfaces:**
- Consumes: `getExercise` (data/exercises), `getChallenge` (data/challenges), `getBadge` (data/badges), `bestValue`, `nextStep`, `isValidResultValue`, `isSuspiciousResult` (engine/tiers), `beginExercises`, `completeCurrent`, `updateProgress`, `abandonSession`, `finishSession`, `summarizeChange`, `ChangeSummary` (ui/actions), `DOMAIN_LABELS`, `EQUIPMENT_LABELS`, `ALL_EQUIPMENT` (storage/schema)
- Produces:
  - `formatValue(v: number): string` — French decimal (`4,5`)
  - `formatDate(iso: string): string` — e.g. `jeu. 17 sept.`
  - `beep(): void`, `unlockAudio(): void`
  - `useWakeLock(active: boolean): void`
  - `useCountdown(initialSec: number, onEnd: () => void): { remaining: number; running: boolean; start: () => void; pause: () => void }`
  - `ChallengeInput(props: { challenge: Challenge; best: number | null; onSubmit: (value: number) => void; submitLabel?: string })`
  - `SessionScreen(props: { state: AppState; update: (fn: (s: AppState) => AppState) => void; onExit: () => void })` (default export of `Session.tsx`)

- [ ] **Step 1: Write the failing test** — `src/ui/format.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { formatDate, formatValue } from './format';

describe('format', () => {
  it('formats values with a French decimal comma', () => {
    expect(formatValue(4.5)).toBe('4,5');
    expect(formatValue(50)).toBe('50');
  });

  it('formats dates in French', () => {
    expect(formatDate(new Date(2026, 8, 17, 12).toISOString())).toMatch(/17 sept/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/ui/format.test.ts`
Expected: FAIL — cannot resolve `./format`.

- [ ] **Step 3: Implement** — `src/ui/format.ts`

```ts
export function formatValue(v: number): string {
  return v.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 5: Create `src/ui/lib/sound.ts`**

```ts
let ctx: AudioContext | null = null;

/** Call from a user tap so iOS allows sound later. */
export function unlockAudio(): void {
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
  } catch {
    // audio not supported
  }
}

export function beep(): void {
  try {
    ctx ??= new AudioContext();
    const audio = ctx;
    const t = audio.currentTime;
    for (const offset of [0, 0.3, 0.6]) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.frequency.value = 880;
      gain.gain.value = 0.3;
      osc.connect(gain).connect(audio.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.18);
    }
  } catch {
    // audio not supported
  }
  navigator.vibrate?.([200, 100, 200]);
}
```

- [ ] **Step 6: Create `src/ui/lib/wakeLock.ts`**

```ts
import { useEffect } from 'react';

export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;
    const request = () =>
      navigator.wakeLock
        .request('screen')
        .then((s) => {
          if (cancelled) void s.release();
          else sentinel = s;
        })
        .catch(() => undefined);
    void request();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release();
    };
  }, [active]);
}
```

- [ ] **Step 7: Create `src/ui/useCountdown.ts`**

Uses a wall-clock end time so the timer stays correct if the phone throttles the page.

```ts
import { useEffect, useRef, useState } from 'react';

export function useCountdown(initialSec: number, onEnd: () => void) {
  const [remaining, setRemaining] = useState(initialSec);
  const [running, setRunning] = useState(false);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;
  const remainingRef = useRef(initialSec);
  remainingRef.current = remaining;

  useEffect(() => {
    if (!running) return;
    const endAt = Date.now() + remainingRef.current * 1000;
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        clearInterval(id);
        setRunning(false);
        onEndRef.current();
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  return {
    remaining,
    running,
    start: () => {
      if (remainingRef.current > 0) setRunning(true);
    },
    pause: () => setRunning(false),
  };
}
```

- [ ] **Step 8: Create `src/ui/components/ChallengeInput.tsx`**

```tsx
import { useState } from 'react';
import type { Challenge } from '../../data/types';
import { isSuspiciousResult, isValidResultValue, nextStep } from '../../engine/tiers';
import { formatValue } from '../format';

interface Props {
  challenge: Challenge;
  best: number | null;
  onSubmit: (value: number) => void;
  submitLabel?: string;
}

export default function ChallengeInput({ challenge, best, onSubmit, submitLabel = 'Enregistrer' }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const next = nextStep(challenge, best);

  const submit = () => {
    const value = Number(text.trim().replace(',', '.'));
    if (text.trim() === '' || !isValidResultValue(challenge, value)) {
      setError(
        challenge.better === 'lower'
          ? 'Entre un temps plus grand que 0 (par exemple 4,5).'
          : challenge.maxValue !== undefined
            ? `Entre un nombre entre 0 et ${challenge.maxValue}.`
            : 'Entre un nombre positif.',
      );
      return;
    }
    if (
      isSuspiciousResult(challenge, value, best) &&
      !window.confirm(`${formatValue(value)} ${challenge.unit} ? C’est beaucoup mieux que ton record (${formatValue(best!)}). Tu confirmes ?`)
    ) {
      return;
    }
    setError(null);
    setText('');
    onSubmit(value);
  };

  return (
    <div className="card stack">
      <div className="row spread">
        <span>
          Record : <strong>{best === null ? '—' : `${formatValue(best)} ${challenge.unit}`}</strong>
        </span>
        {next && (
          <span className="muted">
            {next.label} : {formatValue(next.value)} {challenge.unit}
          </span>
        )}
      </div>
      <label className="field">
        Ton résultat ({challenge.unit})
        <input inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      {error && (
        <p role="alert" className="btn-danger">
          {error}
        </p>
      )}
      <button className="btn btn-primary" onClick={submit}>
        {submitLabel}
      </button>
    </div>
  );
}
```

- [ ] **Step 9: Create `src/ui/screens/Session.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';
import { getBadge } from '../../data/badges';
import { getChallenge } from '../../data/challenges';
import { getExercise } from '../../data/exercises';
import { bestValue } from '../../engine/tiers';
import { ALL_EQUIPMENT, DOMAIN_LABELS, EQUIPMENT_LABELS, type AppState, type InProgressSession } from '../../storage/schema';
import {
  abandonSession, beginExercises, completeCurrent, finishSession, summarizeChange, updateProgress, type ChangeSummary,
} from '../actions';
import ChallengeInput from '../components/ChallengeInput';
import { beep, unlockAudio } from '../lib/sound';
import { useWakeLock } from '../lib/wakeLock';
import { useCountdown } from '../useCountdown';

type Update = (fn: (s: AppState) => AppState) => void;

interface Props {
  state: AppState;
  update: Update;
  onExit: () => void;
}

export default function SessionScreen({ state, update, onExit }: Props) {
  const [recap, setRecap] = useState<ChangeSummary | null>(null);
  const ip = state.inProgress;
  useWakeLock(ip?.phase === 'exercises');

  if (recap) return <Recap summary={recap} onClose={onExit} />;
  if (!ip) {
    return (
      <main className="screen stack">
        <p>Aucune séance en cours.</p>
        <button className="btn" onClick={onExit}>Retour</button>
      </main>
    );
  }

  const finish = (value: number | null) => {
    const after = finishSession(state, new Date(), value);
    setRecap(summarizeChange(state, after, value !== null ? ip.plan.challengeId : null));
    update(() => after);
  };

  if (ip.phase === 'preview') {
    return (
      <Preview
        ip={ip}
        onGo={() => {
          unlockAudio();
          update(beginExercises);
        }}
        onCancel={() => {
          update(abandonSession);
          onExit();
        }}
      />
    );
  }
  if (ip.phase === 'exercises') {
    return <ExerciseRunner key={ip.currentIndex} ip={ip} update={update} onPause={onExit} />;
  }
  return <ChallengePhase state={state} ip={ip} onFinish={finish} />;
}

function Preview({ ip, onGo, onCancel }: { ip: InProgressSession; onGo: () => void; onCancel: () => void }) {
  const challenge = ip.plan.challengeId ? getChallenge(ip.plan.challengeId) : undefined;
  const needed = new Set([
    ...ip.plan.items.flatMap((i) => getExercise(i.exerciseId)?.equipment ?? []),
    ...(challenge?.equipment ?? []),
  ]);
  return (
    <main className="screen stack">
      <h1>Séance de {ip.plan.durationMin} min</h1>
      {needed.size > 0 && (
        <p className="tip">
          À préparer : {ALL_EQUIPMENT.filter((e) => needed.has(e)).map((e) => EQUIPMENT_LABELS[e]).join(', ')}
        </p>
      )}
      <ol className="steps">
        {ip.plan.items.map((item) => (
          <li key={item.exerciseId}>
            <strong>{getExercise(item.exerciseId)?.name}</strong>{' '}
            <span className="muted">
              · {DOMAIN_LABELS[item.domain]} · {item.durationMin} min
            </span>
          </li>
        ))}
        {challenge && (
          <li>
            <strong>🎯 Défi : {challenge.name}</strong>
          </li>
        )}
      </ol>
      <button className="btn btn-primary btn-big" onClick={onGo}>C’est parti !</button>
      <button className="btn" onClick={onCancel}>Annuler</button>
    </main>
  );
}

function ExerciseRunner({ ip, update, onPause }: { ip: InProgressSession; update: Update; onPause: () => void }) {
  const item = ip.plan.items[ip.currentIndex];
  const exercise = getExercise(item.exerciseId);
  const [ended, setEnded] = useState(ip.remainingSec === 0);
  const timer = useCountdown(ip.remainingSec, () => {
    setEnded(true);
    beep();
  });

  const lastSaved = useRef(ip.remainingSec);
  useEffect(() => {
    if (!timer.running || Math.abs(lastSaved.current - timer.remaining) >= 10) {
      if (lastSaved.current === timer.remaining) return;
      lastSaved.current = timer.remaining;
      update((s) => updateProgress(s, { remainingSec: timer.remaining }));
    }
  }, [timer.remaining, timer.running, update]);

  const total = ip.plan.items.length;
  const minutes = Math.floor(timer.remaining / 60);
  const seconds = String(timer.remaining % 60).padStart(2, '0');

  return (
    <main className="screen stack">
      <div className="row spread muted">
        <span>{DOMAIN_LABELS[item.domain]}</span>
        <span>
          {ip.currentIndex + 1} / {total}
        </span>
        <button className="link" onClick={onPause}>Quitter</button>
      </div>
      <div className="progress-line">
        <div style={{ width: `${(ip.currentIndex / total) * 100}%` }} />
      </div>
      <h1>{exercise?.name ?? item.exerciseId}</h1>
      <div className={`timer ${ended ? 'over' : ''}`}>
        {minutes}:{seconds}
      </div>
      {ended ? (
        <p className="celebrate">⏰ Temps écoulé, passe à la suite !</p>
      ) : timer.running ? (
        <button className="btn" onClick={timer.pause}>⏸ Pause</button>
      ) : (
        <button className="btn btn-primary btn-big" onClick={timer.start}>
          ▶ {timer.remaining === item.durationMin * 60 ? 'Démarrer' : 'Reprendre'}
        </button>
      )}
      <ol className="steps">
        {exercise?.steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      {exercise?.tip && <p className="tip">💡 {exercise.tip}</p>}
      <button className="btn btn-primary btn-big" onClick={() => update((s) => completeCurrent(s, true))}>
        ✅ Exercice fait
      </button>
      <button className="btn" onClick={() => update((s) => completeCurrent(s, false))}>
        ⏭ Passer
      </button>
    </main>
  );
}

function ChallengePhase({ state, ip, onFinish }: { state: AppState; ip: InProgressSession; onFinish: (value: number | null) => void }) {
  const challenge = ip.plan.challengeId ? getChallenge(ip.plan.challengeId) : undefined;
  if (!challenge) {
    return (
      <main className="screen stack">
        <h1>Bravo ! 🎉</h1>
        <p>Pas de défi aujourd’hui.</p>
        <button className="btn btn-primary btn-big" onClick={() => onFinish(null)}>Terminer la séance</button>
      </main>
    );
  }
  const best = bestValue(challenge, state.results.filter((r) => r.challengeId === challenge.id).map((r) => r.value));
  return (
    <main className="screen stack">
      <p className="muted">🎯 Défi du jour</p>
      <h1>{challenge.name}</h1>
      <ol className="steps">
        {challenge.howTo.map((h) => <li key={h}>{h}</li>)}
      </ol>
      <ChallengeInput challenge={challenge} best={best} onSubmit={onFinish} submitLabel="Enregistrer et terminer" />
      <button className="link" onClick={() => onFinish(null)}>Passer le défi et terminer</button>
    </main>
  );
}

function Recap({ summary, onClose }: { summary: ChangeSummary; onClose: () => void }) {
  return (
    <main className="screen stack celebrate">
      <div className="big">{summary.levelUp ? '🏆' : '🎉'}</div>
      <h1>Séance terminée !</h1>
      <div className="timer over">+{summary.xpGained} XP</div>
      {summary.newRecord && <p className="card">🔥 Nouveau record !</p>}
      {summary.levelUp && (
        <p className="card">
          Nouveau niveau : <strong>{summary.levelUp}</strong> !
        </p>
      )}
      {summary.newBadgeIds.length > 0 && (
        <>
          <h2>Nouveaux badges</h2>
          <div className="badge-grid">
            {summary.newBadgeIds.map((id) => {
              const badge = getBadge(id);
              return (
                badge && (
                  <div key={id} className="badge">
                    <span className="emoji">{badge.emoji}</span>
                    {badge.name}
                  </div>
                )
              );
            })}
          </div>
        </>
      )}
      <button className="btn btn-primary btn-big" onClick={onClose}>Retour à l’accueil</button>
    </main>
  );
}
```

- [ ] **Step 10: Wire the session screen in `src/App.tsx`**

Add the import:
```tsx
import SessionScreen from './ui/screens/Session';
```

Replace the line `  // SESSION_SCREEN` with:
```tsx
  if (inSession) {
    return (
      <SessionScreen
        state={state}
        update={update}
        onExit={() => {
          setInSession(false);
          setTab('home');
        }}
      />
    );
  }
```

- [ ] **Step 11: Verify**

Run: `npm test`, `npm run typecheck`, then `npm run dev` (mobile viewport).
Expected, in order:
1. « 30 minutes » opens the preview: equipment to prepare, 4 exercises with minutes, the challenge.
2. « C’est parti ! » shows the first exercise with its timer at 5:00; « Démarrer » counts down; « Pause » stops it.
3. Reloading the page during an exercise, then « Reprendre » on home, returns to the same exercise with the saved remaining time (± 10 s).
4. « ✅ Exercice fait » / « ⏭ Passer » move on; after the last one the challenge screen appears.
5. Entering `abc` shows an error; entering a number shows the recap with XP and the « Premier pas » badge.
6. Home now shows the XP bar filled and today's dot checked.

To check the end-of-timer beep quickly: start a session and tap « C’est parti ! », tap « Quitter », then run in the browser console:
```js
const s = JSON.parse(localStorage.getItem('foot-training:state')); s.inProgress.remainingSec = 3; localStorage.setItem('foot-training:state', JSON.stringify(s)); location.reload();
```
Tap « Reprendre » on home, then « ▶ Reprendre » on the timer.
Expected: after 3 s a triple beep (plus vibration on a phone) and « ⏰ Temps écoulé, passe à la suite ! ».

- [ ] **Step 12: Commit**

```bash
git add src
git commit -m "feat: add guided session screen with timer, challenge and recap"
```

---

### Task 14: Challenges screen

**Files:**
- Create: `src/ui/components/ProgressChart.tsx`, `src/ui/screens/Challenges.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `CHALLENGES`, `getChallenge` (data/challenges), `getBadge` (data/badges), `bestValue`, `nextStep`, `rankLabel`, `reachedRank` (engine/tiers), `sortResults` (engine/xp), `addResult`, `summarizeChange`, `ChangeSummary` (ui/actions), `ChallengeInput` (Task 13), `formatValue`, `formatDate` (ui/format), `DOMAIN_LABELS`, `EQUIPMENT_LABELS`
- Produces:
  - `ProgressChart(props: { challenge: Challenge; results: ChallengeResult[] })` — SVG line of results over time with a dashed line at the next tier; for `lower` challenges the axis is inverted so improvement always goes up
  - `Challenges(props: { state: AppState; update: (fn: (s: AppState) => AppState) => void })`

- [ ] **Step 1: Create `src/ui/components/ProgressChart.tsx`**

```tsx
import type { Challenge } from '../../data/types';
import { bestValue, nextStep } from '../../engine/tiers';
import { sortResults } from '../../engine/xp';
import type { ChallengeResult } from '../../storage/schema';
import { formatDate, formatValue } from '../format';

const W = 320;
const H = 180;
const PAD = 30;

export default function ProgressChart({ challenge, results }: { challenge: Challenge; results: ChallengeResult[] }) {
  const points = sortResults(results);
  if (points.length < 2) {
    return <p className="muted">Fais ce défi au moins 2 fois pour voir ta courbe.</p>;
  }
  const best = bestValue(challenge, points.map((p) => p.value))!;
  const goal = nextStep(challenge, best);
  const values = [...points.map((p) => p.value), ...(goal ? [goal.value] : [])];
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const x = (i: number) => PAD + (i * (W - 2 * PAD)) / (points.length - 1);
  const ratio = (v: number) => (v - min) / (max - min);
  const y = (v: number) => (challenge.better === 'higher' ? H - PAD - ratio(v) * (H - 2 * PAD) : PAD + ratio(v) * (H - 2 * PAD));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Progression : ${challenge.name}`}>
      {goal && (
        <>
          <line className="goal" x1={PAD} x2={W - PAD} y1={y(goal.value)} y2={y(goal.value)} />
          <text x={W - PAD} y={y(goal.value) - 5} textAnchor="end">
            {goal.label} {formatValue(goal.value)}
          </text>
        </>
      )}
      <path className="line" d={path} />
      {points.map((p, i) => (
        <circle key={`${p.date}-${i}`} className="point" cx={x(i)} cy={y(p.value)} r={4} />
      ))}
      <text x={2} y={y(max) + 4}>{formatValue(max)}</text>
      <text x={2} y={y(min) + 4}>{formatValue(min)}</text>
      <text x={PAD} y={H - 6}>{formatDate(points[0].date)}</text>
      <text x={W - PAD} y={H - 6} textAnchor="end">
        {formatDate(points[points.length - 1].date)}
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Create `src/ui/screens/Challenges.tsx`**

```tsx
import { useState } from 'react';
import { getBadge } from '../../data/badges';
import { CHALLENGES, getChallenge } from '../../data/challenges';
import { bestValue, rankLabel, reachedRank } from '../../engine/tiers';
import { DOMAIN_LABELS, EQUIPMENT_LABELS, type AppState } from '../../storage/schema';
import { addResult, summarizeChange, type ChangeSummary } from '../actions';
import ChallengeInput from '../components/ChallengeInput';
import ProgressChart from '../components/ProgressChart';
import { formatValue } from '../format';

interface Props {
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
}

function resultMessage(summary: ChangeSummary): string {
  const parts = [summary.newRecord ? '🔥 Nouveau record !' : '✅ Résultat enregistré.'];
  if (summary.xpGained > 0) parts.push(`+${summary.xpGained} XP`);
  if (summary.levelUp) parts.push(`🏆 Nouveau niveau : ${summary.levelUp} !`);
  for (const id of summary.newBadgeIds) {
    const badge = getBadge(id);
    if (badge) parts.push(`${badge.emoji} Badge « ${badge.name} »`);
  }
  return parts.join(' · ');
}

function RankChip({ rank }: { rank: number }) {
  if (rank === 0) return null;
  return <span className={`chip rank-${Math.min(rank, 3)}`}>{rankLabel(rank)}</span>;
}

export default function Challenges({ state, update }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const valuesOf = (id: string) => state.results.filter((r) => r.challengeId === id);
  const selected = selectedId ? getChallenge(selectedId) : undefined;

  if (selected) {
    const results = valuesOf(selected.id);
    const best = bestValue(selected, results.map((r) => r.value));
    const rank = best === null ? 0 : reachedRank(selected, best);
    const owned = state.profile?.equipment ?? [];
    const missing = selected.equipment.filter((e) => !owned.includes(e));

    return (
      <div className="stack">
        <button className="link" onClick={() => { setSelectedId(null); setMessage(null); }}>
          ← Tous les défis
        </button>
        <h1>{selected.name}</h1>
        <div className="row">
          <span className="chip">{DOMAIN_LABELS[selected.domain]}</span>
          <RankChip rank={rank} />
        </div>
        {missing.length > 0 && <p className="banner">Il te faut : {missing.map((e) => EQUIPMENT_LABELS[e]).join(', ')}.</p>}
        <ol className="steps">
          {selected.howTo.map((h) => <li key={h}>{h}</li>)}
        </ol>
        {message && <p className="card">{message}</p>}
        <ChallengeInput
          challenge={selected}
          best={best}
          onSubmit={(value) => {
            const after = addResult(state, selected.id, value, new Date());
            setMessage(resultMessage(summarizeChange(state, after, selected.id)));
            update(() => after);
          }}
        />
        <h2>Ma progression</h2>
        <ProgressChart challenge={selected} results={results} />
      </div>
    );
  }

  return (
    <div className="stack">
      <h1>Défis 🎯</h1>
      {CHALLENGES.map((c) => {
        const best = bestValue(c, valuesOf(c.id).map((r) => r.value));
        return (
          <button key={c.id} className="list-button" onClick={() => setSelectedId(c.id)}>
            <span>
              <strong>{c.name}</strong>
              <br />
              <span className="muted">
                {DOMAIN_LABELS[c.domain]} · record : {best === null ? '—' : `${formatValue(best)} ${c.unit}`}
              </span>
            </span>
            <RankChip rank={best === null ? 0 : reachedRank(c, best)} />
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Wire it in `src/App.tsx`**

Add the import:
```tsx
import Challenges from './ui/screens/Challenges';
```

Replace:
```tsx
        return <p className="muted">Défis</p>;
```
with:
```tsx
        return <Challenges state={state} update={update} />;
```

- [ ] **Step 4: Verify**

Run: `npm test`, `npm run typecheck`, then `npm run dev` (mobile viewport).
Expected:
1. « Défis » lists 10 challenges with record « — ».
2. Open « Jongles d’affilée », enter `12` → message « ✅ Résultat enregistré. · +15 XP », Bronze chip, next goal « Argent : 25 ».
3. Enter `8` → « ✅ Résultat enregistré. » with no XP; enter `30` → « 🔥 Nouveau record ! · +45 XP »; the chart shows 3 points and a dashed « Or 50 » line.
4. Enter `200` → confirmation dialog; cancelling records nothing.
5. « Sprint 20 m »: enter `5` then `4,6` → the curve goes up (inverted axis).

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat: add challenges screen with results and progress chart"
```

---

### Task 15: Progress screen

**Files:**
- Modify: `src/engine/stats.ts`, `src/engine/stats.test.ts`, `src/App.tsx`
- Create: `src/ui/screens/Progress.tsx`

**Interfaces:**
- Consumes: `BADGES` (data/badges), `getExercise` (data/exercises), `computeXp`, `sessionMinutes` (engine/xp), `levelFor` (engine/levels), `startOfWeek`, `addDays` (engine/week), `formatDate` (ui/format), `ALL_DOMAINS`, `DOMAIN_LABELS`
- Produces:
  - `minutesByDomain(sessions: CompletedSession[], now: Date, weeks?: number): Record<Domain, number>` — done minutes per domain since the Monday `weeks − 1` weeks before the current one (default 4); warmups and cooldowns are ignored
  - `Progress(props: { state: AppState })`

- [ ] **Step 1: Add the failing test** — append to `src/engine/stats.test.ts`

Change the import line to:
```ts
import { minutesByDomain, weekActivity } from './stats';
```
Then append:
```ts
describe('minutesByDomain', () => {
  it('sums done minutes per domain over the last 4 weeks', () => {
    const now = new Date(2026, 8, 17, 12); // Thursday; window starts Monday 2026-08-24
    const make = (d: Date, items: CompletedSession['items']): CompletedSession => ({ id: d.toISOString(), date: d.toISOString(), plannedMin: 30, items });
    const sessions = [
      make(new Date(2026, 7, 23, 18), [{ exerciseId: 'a', domain: 'technique', durationMin: 50, done: true }]),
      make(new Date(2026, 7, 24, 18), [
        { exerciseId: 'b', domain: 'technique', durationMin: 10, done: true },
        { exerciseId: 'c', domain: 'echauffement', durationMin: 5, done: true },
      ]),
      make(new Date(2026, 8, 16, 18), [
        { exerciseId: 'd', domain: 'gardien', durationMin: 8, done: true },
        { exerciseId: 'e', domain: 'physique', durationMin: 6, done: false },
      ]),
    ];
    expect(minutesByDomain(sessions, now)).toEqual({ technique: 10, 'passes-tirs': 0, physique: 0, gardien: 8 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/engine/stats.test.ts`
Expected: FAIL — `minutesByDomain` is not exported.

- [ ] **Step 3: Implement** — edit `src/engine/stats.ts`

Change the imports to:
```ts
import { ALL_DOMAINS, type CompletedSession, type Domain } from '../storage/schema';
import { addDays, startOfWeek, toDateKey } from './week';
```
Append:
```ts
export function minutesByDomain(sessions: CompletedSession[], now: Date, weeks = 4): Record<Domain, number> {
  const from = addDays(startOfWeek(now), -7 * (weeks - 1)).getTime();
  const totals = Object.fromEntries(ALL_DOMAINS.map((d) => [d, 0])) as Record<Domain, number>;
  for (const s of sessions) {
    if (new Date(s.date).getTime() < from) continue;
    for (const item of s.items) {
      if (item.done && (ALL_DOMAINS as string[]).includes(item.domain)) {
        totals[item.domain as Domain] += item.durationMin;
      }
    }
  }
  return totals;
}
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 5: Create `src/ui/screens/Progress.tsx`**

```tsx
import { BADGES } from '../../data/badges';
import { getExercise } from '../../data/exercises';
import { levelFor } from '../../engine/levels';
import { minutesByDomain } from '../../engine/stats';
import { computeXp, sessionMinutes } from '../../engine/xp';
import { ALL_DOMAINS, DOMAIN_LABELS, type AppState } from '../../storage/schema';
import { formatDate } from '../format';

export default function Progress({ state }: { state: AppState }) {
  const xp = computeXp(state);
  const level = levelFor(xp.total);
  const earned = new Map(state.badges.map((b) => [b.id, b.earnedAt]));
  const minutes = minutesByDomain(state.sessions, new Date());
  const maxMinutes = Math.max(1, ...Object.values(minutes));
  const history = [...state.sessions].reverse().slice(0, 20);

  return (
    <div className="stack">
      <h1>Progrès 📈</h1>

      <section className="card stack">
        <strong>
          {level.level.emoji} {level.level.name} · {xp.total} XP
        </strong>
        <span className="muted">
          Séances {xp.sessions} · Records {xp.records} · Paliers {xp.tiers} · Semaines réussies {xp.weeks}
        </span>
      </section>

      <h2>
        Badges ({earned.size}/{BADGES.length})
      </h2>
      <div className="badge-grid">
        {BADGES.map((b) => {
          const at = earned.get(b.id);
          return (
            <div key={b.id} className={`badge ${at ? '' : 'locked'}`} title={b.description}>
              <span className="emoji">{b.emoji}</span>
              <strong>{b.name}</strong>
              <br />
              <span className="muted">{at ? formatDate(at) : b.description}</span>
            </div>
          );
        })}
      </div>

      <h2>Minutes par domaine (4 semaines)</h2>
      <div className="card bars">
        {ALL_DOMAINS.map((d) => (
          <div key={d} className="bar-row">
            <span>{DOMAIN_LABELS[d]}</span>
            <div className="bar" style={{ width: `${(minutes[d] / maxMinutes) * 100}%` }} />
            <span>{minutes[d]} min</span>
          </div>
        ))}
      </div>

      <h2>Dernières séances</h2>
      {history.length === 0 && <p className="muted">Pas encore de séance. Lance-toi depuis l’accueil !</p>}
      {history.map((s) => {
        const domains = [...new Set(s.items.map((i) => i.domain).filter((d) => (ALL_DOMAINS as string[]).includes(d)))];
        return (
          <div key={s.id} className="card">
            <div className="row spread">
              <strong>{formatDate(s.date)}</strong>
              <span className="muted">
                {sessionMinutes(s)} / {s.plannedMin} min
              </span>
            </div>
            <span className="muted">
              {domains.map((d) => DOMAIN_LABELS[d]).join(' · ')} — {s.items.filter((i) => i.done).length} exercices faits
              {s.items.some((i) => !getExercise(i.exerciseId)) ? ' (dont des exercices supprimés)' : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: Wire it in `src/App.tsx`**

Add the import:
```tsx
import Progress from './ui/screens/Progress';
```
Replace:
```tsx
        return <p className="muted">Progrès</p>;
```
with:
```tsx
        return <Progress state={state} />;
```

- [ ] **Step 7: Verify**

Run: `npm test`, `npm run typecheck`, then `npm run dev` (mobile viewport).
Expected: after one finished session and a couple of challenge results, « Progrès » shows the XP breakdown, « Premier pas » unlocked with today's date, other badges greyed with their description, minute bars for the session's domains, and the session in the history.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "feat: add progress screen with badges, domain minutes and history"
```

---

### Task 16: Settings screen (profile, equipment, backup, reset)

**Files:**
- Create: `src/ui/lib/download.ts`, `src/ui/screens/Settings.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `exportFileName`, `serializeBackup`, `parseBackup` (storage/backup), `initialState`, `AppState` (storage/schema), `markBackup`, `setProfile` (ui/actions), `AVATARS` (ui/avatars), `EquipmentPicker` (Task 11), `formatDate` (ui/format)
- Produces:
  - `downloadText(filename: string, text: string): void`
  - `Settings(props: { state: AppState; update: (fn: (s: AppState) => AppState) => void })`

- [ ] **Step 1: Create `src/ui/lib/download.ts`**

```ts
export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
```

- [ ] **Step 2: Create `src/ui/screens/Settings.tsx`**

```tsx
import { useRef, useState } from 'react';
import { exportFileName, parseBackup, serializeBackup } from '../../storage/backup';
import { initialState, type AppState } from '../../storage/schema';
import { markBackup, setProfile } from '../actions';
import { AVATARS } from '../avatars';
import EquipmentPicker from '../components/EquipmentPicker';
import { formatDate } from '../format';
import { downloadText } from '../lib/download';

interface Props {
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
}

export default function Settings({ state, update }: Props) {
  const profile = state.profile!;
  const [name, setName] = useState(profile.name);
  const [message, setMessage] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const exportBackup = () => {
    const now = new Date();
    downloadText(exportFileName(now), serializeBackup(markBackup(state, now)));
    update((s) => markBackup(s, now));
    setMessage('💾 Sauvegarde téléchargée. Garde ce fichier en lieu sûr (Drive, e-mail…).');
  };

  const importBackup = async (file: File) => {
    const result = parseBackup(await file.text());
    if (!result.ok) {
      setMessage(`❌ ${result.error}`);
      return;
    }
    if (!window.confirm('Remplacer toutes les données actuelles par cette sauvegarde ?')) return;
    update(() => result.state);
    setName(result.state.profile?.name ?? '');
    setMessage('✅ Sauvegarde restaurée.');
  };

  const reset = () => {
    if (!window.confirm('Effacer toute la progression ? Cette action est définitive.')) return;
    if (!window.confirm('Vraiment tout effacer ? Pense à exporter une sauvegarde avant.')) return;
    update(() => initialState());
  };

  return (
    <div className="stack">
      <h1>Réglages ⚙️</h1>
      {message && <p className="card">{message}</p>}

      <h2>Profil</h2>
      <label className="field">
        Prénom
        <input value={name} maxLength={20} onChange={(e) => setName(e.target.value)} />
      </label>
      <button
        className="btn"
        disabled={!name.trim() || name.trim() === profile.name}
        onClick={() => update((s) => setProfile(s, { ...profile, name: name.trim() }))}
      >
        Enregistrer le prénom
      </button>
      <div className="avatar-grid">
        {AVATARS.map((a) => (
          <button
            key={a}
            className={`avatar ${a === profile.avatar ? 'selected' : ''}`}
            aria-label={`Avatar ${a}`}
            onClick={() => update((s) => setProfile(s, { ...profile, avatar: a }))}
          >
            {a}
          </button>
        ))}
      </div>

      <h2>Matériel disponible</h2>
      <p className="muted">Les séances et les défis ne proposent que ce que tu peux faire avec ce matériel.</p>
      <EquipmentPicker value={profile.equipment} onChange={(equipment) => update((s) => setProfile(s, { ...profile, equipment }))} />

      <h2>Sauvegarde</h2>
      <p className="muted">
        {state.lastBackupAt ? `Dernière sauvegarde : ${formatDate(state.lastBackupAt)}` : 'Aucune sauvegarde pour l’instant.'}
      </p>
      <button className="btn btn-primary" onClick={exportBackup}>Exporter la sauvegarde</button>
      <button className="btn" onClick={() => fileInput.current?.click()}>Importer une sauvegarde</button>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void importBackup(file);
        }}
      />

      <h2>Zone dangereuse</h2>
      <button className="btn btn-danger" onClick={reset}>Tout effacer</button>
    </div>
  );
}
```

- [ ] **Step 3: Wire it in `src/App.tsx`**

Add the import:
```tsx
import Settings from './ui/screens/Settings';
```
Replace:
```tsx
        return <p className="muted">Réglages</p>;
```
with:
```tsx
        return <Settings state={state} update={update} />;
```

- [ ] **Step 4: Verify**

Run: `npm test`, `npm run typecheck`, then `npm run dev` (mobile viewport).
Expected:
1. Renaming and picking another avatar updates the home header.
2. Unchecking « Plots » then starting a 60-minute session: the preview lists no exercise needing plots.
3. « Exporter la sauvegarde » downloads `foot-training-AAAA-MM-JJ.json`; « Dernière sauvegarde » shows today.
4. « Tout effacer » (confirm twice) returns to onboarding. « Importer une sauvegarde » on the exported file (confirm) restores name, sessions and badges.
5. Importing any other `.json` (e.g. `package.json`) shows « ❌ Données illisibles. » and changes nothing.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat: add settings screen with profile, equipment, backup and reset"
```

---

### Task 17: Installable offline PWA and GitHub Pages deployment

**Files:**
- Create: `public/icon.svg`, `pwa-assets.config.ts`, `.github/workflows/deploy.yml`, `README.md`
- Modify: `package.json` (script), `vite.config.ts`, `tsconfig.json`, `index.html`
- Generated: `public/favicon.ico`, `public/pwa-64x64.png`, `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/maskable-icon-512x512.png`, `public/apple-touch-icon-180x180.png`

**Interfaces:**
- Consumes: the built app
- Produces: `dist/` containing `manifest.webmanifest` and `sw.js` that pre-caches every asset

- [ ] **Step 1: Install PWA tooling**

Run:
```bash
npm install -D vite-plugin-pwa @vite-pwa/assets-generator
```
Expected: no `ERR!`.

- [ ] **Step 2: Create `public/icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#15803d"/>
  <circle cx="256" cy="256" r="170" fill="#ffffff" stroke="#1c1917" stroke-width="14"/>
  <polygon points="256,186 322,234 297,312 215,312 190,234" fill="#1c1917"/>
  <path d="M256 186V100M322 234l82-27M297 312l50 70M215 312l-50 70M190 234l-82-27" stroke="#1c1917" stroke-width="14" fill="none"/>
</svg>
```

- [ ] **Step 3: Create `pwa-assets.config.ts` and generate icons**

```ts
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/icon.svg'],
});
```

Add to `package.json` `scripts`:
```json
"generate-pwa-assets": "pwa-assets-generator"
```

Run: `npm run generate-pwa-assets`
Expected: the 6 generated files listed above appear in `public/`.

- [ ] **Step 4: Configure the plugin** — replace `vite.config.ts`

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icon.svg'],
      manifest: {
        name: 'Foot Training',
        short_name: 'Foot',
        description: 'Entraînement de foot pour progresser en s’amusant',
        lang: 'fr',
        theme_color: '#15803d',
        background_color: '#f6f7f4',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
```

In `tsconfig.json`, change `"include"` to:
```json
"include": ["src", "vite.config.ts", "pwa-assets.config.ts"]
```

- [ ] **Step 5: Add icons to `index.html`**

Inside `<head>`, after the `theme-color` meta, add:
```html
    <link rel="icon" href="/favicon.ico" sizes="48x48" />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Foot" />
```

- [ ] **Step 6: Verify the offline build**

Run: `npm test`, `npm run typecheck`, `npm run build`
Expected: all pass; `dist/manifest.webmanifest` and `dist/sw.js` exist.

Run: `npm run preview` and open the URL in Chrome.
Expected:
1. DevTools → Application → Manifest: name « Foot Training », icons shown, no installability errors.
2. Application → Service workers: `sw.js` activated.
3. Network → « Offline », reload: the app still loads with its data.

- [ ] **Step 7: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

- [ ] **Step 8: Create `README.md`**

```markdown
# Foot Training ⚽

Application d'entraînement de foot pour enfant : séances guidées, défis chiffrés, XP, niveaux et badges.
Fonctionne hors-ligne ; les données restent sur le téléphone (pensez à exporter une sauvegarde).

## Développement

    npm install
    npm run dev        # serveur local (accessible depuis le téléphone sur le même Wi-Fi)
    npm test           # tests unitaires
    npm run typecheck
    npm run build

Le contenu (exercices, défis, badges, niveaux) se modifie dans `src/data/`.

## Mise en ligne (GitHub Pages)

1. Créer un dépôt GitHub et y pousser la branche `main`.
2. Settings → Pages → Source : « GitHub Actions ».
3. Chaque push sur `main` déploie l'app sur `https://<utilisateur>.github.io/<dépôt>/`.

## Installation sur le téléphone

- Android (Chrome) : ouvrir l'adresse → menu ⋮ → « Installer l'application ».
- iPhone (Safari) : ouvrir l'adresse → bouton Partager → « Sur l'écran d'accueil ».
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: make the app an installable offline PWA with Pages deploy"
```

- [ ] **Step 10: Publish (requires the user's go-ahead — creates a public GitHub repository)**

Ask the user before doing any of this. With approval:
```bash
git branch -M main
gh repo create foot-training --public --source . --push
```
Then in the GitHub repo: Settings → Pages → Source « GitHub Actions », and wait for the « Deploy to GitHub Pages » workflow to succeed.

- [ ] **Step 11: Final manual check on the phone**

On the real phone, at the Pages URL:
1. Install the app on the home screen and open it from the icon (no browser bar).
2. Complete the onboarding, run a full 30-minute session (timer, beep, skip one exercise, challenge, recap).
3. Switch to airplane mode, close and reopen the app: it opens and the data is still there.
4. Export a backup from Réglages and check the file is saved.

---

## Spec coverage

| Spec section | Task(s) |
|---|---|
| PWA, offline, hosting | 1, 17 |
| Architecture & data model | 2, 9 |
| 40 exercises, 10 challenges, tiers + Or+n | 3, 4, 5 |
| Session composition rules 1–6 | 8 |
| XP, levels, badges | 2, 6, 7 |
| Home (level, week, start/resume) | 12 |
| Session screen (preview, timer, beep/vibration, skip, challenge, recap, wake lock, resume 12 h) | 11, 13 |
| Challenges screen (records, chart, entry outside sessions, suspicious-value confirmation) | 5, 14 |
| Progress screen (badges, history, minutes per domain) | 15 |
| Settings (profile, equipment, export/import, reset with double confirmation) | 16 |
| Storage errors (corrupt copy, unavailable banner, migrations, import validation, backup reminder) | 9, 10, 11, 12 |
| Tests | every task with a pure module |

Deviation from the spec, deliberate: « Passes contre le mur » became « Passes à deux en 30 s » (no wall among the family's equipment); the « suspicious result » check also requires a gap of at least 10 for count-based challenges, so small early scores never trigger a confirmation.
