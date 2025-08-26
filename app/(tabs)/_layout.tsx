import React from 'react';
import { Text, View } from 'react-native';
import {Tabs} from 'expo-router';
import { COLORS } from '@/constants/theme';
import {Ionicons} from '@expo/vector-icons';




export default function TabLayout() {
  return (
    <Tabs
    screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.grey,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopWidth: 0,
          position : 'absolute',
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 5,
        },
    }}>
      <Tabs.Screen name="index" options={{
        tabBarIcon: ({color, size}) => <Ionicons name="home" size={size} color={color} /> 
      }} />
      <Tabs.Screen name="bookmarks" options={{
        tabBarIcon: ({color, size}) => <Ionicons name="bookmark" size={size} color={color} />
      }} />
      <Tabs.Screen name="create" options={{
        tabBarIcon: ({color, size}) => <Ionicons name="add-circle" size={size} color={COLORS.primary} />
      }} />
      <Tabs.Screen name="Notification" options={{
        tabBarIcon: ({color, size}) => <Ionicons name="notifications" size={size} color={color} />
      }} />
      <Tabs.Screen name="Profile" options={{
        tabBarIcon: ({color, size}) => <Ionicons name="person" size={size} color={color} />
      }} />
    </Tabs>
  );
}
 
