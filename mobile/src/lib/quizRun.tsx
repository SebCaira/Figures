import React, { createContext, useContext, useState, useCallback } from 'react';
import { QuizDef, Question } from './seed';

export type QuizMode = 'character' | 'revision';

type Run = {
  quiz: QuizDef | { code: '__rev'; name: string; subject: string; questions: Question[] } | null;
  mode: QuizMode;
  index: number;
  score: number;
  answers: (number | null)[];
  facts: { label: string; value: string }[];
  wrongLabels: string[];
};

const empty: Run = { quiz: null, mode: 'character', index: 0, score: 0, answers: [], facts: [], wrongLabels: [] };

type Ctx = {
  run: Run;
  startQuiz: (quiz: Run['quiz'], mode: QuizMode) => void;
  selectAnswer: (i: number) => void;
  next: () => void;
  reset: () => void;
};

const QuizRunCtx = createContext<Ctx | null>(null);

export function QuizRunProvider({ children }: { children: React.ReactNode }) {
  const [run, setRun] = useState<Run>(empty);

  const startQuiz = useCallback((quiz: Run['quiz'], mode: QuizMode) => {
    const total = quiz?.questions.length ?? 0;
    setRun({ quiz, mode, index: 0, score: 0, answers: new Array(total).fill(null), facts: [], wrongLabels: [] });
  }, []);

  const selectAnswer = useCallback((i: number) => {
    setRun((r) => {
      if (!r.quiz || r.answers[r.index] !== null) return r;
      const q = r.quiz.questions[r.index];
      const correct = i === q.correct;
      const answers = r.answers.slice();
      answers[r.index] = i;
      return {
        ...r,
        answers,
        score: r.score + (correct ? 1 : 0),
        facts: [...r.facts, q.fact],
        wrongLabels: correct ? r.wrongLabels : [...r.wrongLabels, q.fact.label],
      };
    });
  }, []);

  const next = useCallback(() => {
    setRun((r) => ({ ...r, index: Math.min(r.index + 1, (r.quiz?.questions.length ?? 1) - 1) }));
  }, []);

  const reset = useCallback(() => setRun(empty), []);

  return <QuizRunCtx.Provider value={{ run, startQuiz, selectAnswer, next, reset }}>{children}</QuizRunCtx.Provider>;
}

export function useQuizRun() {
  const ctx = useContext(QuizRunCtx);
  if (!ctx) throw new Error('useQuizRun must be used within QuizRunProvider');
  return ctx;
}
