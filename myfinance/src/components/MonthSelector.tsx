import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts } from '../theme';
import { monthLongLabel } from '../lib/format';

interface Props {
  month: string;
  onOlder?: () => void; // undefined = não há mês anterior com dados
  onNewer?: () => void; // undefined = não há mês seguinte com dados
}

export default function MonthSelector({ month, onOlder, onNewer }: Props) {
  return (
    <View style={styles.pill}>
      <TouchableOpacity onPress={onOlder} disabled={!onOlder} hitSlop={12} style={styles.arrowBtn}>
        <Text style={[styles.arrow, !onOlder && styles.off]}>‹</Text>
      </TouchableOpacity>
      <Text style={styles.label}>{monthLongLabel(month)}</Text>
      <TouchableOpacity onPress={onNewer} disabled={!onNewer} hitSlop={12} style={styles.arrowBtn}>
        <Text style={[styles.arrow, !onNewer && styles.off]}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    padding: 4,
  },
  arrowBtn: { width: 40, height: 36, alignItems: 'center', justifyContent: 'center' },
  arrow: { color: '#FFFFFF', fontSize: 26, fontFamily: fonts.bold, lineHeight: 30 },
  off: { opacity: 0.25 },
  label: { color: '#FFFFFF', fontSize: 15, fontFamily: fonts.bold },
});
