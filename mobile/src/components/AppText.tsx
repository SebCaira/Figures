import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useSession } from '../lib/session';

const DYS_REGULAR = 'AtkinsonHyperlegible_400Regular';
const DYS_BOLD = 'AtkinsonHyperlegible_700Bold';
const LARGE_FACTOR = 1.18;

// Drop-in replacement for RN's Text handling both a11y toggles per-component
// (not via a screen-wide transform, which clips content and breaks safe-area/
// tab-bar layout — a real issue hit in testing):
// - "Police adaptée (dys)": swaps every font family for Atkinson Hyperlegible
//   (keeping bold vs regular) and adds a touch of letter-spacing.
// - "Grand texte": scales this text's own fontSize/lineHeight up, letting
//   Yoga reflow layout naturally instead of transforming the whole screen.
export function Text(props: TextProps) {
  const { a11y } = useSession();
  if (!a11y.dys && !a11y.large) return <RNText {...props} />;

  const flat = StyleSheet.flatten(props.style) || {};
  const overrides: Record<string, unknown> = {};

  if (a11y.dys) {
    const isBold = typeof flat.fontFamily === 'string' && /bold|600|700/i.test(flat.fontFamily);
    overrides.fontFamily = isBold ? DYS_BOLD : DYS_REGULAR;
    overrides.letterSpacing = 0.3;
  }
  if (a11y.large) {
    const baseSize = typeof flat.fontSize === 'number' ? flat.fontSize : 14;
    overrides.fontSize = baseSize * LARGE_FACTOR;
    if (typeof flat.lineHeight === 'number') overrides.lineHeight = flat.lineHeight * LARGE_FACTOR;
  }

  return <RNText {...props} style={[props.style, overrides]} />;
}
