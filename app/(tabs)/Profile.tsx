import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';
import CustomActivityLoader from '@/components/CustomActivityLoader';
import BackButton from '@/components/BackButton';
import Header from '@/components/Header';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from '@/helpers/common';
import { radius, second } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import Avatar from '@/components/Avatar';
import { getUserData } from '@/services/userServices';

export default function Profile() {
  const auth = useAuth();
  const router = useRouter();

  // Show loader only while context is undefined (not yet initialized)
  if (auth === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <BackButton onPress={() => router.back()} />
        <View style={{ backgroundColor: 'white', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <CustomActivityLoader />
        </View>
      </View>
    );
  }

  const { user } = auth;

  // If user is not logged in, show a message
  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
        <Text>You are not logged in.</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/LoginScreen')}>
          <Text style={{ color: 'blue' }}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <UserHeader user={user} router={router} />
    </View>
  );
}

interface ProfileType {
  id: string;
  email?: string;
  full_name?: string;
  username: string;
  favorite_anime?: string;
  created_at?: string;
  phone?: string;
  bio?: string;
  image?: string;
}

interface UserHeaderProps {
  user: any;
  router: any;
}

// Helper function to help me put the date into a more readable format
function formatDateFriendly(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const day = days[date.getDay()];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  return `${day}, ${d} ${m} ${y}, Time: ${hours}:${mins}`;
}

const UserHeader = ({ user, router }: UserHeaderProps) => {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      setLoading(true);
      //@ts-ignore
      const result = await getUserData(user.id, 'profiles');
      if (isMounted) {
        setProfile(result);
        setLoading(false);
      }
    }
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [user.id]);

  const onLogout = async () => {
    const {error} = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout Failed', error.message);
    } else {
      router.push('/(auth)/LoginScreen');
    }
  }

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => onLogout() },
    ]);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <CustomActivityLoader />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Failed to load profile data.</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <View>
        <Header title="Profile" ShowBackButton={true} marginBottom={30} />
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={{ color: 'white' }}><Ionicons name='power' size={30} color={second.rose} /></Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={{gap: 15}}>
          <View style={styles.avatarContainer}>
            <Avatar uri={profile.image} size={hp(12)} rounded={radius.xxl*1.4} />
            <Pressable style={styles.editIcon} onPress={() => router.push('/(main)/EditProfile')}>
              <Ionicons name="pencil-outline" size={15} color={second.textDark} />
            </Pressable>
          </View>

          {/* username */}
          <View style={{alignItems: 'center', gap: 4, marginTop: 16}}>
            <Text style={styles.username}>{profile.username}</Text>
          </View>

          {/* details */}
          <View style={{ gap: 10 }}>
            <View style={styles.info}>
              <Ionicons name="mail-outline" size={20} color={second.textDark} style={{marginBottom: -10}} />
              <Text style={styles.infoText}>{user.email}</Text>
            </View>
            <View style={styles.info}>
              <Ionicons name="call-outline" size={20} color={second.textDark} style={{marginBottom: -10}} />
              <Text style={styles.infoText}>{profile.phone || 'No phone number'} </Text>
            </View>
            <View style={styles.info}>
              <Ionicons name="star-outline" size={20} color={second.textDark} style={{marginBottom: -10}} />
              <Text style={styles.infoText}>{profile.favorite_anime || 'No favorite anime'}</Text>
            </View>
            <View style={styles.info}>
              <Ionicons name="calendar-outline" size={20} color={second.textDark} style={{marginBottom: -10}} />  
              <Text style={styles.infoText}>{formatDateFriendly(profile.created_at)}</Text>
            </View>
            <View style={styles.info}>
              <Ionicons name="document-text-outline" size={20} color={second.textDark} style={{marginBottom: -10}} />
              <Text style={styles.infoText}>{profile.bio || 'No bio'}</Text> want to 
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Ensure that direct children have space to display their content
  },
  logoutBtn: {
    position: 'absolute',
    right: wp(3),
    top: hp(2),
    padding: 5,
    backgroundColor: '#fee2e2',
    borderRadius: radius.sm,
    alignItems: 'center',
    alignSelf: 'center',
  },
  noPost: {
    fontSize: hp(2.5),
    fontWeight: '500',
    color: second.text,
    textAlign: 'center',
    marginTop: hp(20),
  },
  listStyle: {
    paddingBottom: 30,
    paddingHorizontal: hp(4),
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
    color: second.text,
    textAlign: 'center',
    marginTop: hp(1),
  },
  username: {
    fontSize: hp(3),
    color: second.textDark,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    elevation: 7,
    backgroundColor: second.gray,
    shadowColor: second.dark,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 5,
    shadowOpacity: 0.4,
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: 'center',
    // Only avatar here, no username for layout
  },
  headerShape: {
    width: wp(100),
    height: hp(20),
  }, 
  headerContainer: {
    marginHorizontal: wp(4),
    marginBottom: hp(2),
  }
});
