import React from 'react';
import { Text, Image, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Notification() {
  return (
    <View
style={{
flex: 1,
justifyContent: 'center',
alignItems: 'center',
}}
>
      <Text>Notification is now working</Text>
      <Link href="/">visit home</Link>
    </View>
  );
};

