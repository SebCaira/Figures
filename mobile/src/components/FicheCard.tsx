import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './AppText';
import { colors, fonts, radii, subjectMeta } from '../theme/theme';
import { Fiche, ProgressEntry } from '../lib/session';
import { famName } from '../lib/text';

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

export function FicheAvatar({ fiche, size = 56 }: { fiche: Fiche; size?: number }) {
  const meta = subjectMeta(fiche.subject);
  if (fiche.photo) {
    return <Image source={{ uri: fiche.photo }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: meta.soft }]}>
      <Text style={[styles.avatarText, { color: meta.color, fontSize: size * 0.34 }]}>{initials(fiche.name)}</Text>
    </View>
  );
}

export function FicheCard({ fiche, progress, onPress }: { fiche: Fiche; progress?: ProgressEntry; onPress: () => void }) {
  const meta = subjectMeta(fiche.subject);
  const mastered = !!progress?.mastered;
  const statusLabel = mastered ? 'Maîtrisée' : progress ? `À revoir · ${Math.round((progress.best / progress.total) * 100)}%` : 'À revoir';
  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${famName(fiche.name)}${fiche.years ? ', ' + fiche.years : ''}, ${statusLabel}`}
    >
      <FicheAvatar fiche={fiche} size={64} />
      <Text style={styles.name} numberOfLines={1}>{famName(fiche.name)}</Text>
      {!!fiche.years && <Text style={styles.years} numberOfLines={1}>{fiche.years}</Text>}
      <View style={[styles.badge, { backgroundColor: mastered ? colors.greenSoft : colors.amberSoft }]}>
        <Text style={[styles.badgeText, { color: mastered ? colors.greenDark : colors.amber }]}>
          {statusLabel}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.serifSemiBold },
  card: {
    width: 128, backgroundColor: colors.cardWhite, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border, padding: 12, marginRight: 10, alignItems: 'flex-start',
  },
  name: { fontFamily: fonts.serifSemiBold, fontSize: 15, color: colors.navy, marginTop: 10 },
  years: { fontFamily: fonts.sans, fontSize: 11, color: colors.muted, marginTop: 2 },
  badge: { marginTop: 8, borderRadius: radii.pill, paddingVertical: 4, paddingHorizontal: 8 },
  badgeText: { fontFamily: fonts.sansBold, fontSize: 10 },
});
