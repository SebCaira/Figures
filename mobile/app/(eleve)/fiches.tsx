import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../src/components/AppText';
import { useRouter } from 'expo-router';
import { colors, fonts, subjectMeta } from '../../src/theme/theme';
import { useSession } from '../../src/lib/session';
import { FicheCard } from '../../src/components/FicheCard';

export default function Fiches() {
  const { collection, progress, masteredCount, toReviewCount } = useSession();
  const router = useRouter();

  const groups = useMemo(() => {
    const bySubject: Record<string, typeof collection> = {};
    collection.forEach((f) => { (bySubject[f.subject] ||= []).push(f); });
    return Object.entries(bySubject);
  }, [collection]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40 }}>
      <Text style={styles.title}>Mes fiches</Text>
      <Text style={styles.count}>{collection.length} personnage{collection.length > 1 ? 's' : ''} collecté{collection.length > 1 ? 's' : ''}</Text>

      <View style={styles.stats}>
        <View style={[styles.statTile, { backgroundColor: colors.greenSoft }]}>
          <Text style={[styles.statNum, { color: colors.greenDark }]}>{masteredCount}</Text>
          <Text style={[styles.statLabel, { color: colors.greenDark }]}>maîtrisées</Text>
        </View>
        <View style={[styles.statTile, { backgroundColor: colors.amberSoft }]}>
          <Text style={[styles.statNum, { color: colors.amber }]}>{toReviewCount}</Text>
          <Text style={[styles.statLabel, { color: colors.amber }]}>à revoir</Text>
        </View>
      </View>

      {collection.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Aucune fiche pour l'instant</Text>
          <Text style={styles.emptyHint}>Utilise un code dans l'onglet Quizz pour collectionner ta première fiche.</Text>
        </View>
      ) : (
        groups.map(([subject, fiches]) => {
          const meta = subjectMeta(subject);
          return (
            <View key={subject} style={{ marginTop: 22 }}>
              <View style={styles.groupHeader}>
                <View style={[styles.dot, { backgroundColor: meta.color }]} />
                <Text style={styles.groupTitle}>{subject}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {fiches.map((f) => (
                  <FicheCard key={f.id} fiche={f} progress={progress[f.id]} onPress={() => router.push(`/fiche/${f.id}`)} />
                ))}
              </ScrollView>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 26, color: colors.navy },
  count: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 4 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 18 },
  statTile: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  statNum: { fontFamily: fonts.serifSemiBold, fontSize: 24 },
  statLabel: { fontFamily: fonts.sansBold, fontSize: 12, marginTop: 2 },
  empty: { marginTop: 40, alignItems: 'center', paddingHorizontal: 20 },
  emptyTitle: { fontFamily: fonts.serifSemiBold, fontSize: 17, color: colors.navy },
  emptyHint: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 6, textAlign: 'center' },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  groupTitle: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.navy },
});
