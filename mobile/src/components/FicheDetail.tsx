import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, subjectMeta } from '../theme/theme';
import { Fiche, ProgressEntry } from '../lib/session';
import { FicheAvatar } from './FicheCard';
import { famName } from '../lib/text';

export function FicheDetail({ fiche, progress }: { fiche: Fiche; progress?: ProgressEntry }) {
  const meta = subjectMeta(fiche.subject);
  const mastered = !!progress?.mastered;
  return (
    <View>
      <View style={[styles.pill, { backgroundColor: meta.soft }]}>
        <Text style={[styles.pillText, { color: meta.color }]}>{fiche.subject}</Text>
      </View>
      <View style={styles.header}>
        <FicheAvatar fiche={fiche} size={84} />
        <Text style={styles.name}>{famName(fiche.name)}</Text>
        {!!fiche.role && <Text style={styles.role}>{fiche.role}</Text>}
        {(fiche.years || fiche.place) && (
          <Text style={styles.meta}>{[fiche.years, fiche.place].filter(Boolean).join(' · ')}</Text>
        )}
        {!!fiche.photo && <Text style={styles.credit}>Portrait d'après Wikimedia Commons · domaine public</Text>}
      </View>

      {progress && (
        <View style={[styles.statusStrip, { backgroundColor: mastered ? colors.greenSoft : colors.amberSoft }]}>
          <Text style={{ color: mastered ? colors.greenDark : colors.amber, fontFamily: fonts.sansBold, fontSize: 13 }}>
            {mastered ? 'Fiche maîtrisée ✓' : `Score : ${progress.best}/${progress.total}`}
          </Text>
        </View>
      )}

      {!!fiche.facts?.length && (
        <View style={styles.factsBlock}>
          {fiche.facts.map((f, i) => (
            <View key={i} style={[styles.factRow, i > 0 && styles.factDivider]}>
              <Text style={styles.factLabel}>{f.label}</Text>
              <Text style={styles.factValue}>{f.value}</Text>
            </View>
          ))}
        </View>
      )}

      {!!fiche.works?.length && (
        <View style={styles.worksBlock}>
          <Text style={styles.blockTitle}>Œuvres & réalisations</Text>
          {fiche.works.map((w, i) => (
            <Text key={i} style={styles.workItem}>· {w}</Text>
          ))}
        </View>
      )}

      {!!fiche.didYouKnow && (
        <View style={styles.dykBlock}>
          <Text style={styles.dykTitle}>Le savais-tu ?</Text>
          <Text style={styles.dykText}>{fiche.didYouKnow}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-start', borderRadius: radii.pill, paddingVertical: 5, paddingHorizontal: 12, marginBottom: 14 },
  pillText: { fontFamily: fonts.sansBold, fontSize: 12 },
  header: { alignItems: 'center', marginBottom: 16 },
  name: { fontFamily: fonts.serifSemiBold, fontSize: 24, color: colors.navy, marginTop: 12, textAlign: 'center' },
  role: { fontFamily: fonts.sans, fontSize: 14, color: colors.mutedBlue, marginTop: 2 },
  meta: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 4 },
  credit: { fontFamily: fonts.sans, fontSize: 10, color: colors.placeholder, marginTop: 6, fontStyle: 'italic' },
  statusStrip: { borderRadius: radii.md, paddingVertical: 10, alignItems: 'center', marginBottom: 16 },
  factsBlock: { backgroundColor: colors.cardWhite, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  factRow: { paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  factDivider: { borderTopWidth: 1, borderTopColor: colors.dividerLight },
  factLabel: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.muted, flexShrink: 0 },
  factValue: { fontFamily: fonts.sans, fontSize: 13, color: colors.navy, flex: 1, textAlign: 'right' },
  worksBlock: { marginBottom: 16 },
  blockTitle: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.navy, marginBottom: 8 },
  workItem: { fontFamily: fonts.sans, fontSize: 14, color: colors.navy, marginBottom: 4, lineHeight: 20 },
  dykBlock: { backgroundColor: colors.goldSoft, borderRadius: radii.lg, padding: 14, marginBottom: 8 },
  dykTitle: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.gold, marginBottom: 4 },
  dykText: { fontFamily: fonts.serifRegular, fontStyle: 'italic', fontSize: 14, color: colors.navy, lineHeight: 20 },
});
