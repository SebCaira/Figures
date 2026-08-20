import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../src/components/AppText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fonts, radii } from '../src/theme/theme';
import { useSession, StudentJoinResult } from '../src/lib/session';
import { BackButton, PrimaryButton, TextField } from '../src/components/ui';

type Role = 'eleve' | 'prof';
type EleveStep = 'join' | 'setup' | 'login' | 'reset';

export default function Auth() {
  const { role: roleParam } = useLocalSearchParams<{ role: string }>();
  const role: Role = roleParam === 'prof' ? 'prof' : 'eleve';
  const router = useRouter();
  const {
    authLoading, authError, setAuthError, teacherSignup, teacherLogin,
    studentJoin, studentSetPassword, studentVerifyPassword, finalizeStudentSession,
  } = useSession();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [code, setCode] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [eleveStep, setEleveStep] = useState<EleveStep>('join');
  const [joinInfo, setJoinInfo] = useState<StudentJoinResult | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [resetCode, setResetCode] = useState('');

  const accent = role === 'eleve' ? colors.studentAccent : colors.teacherAccent;
  const soft = role === 'eleve' ? colors.studentSoft : colors.teacherSoft;
  const icon = role === 'eleve' ? '✸' : '✎';

  const goEleveSpace = () => router.replace('/(eleve)/quizz');

  const submitJoin = async () => {
    const result = await studentJoin(code, prenom, nom);
    if (!result) return;
    setJoinInfo(result);
    setEleveStep(result.needsPasswordSetup ? 'setup' : 'login');
  };

  const submitSetup = async () => {
    if (!joinInfo) return;
    if (newPassword !== newPasswordConfirm) {
      setAuthError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    const ok = await studentSetPassword(
      joinInfo.eleveId, newPassword, eleveStep === 'reset' ? resetCode.trim().toUpperCase() : undefined
    );
    if (!ok) return;
    finalizeStudentSession({ ...joinInfo, prenom: prenom.trim(), nom: nom.trim() });
    goEleveSpace();
  };

  const submitLogin = async () => {
    if (!joinInfo) return;
    const ok = await studentVerifyPassword(joinInfo.eleveId, password);
    if (!ok) return;
    finalizeStudentSession({ ...joinInfo, prenom: prenom.trim(), nom: nom.trim() });
    goEleveSpace();
  };

  const submitTeacher = async () => {
    let ok = false;
    if (mode === 'signup') ok = await teacherSignup(name, email, password);
    else ok = await teacherLogin(email, password);
    if (ok) router.replace('/(prof)/fiches');
  };

  const heading =
    role === 'prof'
      ? (mode === 'signup' ? 'Créer un compte' : 'Se connecter')
      : eleveStep === 'join' ? 'Rejoindre ma classe'
      : eleveStep === 'setup' ? 'Crée ton mot de passe'
      : eleveStep === 'reset' ? 'Réinitialiser ton mot de passe'
      : 'Ton mot de passe';

  const submitLabel =
    role === 'prof' ? (mode === 'signup' ? 'Créer mon compte' : 'Se connecter')
    : eleveStep === 'join' ? 'Continuer'
    : eleveStep === 'setup' || eleveStep === 'reset' ? 'Valider'
    : 'Se connecter';

  const onSubmit = () => {
    if (role === 'prof') return submitTeacher();
    if (eleveStep === 'join') return submitJoin();
    if (eleveStep === 'setup' || eleveStep === 'reset') return submitSetup();
    return submitLogin();
  };

  const backFromEleveStep = () => {
    setAuthError('');
    if (eleveStep === 'setup' || eleveStep === 'login' || eleveStep === 'reset') {
      setEleveStep('join');
      setJoinInfo(null);
      setPassword('');
      return;
    }
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
        <BackButton onPress={role === 'eleve' ? backFromEleveStep : () => { setAuthError(''); router.replace('/'); }} />

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

          {role === 'eleve' && eleveStep === 'join' && (
            <>
              <TextField value={code} onChangeText={setCode} placeholder="Code de la classe" autoCapitalize="characters" />
              <TextField value={prenom} onChangeText={setPrenom} placeholder="Ton prénom" />
              <TextField value={nom} onChangeText={setNom} placeholder="Ton nom" />
            </>
          )}

          {role === 'eleve' && eleveStep === 'setup' && (
            <>
              <Text style={styles.helper}>
                Bienvenue {prenom} ! Crée un mot de passe pour protéger ton compte — tu en auras besoin pour te reconnecter.
              </Text>
              <TextField value={newPassword} onChangeText={setNewPassword} placeholder="Nouveau mot de passe" secureTextEntry />
              <TextField value={newPasswordConfirm} onChangeText={setNewPasswordConfirm} placeholder="Confirme le mot de passe" secureTextEntry />
            </>
          )}

          {role === 'eleve' && eleveStep === 'login' && (
            <>
              <Text style={styles.helper}>Content de te revoir, {prenom} !</Text>
              <TextField value={password} onChangeText={setPassword} placeholder="Ton mot de passe" secureTextEntry />
            </>
          )}

          {role === 'eleve' && eleveStep === 'reset' && (
            <>
              <Text style={styles.helper}>
                Demande à ton professeur le code de réinitialisation, puis choisis un nouveau mot de passe.
              </Text>
              <TextField value={resetCode} onChangeText={setResetCode} placeholder="Code de réinitialisation" autoCapitalize="characters" />
              <TextField value={newPassword} onChangeText={setNewPassword} placeholder="Nouveau mot de passe" secureTextEntry />
              <TextField value={newPasswordConfirm} onChangeText={setNewPasswordConfirm} placeholder="Confirme le mot de passe" secureTextEntry />
            </>
          )}
        </View>

        {!!authError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        )}

        <PrimaryButton label={submitLabel} onPress={onSubmit} loading={authLoading} style={{ marginTop: 20 }} />

        {role === 'prof' && (
          <Text style={styles.toggle} onPress={() => { setAuthError(''); setMode(mode === 'signup' ? 'login' : 'signup'); }}>
            {mode === 'signup' ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? En créer un"}
          </Text>
        )}

        {role === 'eleve' && eleveStep === 'login' && (
          <Text style={styles.toggle} onPress={() => { setAuthError(''); setResetCode(''); setNewPassword(''); setNewPasswordConfirm(''); setEleveStep('reset'); }}>
            Mot de passe oublié ? Demande un code à ton professeur
          </Text>
        )}

        <Text style={styles.footerNote}>
          Les données restent liées à ta classe et sont enregistrées de façon sécurisée.
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
  helper: { fontFamily: fonts.sans, fontSize: 13, color: colors.mutedBlue, marginBottom: 2 },
  errorBanner: { backgroundColor: colors.redSoft, borderRadius: radii.md, padding: 12, marginTop: 14 },
  errorText: { fontFamily: fonts.sans, fontSize: 13, color: colors.redDark },
  toggle: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.navy, marginTop: 18, textAlign: 'center' },
  footerNote: { fontFamily: fonts.sans, fontSize: 11, color: colors.placeholder, marginTop: 30, textAlign: 'center', lineHeight: 16 },
});
