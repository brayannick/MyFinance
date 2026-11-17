import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';

interface Props {
  label: string;
  visible: boolean;
  onPress: () => void;
  variant: 'dark' | 'light';
}

export default function PrivacyToggle({ label, visible, onPress, variant }: Props) {
  const iconColor = variant === 'dark' ? colors.white : colors.ink;

  return (
    <TouchableOpacity
      style={[styles.button, variant === 'dark' ? styles.darkButton : styles.lightButton]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${visible ? 'Ocultar' : 'Mostrar'} ${label}`}
    >
      <View style={[styles.eye, { borderColor: iconColor }]}>
        <View style={[styles.pupil, { backgroundColor: iconColor }]} />
      </View>
      {!visible && <View style={[styles.slash, { backgroundColor: iconColor }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkButton: { backgroundColor: 'rgba(255,255,255,0.1)' },
  lightButton: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  eye: {
    width: 22,
    height: 14,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pupil: { width: 6, height: 6, borderRadius: 3 },
  slash: {
    position: 'absolute',
    width: 27,
    height: 2,
    transform: [{ rotate: '-45deg' }],
  },
});
