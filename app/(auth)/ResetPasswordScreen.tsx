import BackButton from '@/components/BackButton';
import CustomButton from '@/components/customButton';
import { useTheme } from '@/context/themeContext';
import { hp } from '@/helpers/common';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ResetPasswordScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (pass: string) => {
    // At least 8 characters, 1 uppercase, 1 number
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(pass);
  };

  const handleResetPassword = async () => {
    setError('');

    // Validation
    if (!password || !confirmPassword) {
      setError('Please enter both passwords.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must contain at least 1 uppercase letter and 1 number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (updateError) {
        setError(updateError.message || 'Failed to reset password');
        Alert.alert('Error', updateError.message);
      } else {
        Alert.alert('Success', 'Your password has been reset successfully!');
        // Navigate to login after successful reset
        setTimeout(() => {
          router.push('/(auth)/LoginScreen');
        }, 1500);
      }
    } catch (err) {
      console.error('Password update error:', err);
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
          <Text style={[styles.welcomeText, { color: theme.text }]}>Create New Password</Text>
          
          <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
            Enter a strong password with at least 8 characters, including an uppercase letter and a number.
          </Text>

          <View style={styles.form}>
            {/* Password Input */}
            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
              <Ionicons name="lock-closed-outline" size={22} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="New Password"
                placeholderTextColor={theme.placeholder}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
              <Ionicons name="lock-closed-outline" size={22} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Confirm Password"
                placeholderTextColor={theme.placeholder}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Password Requirements */}
            <View style={[styles.requirementsBox, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
              <Text style={[styles.requirementTitle, { color: theme.text }]}>Password Requirements:</Text>
              <Text style={[styles.requirement, { color: password.length >= 8 ? theme.success : theme.textSecondary }]}>
                ✓ At least 8 characters
              </Text>
              <Text style={[styles.requirement, { color: /[A-Z]/.test(password) ? theme.success : theme.textSecondary }]}>
                ✓ At least 1 uppercase letter
              </Text>
              <Text style={[styles.requirement, { color: /\d/.test(password) ? theme.success : theme.textSecondary }]}>
                ✓ At least 1 number
              </Text>
              <Text style={[styles.requirement, { color: password === confirmPassword && confirmPassword ? theme.success : theme.textSecondary }]}>
                ✓ Passwords match
              </Text>
            </View>

            {error ? <Text style={[styles.error, { color: theme.error }]}>{error}</Text> : null}

            <CustomButton
              title={loading ? 'Resetting...' : 'Reset Password'}
              onPress={handleResetPassword}
              loading={loading}
              buttonStyle={[styles.resetButton, { backgroundColor: theme.primary }]}
              textStyle={[styles.resetButtonText, { color: theme.buttonText }]}
            />

            <TouchableOpacity onPress={() => router.push('/(auth)/LoginScreen')} style={styles.backToLoginContainer}>
              <Text style={[styles.backToLoginText, { color: theme.primary }]}>← Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default ResetPasswordScreen

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
  requirementsBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: hp(1),
  },
  requirementTitle: {
    fontSize: hp(1.9),
    fontWeight: 'bold',
    marginBottom: hp(1),
  },
  requirement: {
    fontSize: hp(1.7),
    marginBottom: hp(0.5),
    lineHeight: hp(2.5),
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
