import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import chatHub from '../../shared/api/hubs/chatHub';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../shared/config/constants/ThemeContext';

export default function TabLayout() {
  const { currentColors } = useAppTheme();

  useEffect(() => {
    chatHub.start();
    return () => chatHub.stop();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: currentColors.tint,
        tabBarInactiveTintColor: currentColors.textSecondary,
        tabBarStyle: {
          backgroundColor: currentColors.background,
          borderTopColor: currentColors.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: currentColors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: currentColors.border,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 20,
          color: currentColors.text,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'newspaper' : 'newspaper-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
