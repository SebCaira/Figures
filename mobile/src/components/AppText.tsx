import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useSession } from '../lib/session';

const DYS_REGULAR = 'AtkinsonHyperlegible_400Regular';
const DYS_BOLD = 'AtkinsonHyperlegible_700Bold';

// Drop-in replacement for RN's Text — when "Police adaptée (dys)" is on,
// swaps every font family for Atkinson Hyperlegible (keeping bold vs regular)
// and adds a touch of letter-spacing, matching the original app's a11y toggle.
export function Text(props: TextProps) {
  const { a11y } = useSession();
  if (!a11y.dys) return <RNText {...props} />;

  const flat = StyleSheet.flatten(props.style) || {};
  const isBold = typeof flat.fontFamily === 'string' && /bold|600|700/i.test(flat.fontFamily);

  return (
    <RNText
      {...props}
      style={[props.style, { fontFamily: isBold ? DYS_BOLD : DYS_REGULAR, letterSpacing: 0.3 }]}
    />
  );
}
