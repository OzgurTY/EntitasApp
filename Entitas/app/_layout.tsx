import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#F5F7FA', // Arkaplan rengimizle uyumlu
          },
          headerShadowVisible: false, // Çizgi/gölge kaldırıldı
          headerTintColor: '#111827', // Metin rengi
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: '#F5F7FA',
          }
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false // Ana ekranda header'ı gizle, kendi header'ımızı yaptık
          }} 
        />
        <Stack.Screen 
          name="detail" 
          options={{ 
            title: 'Sinyal Detayı',
            headerBackTitle: 'Geri', // iOS için
          }} 
        />
      </Stack>
    </View>
  );
}