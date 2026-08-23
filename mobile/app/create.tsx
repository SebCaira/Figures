import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../src/components/AppText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fonts, radii, subjectMeta, SUBJECTS } from '../src/theme/theme';
import { isLicenceActive, useSession } from '../src/lib/session';
import { useData } from '../src/lib/data';
import { useToast } from '../src/lib/toast';
import { generateCharacter } from '../src/lib/ai';
import { Question, QuizDef } from '../src/lib/seed';
import { BackButton, Card, Chip, PrimaryButton, SectionTitle, TextField } from '../src/components/ui';

const NIVEAUX = ['6e', '5e', '4e', '3e'];
const LANGUES = ['Français', 'Anglais', 'Allemand', 'Espagnol'];

export default function Create() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { session } = useSession();
  const { classes, customQuizzes, publishQuiz, assignQuiz, assignments } = useData();
  const { flashToast } = useToast();
  const router = useRouter();

  const editing = edit ? customQuizzes[edit] : undefined;

  const [name, setName] = useState(editing?.name ?? '');
  const [subject, setSubject] = useState(editing?.subject ?? 'Histoire');
  const [niveau, setNiveau] = useState(editing?.niveau ?? '4e');
  const [langue, setLangue] = useState(editing?.langue ?? 'Français');
  const [classId, setClassId] = useState<string | undefined>(editing?.classId);
  const [role, setRole] = useState(editing?.role ?? '');
  const [years, setYears] = useState(editing?.years ?? '');
  const [place, setPlace] = useState(editing?.place ?? '');
  const [dyk, setDyk] = useState(editing?.didYouKnow ?? '');
  const [works, setWorks] = useState<string[]>(editing?.works ?? []);
  const [questions, setQuestions] = useState<Question[]>(editing?.questions ?? []);
  const [photo, setPhoto] = useState(editing?.photo ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);

  if (session?.role !== 'prof') return null;

  if (!editing && !isLicenceActive(session)) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 50 }}>
        <BackButton onPress={() => router.back()} />
        <View style={styles.lockedCard}>
          <Text style={styles.lockedTitle}>Licence établissement requise</Text>
          <Text style={styles.lockedText}>
            La création de fiches est réservée aux établissements ayant une licence Figures active. Demande le code de licence à ton établissement, puis active-le dans Réglages.
          </Text>
          <PrimaryButton label="Aller dans Réglages" onPress={() => router.push('/(prof)/reglages')} style={{ marginTop: 16 }} />
        </View>
      </ScrollView>
    );
  }

  const generate = async () => {
    if (!name.trim()) { setError('Entre un nom de personnage.'); return; }
    setError(''); setLoading(true);
    try {
      const result = await generateCharacter(name.trim(), subject, niveau, langue);
      setRole(result.role); setYears(result.years); setPlace(result.place);
      setDyk(result.didYouKnow); setWorks(result.works); setQuestions(result.questions);
      if (result.photo) setPhoto(result.photo);
    } catch (e: any) {
      setError(e?.message || "La génération n'a pas abouti.");
    } finally {
      setLoading(false);
    }
  };

  const patchQuestion = (i: number, patch: Partial<Question>) => {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  };

  const publish = async () => {
    if (!questions.length) { setError('Génère au moins un questionnaire avec l\'IA avant de publier.'); return; }
    setPublishing(true);
    const draft: QuizDef = {
      code: editing?.code || '',
      name: name.trim(), subject, role, years, place, didYouKnow: dyk, works,
      questions, by: session.prenom, niveau, langue, classId, photo,
    };
    const result = await publishQuiz(draft, editing?.code);
    if (result && classId) {
      const alreadyAssigned = assignments.some((a) => a.classId === classId && a.quizCode === result.code);
      if (!alreadyAssigned) await assignQuiz(classId, result.code);
    }
    setPublishing(false);
    if (result) {
      flashToast(editing ? 'Fiche modifiée ✓' : `Publié · code ${result.code}`);
      router.back();
    } else {
      flashToast("Impossible de publier. Réessaie.");
    }
  };

  const meta = subjectMeta(subject);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 50 }}>
      <BackButton onPress={() => router.back()} />
      <Text style={styles.title}>{editing ? 'Modifier la fiche' : 'Nouveau personnage'}</Text>

      {!editing && (
        <View style={styles.hintBanner}>
          <Text style={styles.hintText}>
            Tape juste un nom : l'<Text style={styles.bold}>IA</Text> rédige le <Text style={styles.bold}>quiz</Text> et prépare la fiche…
          </Text>
        </View>
      )}

      <View style={{ marginTop: 18 }}>
        <TextField value={name} onChangeText={setName} placeholder="Nom du personnage (ex. Léonard de Vinci)" />
      </View>

      <View style={{ marginTop: 18 }}>
        <SectionTitle>Matière</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {Object.keys(SUBJECTS).map((s) => (
            <Chip key={s} label={s} active={subject === s} onPress={() => setSubject(s)} color={subjectMeta(s).color} />
          ))}
        </View>
      </View>

      <View style={{ marginTop: 6 }}>
        <SectionTitle>Niveau</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {NIVEAUX.map((n) => (
            <Chip key={n} label={n} active={niveau === n} onPress={() => setNiveau(n)} />
          ))}
        </View>
      </View>

      <View style={{ marginTop: 6 }}>
        <SectionTitle>Langue</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {LANGUES.map((l) => (
            <Chip key={l} label={l} active={langue === l} onPress={() => setLangue(l)} />
          ))}
        </View>
      </View>

      <View style={{ marginTop: 6 }}>
        <SectionTitle>Classe associée</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Chip label="Aucune" active={!classId} onPress={() => setClassId(undefined)} />
          {classes.map((c) => (
            <Chip key={c.id} label={c.name} active={classId === c.id} onPress={() => setClassId(c.id)} />
          ))}
        </View>
      </View>

      <PrimaryButton
        label={loading ? 'L\'IA rédige les questions…' : 'Générer la fiche avec l\'IA'}
        onPress={generate}
        loading={loading}
        style={{ marginTop: 8 }}
      />

      {!!error && (
        <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>
      )}

      {(role || years || place || dyk || works.length > 0) && (
        <Card style={{ marginTop: 20 }}>
          {!!photo && <Image source={{ uri: photo }} style={styles.photo} />}
          <Text style={styles.fieldLabel}>Rôle</Text>
          <TextField value={role} onChangeText={setRole} placeholder="Rôle" style={{ marginBottom: 8 }} />
          <Text style={styles.fieldLabel}>Dates</Text>
          <TextField value={years} onChangeText={setYears} placeholder="Dates" style={{ marginBottom: 8 }} />
          <Text style={styles.fieldLabel}>Lieu</Text>
          <TextField value={place} onChangeText={setPlace} placeholder="Lieu" style={{ marginBottom: 8 }} />
          <Text style={styles.fieldLabel}>Le savais-tu ?</Text>
          <TextField value={dyk} onChangeText={setDyk} placeholder="Anecdote" />
          {works.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.fieldLabel}>Œuvres & réalisations</Text>
              {works.map((w, i) => <Text key={i} style={styles.workItem}>· {w}</Text>)}
            </View>
          )}
        </Card>
      )}

      {questions.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <SectionTitle>Questions générées</SectionTitle>
          {questions.map((q, i) => (
            <Card key={i} style={{ marginBottom: 10 }}>
              <TextField value={q.q} onChangeText={(t) => patchQuestion(i, { q: t })} placeholder="Question" style={{ marginBottom: 8 }} />
              {q.options.map((opt, oi) => (
                <View key={oi} style={styles.optionRow}>
                  <Chip
                    label={oi === q.correct ? '✓' : String.fromCharCode(65 + oi)}
                    active={oi === q.correct}
                    color={colors.green}
                    onPress={() => patchQuestion(i, { correct: oi as 0 | 1 | 2 | 3 })}
                  />
                  <TextField
                    value={opt}
                    onChangeText={(t) => {
                      const opts = q.options.slice() as [string, string, string, string];
                      opts[oi] = t;
                      patchQuestion(i, { options: opts });
                    }}
                    placeholder={`Option ${oi + 1}`}
                    style={{ flex: 1 }}
                  />
                </View>
              ))}
              <TextField
                value={q.fact.label}
                onChangeText={(t) => patchQuestion(i, { fact: { ...q.fact, label: t } })}
                placeholder="Étiquette de la fiche"
                style={{ marginTop: 8 }}
              />
            </Card>
          ))}
          <PrimaryButton label="↻ Régénérer les questions" dark={false} onPress={generate} loading={loading} />
        </View>
      )}

      <PrimaryButton
        label={editing ? 'Enregistrer les modifications' : 'Publier & générer le code'}
        onPress={publish}
        loading={publishing}
        style={{ marginTop: 22 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 24, color: colors.navy, marginTop: 8 },
  hintBanner: { backgroundColor: colors.teacherSoft, borderRadius: radii.md, padding: 12, marginTop: 14 },
  lockedCard: {
    backgroundColor: colors.cardWhite, borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.lg, padding: 20, marginTop: 40,
  },
  lockedTitle: { fontFamily: fonts.serifSemiBold, fontSize: 19, color: colors.navy },
  lockedText: { fontFamily: fonts.sans, fontSize: 14, color: colors.muted, marginTop: 8, lineHeight: 20 },
  hintText: { fontFamily: fonts.sans, fontSize: 13, color: colors.navy },
  bold: { fontFamily: fonts.sansBold },
  errorBanner: { backgroundColor: colors.redSoft, borderRadius: radii.md, padding: 12, marginTop: 12 },
  errorText: { fontFamily: fonts.sans, fontSize: 13, color: colors.redDark },
  photo: { width: '100%', height: 160, borderRadius: radii.md, marginBottom: 12 },
  fieldLabel: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.muted, marginBottom: 4, marginTop: 4 },
  workItem: { fontFamily: fonts.sans, fontSize: 13, color: colors.navy, marginTop: 2 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
});
