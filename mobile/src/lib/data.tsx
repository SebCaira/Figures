import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from './supabase';
import { useSession } from './session';
import { loadJSON, saveJSON } from './storage';
import { QUIZZES, SHARED_QUIZ, QuizDef, Question } from './seed';

export type RosterStudent = { id: string; name: string; fiches: number; pct: string };
export type ClassGroup = {
  id: string;
  code: string;
  name: string;
  teacherId: string;
  teachers: string[];
  students: RosterStudent[];
};

export type Assignment = { id: string; classId: string; quizCode: string; due: string };

const K_ASSIGNMENTS = 'figures.assignments.v1';

type Ctx = {
  classes: ClassGroup[];
  loadingClasses: boolean;
  refreshProfData: () => Promise<void>;
  createClass: (name: string) => Promise<ClassGroup | null>;
  joinAsCoTeacher: (code: string) => Promise<{ ok: boolean; message: string }>;
  removeStudent: (classId: string, studentId: string) => void;
  deleteClass: (classId: string) => void;
  customQuizzes: Record<string, QuizDef>;
  loadingQuizzes: boolean;
  refreshClassQuizzes: () => Promise<void>;
  allQuizzes: Record<string, QuizDef>;
  publishQuiz: (draft: QuizDef, editingCode?: string) => Promise<QuizDef | null>;
  assignments: Assignment[];
  assignQuiz: (classId: string, quizCode: string) => void;
};

const DataCtx = createContext<Ctx | null>(null);

