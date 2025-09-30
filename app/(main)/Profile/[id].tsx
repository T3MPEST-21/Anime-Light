import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Avatar from '@/components/Avatar';
import { useEffect, useState } from 'react';
import { getUserData } from '@/services/userServices';
import { useTheme } from '@/context/themeContext';
import Header from '@/components/Header';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from '@/helpers/common';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const user = await getUserData(id as string);
      setProfile(user);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <View style={[styles.container, { backgroundColor: theme.background }]}><Text style={{ color: theme.text }}>Loading...</Text></View>;
  }

  if (!profile) {
    return <View style={[styles.container, { backgroundColor: theme.background }]}><Text style={{ color: theme.text }}>User not found</Text></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title="Profile" ShowBackButton={true} marginBottom={30} /> 
        <View>
            {/* Profile Avatar */}
            <View style={{ alignItems: 'center' }}>
                <Avatar uri={profile.image || profile.avatar_url || ''} size={100} />
                <Text style={[styles.username, { color: theme.text }]}>{profile.username}</Text>
            </View>

            {/* Profile Info */}
            <View style={{ gap: 10 }}>
            <View style={styles.info}>
              <Ionicons name="call-outline" size={20} color={theme.primary} style={{marginBottom: -10}} />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>{profile.phone || 'No phone number'} </Text>
            </View>
            <View style={styles.info}>
              <Ionicons name="star-outline" size={20} color={theme.primary} style={{marginBottom: -10}} />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>{profile.favorite_anime || 'No favorite anime'}</Text>
            </View>
            <View style={styles.info}>
              <Ionicons name="document-text-outline" size={20} color={theme.primary} style={{marginBottom: -10}} />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>{profile.bio || 'No bio'}</Text>
            </View>
          </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  info: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginLeft: wp(4)
    },
    infoText: {
      fontSize: hp(2),
      fontWeight: '500',
      textAlign: 'center',
      marginTop: hp(1),
    },
});
