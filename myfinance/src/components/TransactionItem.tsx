import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { categoryColor } from '../constants/categories';
import { colors, fonts } from '../theme';
import { formatBRL, formatDate } from '../lib/format';
import type { Transaction } from '../types';

interface Props {
  item: Transaction;
  onPress: (item: Transaction) => void;
  showAmount?: boolean;
  first?: boolean;
  last?: boolean;
}

export default function TransactionItem({ item, onPress, showAmount = true, first, last }: Props) {
  const positive = item.valor >= 0;
  const tint = categoryColor(item.categoria);
  const initial = (item.descricao.trim().charAt(0) || '•').toUpperCase();

  return (
    <TouchableOpacity
      style={[styles.row, first && styles.first, last ? styles.last : styles.divider]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: `${tint}33` }]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.descricao}</Text>
        <View style={styles.meta}>
          <Text style={styles.date}>{formatDate(item.data_transacao)}</Text>
          <View style={[styles.chip, { backgroundColor: `${tint}30` }]}>
            <Text style={styles.chipText}>{item.categoria}</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.value, { color: showAmount ? (positive ? colors.income : colors.expense) : colors.muted }]}>
        {showAmount ? `${positive ? '+' : ''}${formatBRL(item.valor)}` : '•••••'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  first: { borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  last: { borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: colors.ink, fontSize: 15, fontFamily: fonts.extrabold },
  info: { flex: 1, paddingRight: 10 },
  title: { fontSize: 14, color: colors.text, fontFamily: fonts.bold },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 8 },
  date: { fontSize: 12, color: colors.muted, fontFamily: fonts.regular },
  chip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  chipText: { fontSize: 11, color: colors.ink, fontFamily: fonts.semibold },
  value: { fontSize: 14, fontFamily: fonts.extrabold },
});
