import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import SummaryCard from '../components/SummaryCard';
import PrivacyToggle from '../components/PrivacyToggle';
import MonthSelector from '../components/MonthSelector';
import CategoryBreakdown from '../components/CategoryBreakdown';
import EvolutionChart from '../components/EvolutionChart';
import TransactionItem from '../components/TransactionItem';
import CategoryModal from '../components/CategoryModal';
import { fetchTransactions, updateCategory } from '../services/transactions';
import { computeSummary, defaultMonth, listMonths } from '../lib/summary';
import { formatBRL, monthName } from '../lib/format';
import { colors, fonts, shadow } from '../theme';
import type { Transaction } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [transactionsVisible, setTransactionsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setItems(await fetchTransactions());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar as transações.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  // Mês exibido: o escolhido nas setas; senão o mês atual (se tiver dados) ou o mais recente com dados.
  const months = useMemo(() => listMonths(items), [items]);
  const month = picked && months.includes(picked) ? picked : defaultMonth(months);
  const position = months.indexOf(month); // months está do mais novo para o mais antigo
  const older = position >= 0 ? months[position + 1] : undefined;
  const newer = position > 0 ? months[position - 1] : undefined;

  const summary = useMemo(() => computeSummary(items, month), [items, month]);

  async function chooseCategory(category: string) {
    if (!selected) return;
    const { id } = selected;
    setSelected(null);
    setSaving(true);
    try {
      await updateCategory(id, category); // só atualiza a tela depois que o banco confirmar
      setItems((prev) => prev.map((t) => (t.id === id ? { ...t, categoria: category, categoria_manual: true } : t)));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar a categoria.');
    } finally {
      setSaving(false);
    }
  }

  const header = (
    <View>
      <View style={[styles.hero, { paddingTop: insets.top + 10 }]}>
        <View style={styles.glow} />
        <View style={styles.topBar}>
          <Text style={styles.wordmark}>
            <Text style={styles.wordmarkGold}>My</Text>Finance
          </Text>
          <PrivacyToggle
            label="saldo"
            visible={balanceVisible}
            onPress={() => setBalanceVisible((visible) => !visible)}
            variant="dark"
          />
        </View>

        <MonthSelector
          month={month}
          onOlder={older ? () => setPicked(older) : undefined}
          onNewer={newer ? () => setPicked(newer) : undefined}
        />

        <Text style={styles.heroLabel}>Saldo total</Text>
        <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
          {balanceVisible ? formatBRL(summary.balance) : '•••••'}
        </Text>

        <View style={styles.row}>
          <SummaryCard label="Entradas" value={formatBRL(summary.income)} tone="income" />
          <SummaryCard label="Saídas" value={formatBRL(summary.expense)} tone="expense" />
        </View>

        <TouchableOpacity style={styles.importBtn} onPress={() => navigation.navigate('Importar')} activeOpacity={0.85}>
          <Text style={styles.importText}>Importar extrato OFX</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.errorAction}>Recarregar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardHead}>
          <View>
            <Text style={styles.cardTitle}>Gastos por categoria</Text>
            <Text style={styles.cardSubtitle}>Saídas de {monthName(month)}</Text>
          </View>
          <Text style={styles.cardTotal}>{formatBRL(summary.expense)}</Text>
        </View>
        <CategoryBreakdown data={summary.categorySpending} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Evolução do patrimônio</Text>
        <Text style={[styles.cardSubtitle, { marginBottom: 14 }]}>Toque em uma barra para trocar de mês</Text>
        <EvolutionChart points={summary.evolution} selectedKey={month} onSelect={setPicked} />
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Transações</Text>
        <View style={styles.sectionActions}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.greenMid} />
          ) : (
            <Text style={styles.sectionCount}>
              {summary.transactions.length} em {monthName(month)}
            </Text>
          )}
          <PrivacyToggle
            label="valores das transações"
            visible={transactionsVisible}
            onPress={() => setTransactionsVisible((visible) => !visible)}
            variant="light"
          />
        </View>
      </View>
      {summary.transactions.length > 0 && (
        <Text style={styles.sectionHint}>Toque em uma transação para escolher a categoria.</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.greenMid} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={summary.transactions}
        keyExtractor={(t) => t.id}
        ListHeaderComponent={header}
        renderItem={({ item, index }) => (
          <TransactionItem
            item={item}
            onPress={setSelected}
            showAmount={transactionsVisible}
            first={index === 0}
            last={index === summary.transactions.length - 1}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {items.length === 0
              ? 'Nenhuma transação ainda. Toque em “Importar extrato OFX” para começar.'
              : 'Nenhuma transação neste mês.'}
          </Text>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.gold} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      />
      <CategoryModal
        visible={!!selected}
        title={selected?.descricao}
        current={selected?.categoria}
        onSelect={chooseCategory}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingBottom: 26,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -90,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.greenMid,
    opacity: 0.2,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  wordmark: { color: colors.white, fontSize: 22, fontFamily: fonts.extrabold, letterSpacing: -0.4 },
  wordmarkGold: { color: colors.gold },
  heroLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontFamily: fonts.semibold, marginTop: 22 },
  balance: { color: colors.white, fontSize: 42, fontFamily: fonts.extrabold, letterSpacing: -1, marginTop: 2, marginBottom: 18 },
  row: { flexDirection: 'row', gap: 12 },
  importBtn: { backgroundColor: colors.gold, borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 16 },
  importText: { color: colors.ink, fontSize: 15, fontFamily: fonts.extrabold },
  card: { backgroundColor: colors.white, borderRadius: 22, marginHorizontal: 16, marginTop: 16, padding: 18, ...shadow },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardTitle: { fontSize: 16, color: colors.text, fontFamily: fonts.extrabold },
  cardSubtitle: { fontSize: 12, color: colors.muted, fontFamily: fonts.regular, marginTop: 2 },
  cardTotal: { fontSize: 15, color: colors.text, fontFamily: fonts.extrabold },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 26 },
  sectionActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, color: colors.text, fontFamily: fonts.extrabold },
  sectionCount: { fontSize: 12, color: colors.muted, fontFamily: fonts.semibold },
  sectionHint: { fontSize: 12, color: colors.muted, fontFamily: fonts.regular, marginHorizontal: 20, marginTop: 2, marginBottom: 12 },
  empty: { color: colors.muted, textAlign: 'center', padding: 28, lineHeight: 21, fontFamily: fonts.regular },
  errorBox: { backgroundColor: colors.expenseSoft, marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 14 },
  errorText: { color: colors.expense, fontSize: 13, lineHeight: 19, fontFamily: fonts.semibold },
  errorAction: { color: colors.green, fontFamily: fonts.extrabold, marginTop: 8 },
});
