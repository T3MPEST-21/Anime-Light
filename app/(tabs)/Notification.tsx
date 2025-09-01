import React from 'react';
import { Text, Image, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import BackButton from '@/components/BackButton';

export default function Notification() {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <BackButton onPress={() => router.back()} />
    </View>
  );
};


