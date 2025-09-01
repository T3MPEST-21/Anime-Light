import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { radius, second } from '@/constants/theme';
import { hp, wp } from '@/helpers/common';
import Header from '@/components/Header';
import { Image } from 'expo-image';
import { useAuth } from '@/context/authContext';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { imageFile } from '@/services/ImageService';

const EditProfile = () => {
  const { user, setUserData } = useAuth() ?? {};
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.image || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pick image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0].uri) {
      setAvatar(result.assets[0].uri);
    }
  };

  // Save profile changes
  const handleSave = async () => {
    if (!user) {
      return (
        <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require('../../assets/images/naruto-not-logged-in.png')} style={{ width: wp(50), height: wp(50) }} />
            <Text style={{ color: second.text, fontSize: hp(2.5), textAlign: 'center', marginTop: 20 }}>User not found. Please log in again.</Text>
          </View>
        </View>
      );
    }

    setError('');
    setSuccess('');
    setLoading(true);

    let imageUrl = avatar;
    // If avatar is a new local file (not a remote URL), upload it
    if (typeof avatar === 'string' && avatar.startsWith('file')) {
      let imageRes = await imageFile('uploads', avatar, true);
      if (imageRes.success) imageUrl = imageRes.data;
      else imageUrl = null;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        username: username.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        image: imageUrl,
      })
      .eq('id', user.id);

    setLoading(false);

    if (error) {
      if (
        error.message.toLowerCase().includes('duplicate') ||
        error.message.toLowerCase().includes('unique constraint')
      ) {
        setError('Username already taken.');
      } else {
        setError(error.message);
      }
    } else {
      setSuccess('Profile updated!');
      setUserData?.({ username, bio, phone, image: imageUrl });
      router.push('/(tabs)/Profile');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Header title="Edit Profile" ShowBackButton={true} marginBottom={hp(2)} />

          <View style={styles.form}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <Image source={avatar} style={styles.avatar} />
              <Pressable style={styles.cameraIcon} onPress={pickImage}>
                <Ionicons name="camera" size={20} color={second.text} />
              </Pressable>
            </View>

            {/* Username */}
            <View style={styles.input}>
              <Ionicons name="at-outline" size={18} color={second.text} />
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                style={{ flex: 1, fontSize: hp(2.1), color: second.text }}
                autoCapitalize="none"
              />
            </View>

            {/* Phone (optional) */}
            <View style={styles.input}>
              <Ionicons name="call-outline" size={18} color={second.text} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone (optional)"
                style={{ flex: 1, fontSize: hp(2.1), color: second.text }}
                keyboardType="phone-pad"
              />
            </View>

            {/* Bio */}
            <View style={[styles.input, styles.bio]}>
              <Ionicons name="document-text-outline" size={18} color={second.text} style={{ marginTop: 5 }} />
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Bio"
                style={{ flex: 1, fontSize: hp(2.1), color: second.text, minHeight: 60 }}
                multiline
                maxLength={200}
              />
            </View>

            {error ? <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text> : null}
            {success ? <Text style={{ color: 'green', textAlign: 'center' }}>{success}</Text> : null}

            <Pressable
              style={{
                backgroundColor: second.primary,
                padding: 15,
                borderRadius: radius.xxl,
                alignItems: 'center',
                marginTop: 10,
                opacity: loading ? 0.7 : 1,
              }}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: hp(2.1) }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  input: {
    flexDirection: 'row',
    borderWidth: 0.4,
    borderColor: second.text,
    borderRadius: radius.xxl,
    padding: 17,
    paddingHorizontal: 20,
    gap: 5,
    borderCurve: 'continuous',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  bio: {
    height: hp(15),
    alignItems: 'flex-start',
    paddingVertical: 15,
  },
  form: {
    gap: 18,
    marginTop: 20,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: -10,
    padding: 8,
    borderRadius: 50,
    backgroundColor: second.darkLight,
    shadowColor: second.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderCurve: 'continuous',
    borderColor: second.darkLight,
    borderWidth: 1,
  },
  avatarContainer: {
    width: hp(14),
    height: hp(14),
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
});