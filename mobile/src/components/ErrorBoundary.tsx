import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './AppText';
import { colors, fonts } from '../theme/theme';
import { PrimaryButton } from './ui';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

// Without this, any uncaught render error crashes the whole app straight to
// the home screen in a release build (React Native reports it as fatal to
// native with no JS-side recovery). This catches it and offers a reset
// instead — required for App Review reliability, not just nicer UX.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.screen}>
          <Text style={styles.title}>Oups, une erreur est survenue</Text>
          <Text style={styles.message}>
            Quelque chose s'est mal passé. Tes fiches et ta progression sont enregistrées, tu peux réessayer.
          </Text>
          <PrimaryButton
            label="Réessayer"
            onPress={() => this.setState({ error: null })}
            style={{ marginTop: 20 }}
          />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', padding: 28 },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 20, color: colors.navy, textAlign: 'center' },
  message: { fontFamily: fonts.sans, fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 10, lineHeight: 20 },
});
