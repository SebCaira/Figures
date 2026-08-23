import React, { useMemo, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../src/components/AppText';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, fonts, radii, subjectMeta } from '../../src/theme/theme';
import { isLicenceActive, useSession } from '../../src/lib/session';
import { useData } from '../../src/lib/data';
import { LicenceLockedCard, PrimaryButton } from '../../src/components/ui';

export default function ProfFiches() {
  const { session } = useSession();
  const { customQuizzes, refreshProfData } = useData();
  const router = useRouter();

  useFocusEffect(useCallback(() => { refreshProfData(); }, [refreshProfData]));

  const groups = useMemo(() => {
    const bySubject: Record<string, number> = {};
    Object.values(customQuizzes).forEach((q) => { bySubject[q.subject] = (bySubject[q.subject] || 0) + 1; });
    return Object.entries(bySubject);
  }, [customQuizzes]);

  if (session?.role !== 'prof') return null;

  if (!isLicenceActive(session)) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40 }}>
        <Text style={styles.greeting}>Bonjour {session.prenom}</Text>
        <LicenceLockedCard onActivate={() => router.push('/(prof)/reglages')} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Bonjour {session.prenom}</Text>
          <View style={styles.pill}><Text style={styles.pillText}>Prof</Text></View>
        </View>
      </View>
      <Text style={styles.hint}>Tape un nom, l'IA génère le quiz et la fiche.</Text>

      <PrimaryButton label="+ Nouveau personnage" onPress={() => router.push('/create')} style={{ marginTop: 16 }} />

      <View style={{ marginTop: 24, gap: 10 }}>
        {groups.length === 0 && (
          <Text style={styles.empty}>Aucun personnage créé pour l'instant.</Text>
        )}
        {groups.map(([subject, count]) => {
          const meta = subjectMeta(subject);
          return (
            <Pressable
              key={subject}
              style={styles.groupCard}
              onPress={() => router.push(`/subject/${encodeURIComponent(subject)}`)}
              accessibilityRole="button"
              accessibilityLabel={`${subject}, ${count} personnage${count > 1 ? 's' : ''}`}
            >
              <View style={[styles.countBadge, { backgroundColor: meta.soft }]}>
                <Text style={[styles.countText, { color: meta.color }]}>{count}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.groupName}>{subject}</Text>
                <Text style={styles.groupSub}>{count} personnage{count > 1 ? 's' : ''}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontFamily: fonts.serifSemiBold, fontSize: 24, color: colors.navy },
  pill: { alignSelf: 'flex-start', backgroundColor: colors.teacherSoft, borderRadius: radii.pill, paddingVertical: 4, paddingHorizontal: 10, marginTop: 6 },
  pillText: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.teacherAccent },
  hint: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 10 },
  empty: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
  groupCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.cardWhite,
    borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 14,
  },
  countBadge: { width: 36, height: 36, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  countText: { fontFamily: fonts.sansBold, fontSize: 14 },
  groupName: { fontFamily: fonts.serifSemiBold, fontSize: 16, color: colors.navy },
  groupSub: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, marginTop: 1 },
  chevron: { fontSize: 20, color: colors.placeholder },
});
