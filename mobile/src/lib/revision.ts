import { Fiche, Progress } from './session';
import { Question } from './seed';

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Rebuilds a mixed multiple-choice review from the student's own collected
// facts, prioritizing not-yet-mastered fiches and previously-missed facts —
// a lightweight spaced-repetition loop, faithful to the original app.
export function buildRevisionQuiz(collection: Fiche[], progress: Progress, filter: string): Question[] | null {
  const pool = filter === 'Tous' ? collection : collection.filter((f) => f.subject === filter);
  const allFacts = pool.flatMap((f) => f.facts.map((fact) => ({ ...fact, ficheId: f.id, ficheName: f.name })));
  if (allFacts.length < 3) return null;

  const weighted = allFacts.map((f) => {
    const p = progress[f.ficheId];
    const weight = (!p?.mastered ? 2 : 0) + (p?.wrong?.includes(f.label) ? 2 : 1);
    return { fact: f, weight };
  });
  weighted.sort((a, b) => b.weight - a.weight);
  const chosen = shuffle(weighted.slice(0, Math.max(10, weighted.length))).slice(0, 10);

  const allValues = Array.from(new Set(allFacts.map((f) => f.value)));

  return chosen.map(({ fact }) => {
    const distractorsPool = shuffle(allValues.filter((v) => v !== fact.value));
    const distractors = distractorsPool.slice(0, 3);
    while (distractors.length < 3) distractors.push('—');
    const options = shuffle([fact.value, ...distractors]);
    const correct = options.indexOf(fact.value) as 0 | 1 | 2 | 3;
    return {
      q: `${fact.ficheName} — ${fact.label} ?`,
      options: options as [string, string, string, string],
      correct,
      fact: { label: fact.label, value: fact.value },
    };
  });
}
