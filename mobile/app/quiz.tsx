import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../src/components/AppText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fonts, radii, subjectMeta } from '../src/theme/theme';
import { useSession } from '../src/lib/session';
import { useQuizRun } from '../src/lib/quizRun';
import { buildRevisionQuiz } from '../src/lib/revision';
import { famName } from '../src/lib/text';
import { FicheAvatar } from '../src/components/FicheCard';
import { PrimaryButton } from '../src/components/ui';

export default function Quiz() {
  const { revision, filter } = useLocalSearchParams<{ revision?: string; filter?: string }>();
  const { collection, progress } = useSession();
  const { run, startQuiz, selectAnswer, next, reset } = useQuizRun();
  const router = useRouter();

  useEffect(() => {
    if (revision === '1' && !run.quiz) {
      const f = filter || 'Tous';
      const questions = buildRevisionQuiz(collection, progress, f);
      if (!questions) {
        router.back();
        return;
      }
      startQuiz({ code: '__rev', name: 'Quiz de révision', subject: f, questions }, 'revision');
    }
  }, [revision, filter, run.quiz]);

  if (!run.quiz) return <View style={{ flex: 1, backgroundColor: colors.cream }} />;

  const quiz = run.quiz;
  const q = quiz.questions[run.index];
  const answered = run.answers[run.index];
  const total = quiz.questions.length;
  const isLast = run.index === total - 1;
  const meta = subjectMeta('subject' in quiz ? quiz.subject : '');

  const onNext = () => {
    if (isLast) {
      // Character mode: result screen records progress + saves the fiche once the
      // student taps "Enregistrer". Revision mode never records progress (matches
      // the original app — revision is practice, not a graded attempt).
      router.replace('/result');
    } else {
      next();
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => { reset(); router.replace(run.mode === 'character' ? '/(eleve)/quizz' : '/(eleve)/fiches'); }}>
          <Text style={styles.quit}>✕</Text>
        </Pressable>
        <Text style={styles.counter}>{run.index + 1}/{total}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((run.index + (answered !== null ? 1 : 0)) / total) * 100}%` }]} />
      </View>

      {run.mode === 'character' ? (
        <View style={[styles.chip, { backgroundColor: meta.soft }]}>
          <Text style={[styles.chipText, { color: meta.color }]}>Tu construis la fiche de {'name' in quiz ? famName(quiz.name) : ''}</Text>
        </View>
      ) : (
        <View style={[styles.chip, { backgroundColor: colors.goldSoft }]}>
          <Text style={[styles.chipText, { color: colors.gold }]}>Quiz de révision</Text>
        </View>
      )}

      <Text style={styles.question}>{q.q}</Text>

      <View style={{ marginTop: 20, gap: 10 }}>
        {q.options.map((opt, i) => {
          const isAnswered = answered !== null;
          const isCorrect = i === q.correct;
          const isPicked = answered === i;
          let bg = colors.cardWhite, border = colors.border, textColor = colors.navy;
          if (isAnswered && isCorrect) { bg = colors.greenSoft; border = colors.green; textColor = colors.greenDark; }
          else if (isAnswered && isPicked && !isCorrect) { bg = colors.redSoft; border = colors.red; textColor = colors.redDark; }
          return (
            <Pressable
              key={i}
              disabled={isAnswered}
              onPress={() => selectAnswer(i)}
              style={[styles.option, { backgroundColor: bg, borderColor: border }]}
            >
              <Text style={[styles.optionLetter, { color: textColor }]}>{String.fromCharCode(65 + i)}</Text>
              <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>

      {answered !== null && (
        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            {run.mode === 'character' ? '+ Ajouté à la fiche · ' : 'Bonne réponse · '}{q.fact.label} : {q.fact.value}
          </Text>
        </View>
      )}

      <View style={{ flex: 1 }} />
      {answered !== null && (
        <PrimaryButton label={isLast ? 'Voir mon score' : 'Question suivante'} onPress={onNext} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, padding: 20, paddingTop: 56, paddingBottom: 30 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quit: { fontSize: 18, color: colors.muted },
  counter: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.muted },
  progressTrack: { height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: colors.gold },
  chip: { alignSelf: 'flex-start', borderRadius: radii.pill, paddingVertical: 6, paddingHorizontal: 12, marginTop: 18 },
  chipText: { fontFamily: fonts.sansBold, fontSize: 12 },
  question: { fontFamily: fonts.serifSemiBold, fontSize: 21, color: colors.navy, marginTop: 16, lineHeight: 28 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: radii.md, paddingVertical: 14, paddingHorizontal: 16 },
  optionLetter: { fontFamily: fonts.sansBold, fontSize: 13, width: 18 },
  optionText: { fontFamily: fonts.sans, fontSize: 14, flex: 1 },
  callout: { backgroundColor: colors.navy, borderRadius: radii.md, padding: 12, marginTop: 16 },
  calloutText: { fontFamily: fonts.sans, fontSize: 12, color: colors.cream },
});
