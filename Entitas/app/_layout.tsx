import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { COLORS } from '../src/constants/colors';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerShadowVisible: false, // Çizgiyi kaldırır, ferah görünür
          headerTintColor: COLORS.textMain,
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 18,
          },
          contentStyle: {
            backgroundColor: COLORS.background,
          },
          animation: 'slide_from_right', // iOS tarzı yumuşak geçiş
        }}
      >
        {/* Ana Sayfa: Header'ı gizliyoruz çünkü kendi özel başlığımızı yaptık */}
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false, 
            title: 'Ana Sayfa' 
          }} 
        />
        
        {/* Detay Sayfası: Geri butonu otomatik gelir */}
        <Stack.Screen 
          name="detail" 
          options={{ 
            title: 'Sinyal Analizi',
            headerBackTitle: 'Geri',
            headerTransparent: false,
          }} 
        />
      </Stack>
    </View>
  );
}