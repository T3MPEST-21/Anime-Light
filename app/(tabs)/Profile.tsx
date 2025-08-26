import React from 'react';
import { Text, Image, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';


export default function Profile() {
  return (
    <View
style={{
flex: 1,
justifyContent: 'center',
alignItems: 'center',
}}
>
      <Text>Profile is now working</Text>
      <Link href="/Notification">visit notification</Link>
    </View>
  );
};

