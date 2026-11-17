import { StyleSheet, Text, View } from 'react-native';
import { categoryColor } from '../constants/categories';
import { formatBRL } from '../lib/format';
import { colors, fonts } from '../theme';
import type { CategorySpending } from '../lib/summary';

export default function CategoryBreakdown({ data }: { data: CategorySpending[] }) {
  if (data.length === 0) {
    return <Text style={styles.empty}>Nenhuma saída registrada neste mês.</Text>;
  }

  return (
    <View>
      <View style={styles.stack}>
        {data.map((d) => (
          <View key={d.category} style={{ flex: d.share, backgroundColor: categoryColor(d.category) }} />
        ))}
      </View>

      {data.map((d) => {
        const color = categoryColor(d.category);
        return (
          <View key={d.category} style={styles.row}>
            <View style={styles.top}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={styles.name} numberOfLines={1}>{d.category}</Text>
              <Text style={styles.percent}>{Math.round(d.share * 100)}%</Text>
              <Text style={styles.amount}>{formatBRL(d.amount)}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.max(d.share * 100, 2)}%`, backgroundColor: color }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.muted, fontSize: 14, fontFamily: fonts.regular, paddingVertical: 6 },
  stack: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2, marginBottom: 6 },
  row: { marginTop: 14 },
  top: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  name: { flex: 1, color: colors.text, fontSize: 14, fontFamily: fonts.semibold },
  percent: { color: colors.muted, fontSize: 12, fontFamily: fonts.semibold, marginRight: 10 },
  amount: { color: colors.text, fontSize: 14, fontFamily: fonts.bold },
  track: { height: 6, backgroundColor: colors.background, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
