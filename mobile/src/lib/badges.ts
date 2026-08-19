import { Fiche, Progress } from './session';
import { SUBJECTS } from '../theme/theme';

export type Badge = {
  mark: string;
  title: string;
  desc: string;
  cur: number;
  goal: number;
  accent: string;
  earned: boolean;
};

export function computeBadges(collection: Fiche[], progress: Progress): Badge[] {
  const collectionCount = collection.length;
  const masteredCount = collection.filter((f) => progress[f.id]?.mastered).length;
  const anyPerfect = Object.values(progress).some((p) => p.mastered);

  const badges: Badge[] = [
    { mark: '1', title: 'Première fiche', desc: 'Collectionne ta 1re fiche', cur: Math.min(collectionCount, 1), goal: 1, accent: '#2A6F9E' },
    { mark: '★', title: 'Sans faute', desc: 'Réussis un quiz à 100%', cur: anyPerfect ? 1 : 0, goal: 1, accent: '#2A6F9E' },
    { mark: '5', title: 'Collectionneur', desc: 'Collectionne 5 fiches', cur: Math.min(collectionCount, 5), goal: 5, accent: '#2A6F9E' },
    { mark: '✦', title: "Mémoire d'or", desc: 'Maîtrise 5 fiches', cur: Math.min(masteredCount, 5), goal: 5, accent: '#2A6F9E' },
  ].map((b) => ({ ...b, earned: b.cur >= b.goal }));

  const subjectBadgeDefs: Record<string, { title: string; accent: string }> = {
    Sciences: { title: 'Petit savant', accent: '#2E7D6B' },
    Histoire: { title: 'Historien·ne', accent: '#A8743A' },
    'Littérature': { title: "Plume d'or", accent: '#8C3B4A' },
    Artistes: { title: "Œil d'artiste", accent: '#6B4E9E' },
    Sportifs: { title: 'Champion·ne', accent: '#3A6E4F' },
    Musique: { title: 'Virtuose', accent: '#2A6F9E' },
  };

  for (const subject of Object.keys(SUBJECTS)) {
    const def = subjectBadgeDefs[subject];
    if (!def) continue;
    const count = collection.filter((f) => f.subject === subject).length;
    badges.push({
      mark: '5', title: def.title, desc: `5 fiches en ${subject}`,
      cur: Math.min(count, 5), goal: 5, accent: def.accent, earned: count >= 5,
    });
  }

  return badges;
}
