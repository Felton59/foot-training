export type Domain = 'technique' | 'passes-tirs' | 'physique' | 'gardien';
export type ExerciseKind = Domain | 'echauffement' | 'retour-calme';
export type Equipment = 'ballon' | 'plots' | 'grand-espace' | 'but';
export type Duration = 30 | 45 | 60;

export const ALL_DOMAINS: Domain[] = ['technique', 'passes-tirs', 'physique', 'gardien'];
export const ALL_EQUIPMENT: Equipment[] = ['ballon', 'plots', 'grand-espace', 'but'];
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
  but: 'But de foot',
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
