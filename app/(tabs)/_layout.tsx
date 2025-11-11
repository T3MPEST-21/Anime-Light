import React from 'react';
import { Text, View } from 'react-native';
import {Tabs} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NewPostsProvider, useNewPosts } from '@/context/newPostsContext';
import { useTheme } from '@/context/themeContext';

const HomeTabIcon = ({ color, size, focused }: { color: string; size: number; focused: boolean }) => {
  const { newPostsCount } = useNewPosts();
  const { theme } = useTheme();
  
  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
      {newPostsCount > 0 && (
        <View style={{
          position: 'absolute',
          top: -2,
          right: -6,
          backgroundColor: theme.primary,
          borderRadius: 8,
          minWidth: 16,
          height: 16,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
          }}>+</Text>
        </View>
      )}
    </View>
  );
};

function TabsContent() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textLight,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          position: 'absolute',
          elevation: 0,
          height: 56 + insets.bottom,
          paddingBottom: Math.max(6, insets.bottom * 0.6),
          paddingTop: 5,
        },
      }}
    >
      <Tabs.Screen name="index" options={{
        tabBarIcon: ({ color, size, focused }) => <HomeTabIcon color={color} size={size} focused={focused} />
      }} />
      <Tabs.Screen name="Friends" options={{
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
        )
      }} />
      <Tabs.Screen name="ChatScreen" options={{
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color} />
        )
      }} />
      <Tabs.Screen name="Notification" options={{
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={size} color={color} />
        )
      }} />
      <Tabs.Screen name="Profile" options={{
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
        )
      }} />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <NewPostsProvider>
      <TabsContent />
    </NewPostsProvider>
  );
}