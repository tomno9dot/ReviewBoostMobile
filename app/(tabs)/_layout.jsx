// ReviewBoostMobile/app/(tabs)/_layout.jsx

import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 82 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 18 : 8,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#ececf1',
          zIndex: 999,
          elevation: 20,
        },
        sceneStyle: {
          backgroundColor: '#f8f7ff',
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Send',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color: color }}>⭐</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color: color }}>👥</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color: color }}>📊</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color: color }}>⚙️</Text>
          ),
        }}
      />
    </Tabs>
  );
}