import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loadJSON, saveJSON } from './storage';
import { supabase } from './supabase';

export type EleveSession = {
  role: 'eleve';
  prenom: string;
  nom: string;
  classe: string;
  classCode: string;
  classId: string;
  eleveId: string;
};

export type ProfSession = {
  role: 'prof';
  email: string;
  prenom: string;
  uid: string;
};

export type AppSession = EleveSession | ProfSession | null;

export type Fiche = {
  id: string;
  code: string;
  name: string;
  subject: string;
  years?: string;
  role?: string;
  place?: string;
  photo?: string;
  didYouKnow?: string;
  works?: string[];
  facts: { label: string; value: string }[];
  by?: string;
};

export type ProgressEntry = {
  best: number;
  total: number;
  attempts: number;
  mastered: boolean;
  wrong: string[];
};
export type Progress = Record<string, ProgressEntry>;

type A11y = { dys: boolean; large: boolean };
type OnboardSeen = { eleve: boolean; prof: boolean };

const K_SESSION = 'figures.session.v1';
const K_COLLECTION = 'figures.collection.v4';
const K_PROGRESS = 'figures.progress.v1';
const K_CONSENT = 'figures.consent';
const K_A11Y = 'figures.a11y';
const K_ONBOARD = 'figures.onboard.v1';

