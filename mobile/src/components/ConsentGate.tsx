import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './AppText';
import { colors, fonts, radii } from '../theme/theme';
import { useSession } from '../lib/session';
import { PrimaryButton } from './ui';

export function ConsentGate() {
  const { acceptConsent } = useSession();
  return (
    <View style={styles.screen}>
      <View style={styles.sheet}>
        <Text style={styles.icon}>⚙</Text>
        <Text style={styles.title}>Confidentialité & données</Text>
        <Text style={styles.body}>
          Figures est conçu pour le milieu scolaire et respecte le <Text style={styles.bold}>RGPD</Text>.
          Les fiches et progrès sont enregistrés sur ton appareil. Aucune donnée n'est revendue.
          Pour les élèves mineurs, l'usage se fait sous la responsabilité de l'établissement.
        </Text>
        <PrimaryButton label="J'ai compris & j'accepte" onPress={acceptConsent} style={{ marginTop: 22 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'rgba(33,48,63,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.cream, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: 26, paddingBottom: 40 },
  icon: { fontSize: 26, color: colors.navy, marginBottom: 10 },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 21, color: colors.navy, marginBottom: 12 },
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.mutedBlue },
  bold: { fontFamily: fonts.sansBold, color: colors.navy },
});
