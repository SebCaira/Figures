import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle, TextStyle, ActivityIndicator, TextInput } from 'react-native';
import { Text } from './AppText';
import { colors, fonts, radii } from '../theme/theme';
import { useSession } from '../lib/session';

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({
  label, onPress, dark = true, loading = false, disabled = false, style,
}: { label: string; onPress: () => void; dark?: boolean; loading?: boolean; disabled?: boolean; style?: ViewStyle }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.btn,
        dark ? styles.btnDark : styles.btnLight,
        (disabled || loading) && { opacity: 0.6 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={dark ? colors.cream : colors.navy} />
      ) : (
        <Text style={[styles.btnText, { color: dark ? colors.cream : colors.navy }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function TextField({
  value, onChangeText, placeholder, secureTextEntry, autoCapitalize, keyboardType, style,
}: {
  value: string; onChangeText: (s: string) => void; placeholder: string;
  secureTextEntry?: boolean; autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address'; style?: ViewStyle & TextStyle;
}) {
  const { a11y } = useSession();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.placeholder}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize ?? 'sentences'}
      keyboardType={keyboardType ?? 'default'}
      style={[styles.input, a11y.dys && styles.inputDys, style]}
    />
  );
}

export function Chip({
  label, active, onPress, color,
}: { label: string; active?: boolean; onPress?: () => void; color?: string }) {
  const accent = color || colors.navy;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      style={[
        styles.chip,
        active ? { backgroundColor: accent, borderColor: accent } : { backgroundColor: colors.cardWhite, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? colors.cream : colors.navy }]}>{label}</Text>
    </Pressable>
  );
}

export function SectionTitle({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Retour" style={styles.backBtn}>
      <Text style={styles.backBtnText}>‹ Retour</Text>
    </Pressable>
  );
}

export function LicenceLockedCard({ onActivate }: { onActivate: () => void }) {
  return (
    <View style={styles.lockedCard}>
      <Text style={styles.lockedTitle}>Licence établissement requise</Text>
      <Text style={styles.lockedText}>
        Cette section est réservée aux établissements ayant une licence Figures active. Demande le code de licence à ton établissement, puis active-le dans Réglages.
      </Text>
      <PrimaryButton label="Aller dans Réglages" onPress={onActivate} style={{ marginTop: 16 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  card: {
    backgroundColor: colors.cardWhite, borderRadius: radii.lg, borderWidth: 1,
    borderColor: colors.border, padding: 18,
  },
  btn: {
    borderRadius: radii.md, paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
  },
  btnDark: { backgroundColor: colors.navy },
  btnLight: { backgroundColor: colors.cardWhite, borderWidth: 1, borderColor: colors.border },
  btnText: { fontFamily: fonts.sansBold, fontSize: 15 },
  input: {
    backgroundColor: colors.cardWhite, borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 13,
    fontFamily: fonts.sans, fontSize: 15, color: colors.navy,
  },
  inputDys: { fontFamily: 'AtkinsonHyperlegible_400Regular', letterSpacing: 0.3 },
  chip: {
    borderWidth: 1, borderRadius: radii.pill, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, marginBottom: 8,
  },
  chipText: { fontFamily: fonts.sansBold, fontSize: 13 },
  sectionTitle: { fontFamily: fonts.sansBold, fontSize: 13, letterSpacing: 0.4, color: colors.muted, textTransform: 'uppercase', marginBottom: 10 },
  backBtn: { paddingVertical: 6, paddingHorizontal: 2, alignSelf: 'flex-start' },
  backBtnText: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.navy },
  lockedCard: {
    backgroundColor: colors.cardWhite, borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.lg, padding: 20, marginTop: 40,
  },
  lockedTitle: { fontFamily: fonts.serifSemiBold, fontSize: 19, color: colors.navy },
  lockedText: { fontFamily: fonts.sans, fontSize: 14, color: colors.muted, marginTop: 8, lineHeight: 20 },
});
