import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORIES, categoryColor } from '../constants/categories';
import { colors, fonts } from '../theme';

interface Props {
  visible: boolean;
  title?: string; // descrição da transação escolhida
  current?: string;
  onSelect: (category: string) => void;
  onClose: () => void;
}

export default function CategoryModal({ visible, title, current, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.grabber} />
          <Text style={styles.heading}>Escolher categoria</Text>
          {!!title && <Text style={styles.subtitle} numberOfLines={2}>{title}</Text>}
          <View style={styles.chips}>
            {CATEGORIES.map((c) => {
              const active = c === current;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => onSelect(c)}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.dot, { backgroundColor: categoryColor(c) }]} />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(6,35,29,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 40,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 16 },
  heading: { fontSize: 18, color: colors.text, fontFamily: fonts.extrabold },
  subtitle: { fontSize: 13, color: colors.muted, fontFamily: fonts.regular, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  dot: { width: 9, height: 9, borderRadius: 5 },
  chipText: { color: colors.text, fontSize: 14, fontFamily: fonts.semibold },
  chipTextActive: { color: colors.white },
});
