import { Stack } from 'expo-router';
import { Colors } from '../../shared/config/constants/Colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.dark.background },
        headerTintColor: Colors.dark.text,
        headerTitle: 'Auth',
        headerTitleStyle: { fontWeight: '800' },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Auth' }} />
      <Stack.Screen name="register" options={{ title: 'Auth' }} />
      <Stack.Screen name="recovery" options={{ title: 'Auth' }} />
    </Stack>
  );
}
