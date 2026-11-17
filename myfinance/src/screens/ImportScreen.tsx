import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { pickOfxFile } from '../services/ofxFile';
import { parseOfx } from '../lib/ofxParser';
import { importTransactions } from '../services/transactions';
import { monthLongLabel } from '../lib/format';
import { colors, fonts, shadow } from '../theme';
import type { ImportResult } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Importar'>;

export default function ImportScreen({ navigation }: Props) {
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [period, setPeriod] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    setError(null);
    setResult(null);
    setPeriod(null);
    try {
      const file = await pickOfxFile();
      if (!file) return;
      setBusy(true);
      setFileName(file.name);

      const rows = parseOfx(file.content);
      if (!rows.length) {
        setError('Nenhuma transação encontrada. Confira se o arquivo é um extrato .ofx válido.');
        return;
      }
      const months = [...new Set(rows.map((r) => r.data_transacao.slice(0, 7)))].sort();
      setPeriod(months.map(monthLongLabel).join(', '));
      setResult(await importTransactions(rows));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível importar o arquivo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.lead}>
        Baixe o extrato em formato OFX no app ou site do seu banco e escolha o arquivo aqui. Ele é lido no
        próprio celular.
      </Text>

      <TouchableOpacity
        style={[styles.button, busy && { opacity: 0.6 }]}
        onPress={handleImport}
        disabled={busy}
        activeOpacity={0.85}
      >
        {busy ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.buttonText}>Escolher arquivo .ofx</Text>}
      </TouchableOpacity>

      {fileName && <Text style={styles.file}>{fileName}</Text>}

      {result && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Importação concluída</Text>
          <Text style={styles.big}>{result.inserted}</Text>
          <Text style={styles.cardText}>
            {result.inserted === 1 ? 'transação nova' : 'transações novas'}
            {result.ignored > 0
              ? `; ${result.ignored} já ${result.ignored === 1 ? 'estava' : 'estavam'} no app e ${
                  result.ignored === 1 ? 'foi ignorada' : 'foram ignoradas'
                }.`
              : '.'}
          </Text>
          {period && <Text style={styles.period}>Período do arquivo: {period}</Text>}
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.doneText}>Ver no painel</Text>
          </TouchableOpacity>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  lead: { color: colors.text, fontSize: 15, lineHeight: 23, fontFamily: fonts.regular, marginBottom: 22 },
  button: { backgroundColor: colors.gold, borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  buttonText: { color: colors.ink, fontSize: 16, fontFamily: fonts.extrabold },
  file: { color: colors.muted, fontSize: 13, fontFamily: fonts.semibold, marginTop: 14, textAlign: 'center' },
  card: { backgroundColor: colors.ink, borderRadius: 24, padding: 22, marginTop: 24, ...shadow },
  cardTitle: { color: colors.goldLight, fontSize: 13, fontFamily: fonts.bold },
  big: { color: colors.white, fontSize: 48, fontFamily: fonts.extrabold, letterSpacing: -1, marginVertical: 4 },
  cardText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 21, fontFamily: fonts.regular },
  period: { color: colors.greenLight, fontSize: 13, fontFamily: fonts.semibold, marginTop: 12 },
  doneBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 18 },
  doneText: { color: colors.white, fontSize: 14, fontFamily: fonts.extrabold },
  errorBox: { backgroundColor: colors.expenseSoft, borderRadius: 16, padding: 14, marginTop: 24 },
  errorText: { color: colors.expense, fontSize: 13, lineHeight: 19, fontFamily: fonts.semibold },
});
