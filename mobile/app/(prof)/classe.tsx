import React, { useState, useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../src/components/AppText';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { colors, fonts, radii } from '../../src/theme/theme';
import { useSession } from '../../src/lib/session';
import { useData } from '../../src/lib/data';
import { useToast } from '../../src/lib/toast';
import { Card, Chip, PrimaryButton, SectionTitle, TextField } from '../../src/components/ui';

export default function Classe() {
  const { session } = useSession();
  const { classes, customQuizzes, assignments, createClass, joinAsCoTeacher, removeStudent, deleteClass, archiveClass, reopenClass, assignQuiz, generateResetCode, refreshProfData } = useData();
  const { flashToast } = useToast();
  const router = useRouter();

  // Roster/progress/co-teacher changes made elsewhere (a student finishing a
  // quiz, a co-teacher joining) aren't pushed here — refetch on every focus.
  useFocusEffect(useCallback(() => { refreshProfData(); }, [refreshProfData]));

  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  if (session?.role !== 'prof') return null;

  const doCreate = async () => {
    if (!newName.trim()) return;
    const cls = await createClass(newName.trim());
    setNewName('');
    if (cls) flashToast(`Classe créée · ${cls.code}`);
    else flashToast('Impossible de créer la classe. Réessaie.');
  };

  const doJoin = async () => {
    if (!joinCode.trim()) return;
    const res = await joinAsCoTeacher(joinCode.trim());
    setJoinCode('');
    flashToast(res.message);
  };

  const copyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    flashToast('Code copié ✓');
  };

  const resetPassword = async (eleveId: string, studentName: string) => {
    const code = await generateResetCode(eleveId);
    if (!code) { flashToast('Impossible de générer le code. Réessaie.'); return; }
    await Clipboard.setStringAsync(code);
    Alert.alert(
      'Code de réinitialisation',
      `Donne ce code à ${studentName} (copié dans le presse-papiers) :\n\n${code}\n\nValable 24h, à usage unique — il lui permettra de créer un nouveau mot de passe.`
    );
  };

  const confirmDelete = (classId: string) => {
    Alert.alert(
      'Supprimer la classe',
      "Action irréversible : la classe, ses élèves et leur progression sont effacés définitivement. Pour un simple passage à l'année suivante, utilise plutôt \"Clore la classe\".",
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteClass(classId) },
      ]
    );
  };

  const confirmArchive = (classId: string) => {
    Alert.alert(
      'Clore la classe',
      "Plus aucun nouvel élève ne pourra la rejoindre avec ce code. Les élèves déjà inscrits gardent leurs fiches et leur progression, et peuvent toujours se connecter.",
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Clore', onPress: () => archiveClass(classId) },
      ]
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40 }}>
      <Text style={styles.title}>Mes classes</Text>
      <Text style={styles.explainer}>Crée une classe, partage son code, suis la progression de tes élèves.</Text>

      <Card style={{ marginTop: 18 }}>
        <SectionTitle>Nouvelle classe</SectionTitle>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextField value={newName} onChangeText={setNewName} placeholder="Ex. 4e B" style={{ flex: 1 }} />
          <PrimaryButton label="Créer" onPress={doCreate} style={{ paddingHorizontal: 20 }} />
        </View>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <SectionTitle>Rejoindre une classe (co-prof)</SectionTitle>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextField value={joinCode} onChangeText={setJoinCode} placeholder="Code de la classe" autoCapitalize="characters" style={{ flex: 1 }} />
          <PrimaryButton label="Rejoindre" dark={false} onPress={doJoin} style={{ paddingHorizontal: 20 }} />
        </View>
      </Card>

      <View style={{ marginTop: 20, gap: 12 }}>
        {classes.map((c) => {
          const isOpen = expanded === c.id;
          const classAssignments = assignments.filter((a) => a.classId === c.id);
          return (
            <View key={c.id} style={styles.classCard}>
              <Pressable
                style={styles.classHeader}
                onPress={() => setExpanded(isOpen ? null : c.id)}
                accessibilityRole="button"
                accessibilityLabel={`${c.name}, ${c.students.length} élève${c.students.length > 1 ? 's' : ''}, code ${c.code}${c.archivedAt ? ', fermée' : ''}`}
                accessibilityState={{ expanded: isOpen }}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.className}>{c.name}</Text>
                    {!!c.archivedAt && (
                      <View style={styles.closedBadge}><Text style={styles.closedBadgeText}>Fermée</Text></View>
                    )}
                  </View>
                  <Text style={styles.classMeta}>{c.students.length} élève{c.students.length > 1 ? 's' : ''} · {c.code}</Text>
                </View>
                <Text style={styles.chevron}>{isOpen ? '⌃' : '⌄'}</Text>
              </Pressable>

              {isOpen && (
                <View style={styles.classBody}>
                  <PrimaryButton label="Copier le code" dark={false} onPress={() => copyCode(c.code)} />

                  <SectionTitle style={{ marginTop: 16 }}>Équipe pédagogique</SectionTitle>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {c.teachers.map((t, i) => (
                      <Chip key={i} label={t === session.prenom ? `${t} (toi)` : t} />
                    ))}
                  </View>
                  <Text style={styles.coTeachHint}>Un autre professeur peut co-animer cette classe en utilisant son code dans "Rejoindre une classe".</Text>

                  {Object.keys(customQuizzes).length > 0 && (
                    <>
                      <SectionTitle style={{ marginTop: 16 }}>Questionnaires partagés</SectionTitle>
                      {Object.values(customQuizzes).map((q) => {
                        const assigned = classAssignments.some((a) => a.quizCode === q.code);
                        return (
                          <View key={q.code} style={styles.assignRow}>
                            <Text style={styles.assignName}>{q.name}</Text>
                            <Chip label={assigned ? 'Assigné ✓' : 'Assigner'} active={assigned} onPress={() => assignQuiz(c.id, q.code)} />
                          </View>
                        );
                      })}
                    </>
                  )}

                  <SectionTitle style={{ marginTop: 16 }}>Élèves</SectionTitle>
                  {c.students.length === 0 && <Text style={styles.emptyStudents}>Aucun élève n'a encore rejoint.</Text>}
                  {c.students.map((s) => (
                    <View key={s.id} style={styles.studentRow}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Pressable
                          style={{ flex: 1 }}
                          onPress={() => router.push({ pathname: '/student/[id]', params: { id: s.id, classId: c.id } })}
                          accessibilityRole="button"
                          accessibilityLabel={`Voir la fiche de ${s.name}, ${s.fiches} fiches, ${s.pct}`}
                        >
                          <Text style={styles.studentName}>{s.name} ›</Text>
                        </Pressable>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <Text style={styles.studentPct}>{s.fiches} fiches · {s.pct}</Text>
                          <Pressable
                            onPress={() => removeStudent(c.id, s.id)}
                            accessibilityRole="button"
                            accessibilityLabel={`Retirer ${s.name} de la classe`}
                          >
                            <Text style={styles.remove}>×</Text>
                          </Pressable>
                        </View>
                      </View>
                      <Text style={styles.resetLink} onPress={() => resetPassword(s.id, s.name)}>
                        Réinitialiser le mot de passe
                      </Text>
                    </View>
                  ))}

                  <PrimaryButton
                    label={c.archivedAt ? 'Rouvrir la classe' : 'Clore la classe'}
                    dark={false}
                    onPress={() => c.archivedAt ? reopenClass(c.id) : confirmArchive(c.id)}
                    style={{ marginTop: 16 }}
                  />
                  {!!c.archivedAt && (
                    <Text style={styles.closedHint}>
                      Classe fermée depuis le {new Date(c.archivedAt).toLocaleDateString('fr-FR')} · les élèves gardent leurs fiches.
                    </Text>
                  )}
                  <PrimaryButton
                    label="Supprimer la classe"
                    dark={false}
                    onPress={() => confirmDelete(c.id)}
                    style={{ marginTop: 10, borderColor: colors.red }}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 24, color: colors.navy },
  explainer: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 4 },
  classCard: { borderRadius: radii.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  classHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.navy, padding: 16 },
  className: { fontFamily: fonts.serifSemiBold, fontSize: 17, color: colors.cream },
  classMeta: { fontFamily: fonts.sans, fontSize: 12, color: 'rgba(246,242,233,0.7)', marginTop: 2 },
  chevron: { fontSize: 16, color: colors.cream },
  closedBadge: { backgroundColor: 'rgba(246,242,233,0.16)', borderRadius: radii.pill, paddingVertical: 2, paddingHorizontal: 8 },
  closedBadgeText: { fontFamily: fonts.sansBold, fontSize: 10, color: colors.cream },
  closedHint: { fontFamily: fonts.sans, fontSize: 11, color: colors.muted, marginTop: 6, lineHeight: 15 },
  classBody: { backgroundColor: colors.cardWhite, padding: 16 },
  coTeachHint: { fontFamily: fonts.sans, fontSize: 11, color: colors.placeholder, marginTop: 8, lineHeight: 15 },
  assignRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  assignName: { fontFamily: fonts.sans, fontSize: 13, color: colors.navy },
  emptyStudents: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  studentRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.dividerLight },
  studentName: { fontFamily: fonts.sans, fontSize: 13, color: colors.navy },
  studentPct: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  remove: { fontSize: 18, color: colors.red, paddingHorizontal: 4 },
  resetLink: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.gold, marginTop: 4 },
});
