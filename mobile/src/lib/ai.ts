import { Question } from './seed';

// Talks to the existing Netlify function (netlify/functions/complete.js) that proxies
// the Anthropic API. The API key never lives in the mobile app — it stays server-side
// on Netlify. Defaults to the deployed Figures web app's origin; override with
// EXPO_PUBLIC_API_BASE_URL (see .env.example) if that ever moves.
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://figurescollege.netlify.app';

const FMT =
  '{"role":"titre court","years":"dates ex. 1867 – 1934","place":"lieu de naissance",' +
  '"didYouKnow":"anecdote surprenante en une phrase","works":["œuvre ou réalisation 1","œuvre 2","œuvre 3"],' +
  '"questions":[{"q":"question","options":["A","B","C","D"],"correct":0,"fact":{"label":"mot-clé","value":"info pour la fiche"}}]}';

function buildPrompt(name: string, subject: string, niveau: string, langue: string) {
  const rules =
    ` Adapte la difficulté à une classe de ${niveau}. Rédige TOUT le contenu (questions, options, rôle, anecdote, ` +
    `œuvres, facts) en ${langue}. Sois CONCIS : valeurs "value" des facts en moins de 12 mots. "works" liste 2 à 3 ` +
    `œuvres. 4 options par question. "correct" = index (0-3) de la bonne réponse. Réponds UNIQUEMENT par du JSON ` +
    `valide, sans aucun texte ni balise de code.`;
  return (
    `Tu es professeur de ${subject}. Prépare une fiche de révision sur "${name}". ` +
    `Donne l'identité ET EXACTEMENT 5 questions QCM, au format exact ${FMT}.${rules}`
  );
}

async function aiComplete(prompt: string): Promise<string> {
  if (!BASE_URL) {
    throw new Error(
      "EXPO_PUBLIC_API_BASE_URL n'est pas configuré (voir .env.example) — impossible d'appeler l'IA."
    );
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const res = await fetch(`${BASE_URL}/.netlify/functions/complete`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return (data.text || data.completion || '') as string;
  } finally {
    clearTimeout(timeout);
  }
}

function extractJSON(raw: string): any | null {
  try {
    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return salvageJSON(raw);
  }
}

function salvageJSON(raw: string): any | null {
  try {
    const qIdx = raw.indexOf('"questions"');
    if (qIdx === -1) return null;
    const arrStart = raw.indexOf('[', qIdx);
    if (arrStart === -1) return null;
    const questions: any[] = [];
    let i = arrStart + 1;
    while (i < raw.length) {
      const objStart = raw.indexOf('{', i);
      if (objStart === -1) break;
      let depth = 0, j = objStart;
      for (; j < raw.length; j++) {
        if (raw[j] === '{') depth++;
        else if (raw[j] === '}') { depth--; if (depth === 0) break; }
      }
      if (depth !== 0) break; // truncated mid-object, stop here
      try { questions.push(JSON.parse(raw.slice(objStart, j + 1))); } catch { /* skip broken one */ }
      i = j + 1;
    }
    return questions.length ? { questions } : null;
  } catch {
    return null;
  }
}

function mapQ(arr: any[]): Question[] {
  return (arr || []).slice(0, 8).map((q) => {
    const options = Array.isArray(q?.options) ? q.options.slice(0, 4).map(String) : [];
    while (options.length < 4) options.push('—');
    const correct = Math.min(3, Math.max(0, Number(q?.correct) || 0)) as 0 | 1 | 2 | 3;
    return {
      q: String(q?.q || ''),
      options: options as [string, string, string, string],
      correct,
      fact: { label: String(q?.fact?.label || 'Info'), value: String(q?.fact?.value || '—') },
    };
  });
}

async function fetchPhoto(name: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    for (const host of ['fr.wikipedia.org', 'en.wikipedia.org']) {
      try {
        const direct = await fetch(
          `https://${host}/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=500&titles=${encodeURIComponent(name)}&origin=*`,
          { signal: controller.signal }
        ).then((r) => r.json());
        const pages = direct?.query?.pages || {};
        const first: any = Object.values(pages)[0];
        if (first?.thumbnail?.source) return first.thumbnail.source as string;

        const search = await fetch(
          `https://${host}/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(name)}&origin=*`,
          { signal: controller.signal }
        ).then((r) => r.json());
        const title = search?.query?.search?.[0]?.title;
        if (!title) continue;
        const resolved = await fetch(
          `https://${host}/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=500&titles=${encodeURIComponent(title)}&origin=*`,
          { signal: controller.signal }
        ).then((r) => r.json());
        const rp: any = Object.values(resolved?.query?.pages || {})[0];
        if (rp?.thumbnail?.source) return rp.thumbnail.source as string;
      } catch {
        // try next host
      }
    }
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

export type GeneratedCharacter = {
  role: string;
  years: string;
  place: string;
  didYouKnow: string;
  works: string[];
  questions: Question[];
  photo: string;
};

export async function generateCharacter(
  name: string, subject: string, niveau: string, langue: string
): Promise<GeneratedCharacter> {
  const prompt = buildPrompt(name, subject, niveau, langue);
  const [rawText, photo] = await Promise.all([
    aiComplete(prompt),
    fetchPhoto(name).catch(() => ''),
  ]);
  const parsed = extractJSON(rawText);
  if (!parsed) {
    throw new Error(
      "La génération n'a pas abouti. Réessaie — et si l'app est en ligne, vérifie que la fonction IA et la clé API sont bien configurées sur Netlify."
    );
  }
  return {
    role: String(parsed.role || ''),
    years: String(parsed.years || ''),
    place: String(parsed.place || ''),
    didYouKnow: String(parsed.didYouKnow || ''),
    works: Array.isArray(parsed.works) ? parsed.works.slice(0, 4).map(String) : [],
    questions: mapQ(parsed.questions || []),
    photo,
  };
}
