import React from 'react';
import { Text, View } from 'react-native';
import {Tabs} from 'expo-router';
import { COLORS, second } from '@/constants/theme';
import {Ionicons} from '@expo/vector-icons';
import { NewPostsProvider, useNewPosts } from '@/context/newPostsContext';
import { ThemeProvider, useTheme } from '@/context/themeContext';

const HomeTabIcon = ({ color, size }: { color: string; size: number }) => {
  const { newPostsCount } = useNewPosts();
  const { theme } = useTheme();
  
  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name="home" size={size} color={color} />
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
  
  return (
    <Tabs
    screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textLight,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          position : 'absolute',
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 5,
        },
    }}>
      <Tabs.Screen name="index" options={{
        tabBarIcon: ({ color, size }) => <HomeTabIcon color={color} size={size} />
      }} />
      <Tabs.Screen name="Friends" options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />
      }} />
      <Tabs.Screen name="chats" options={{
        tabBarIcon: ({color, size}) => <Ionicons name="chatbubbles" size={size} color={second.secondary2} />
      }} />
      {/*<Tabs.Screen name="create" options={{
        tabBarIcon: ({color, size}) => <Ionicons name="add-circle" size={size} color={theme.primary} />
      }} />*/}
      <Tabs.Screen name="Notification" options={{
        tabBarIcon: ({color, size}) => <Ionicons name="notifications" size={size} color={color} />
      }} />
      <Tabs.Screen name="Profile" options={{
        tabBarIcon: ({color, size}) => <Ionicons name="person" size={size} color={color} />
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