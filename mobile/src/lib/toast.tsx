import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet } from 'react-native';
import { Text } from '../components/AppText';
import { colors, fonts, radii } from '../theme/theme';

type Ctx = { flashToast: (msg: string) => void };
const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { reduceMotion.current = v; });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => { reduceMotion.current = v; });
    return () => sub.remove();
  }, []);

  const flashToast = (m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(opacity, { toValue: 1, duration: reduceMotion.current ? 0 : 180, useNativeDriver: true }).start();
    timer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: reduceMotion.current ? 0 : 220, useNativeDriver: true }).start();
    }, 1900);
  };

  return (
    <ToastCtx.Provider value={{ flashToast }}>
      {children}
      <Animated.View pointerEvents="none" style={[styles.toast, { opacity }]}>
        <Text style={styles.text}>{msg}</Text>
      </Animated.View>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute', bottom: 40, left: 24, right: 24,
    backgroundColor: colors.navy, borderRadius: radii.pill,
    paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center',
  },
  text: { color: colors.cream, fontFamily: fonts.sans, fontSize: 14 },
});
