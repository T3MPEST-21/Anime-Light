import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Slot } from 'expo-router';
import React from 'react';

export default function MainLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <Slot />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
