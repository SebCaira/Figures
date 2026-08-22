import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Same project the existing web app (index.html) talks to — the anon key is
// public/client-safe by design (Supabase row-level security enforces access,
// not key secrecy), so reusing it here keeps mobile and web on one dataset.
const SB_URL = 'https://feqwzcplqiituehifrjb.supabase.co';
const SB_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcXd6Y3BscWlpdHVlaGlmcmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MjYyMjEsImV4cCI6MjA5ODQwMjIyMX0.KsV3kwrPY8sz26EIN6StImXm0LEiEsdmlafjgDpN7n8';

// AsyncStorage's web implementation touches `localStorage`, which doesn't
// exist during Expo Router's static export (pages are pre-rendered in
// Node, with no browser). Only swap in a no-op there — real native
// (iOS/Android) and real browsers both keep AsyncStorage.
const noopStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};
const isServerRendering = Platform.OS === 'web' && typeof window === 'undefined';

export const supabase = createClient(SB_URL, SB_KEY, {
  auth: {
    storage: isServerRendering ? noopStorage : AsyncStorage,
    autoRefreshToken: !isServerRendering,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
