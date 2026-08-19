import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, radii } from '../src/theme/theme';
import { BackButton, Card } from '../src/components/ui';

export default function About() {
  const router = useRouter();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40 }}>
      <BackButton onPress={() => router.back()} />
      <View style={styles.logo}><Text style={styles.logoF}>F<Text style={{ color: colors.gold }}>.</Text></Text></View>
      <Text style={styles.title}>À propos de Figures</Text>

      <Card style={{ marginTop: 18 }}>
        <Text style={styles.cardTitle}>L'idée</Text>
        <Text style={styles.body}>
          Aider les élèves à retenir les personnages de leurs cours (histoire, littérature, sciences...) en
          transformant chaque quiz en fiche de révision personnelle à collectionner.
        </Text>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Text style={styles.cardTitle}>Comment ça marche</Text>
        <Text style={styles.body}>
          Le professeur crée un personnage, l'IA propose un quiz de 5 questions. Il partage le code à sa classe.
          Chaque élève répond au quiz : même en cas d'erreur, la fiche se remplit quand même. Les fiches se
          collectionnent, débloquent des récompenses, et peuvent être révisées à tout moment pour cibler ses points faibles.
        </Text>
      </Card>

      <Card style={{ marginTop: 14, backgroundColor: colors.goldSoft, borderColor: colors.goldSoft }}>
        <Text style={styles.cardTitle}>Où en est le projet</Text>
        <Text style={styles.body}>
          Figures est en <Text style={styles.bold}>version pilote</Text> : pleinement utilisable pour tester en classe.
          La synchronisation entre appareils (cloud) est la prochaine étape avant un déploiement en établissement.
        </Text>
      </Card>

      <Text style={styles.footer}>
        Un projet imaginé par un enseignant, pour les enseignants. Conçu dans le respect du RGPD et de l'accessibilité.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  logo: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  logoF: { fontFamily: fonts.serifSemiBold, fontSize: 26, color: colors.cream },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 24, color: colors.navy, marginTop: 14 },
  cardTitle: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.navy, marginBottom: 8 },
  body: { fontFamily: fonts.sans, fontSize: 13, color: colors.mutedBlue, lineHeight: 20 },
  bold: { fontFamily: fonts.sansBold, color: colors.navy },
  footer: { fontFamily: fonts.sans, fontSize: 11, color: colors.placeholder, textAlign: 'center', marginTop: 26, lineHeight: 16 },
});
