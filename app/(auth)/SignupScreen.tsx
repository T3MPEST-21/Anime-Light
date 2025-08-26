import { StyleSheet, Text, View, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react';
import { hp } from '@/helpers/common';
import { second } from '@/constants/theme';
import CustomButton from '@/components/customButton';
import BackButton from '@/components/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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

  const handleSignup = () => {
    setError('');
    if (!fullname || !username || !email || !password || !repeatPassword) {
      setError('Please fill all required fields.');
      return;
    }
    if (password !== repeatPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    // Simulate signup
    setTimeout(() => {
      setLoading(false);
      // Replace with your signup logic
      // Success logic here
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: second.grayLight }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
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