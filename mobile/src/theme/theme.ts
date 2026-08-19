export const colors = {
  pageBg: '#ECE7DA',
  cream: '#F6F2E9',
  cardWhite: '#FFFCF5',
  navy: '#21303F',
  gold: '#B0863C',
  goldSoft: '#F3E9D6',
  border: '#E7E1D3',
  dividerLight: '#F0EBDE',
  muted: '#8A8675',
  mutedBlue: '#6E7884',
  placeholder: '#A7AEB4',
  green: '#2E7D6B',
  greenSoft: '#E6F2EC',
  greenDark: '#1F5C4D',
  amber: '#9A6B1E',
  amberSoft: '#F7EEDF',
  red: '#B5503E',
  redDark: '#8E3A2C',
  redSoft: '#F7E7E4',
  scoreGold: '#C2922F',
  scoreAmber: '#A8743A',
  blue: '#2A6F9E',
  studentAccent: '#2E7D6B',
  studentSoft: '#E6F0EC',
  teacherAccent: '#B0863C',
  teacherSoft: '#F3E9D6',
  white: '#FFFFFF',
};

export type SubjectKey = 'Sciences' | 'Histoire' | 'Littérature' | 'Artistes' | 'Sportifs' | 'Musique';

export const SUBJECTS: Record<SubjectKey, { color: string; soft: string }> = {
  Sciences: { color: '#2E7D6B', soft: '#E6F0EC' },
  Histoire: { color: '#A8743A', soft: '#F3EADD' },
  'Littérature': { color: '#8C3B4A', soft: '#F4E6E8' },
  Artistes: { color: '#6B4E9E', soft: '#ECE6F5' },
  Sportifs: { color: '#3A6E4F', soft: '#E5F0E9' },
  Musique: { color: '#2A6F9E', soft: '#E4EDF5' },
};

export function subjectMeta(subject: string) {
  return SUBJECTS[subject as SubjectKey] || { color: colors.muted, soft: '#EFEBE2' };
}

export const fonts = {
  serifRegular: 'Newsreader_400Regular',
  serifMedium: 'Newsreader_500Medium',
  serifSemiBold: 'Newsreader_600SemiBold',
  serifBold: 'Newsreader_700Bold',
  sans: 'PublicSans_400Regular',
  sansBold: 'PublicSans_700Bold',
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 20,
  pill: 999,
};
