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
