import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts } from '../theme';
import { formatCompact } from '../lib/format';
import type { EvolutionPoint } from '../lib/summary';

interface Props {
  points: EvolutionPoint[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export default function EvolutionChart({ points, selectedKey, onSelect }: Props) {
  if (!points.length) {
    return <Text style={styles.empty}>Importe um extrato para ver a evolução do seu patrimônio.</Text>;
  }
  const max = Math.max(...points.map((p) => Math.abs(p.balance)), 1);

  return (
    <View style={styles.row}>
      {points.map((p) => {
        const height = Math.max(8, (Math.abs(p.balance) / max) * 110);
        const selected = p.key === selectedKey;
        const color = p.balance < 0 ? colors.expense : selected ? colors.gold : colors.greenMid;
        return (
          <TouchableOpacity key={p.key} style={styles.col} onPress={() => onSelect(p.key)} activeOpacity={0.7}>
            <Text style={[styles.value, selected && styles.selectedText]}>{formatCompact(p.balance)}</Text>
            <View style={[styles.bar, { height, backgroundColor: color, opacity: selected ? 1 : 0.55 }]} />
            <Text style={[styles.label, selected && styles.selectedText]}>{p.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', minHeight: 160 },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 26, borderRadius: 9, marginVertical: 7 },
  value: { fontSize: 11, color: colors.muted, fontFamily: fonts.semibold },
  label: { fontSize: 11, color: colors.muted, fontFamily: fonts.semibold },
  selectedText: { color: colors.text, fontFamily: fonts.extrabold },
  empty: { color: colors.muted, fontSize: 14, lineHeight: 20, fontFamily: fonts.regular },
});
