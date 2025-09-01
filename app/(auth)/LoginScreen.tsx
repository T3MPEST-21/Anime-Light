import { StyleSheet, Text, View, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import React from 'react'
import BackButton from '@/components/BackButton'
import { useRouter } from 'expo-router';
import { hp } from '@/helpers/common';
import { second } from '@/constants/theme';
import CustomButton from '@/components/customButton';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    //triming name
    let mail = email.trim();
    let pass = password.trim();

    setLoading(true);

    const {error} = await supabase.auth.signInWithPassword({
      email: mail,
      password: pass,
    });
    
    setLoading(false);

    console.log('error', error);
    if (error) {
      Alert.alert('error: ' + error.message);
    }
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
        <BackButton onPress={() => router.back()} />
        <View style={styles.container}>
          <Text style={styles.welcomeText}>Hey, Nice to see you again</Text>
          <View style={styles.form}>
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
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.forgotButton} onPress={() => alert("Forgot Password pressed")}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <CustomButton
            title={loading ? '' : 'Login'}
            onPress={handleLogin}
            loading={loading}
            buttonStyle={styles.loginButton}
            textStyle={styles.loginButtonText}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/SignupScreen')}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen

const styles = StyleSheet.create({
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: hp(1),
  },
  forgotText: {
    color: second.primary,
    fontSize: hp(1.9),
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(2),
  },
  signupText: {
    fontSize: hp(1.9),
    color: '#888',
    marginRight: 6,
  },
  signupLink: {
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
  welcomeText: {
    fontSize: hp(3.5),
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
  loginButton: {
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
  loginButtonText: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    color: second.white,
  },
});