import { StyleSheet, Text, View, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react';
import { hp } from '@/helpers/common';
import { second } from '@/constants/theme';
import CustomButton from '@/components/customButton';
import BackButton from '@/components/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

const SignupScreen = () => {
    const router = useRouter();
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [favoriteAnime, setFavoriteAnime] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');
    if (!fullname || !username || !email || !password || !repeatPassword) {
      setError('Please fill all required fields.');
      return;
    }
    if (password !== repeatPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Trimming input values
    let name = fullname.trim();
    let user = username.trim();
    let mail = email.trim();
    let anime = favoriteAnime.trim();
    let pass = password.trim();

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: mail,
      password: pass,
      options: {
        data: {
          full_name: name,
          username: user,
          favorite_anime: anime,
        },
      },
    });

    setLoading(false);

    const session = data?.session;
    console.log('session', session);
    console.log('error', error);

    if (error) {
      // Log the full error object for debugging
      console.log('Supabase error object:', error);

      // Check for duplicate username error in various ways
      if (
        (error.message && (
          error.message.toLowerCase().includes('user already registered') ||
          error.message.toLowerCase().includes('duplicate') ||
          error.message.toLowerCase().includes('unique constraint') ||
          error.message.toLowerCase().includes('users_username_key') || // Postgres constraint name
          error.message.toLowerCase().includes('already exists') ||
          error.message.toLowerCase().includes('Database error saving new user') ||
          error.message.toLowerCase().includes('username') && error.message.toLowerCase().includes('already')
        )) ||
        (error.code === '23505') // Postgres unique violation code
      ) {
        setError("This Username or email is already taken by someone else, why don't you try picking a more unique one?");
      } else {
        setError(error.message || 'An unknown error occurred.');
      }
      return;
    }

    // Optionally, navigate to another screen or show success message here
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: second.grayLight }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BackButton />
        <View style={styles.container}>
          <Text style={styles.title}>Let's get you started, shall we?</Text>
          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={22} color="#aaa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#aaa"
                value={fullname}
                onChangeText={setFullname}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="at-outline" size={22} color="#aaa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={22} color="#aaa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="star-outline" size={22} color="#aaa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Favorite Anime (optional)"
                placeholderTextColor="#aaa"
                value={favoriteAnime}
                onChangeText={setFavoriteAnime}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={22} color="#aaa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={22} color="#aaa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Repeat Password"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={repeatPassword}
                onChangeText={setRepeatPassword}
              />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <CustomButton
              title={loading ? '' : 'Sign Up'}
              onPress={handleSignup}
              loading={loading}
              buttonStyle={styles.signupButton}
              textStyle={styles.signupButtonText}
            />
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/LoginScreen')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default SignupScreen

const styles = StyleSheet.create({
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(2),
  },
  loginText: {
    fontSize: hp(1.9),
    color: '#888',
    marginRight: 6,
  },
  loginLink: {
    fontSize: hp(1.9),
    color: second.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: hp(6),
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: hp(3.2),
    fontWeight: '600',
    color: second.text,
    textAlign: 'center',
    marginBottom: hp(2),
  },
  form: {
    width: '100%',
    marginTop: hp(2),
    alignItems: 'center',
  },
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: second.grayLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: hp(1.5),
    paddingHorizontal: 8,
    height: hp(6),
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: hp(2.2),
    color: second.text,
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  error: {
    color: '#d00',
    fontSize: hp(1.8),
    marginBottom: hp(1),
    textAlign: 'center',
  },
  signupButton: {
    width: '100%',
    marginTop: hp(1),
    backgroundColor: second.primary,
    borderRadius: 16,
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: second.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  signupButtonText: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    color: second.white,
  },
});