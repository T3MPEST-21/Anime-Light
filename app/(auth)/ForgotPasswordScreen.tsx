import BackButton from '@/components/BackButton';
import CustomButton from '@/components/customButton';
import { useTheme } from '@/context/themeContext';
import { hp } from '@/helpers/common';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePasswordReset = async () => {
    setError('');
    
    // Validation
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: 'animelite://(auth)/ResetPasswordScreen', // Deep link to your app
        }
      );

      if (resetError) {
        setError(resetError.message || 'Failed to send reset email');
        Alert.alert('Error', resetError.message);
      } else {
        setSuccess(true);
        Alert.alert(
          'Success',
          'Password reset email sent! Check your inbox for instructions.'
        );
        // Optionally navigate back after a delay
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BackButton onPress={() => router.back()} />
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          <Text style={[styles.welcomeText, { color: theme.text }]}>Reset Your Password</Text>
          
          <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
            Enter the email address associated with your account, and we'll send you a link to reset your password.
          </Text>

          <View style={styles.form}>
            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
              <Ionicons name="mail-outline" size={22} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Email"
                placeholderTextColor={theme.placeholder}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            {error ? <Text style={[styles.error, { color: theme.error }]}>{error}</Text> : null}

            <CustomButton
              title={loading ? 'Sending...' : 'Send Reset Link'}
              onPress={handlePasswordReset}
              loading={loading}
              buttonStyle={[styles.resetButton, { backgroundColor: theme.primary }]}
              textStyle={[styles.resetButtonText, { color: theme.buttonText }]}
            />

            <TouchableOpacity onPress={() => router.back()} style={styles.backToLoginContainer}>
              <Text style={[styles.backToLoginText, { color: theme.primary }]}>← Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default ForgotPasswordScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  welcomeText: {
    fontSize: hp(3),
    fontWeight: 'bold',
    marginBottom: hp(2),
  },
  instructionText: {
    fontSize: hp(2),
    marginBottom: hp(3),
    lineHeight: hp(3),
  },
  form: {
    gap: hp(2),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: hp(7),
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: hp(2),
    fontWeight: '500',
  },
  error: {
    fontSize: hp(1.8),
    marginTop: -8,
    marginBottom: 8,
  },
  resetButton: {
    height: hp(7),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(1),
  },
  resetButtonText: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
  },
  backToLoginContainer: {
    alignSelf: 'center',
    marginTop: hp(2),
  },
  backToLoginText: {
    fontSize: hp(2),
    fontWeight: '500',
  },
});
