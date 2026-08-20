import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../src/components/AppText';
import { Redirect, useRouter } from 'expo-router';
import { colors, fonts, radii } from '../src/theme/theme';
import { useSession } from '../src/lib/session';
import { ConsentGate } from '../src/components/ConsentGate';

export default function Landing() {
  const { ready, session, consentAccepted } = useSession();
  const router = useRouter();

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.navy }} />;
  if (!consentAccepted) return <ConsentGate />;
  if (session?.role === 'eleve') return <Redirect href="/(eleve)/quizz" />;
  if (session?.role === 'prof') return <Redirect href="/(prof)/fiches" />;

  return (
    <View style={styles.screen}>
      <View style={styles.center}>
        <View style={styles.logo}>
          <Text style={styles.logoF}>F<Text style={{ color: colors.gold }}>.</Text></Text>
        </View>
        <Text style={styles.kicker}>Bienvenue sur</Text>
        <Text style={styles.title}>Figures<Text style={{ color: colors.gold }}>.</Text></Text>
        <Text style={styles.subtitle}>les personnages de tes cours</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.roleBtn, styles.roleBtnDark]} onPress={() => router.push('/auth?role=eleve')}>
          <Text style={styles.roleIcon}>✸</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.roleTitleDark}>Espace élève</Text>
            <Text style={styles.roleSubDark}>Je réponds aux quiz et je collectionne mes fiches</Text>
          </View>
        </Pressable>
        <Pressable style={[styles.roleBtn, styles.roleBtnLight]} onPress={() => router.push('/auth?role=prof')}>
          <Text style={[styles.roleIcon, { color: colors.navy }]}>✎</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.roleTitleLight}>Espace professeur</Text>
            <Text style={styles.roleSubLight}>Je crée les personnages et je partage les codes</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: 26, paddingTop: 90, paddingBottom: 30, justifyContent: 'space-between' },
  center: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 60, height: 60, borderRadius: 16, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  logoF: { fontFamily: fonts.serifSemiBold, fontSize: 32, color: colors.cream },
  kicker: { fontFamily: fonts.sansBold, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: colors.gold },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 44, color: colors.navy, marginTop: 4 },
  subtitle: { fontFamily: fonts.sans, fontSize: 15, color: colors.muted, marginTop: 6 },
  actions: { gap: 14 },
  roleBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: radii.xl, paddingVertical: 20, paddingHorizontal: 22 },
  roleBtnDark: { backgroundColor: colors.navy },
  roleBtnLight: { backgroundColor: colors.cardWhite, borderWidth: 1, borderColor: colors.border },
  roleIcon: { fontSize: 24, color: colors.cream },
  roleTitleDark: { fontFamily: fonts.serifSemiBold, fontSize: 17, color: colors.cream },
  roleSubDark: { fontFamily: fonts.sans, fontSize: 12, color: 'rgba(246,242,233,0.7)', marginTop: 3 },
  roleTitleLight: { fontFamily: fonts.serifSemiBold, fontSize: 17, color: colors.navy },
  roleSubLight: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, marginTop: 3 },
});
