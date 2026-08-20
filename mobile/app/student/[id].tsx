import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../src/components/AppText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fonts, radii, subjectMeta } from '../../src/theme/theme';
import { useData } from '../../src/lib/data';
import { famName } from '../../src/lib/text';
import { BackButton } from '../../src/components/ui';
import { FicheAvatar } from '../../src/components/FicheCard';

export default function StudentDetail() {
  const { id, classId } = useLocalSearchParams<{ id: string; classId: string }>();
  const { classes, allQuizzes } = useData();
  const router = useRouter();

  const cls = classes.find((c) => c.id === classId);
  const student = cls?.students.find((s) => s.id === id);

  const fiches = useMemo(() => {
    if (!student) return [];
    return student.progressDetails
      .map((p) => ({ ...p, quiz: allQuizzes[p.quizCode] }))
      .filter((p) => !!p.quiz);
  }, [student, allQuizzes]);

  if (!cls || !student) return null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40 }}>
      <BackButton onPress={() => router.back()} />
      <Text style={styles.name}>{student.name}</Text>
      <Text style={styles.meta}>{cls.name} · {student.fiches} fiche{student.fiches > 1 ? 's' : ''} · moyenne {student.pct}</Text>

      {fiches.length === 0 ? (
        <Text style={styles.empty}>Cet élève n'a pas encore terminé de quiz.</Text>
      ) : (
        <View style={{ marginTop: 20, gap: 10 }}>
          {fiches.map((f) => {
            const meta = subjectMeta(f.quiz!.subject);
            const pct = f.total ? Math.round((f.best / f.total) * 100) : 0;
            return (
              <View key={f.quizCode} style={styles.row}>
                <FicheAvatar fiche={{ id: f.quizCode, code: f.quizCode, name: f.quiz!.name, subject: f.quiz!.subject, facts: [] }} size={48} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.ficheName}>{famName(f.quiz!.name)}</Text>
                  <Text style={[styles.ficheSubject, { color: meta.color }]}>{f.quiz!.subject}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: f.mastered ? colors.greenSoft : colors.amberSoft }]}>
                  <Text style={{ color: f.mastered ? colors.greenDark : colors.amber, fontFamily: fonts.sansBold, fontSize: 11 }}>
                    {f.mastered ? 'Maîtrisée' : `${pct}%`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  name: { fontFamily: fonts.serifSemiBold, fontSize: 24, color: colors.navy, marginTop: 12 },
  meta: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 4 },
  empty: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 24 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.cardWhite,
    borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 12,
  },
  ficheName: { fontFamily: fonts.serifSemiBold, fontSize: 15, color: colors.navy },
  ficheSubject: { fontFamily: fonts.sansBold, fontSize: 11, marginTop: 2 },
  badge: { borderRadius: radii.pill, paddingVertical: 5, paddingHorizontal: 10 },
});