// Strips accents (é→e, â→a, …) before removing non-letters, so generated
// codes stay readable instead of silently dropping accented characters.
function deaccent(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function genClassCode(name: string) {
  const prefix = (deaccent(name).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4)) || 'CLS';
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

function genQuizCode(name: string) {
  const base = name.trim().split(/\s+/).pop() || name.trim();
  const clean = deaccent(base).replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 8) || 'PERSO';
  return `${clean}${Math.floor(10 + Math.random() * 89)}`;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [customQuizzes, setCustomQuizzes] = useState<Record<string, QuizDef>>({});
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    loadJSON<Assignment[]>(K_ASSIGNMENTS, []).then(setAssignments);
  }, []);
  useEffect(() => { saveJSON(K_ASSIGNMENTS, assignments); }, [assignments]);

  const refreshProfData = useCallback(async () => {
    if (!session || session.role !== 'prof') return;
    setLoadingClasses(true);
    try {
      const uid = session.uid;
      const { data: owned } = await supabase.from('classes').select('id, code, name, teacher_id').eq('teacher_id', uid);
      const { data: coRows } = await supabase.from('class_teachers').select('class_id').eq('teacher_id', uid);
      const coClassIds = (coRows || []).map((r: any) => r.class_id);
      let coClasses: any[] = [];
      if (coClassIds.length) {
        const { data } = await supabase.from('classes').select('id, code, name, teacher_id').in('id', coClassIds);
        coClasses = data || [];
      }
      const allClassRows = [...(owned || []), ...coClasses];
      const teacherIdSet = new Set<string>([uid]);
      const result: ClassGroup[] = [];
      for (const c of allClassRows) {
        teacherIdSet.add(c.teacher_id);
        const { data: coTeachers } = await supabase
          .from('class_teachers').select('teacher_id, prenom').eq('class_id', c.id);
        (coTeachers || []).forEach((t: any) => teacherIdSet.add(t.teacher_id));
        const teacherNames = [session.prenom, ...(coTeachers || []).map((t: any) => t.prenom)].filter(Boolean);
        const { data: eleves } = await supabase.from('eleves').select('id, prenom, nom').eq('class_id', c.id);
        const students: RosterStudent[] = [];
        for (const e of eleves || []) {
          const { data: progRows } = await supabase.from('progress').select('best, total').eq('eleve_id', e.id);
          const rows = progRows || [];
          const pct = rows.length
            ? Math.round((rows.reduce((sum: number, r: any) => sum + (r.total ? r.best / r.total : 0), 0) / rows.length) * 100)
            : 0;
          students.push({ id: e.id, name: `${e.prenom} ${e.nom}`, fiches: rows.length, pct: `${pct}%` });
        }
        result.push({ id: c.id, code: c.code, name: c.name, teacherId: c.teacher_id, teachers: teacherNames, students });
      }
      setClasses(result);

      const { data: personnages } = await supabase
        .from('personnages').select('code, data, teacher_id').in('teacher_id', Array.from(teacherIdSet));
      const merged: Record<string, QuizDef> = {};
      (personnages || []).forEach((row: any) => { merged[row.code] = row.data; });
      setCustomQuizzes(merged);
    } finally {
      setLoadingClasses(false);
    }
  }, [session]);

  const refreshClassQuizzes = useCallback(async () => {
    if (!session || session.role !== 'eleve') return;
    setLoadingQuizzes(true);
    try {
      const { data: cls } = await supabase.from('classes').select('teacher_id').eq('id', session.classId).maybeSingle();
      const teacherIds = new Set<string>();
      if (cls?.teacher_id) teacherIds.add(cls.teacher_id);
      const { data: coTeachers } = await supabase.from('class_teachers').select('teacher_id').eq('class_id', session.classId);
      (coTeachers || []).forEach((t: any) => teacherIds.add(t.teacher_id));
      if (!teacherIds.size) { setCustomQuizzes({}); return; }
      const { data: personnages } = await supabase.from('personnages').select('code, data').in('teacher_id', Array.from(teacherIds));
      const merged: Record<string, QuizDef> = {};
      (personnages || []).forEach((row: any) => { merged[row.code] = row.data; });
      setCustomQuizzes(merged);
    } finally {
      setLoadingQuizzes(false);
    }
  }, [session]);

  useEffect(() => {
    if (!session) { setClasses([]); setCustomQuizzes({}); return; }
    if (session.role === 'prof') refreshProfData();
    else refreshClassQuizzes();
  }, [session, refreshProfData, refreshClassQuizzes]);

  const createClass = useCallback(async (name: string) => {
    if (!session || session.role !== 'prof') return null;
    const code = genClassCode(name);
    const { data, error } = await supabase
      .from('classes').insert({ code, name, teacher_id: session.uid }).select('id, code, name, teacher_id').single();
    if (error || !data) return null;
    const cls: ClassGroup = { id: data.id, code: data.code, name: data.name, teacherId: data.teacher_id, teachers: [session.prenom], students: [] };
    setClasses((s) => [...s, cls]);
    return cls;
  }, [session]);

  const joinAsCoTeacher = useCallback(async (code: string) => {
    if (!session || session.role !== 'prof') return { ok: false, message: 'Connecte-toi en tant que professeur.' };
    const upCode = code.trim().toUpperCase();
    const { data: cls } = await supabase.from('classes').select('id, teacher_id').ilike('code', upCode).maybeSingle();
    if (!cls) return { ok: false, message: "Ce code de classe n'existe pas." };
    if (cls.teacher_id === session.uid) return { ok: false, message: 'Tu animes déjà cette classe.' };
    const { data: existing } = await supabase.from('class_teachers').select('class_id').eq('class_id', cls.id).eq('teacher_id', session.uid).maybeSingle();
    if (!existing) {
      await supabase.from('class_teachers').insert({ class_id: cls.id, teacher_id: session.uid, prenom: session.prenom });
    }
    await refreshProfData();
    return { ok: true, message: 'Tu co-animes désormais cette classe ✓' };
  }, [session, refreshProfData]);

  const removeStudent = useCallback((classId: string, studentId: string) => {
    setClasses((s) => s.map((c) => c.id === classId ? { ...c, students: c.students.filter((st) => st.id !== studentId) } : c));
  }, []);

  const deleteClass = useCallback((classId: string) => {
    setClasses((s) => s.filter((c) => c.id !== classId));
    setAssignments((s) => s.filter((a) => a.classId !== classId));
  }, []);

  const allQuizzes = useMemo<Record<string, QuizDef>>(() => ({
    ...QUIZZES,
    [SHARED_QUIZ.code]: SHARED_QUIZ,
    ...customQuizzes,
  }), [customQuizzes]);

  const publishQuiz = useCallback(async (draft: QuizDef, editingCode?: string) => {
    if (!session || session.role !== 'prof') return null;
    const code = editingCode || genQuizCode(draft.name);
    const full: QuizDef = { ...draft, code, by: session.prenom };
    const { data: existing } = await supabase.from('personnages').select('id').eq('teacher_id', session.uid).eq('code', code).maybeSingle();
    if (existing) {
      await supabase.from('personnages').update({ data: full }).eq('id', existing.id);
    } else {
      await supabase.from('personnages').insert({ teacher_id: session.uid, code, data: full });
    }
    setCustomQuizzes((s) => ({ ...s, [code]: full }));
    return full;
  }, [session]);

  const assignQuiz = useCallback((classId: string, quizCode: string) => {
    setAssignments((s) => {
      const exists = s.find((a) => a.classId === classId && a.quizCode === quizCode);
      if (exists) return s.filter((a) => a !== exists);
      return [...s, { id: `a${Date.now()}`, classId, quizCode, due: 'vendredi prochain' }];
    });
  }, []);

  const value: Ctx = {
    classes, loadingClasses, refreshProfData, createClass, joinAsCoTeacher,
    removeStudent, deleteClass, customQuizzes, loadingQuizzes, refreshClassQuizzes,
    allQuizzes, publishQuiz, assignments, assignQuiz,
  };

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

export function useData() {
  const ctx = useContext(DataCtx);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export type { QuizDef, Question };
