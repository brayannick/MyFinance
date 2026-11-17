import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from './src/screens/DashboardScreen';
import ImportScreen from './src/screens/ImportScreen';
import type { RootStackParamList } from './src/navigation/types';
import { colors, fonts } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    [fonts.regular]: require('./assets/fonts/Manrope_500Medium.ttf'),
    [fonts.semibold]: require('./assets/fonts/Manrope_600SemiBold.ttf'),
    [fonts.bold]: require('./assets/fonts/Manrope_700Bold.ttf'),
    [fonts.extrabold]: require('./assets/fonts/Manrope_800ExtraBold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink }}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.ink },
            headerTintColor: colors.white,
            headerShadowVisible: false,
            headerBackButtonDisplayMode: 'minimal',
            headerTitleStyle: { fontFamily: fonts.extrabold, fontSize: 17 },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          {/* O painel usa um topo próprio com a marca MyFinance; o título serve de rótulo de volta. */}
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'MyFinance', headerShown: false }} />
          <Stack.Screen name="Importar" component={ImportScreen} options={{ title: 'Importar extrato' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
