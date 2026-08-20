import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../src/components/AppText';
import { useRouter } from 'expo-router';
import { colors, fonts, radii } from '../src/theme/theme';
import { useSession } from '../src/lib/session';
import { useQuizRun } from '../src/lib/quizRun';
import { useToast } from '../src/lib/toast';
import { computeBadges } from '../src/lib/badges';
import { FicheDetail } from '../src/components/FicheDetail';
import { PrimaryButton } from '../src/components/ui';

export default function Result() {
  const { run, reset, startQuiz } = useQuizRun();
  const { collection, progress, addOrUpdateFiche, recordProgress } = useSession();
  const { flashToast } = useToast();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const quiz = run.quiz;

  const fiche = useMemo(() => {
    if (!quiz || run.mode !== 'character' || !('name' in quiz)) return null;
    const q = quiz as any;
    return {
      id: q.code.toLowerCase(), code: q.code, name: q.name, subject: q.subject,
      years: q.years, role: q.role, place: q.place, photo: q.photo,
      didYouKnow: q.didYouKnow, works: q.works, facts: run.facts, by: q.by,
    };
  }, [quiz, run]);

  if (!quiz) return <View style={{ flex: 1, backgroundColor: colors.cream }} />;

  const total = quiz.questions.length;
  const pct = total ? Math.round((run.score / total) * 100) : 0;
  const emoji = pct === 100 ? '🏅' : pct >= 60 ? '👏' : '💪';
  const message =
    pct === 100
      ? (run.mode === 'character' ? 'Sans faute ! Fiche complète.' : 'Sans faute sur cette révision !')
      : pct >= 60
        ? 'Bien joué, continue comme ça.'
        : (run.mode === 'character' ? 'Pas grave : ta fiche est quand même remplie pour réviser.' : 'Continue à réviser, tu vas progresser.');

  const save = () => {
    if (!fiche) return;
    const before = computeBadges(collection, progress);
    addOrUpdateFiche(fiche);
    recordProgress(fiche.id, run.score, total, run.wrongLabels);
    setSaved(true);
    setTimeout(() => {
      const after = computeBadges([...collection.filter((f) => f.id !== fiche.id), fiche], { ...progress, [fiche.id]: { best: run.score, total, attempts: 1, mastered: run.score === total, wrong: run.wrongLabels } });
      const newlyEarned = after.find((b) => b.earned && !before.find((bb) => bb.title === b.title && bb.earned));
      flashToast(newlyEarned ? `🏅 Récompense débloquée : ${newlyEarned.title} !` : 'Fiche enregistrée ✓');
    }, 300);
  };

  const redo = () => {
    startQuiz(quiz, run.mode);
    router.replace('/quiz');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}>
      <Text style={styles.title}>Quiz terminé</Text>
      <View style={styles.ring}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.score}>{run.score} / {total}</Text>
      </View>
      <Text style={styles.message}>{message}</Text>

      {fiche && (
        <View style={{ marginTop: 24 }}>
          <FicheDetail fiche={fiche} />
        </View>
      )}

      <View style={{ marginTop: 24, gap: 10 }}>
        {run.mode === 'character' ? (
          <>
            <PrimaryButton
              label={saved ? 'Enregistrée ✓' : 'Enregistrer dans mes fiches'}
              onPress={save}
              disabled={saved}
            />
            <PrimaryButton label="Refaire le quiz" dark={false} onPress={redo} />
            {saved && (
              <PrimaryButton
                label="Retour à mes fiches"
                dark={false}
                onPress={() => { reset(); router.replace('/(eleve)/fiches'); }}
              />
            )}
          </>
        ) : (
          <>
            <PrimaryButton label="Refaire une révision" onPress={() => { reset(); router.replace('/(eleve)/quizz'); }} />
            <PrimaryButton label="Retour à mes fiches" dark={false} onPress={() => { reset(); router.replace('/(eleve)/fiches'); }} />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 24, color: colors.navy, textAlign: 'center' },
  ring: {
    width: 160, height: 160, borderRadius: 80, borderWidth: 10, borderColor: colors.gold,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 24, backgroundColor: colors.cardWhite,
  },
  emoji: { fontSize: 34 },
  score: { fontFamily: fonts.serifSemiBold, fontSize: 22, color: colors.navy, marginTop: 4 },
  message: { fontFamily: fonts.sans, fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 16 },
});
