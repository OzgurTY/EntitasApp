import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { COLORS } from '../src/constants/colors';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.background },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          
          <Stack.Screen name="detail" options={{ headerShown: false }} /> 

          <Stack.Screen name="models" options={{ headerShown: false }} />
          
          <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack>
      </View>
    </AuthProvider>
  );
}