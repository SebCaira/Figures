import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fonts, radii } from '../src/theme/theme';
import { useSession } from '../src/lib/session';
import { BackButton, PrimaryButton, TextField } from '../src/components/ui';

type Role = 'eleve' | 'prof';

export default function Auth() {
  const { role: roleParam } = useLocalSearchParams<{ role: string }>();
  const role: Role = roleParam === 'prof' ? 'prof' : 'eleve';
  const router = useRouter();
  const { authLoading, authError, setAuthError, teacherSignup, teacherLogin, studentJoin } = useSession();

  const [mode, setMode] = useState<'login' | 'signup' | 'join'>(role === 'prof' ? 'login' : 'join');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');

  const accent = role === 'eleve' ? colors.studentAccent : colors.teacherAccent;
  const soft = role === 'eleve' ? colors.studentSoft : colors.teacherSoft;
  const icon = role === 'eleve' ? '✸' : '✎';
  const heading = role === 'eleve' ? 'Rejoindre ma classe' : mode === 'signup' ? 'Créer un compte' : 'Se connecter';

  const submit = async () => {
    let ok = false;
    if (role === 'prof' && mode === 'signup') ok = await teacherSignup(name, email, password);
    else if (role === 'prof') ok = await teacherLogin(email, password);
    else ok = await studentJoin(code, prenom, nom);
    if (ok) router.replace(role === 'eleve' ? '/(eleve)/quizz' : '/(prof)/fiches');
  };

  const submitLabel = role === 'prof' ? (mode === 'signup' ? 'Créer mon compte' : 'Se connecter') : 'Rejoindre la classe';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
        <BackButton onPress={() => { setAuthError(''); router.replace('/'); }} />

        <View style={[styles.iconWrap, { backgroundColor: soft }]}>
          <Text style={[styles.icon, { color: accent }]}>{icon}</Text>
        </View>
        <Text style={styles.heading}>{heading}</Text>

        <View style={{ marginTop: 24, gap: 12 }}>
          {role === 'prof' && mode === 'signup' && (
            <TextField value={name} onChangeText={setName} placeholder="Ton nom (ex. M. Lemaire)" />
          )}
          {role === 'prof' && (
            <>
              <TextField value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
              <TextField value={password} onChangeText={setPassword} placeholder="Mot de passe" secureTextEntry />
            </>
          )}
          {role === 'eleve' && (
            <>
              <TextField value={code} onChangeText={setCode} placeholder="Code de la classe" autoCapitalize="characters" />
              <TextField value={prenom} onChangeText={setPrenom} placeholder="Ton prénom" />
              <TextField value={nom} onChangeText={setNom} placeholder="Ton nom" />
            </>
          )}
        </View>

        {!!authError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        )}

        <PrimaryButton label={submitLabel} onPress={submit} loading={authLoading} style={{ marginTop: 20 }} />

        {role === 'prof' && (
          <Text style={styles.toggle} onPress={() => { setAuthError(''); setMode(mode === 'signup' ? 'login' : 'signup'); }}>
            {mode === 'signup' ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? En créer un"}
          </Text>
        )}

        <Text style={styles.footerNote}>
          Démo : tu peux créer un compte fictif. Les données restent sur cet appareil et sur le compte cloud sécurisé de l'établissement.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  iconWrap: { width: 52, height: 52, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  icon: { fontSize: 24 },
  heading: { fontFamily: fonts.serifSemiBold, fontSize: 26, color: colors.navy, marginTop: 16 },
  errorBanner: { backgroundColor: colors.redSoft, borderRadius: radii.md, padding: 12, marginTop: 14 },
  errorText: { fontFamily: fonts.sans, fontSize: 13, color: colors.redDark },
  toggle: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.navy, marginTop: 18, textAlign: 'center' },
  footerNote: { fontFamily: fonts.sans, fontSize: 11, color: colors.placeholder, marginTop: 30, textAlign: 'center', lineHeight: 16 },
});