type Ctx = {
  ready: boolean;
  session: AppSession;
  consentAccepted: boolean;
  acceptConsent: () => void;
  a11y: A11y;
  toggleA11y: (key: keyof A11y) => void;
  onboardSeen: OnboardSeen;
  markOnboardSeen: (role: 'eleve' | 'prof') => void;
  collection: Fiche[];
  progress: Progress;
  addOrUpdateFiche: (fiche: Fiche) => void;
  recordProgress: (ficheId: string, score: number, total: number, wrongLabels: string[]) => void;
  masteredCount: number;
  toReviewCount: number;
  authLoading: boolean;
  authError: string;
  setAuthError: (s: string) => void;
  teacherSignup: (name: string, email: string, password: string) => Promise<boolean>;
  teacherLogin: (email: string, password: string) => Promise<boolean>;
  studentJoin: (code: string, prenom: string, nom: string) => Promise<boolean>;
  logout: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

function frError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('already exists')) {
    return 'Un compte existe déjà avec cet email. Essaie de te connecter.';
  }
  if (m.includes('password')) return 'Le mot de passe doit contenir au moins 4 caractères.';
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'Email ou mot de passe incorrect.';
  }
  return 'Une erreur est survenue. Réessaie.';
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<AppSession>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [a11y, setA11y] = useState<A11y>({ dys: false, large: false });
  const [onboardSeen, setOnboardSeen] = useState<OnboardSeen>({ eleve: false, prof: false });
  const [collection, setCollection] = useState<Fiche[]>([]);
  const [progress, setProgress] = useState<Progress>({});
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    (async () => {
      const [s, c, p, cons, a11yV, ob] = await Promise.all([
        loadJSON<AppSession>(K_SESSION, null),
        loadJSON<Fiche[]>(K_COLLECTION, []),
        loadJSON<Progress>(K_PROGRESS, {}),
        loadJSON<boolean>(K_CONSENT, false),
        loadJSON<A11y>(K_A11Y, { dys: false, large: false }),
        loadJSON<OnboardSeen>(K_ONBOARD, { eleve: false, prof: false }),
      ]);
      setSession(s);
      setCollection(c);
      setProgress(p);
      setConsentAccepted(cons);
      setA11y(a11yV);
      setOnboardSeen(ob);
      setReady(true);
    })();
  }, []);

  useEffect(() => { if (ready) saveJSON(K_SESSION, session); }, [session, ready]);
  useEffect(() => { if (ready) saveJSON(K_COLLECTION, collection); }, [collection, ready]);
  useEffect(() => { if (ready) saveJSON(K_PROGRESS, progress); }, [progress, ready]);
  useEffect(() => { if (ready) saveJSON(K_CONSENT, consentAccepted); }, [consentAccepted, ready]);
  useEffect(() => { if (ready) saveJSON(K_A11Y, a11y); }, [a11y, ready]);
  useEffect(() => { if (ready) saveJSON(K_ONBOARD, onboardSeen); }, [onboardSeen, ready]);

  const acceptConsent = useCallback(() => setConsentAccepted(true), []);
  const toggleA11y = useCallback((key: keyof A11y) => {
    setA11y((s) => ({ ...s, [key]: !s[key] }));
  }, []);
  const markOnboardSeen = useCallback((role: 'eleve' | 'prof') => {
    setOnboardSeen((s) => ({ ...s, [role]: true }));
  }, []);

  const addOrUpdateFiche = useCallback((fiche: Fiche) => {
    setCollection((s) => {
      const idx = s.findIndex((f) => f.id === fiche.id);
      if (idx === -1) return [...s, fiche];
      const copy = s.slice();
      copy[idx] = fiche;
      return copy;
    });
  }, []);

  const recordProgress = useCallback((ficheId: string, score: number, total: number, wrongLabels: string[]) => {
    setProgress((s) => {
      const prev = s[ficheId];
      const best = Math.max(prev?.best ?? 0, score);
      const mastered = !!prev?.mastered || score === total;
      const entry: ProgressEntry = {
        best, total, attempts: (prev?.attempts ?? 0) + 1, mastered,
        wrong: Array.from(new Set([...(prev?.wrong ?? []), ...wrongLabels])),
      };
      return { ...s, [ficheId]: entry };
    });
    // Push to Supabase for a logged-in student (best-effort, matches original app).
    setSession((cur) => {
      if (cur && cur.role === 'eleve') {
        supabase
          .from('progress')
          .upsert(
            { eleve_id: cur.eleveId, quiz_code: ficheId.toUpperCase(), best: score, total, mastered: score === total, updated_at: new Date().toISOString() },
            { onConflict: 'eleve_id,quiz_code' }
          )
          .then(() => {});
      }
      return cur;
    });
  }, []);

  const masteredCount = collection.filter((f) => progress[f.id]?.mastered).length;
  const toReviewCount = collection.length - masteredCount;

  const teacherSignup = useCallback(async (name: string, email: string, password: string) => {
    setAuthError(''); setAuthLoading(true);
    try {
      if (!name.trim() || !email.trim() || password.length < 4) {
        setAuthError('Vérifie ton nom, ton email et un mot de passe d\'au moins 4 caractères.');
        return false;
      }
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) { setAuthError(frError(error.message)); return false; }
      let uid = data.user?.id;
      if (!data.session) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInErr) {
          setAuthError('Compte créé. Vérifie ta boîte mail pour confirmer ton adresse avant de te connecter.');
          return false;
        }
        uid = signInData.user?.id;
      }
      if (!uid) { setAuthError('Erreur inattendue. Réessaie.'); return false; }
      await supabase.from('profs').upsert({ id: uid, prenom: name.trim() });
      setSession({ role: 'prof', email: email.trim(), prenom: name.trim(), uid });
      return true;
    } catch (e: any) {
      setAuthError(e?.message || 'Erreur réseau. Réessaie.');
      return false;
    } finally { setAuthLoading(false); }
  }, []);

  const teacherLogin = useCallback(async (email: string, password: string) => {
    setAuthError(''); setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) { setAuthError(frError(error.message)); return false; }
      const uid = data.user?.id;
      if (!uid) { setAuthError('Erreur inattendue. Réessaie.'); return false; }
      const { data: profRow } = await supabase.from('profs').select('prenom').eq('id', uid).maybeSingle();
      setSession({ role: 'prof', email: email.trim(), prenom: profRow?.prenom || 'Professeur', uid });
      return true;
    } catch (e: any) {
      setAuthError(e?.message || 'Erreur réseau. Réessaie.');
      return false;
    } finally { setAuthLoading(false); }
  }, []);

  const studentJoin = useCallback(async (code: string, prenom: string, nom: string) => {
    setAuthError(''); setAuthLoading(true);
    try {
      if (!prenom.trim() || !nom.trim() || !code.trim()) {
        setAuthError('Renseigne le code de la classe, ton prénom et ton nom.');
        return false;
      }
      const upCode = code.trim().toUpperCase();
      const { data: cls, error: clsErr } = await supabase
        .from('classes').select('id, code, name, teacher_id').ilike('code', upCode).maybeSingle();
      if (clsErr || !cls) { setAuthError("Ce code de classe n'existe pas. Vérifie auprès de ton professeur."); return false; }
      const nomUp = nom.trim().toUpperCase();
      const { data: existing } = await supabase
        .from('eleves').select('id').eq('class_id', cls.id).eq('prenom', prenom.trim()).eq('nom', nomUp).maybeSingle();
      let eleveId = existing?.id;
      if (!eleveId) {
        const { data: inserted, error: insErr } = await supabase
          .from('eleves').insert({ class_id: cls.id, prenom: prenom.trim(), nom: nomUp }).select('id').single();
        if (insErr || !inserted) { setAuthError('Impossible de te rejoindre à la classe. Réessaie.'); return false; }
        eleveId = inserted.id;
      }
      setSession({
        role: 'eleve', prenom: prenom.trim(), nom: nomUp,
        classe: cls.name, classCode: cls.code, classId: cls.id, eleveId,
      });
      return true;
    } catch (e: any) {
      setAuthError(e?.message || 'Erreur réseau. Réessaie.');
      return false;
    } finally { setAuthLoading(false); }
  }, []);

  const logout = useCallback(() => {
    supabase.auth.signOut().catch(() => {});
    setSession(null);
  }, []);

  const value: Ctx = {
    ready, session, consentAccepted, acceptConsent, a11y, toggleA11y,
    onboardSeen, markOnboardSeen, collection, progress, addOrUpdateFiche,
    recordProgress, masteredCount, toReviewCount, authLoading, authError,
    setAuthError, teacherSignup, teacherLogin, studentJoin, logout,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useSession() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
