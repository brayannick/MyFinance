import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

interface Props {
  label: string;
  value: string;
  tone: 'income' | 'expense';
}

export default function SummaryCard({ label, value, tone }: Props) {
  const dot = tone === 'income' ? colors.greenLight : '#FF9A8F';
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={[styles.dot, { backgroundColor: dot }]} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 14,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: fonts.semibold },
  value: { color: colors.white, fontSize: 19, fontFamily: fonts.extrabold },
});
