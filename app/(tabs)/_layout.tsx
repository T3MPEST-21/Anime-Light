import React from 'react';
import { Text, View } from 'react-native';
import {Tabs} from 'expo-router';
import { COLORS, second } from '@/constants/theme';
import {Ionicons} from '@expo/vector-icons';




export default function TabLayout() {
  return (
    <Tabs
    screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: second.secondary2,
        tabBarInactiveTintColor: second.secondary3,
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
      <Tabs.Screen name="chats" options={{
        tabBarIcon: ({color, size}) => <Ionicons name="chatbubbles" size={size} color={color} />
      }} />
      <Tabs.Screen name="create" options={{
        tabBarIcon: ({color, size}) => <Ionicons name="add-circle" size={size} color={second.primarySecond} />
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
 