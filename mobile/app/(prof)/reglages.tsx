import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Text } from '../../src/components/AppText';
import { useRouter } from 'expo-router';
import { colors, fonts } from '../../src/theme/theme';
import { isLicenceActive, useSession } from '../../src/lib/session';
import { useData } from '../../src/lib/data';
import { useToast } from '../../src/lib/toast';
import { Card, Chip, PrimaryButton, TextField } from '../../src/components/ui';

export default function Reglages() {
  const { session, a11y, toggleA11y, logout, activateLicence } = useSession();
  const { classes, customQuizzes } = useData();
  const { flashToast } = useToast();
  const router = useRouter();

  const [licenceCode, setLicenceCode] = useState('');
  const [activating, setActivating] = useState(false);

  const subjects = useMemo(
    () => Array.from(new Set(Object.values(customQuizzes).map((q) => q.subject))),
    [customQuizzes]
  );

  if (session?.role !== 'prof') return null;

  const licenceActive = isLicenceActive(session);

  const activate = async () => {
    if (!licenceCode.trim()) return;
    setActivating(true);
    const result = await activateLicence(licenceCode.trim());
    setActivating(false);
    flashToast(result.message);
    if (result.ok) setLicenceCode('');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40 }}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{session.prenom[0]?.toUpperCase()}</Text></View>
        <Text style={styles.name}>{session.prenom}</Text>
        <Text style={styles.meta}>{Object.keys(customQuizzes).length} personnage{Object.keys(customQuizzes).length > 1 ? 's' : ''} · {classes.length} classe{classes.length > 1 ? 's' : ''}</Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={styles.sectionLabel}>Licence établissement</Text>
        <Card>
          {licenceActive ? (
            <Text style={styles.rowLabel}>
              Licence active jusqu'au {new Date(session.licenceExpiration!).toLocaleDateString('fr-FR')}
            </Text>
          ) : (
            <>
              <TextField
                value={licenceCode}
                onChangeText={setLicenceCode}
                placeholder="Ex. INST-XXXX-2026"
                autoCapitalize="characters"
              />
              <PrimaryButton
                label="Activer"
                onPress={activate}
                loading={activating}
                style={{ marginTop: 10 }}
              />
            </>
          )}
        </Card>
      </View>

      {subjects.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionLabel}>Mes matières</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {subjects.map((s) => <Chip key={s} label={s} />)}
          </View>
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <Text style={styles.sectionLabel}>Accessibilité</Text>
        <Card>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Police adaptée (dys)</Text>
            <Switch value={a11y.dys} onValueChange={() => toggleA11y('dys')} trackColor={{ true: colors.gold, false: colors.border }} />
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.rowLabel}>Grand texte</Text>
            <Switch value={a11y.large} onValueChange={() => toggleA11y('large')} trackColor={{ true: colors.gold, false: colors.border }} />
          </View>
        </Card>
      </View>

      <View style={{ marginTop: 24, gap: 10 }}>
        <PrimaryButton label="À propos de Figures" dark={false} onPress={() => router.push('/about')} />
        <PrimaryButton label="Se déconnecter" dark={false} onPress={() => { logout(); router.replace('/'); }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  header: { alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.teacherSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.serifSemiBold, fontSize: 26, color: colors.teacherAccent },
  name: { fontFamily: fonts.serifSemiBold, fontSize: 21, color: colors.navy, marginTop: 12 },
  meta: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 2 },
  sectionLabel: { fontFamily: fonts.sansBold, fontSize: 13, letterSpacing: 0.4, color: colors.muted, textTransform: 'uppercase', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.dividerLight },
  rowLabel: { fontFamily: fonts.sans, fontSize: 14, color: colors.navy },
});
