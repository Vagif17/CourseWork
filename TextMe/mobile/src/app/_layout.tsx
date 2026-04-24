import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack, SplashScreen } from 'expo-router';

import { AppProviders } from './providers';
import { useAppTheme } from '../shared/config/constants/ThemeContext';
import { useCall } from '../shared/config/constants/CallContext';
import CallModal from '../shared/ui/components/CallModal';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useState(true);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppProviders>
      <InnerLayout />
    </AppProviders>
  );
}

function InnerLayout() {
  const { currentColors, isDark } = useAppTheme();
  const webrtc = useCall();
  
  return (
    <NavThemeProvider value={isDark ? NavDarkTheme : NavLightTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: currentColors.background },
          headerTintColor: currentColors.text,
          headerTitleStyle: { fontWeight: '800' },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      
      <CallModal 
        webrtc={webrtc} 
        visible={webrtc.callState !== 'idle'} 
      />
    </NavThemeProvider>
  );
}
