import type { BadgeDef } from './types';

export const BADGES: BadgeDef[] = [
  { id: 'premier-pas', name: 'Premier pas', emoji: '👟', description: "Termine ta première séance." },
  { id: 'regulier', name: 'Régulier', emoji: '📅', description: "Termine 10 séances." },
  { id: 'acharne', name: 'Acharné', emoji: '💪', description: "Termine 50 séances." },
  { id: 'semaine-or', name: 'Semaine en or', emoji: '🌟', description: "Fais au moins 3 séances dans une semaine." },
  { id: 'serie-4', name: 'Série de 4', emoji: '🔥', description: "Réussis 4 semaines de suite." },
  { id: 'jongles-50', name: '50 jongles', emoji: '🤹', description: "Fais 50 jongles d'affilée." },
  { id: 'pied-gauche', name: 'Pied gauche en feu', emoji: '🦶', description: "Atteins l'or en jongles ou en tirs avec ton pied faible." },
  { id: 'fusee', name: 'Fusée', emoji: '🚀', description: "Atteins l'or au sprint 20 m." },
  { id: 'sniper', name: 'Sniper', emoji: '🎯', description: "Cadre 10 tirs sur 10." },
  { id: 'mur', name: 'Mur infranchissable', emoji: '🧤', description: "Atteins l'or aux arrêts de gardien." },
  { id: 'touche-a-tout', name: 'Touche-à-tout', emoji: '🧩', description: "Obtiens au moins le bronze dans les 4 domaines." },
  { id: 'collectionneur', name: 'Collectionneur', emoji: '🥇', description: "Atteins l'or sur 5 défis différents." },
];

export function getBadge(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}
