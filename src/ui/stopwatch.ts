/** Temps écoulé entre deux instants (ms), arrondi au dixième de seconde. */
export function elapsedTenths(startMs: number, nowMs: number): number {
  return Math.max(0, Math.round((nowMs - startMs) / 100)) / 10;
}

/** Texte prêt à mettre dans la case résultat (virgule française, 1 décimale). */
export function secondsInputText(seconds: number): string {
  return seconds.toFixed(1).replace('.', ',');
}
