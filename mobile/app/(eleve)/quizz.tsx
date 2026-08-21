import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../src/components/AppText';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { colors, fonts, radii, subjectMeta } from '../../src/theme/theme';
import { useSession } from '../../src/lib/session';
import { useData } from '../../src/lib/data';
import { useQuizRun } from '../../src/lib/quizRun';
import { useToast } from '../../src/lib/toast';
import { computeBadges } from '../../src/lib/badges';
import { DEMO_CODES } from '../../src/lib/seed';
import { famName } from '../../src/lib/text';
import { Card, Chip, PrimaryButton, SectionTitle, TextField } from '../../src/components/ui';

export default function Quizz() {
  const { session, collection, progress } = useSession();
  const { allQuizzes, assignments, refreshClassQuizzes } = useData();
  const { startQuiz } = useQuizRun();

  // Assignments/personnages a teacher just published elsewhere aren't pushed to
  // this device — refetch every time this tab regains focus so they show up
  // without requiring a full logout/login.
  useFocusEffect(useCallback(() => { refreshClassQuizzes(); }, [refreshClassQuizzes]));
  const { flashToast } = useToast();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [showAllBadges, setShowAllBadges] = useState(false);

  const prenom = session?.role === 'eleve' ? session.prenom : '';
  const badges = useMemo(() => computeBadges(collection, progress), [collection, progress]);
  const earned = badges.filter((b) => b.earned);
  const shown = showAllBadges ? badges : badges.slice(0, 4);

  const launch = (raw: string) => {
    const up = raw.trim().toUpperCase();
    const quiz = allQuizzes[up];
    if (!quiz) { flashToast("Ce code n'existe pas..."); return; }
    startQuiz(quiz, 'character');
    router.push('/quiz');
  };

  const subjects = Array.from(new Set(collection.map((f) => f.subject)));

  const myAssignments = useMemo(() => {
    if (session?.role !== 'eleve') return [];
    return assignments
      .filter((a) => a.classId === session.classId)
      .map((a) => ({ ...a, quiz: allQuizzes[a.quizCode] }))
      .filter((a) => !!a.quiz);
  }, [assignments, allQuizzes, session]);

  const startRevision = (filter: string) => {
    router.push({ pathname: '/quiz', params: { revision: '1', filter } });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40 }}>
      <Text style={styles.greeting}>Bonjour {prenom}</Text>

      <Card style={{ backgroundColor: colors.navy, marginTop: 18 }}>
        <Text style={styles.cardTitleDark}>Lancer un quiz</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <TextField
            value={code}
            onChangeText={setCode}
            placeholder="CODE"
            autoCapitalize="characters"
            style={{ flex: 1, letterSpacing: 2 }}
          />
          <PrimaryButton label="OK" onPress={() => launch(code)} dark={false} style={{ paddingHorizontal: 22 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {DEMO_CODES.map((c) => (
            <Chip key={c} label={c} onPress={() => launch(c)} />
          ))}
        </View>
      </Card>

      {myAssignments.length > 0 && (
        <View style={{ marginTop: 26 }}>
          <SectionTitle>À faire</SectionTitle>
          {myAssignments.map((a) => {
            const meta = subjectMeta(a.quiz!.subject);
            const done = collection.some((f) => f.id === a.quizCode.toLowerCase());
            return (
              <Pressable
                key={a.id}
                onPress={() => { startQuiz(a.quiz!, 'character'); router.push('/quiz'); }}
                style={styles.assignRow}
              >
                <View style={[styles.assignDot, { backgroundColor: meta.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.assignName}>{famName(a.quiz!.name)}</Text>
                  <Text style={styles.assignDue}>À faire pour {a.due}</Text>
                </View>
                <View style={[styles.assignBadge, { backgroundColor: done ? colors.greenSoft : colors.amberSoft }]}>
                  <Text style={{ color: done ? colors.greenDark : colors.amber, fontFamily: fonts.sansBold, fontSize: 11 }}>
                    {done ? 'Fait ✓' : 'À faire'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={{ marginTop: 26 }}>
        <SectionTitle>Réviser mes fiches</SectionTitle>
        <Card style={{ backgroundColor: colors.goldSoft, borderColor: colors.goldSoft }}>
          <PrimaryButton label="Réviser toutes mes fiches" onPress={() => startRevision('Tous')} dark />
          {subjects.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
              {subjects.map((s) => (
                <Chip key={s} label={s} onPress={() => startRevision(s)} color={colors.gold} />
              ))}
            </View>
          )}
        </Card>
      </View>

      <View style={{ marginTop: 26 }}>
        <SectionTitle>Mes récompenses</SectionTitle>
        {shown.map((b) => (
          <View key={b.title} style={styles.badgeRow}>
            <View style={[styles.badgeMark, { backgroundColor: b.earned ? b.accent : colors.border }]}>
              <Text style={styles.badgeMarkText}>{b.mark}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.badgeTitle}>{b.title}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
              {!b.earned && (
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.min(100, (b.cur / b.goal) * 100)}%` }]} />
                </View>
              )}
            </View>
            {!b.earned && <Text style={styles.badgeCount}>{b.cur}/{b.goal}</Text>}
          </View>
        ))}
        {badges.length > 4 && (
          <Text style={styles.toggleAll} onPress={() => setShowAllBadges((s) => !s)}>
            {showAllBadges ? 'Voir moins' : 'Voir toutes mes récompenses'}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  assignRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.cardWhite,
    borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: 12, marginBottom: 8,
  },
  assignDot: { width: 8, height: 8, borderRadius: 4 },
  assignName: { fontFamily: fonts.serifSemiBold, fontSize: 14, color: colors.navy },
  assignDue: { fontFamily: fonts.sans, fontSize: 11, color: colors.muted, marginTop: 1 },
  assignBadge: { borderRadius: radii.pill, paddingVertical: 4, paddingHorizontal: 8 },
  greeting: { fontFamily: fonts.serifSemiBold, fontSize: 26, color: colors.navy },
  cardTitleDark: { fontFamily: fonts.serifSemiBold, fontSize: 17, color: colors.cream },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  badgeMark: { width: 40, height: 40, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  badgeMarkText: { fontFamily: fonts.serifSemiBold, fontSize: 16, color: colors.white },
  badgeTitle: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.navy },
  badgeDesc: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, marginTop: 1 },
  barTrack: { height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  barFill: { height: 4, backgroundColor: colors.gold },
  badgeCount: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.muted },
  toggleAll: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.navy, marginTop: 8 },
});
