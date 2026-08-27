import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  licenceExpiration: string | null;
};

export type AppSession = EleveSession | ProfSession | null;

export function isLicenceActive(session: AppSession): boolean {
  return (
    !!session && session.role === 'prof' &&
    !!session.licenceExpiration && new Date(session.licenceExpiration) >= new Date()
  );
}

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
  activateLicence: (code: string) => Promise<{ ok: boolean; message: string }>;
  studentJoin: (code: string, prenom: string, nom: string) => Promise<StudentJoinResult | null>;
  studentSetPassword: (eleveId: string, password: string, resetCode?: string) => Promise<boolean>;
  studentVerifyPassword: (eleveId: string, password: string) => Promise<boolean>;
  finalizeStudentSession: (info: {
    eleveId: string; classId: string; className: string; classCode: string; prenom: string; nom: string;
  }) => void;
  logout: () => void;
  deleteAccount: (password?: string) => Promise<{ ok: boolean; message: string }>;
};

export type StudentJoinResult = {
  eleveId: string;
  classId: string;
  className: string;
  classCode: string;
  needsPasswordSetup: boolean;
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
  const sessionRef = useRef<AppSession>(null);
  sessionRef.current = session;
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
    const cur = sessionRef.current;
    if (cur && cur.role === 'eleve') {
      supabase
        .from('progress')
        .upsert(
          { eleve_id: cur.eleveId, quiz_code: ficheId.toUpperCase(), best: score, total, mastered: score === total, updated_at: new Date().toISOString() },
          { onConflict: 'eleve_id,quiz_code' }
        )
        .then(() => {}, () => {});
    }
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
      setSession({ role: 'prof', email: email.trim(), prenom: name.trim(), uid, licenceExpiration: null });
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
      const { data: profRow } = await supabase.from('profs').select('prenom, licence_expiration').eq('id', uid).maybeSingle();
      setSession({
        role: 'prof', email: email.trim(), prenom: profRow?.prenom || 'Professeur', uid,
        licenceExpiration: profRow?.licence_expiration ?? null,
      });
      return true;
    } catch (e: any) {
      setAuthError(e?.message || 'Erreur réseau. Réessaie.');
      return false;
    } finally { setAuthLoading(false); }
  }, []);

  const activateLicence = useCallback(async (code: string) => {
    const { data, error } = await supabase.rpc('activer_licence', { p_code: code.trim() });
    if (error || !data?.length) {
      const m = error?.message || '';
      let message = "Impossible d'activer ce code. Réessaie.";
      if (m.includes('LICENCE_NOT_FOUND')) message = "Ce code n'existe pas. Vérifie auprès de ton établissement.";
      else if (m.includes('LICENCE_EXPIRED')) message = 'Ce code a expiré.';
      else if (m.includes('LICENCE_REVOKED')) message = "Ce code n'est plus actif.";
      else if (m.includes('LICENCE_ALREADY_ACTIVATED')) message = 'Ce code est déjà activé sur ton compte.';
      else if (m.includes('LICENCE_QUOTA_REACHED')) message = "Le nombre maximum d'enseignants pour cet établissement est atteint.";
      return { ok: false, message };
    }
    const dateExpiration = data[0].date_expiration as string;
    setSession((s) => (s && s.role === 'prof' ? { ...s, licenceExpiration: dateExpiration } : s));
    return { ok: true, message: `Licence active jusqu'au ${new Date(dateExpiration).toLocaleDateString('fr-FR')}` };
  }, []);

  const studentJoin = useCallback(async (code: string, prenom: string, nom: string) => {
    setAuthError(''); setAuthLoading(true);
    try {
      if (!prenom.trim() || !nom.trim() || !code.trim()) {
        setAuthError('Renseigne le code de la classe, ton prénom et ton nom.');
        return null;
      }
      const { data, error } = await supabase.rpc('eleve_join', {
        p_class_code: code.trim(), p_prenom: prenom.trim(), p_nom: nom.trim(),
      });
      if (error || !data?.length) {
        let msg = 'Impossible de te rejoindre à la classe. Réessaie.';
        if (error?.message?.includes('CLASS_NOT_FOUND')) {
          msg = "Ce code de classe n'existe pas. Vérifie auprès de ton professeur.";
        } else if (error?.message?.includes('CLASS_ARCHIVED')) {
          msg = "Cette classe est fermée. Demande à ton professeur le nouveau code de classe.";
        }
        setAuthError(msg);
        return null;
      }
      const row = data[0];
      return {
        eleveId: row.eleve_id as string,
        classId: row.class_id as string,
        className: row.class_name as string,
        classCode: row.class_code as string,
        needsPasswordSetup: row.needs_password_setup as boolean,
      };
    } catch (e: any) {
      setAuthError(e?.message || 'Erreur réseau. Réessaie.');
      return null;
    } finally { setAuthLoading(false); }
  }, []);

  const studentSetPassword = useCallback(async (eleveId: string, password: string, resetCode?: string) => {
    setAuthError(''); setAuthLoading(true);
    try {
      if (password.length < 4) {
        setAuthError('Le mot de passe doit contenir au moins 4 caractères.');
        return false;
      }
      const { error } = await supabase.rpc('eleve_set_password', {
        p_eleve_id: eleveId, p_new_password: password, p_reset_code: resetCode || null,
      });
      if (error) {
        setAuthError(
          error.message?.includes('RESET_CODE_INVALID')
            ? "Ce code de réinitialisation n'est pas valide ou a expiré. Demande-en un nouveau à ton professeur."
            : "Impossible d'enregistrer ce mot de passe. Réessaie."
        );
        return false;
      }
      return true;
    } catch (e: any) {
      setAuthError(e?.message || 'Erreur réseau. Réessaie.');
      return false;
    } finally { setAuthLoading(false); }
  }, []);

  const studentVerifyPassword = useCallback(async (eleveId: string, password: string) => {
    setAuthError(''); setAuthLoading(true);
    try {
      const { data, error } = await supabase.rpc('eleve_verify_password', {
        p_eleve_id: eleveId, p_password: password,
      });
      if (error || !data) {
        setAuthError('Mot de passe incorrect.');
        return false;
      }
      return true;
    } catch (e: any) {
      setAuthError(e?.message || 'Erreur réseau. Réessaie.');
      return false;
    } finally { setAuthLoading(false); }
  }, []);

  const finalizeStudentSession = useCallback((info: {
    eleveId: string; classId: string; className: string; classCode: string; prenom: string; nom: string;
  }) => {
    setSession({
      role: 'eleve', prenom: info.prenom, nom: info.nom.toUpperCase(),
      classe: info.className, classCode: info.classCode, classId: info.classId, eleveId: info.eleveId,
    });
  }, []);

  const logout = useCallback(() => {
    supabase.auth.signOut().catch(() => {});
    setSession(null);
  }, []);

  const deleteAccount = useCallback(async (password?: string) => {
    const cur = sessionRef.current;
    if (!cur) return { ok: false, message: 'Aucun compte à supprimer.' };
    if (cur.role === 'prof') {
      const { error } = await supabase.rpc('prof_delete_account');
      if (error) return { ok: false, message: 'Impossible de supprimer le compte. Réessaie.' };
    } else {
      if (!password) return { ok: false, message: 'Entre ton mot de passe pour confirmer.' };
      const { error } = await supabase.rpc('eleve_delete_account', {
        p_eleve_id: cur.eleveId, p_password: password,
      });
      if (error) {
        const msg = error.message?.includes('INVALID_PASSWORD')
          ? 'Mot de passe incorrect.'
          : 'Impossible de supprimer le compte. Réessaie.';
        return { ok: false, message: msg };
      }
    }
    setCollection([]);
    setProgress({});
    logout();
    return { ok: true, message: 'Compte supprimé.' };
  }, [logout]);

  const value: Ctx = {
    ready, session, consentAccepted, acceptConsent, a11y, toggleA11y,
    onboardSeen, markOnboardSeen, collection, progress, addOrUpdateFiche,
    recordProgress, masteredCount, toReviewCount, authLoading, authError,
    setAuthError, teacherSignup, teacherLogin, activateLicence, studentJoin,
    studentSetPassword, studentVerifyPassword, finalizeStudentSession, logout,
    deleteAccount,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useSession() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
