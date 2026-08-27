import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Text } from '../../src/components/AppText';
import { useRouter } from 'expo-router';
import { colors, fonts, radii } from '../../src/theme/theme';
import { useSession } from '../../src/lib/session';
import { useToast } from '../../src/lib/toast';
import { Card, PrimaryButton, SectionTitle, TextField } from '../../src/components/ui';

export default function Espace() {
  const { session, collection, a11y, toggleA11y, logout, deleteAccount } = useSession();
  const { flashToast } = useToast();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  if (session?.role !== 'eleve') return null;

  const initials = `${session.prenom[0] ?? ''}${session.nom[0] ?? ''}`.toUpperCase();

  const confirmDeleteAccount = () => {
    if (!deletePassword) { flashToast('Entre ton mot de passe pour confirmer.'); return; }
    Alert.alert(
      'Supprimer mon compte',
      'Action irréversible : ton compte, tes fiches collectées et ta progression seront définitivement supprimés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const result = await deleteAccount(deletePassword);
            setDeleting(false);
            if (result.ok) router.replace('/');
            else flashToast(result.message);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40 }}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
        <Text style={styles.name}>{session.prenom} {session.nom}</Text>
        <Text style={styles.meta}>{session.classe} · {collection.length} fiche{collection.length > 1 ? 's' : ''}</Text>
      </View>

      <Card style={{ marginTop: 20 }}>
        <InfoRow label="Prénom" value={session.prenom} />
        <InfoRow label="Nom" value={session.nom} />
        <InfoRow label="Classe" value={`${session.classe} (${session.classCode})`} last />
        <Text style={styles.lockNote}>Ton identité est enregistrée et ne peut plus être modifiée. Contacte ton professeur en cas d'erreur.</Text>
      </Card>

      <View style={{ marginTop: 24 }}>
        <SectionTitle>Accessibilité</SectionTitle>
        <Card>
          <ToggleRow label="Police adaptée (dys)" value={a11y.dys} onChange={() => toggleA11y('dys')} />
          <ToggleRow label="Grand texte" value={a11y.large} onChange={() => toggleA11y('large')} last />
        </Card>
      </View>

      <View style={{ marginTop: 24, gap: 10 }}>
        <PrimaryButton label="À propos de Figures" dark={false} onPress={() => router.push('/about')} />
        <PrimaryButton label="Se déconnecter" dark={false} onPress={() => { logout(); router.replace('/'); }} />
        {showDeleteConfirm ? (
          <View style={styles.deleteBox}>
            <Text style={styles.fieldLabel}>Mot de passe</Text>
            <TextField
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Ton mot de passe"
              secureTextEntry
              style={{ marginTop: 4 }}
            />
            <PrimaryButton
              label="Confirmer la suppression"
              loading={deleting}
              onPress={confirmDeleteAccount}
              style={{ marginTop: 10, backgroundColor: colors.red }}
            />
            <PrimaryButton
              label="Annuler"
              dark={false}
              onPress={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
              style={{ marginTop: 8 }}
            />
          </View>
        ) : (
          <PrimaryButton
            label="Supprimer mon compte"
            dark={false}
            onPress={() => setShowDeleteConfirm(true)}
            style={{ borderColor: colors.red }}
          />
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ToggleRow({ label, value, onChange, last }: { label: string; value: boolean; onChange: () => void; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.gold, false: colors.border }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  header: { alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.studentSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.serifSemiBold, fontSize: 26, color: colors.studentAccent },
  name: { fontFamily: fonts.serifSemiBold, fontSize: 21, color: colors.navy, marginTop: 12 },
  meta: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.dividerLight },
  infoLabel: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.muted },
  infoValue: { fontFamily: fonts.sans, fontSize: 13, color: colors.navy },
  lockNote: { fontFamily: fonts.sans, fontSize: 11, color: colors.placeholder, marginTop: 10, lineHeight: 15 },
  deleteBox: {
    backgroundColor: colors.cardWhite, borderWidth: 1, borderColor: colors.red,
    borderRadius: radii.lg, padding: 14,
  },
  fieldLabel: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.muted },
});
