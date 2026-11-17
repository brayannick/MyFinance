import type { ViewStyle } from 'react-native';

// Paleta: branco, verde (esmeralda do logo) e dourado.
export const colors = {
  white: '#FFFFFF',
  background: '#F3F6F4',
  ink: '#06231D', // verde profundo do topo
  inkSoft: '#0D3A2E',
  green: '#0E5A44',
  greenMid: '#1F9A74', // esmeralda do logo
  greenLight: '#58C7A1',
  greenSoft: '#E3F4EC',
  gold: '#E3B75A',
  goldDeep: '#B98A24',
  goldLight: '#F3DC9C',
  goldSoft: '#FBF4E1',
  text: '#10231D',
  muted: '#6B7F77',
  border: '#E4ECE7',
  income: '#13946A',
  expense: '#D2554A',
  expenseSoft: '#FCEDEB',
};

// Manrope (arquivos em assets/fonts, carregados no App.tsx)
export const fonts = {
  regular: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
};

export const shadow: ViewStyle = {
  shadowColor: '#06231D',
  shadowOpacity: 0.07,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
};
