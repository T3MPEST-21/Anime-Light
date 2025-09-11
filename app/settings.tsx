import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { useAuth } from '@/context/authContext';
import { hp, wp } from '@/helpers/common';
import { second } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function Settings() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const authContext = useAuth();
  const onLogout = async () => {
      const {error} = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Logout Failed', error.message);
      } else {
        router.push('/(auth)/LoginScreen');
      }
    }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            if (onLogout) {
              onLogout();
              router.replace('/(auth)/LoginScreen');
            }
          },
        },
      ]
    );
  };

  const settingsOptions = [
    {
      id: 'theme',
      title: 'Dark Mode',
      subtitle: 'Switch between light and dark theme',
      icon: isDark ? 'moon' : 'sunny',
      type: 'toggle',
      value: isDark,
      onToggle: toggleTheme,
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Receive notifications for likes and comments',
      icon: 'notifications',
      type: 'toggle',
      value: true,
      onToggle: () => {
        // TODO: Implement notification settings
        Alert.alert('Coming Soon', 'Notification settings will be available soon!');
      },
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      subtitle: 'Manage your privacy and data settings',
      icon: 'shield-checkmark',
      type: 'navigation',
      onPress: () => {
        Alert.alert('Coming Soon', 'Privacy settings will be available soon!');
      },
    },
    {
      id: 'about',
      title: 'About AnimeLight',
      subtitle: 'Version 1.0.0',
      icon: 'information-circle',
      type: 'navigation',
      onPress: () => {
        Alert.alert('About AnimeLight', 'AnimeLight v1.0.0\n\nA social platform for anime enthusiasts to share and discover content.');
      },
    },
    {
      id: 'logout',
      title: 'Logout',
      subtitle: 'Sign out of your account',
      icon: 'log-out',
      type: 'action',
      onPress: handleLogout,
      danger: true,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Settings Options */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.settingItem,
                { borderBottomColor: theme.divider },
                index === settingsOptions.length - 1 && styles.lastItem,
              ]}
              onPress={option.type === 'navigation' || option.type === 'action' ? option.onPress : undefined}
              disabled={option.type === 'toggle'}
            >
              <View style={styles.settingLeft}>
                <View style={[
                  styles.iconContainer, 
                  { backgroundColor: option.danger ? theme.error + '20' : theme.primary + '20' }
                ]}>
                  <Ionicons 
                    name={option.icon as any} 
                    size={20} 
                    color={option.danger ? theme.error : theme.primary} 
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[
                    styles.settingTitle, 
                    { color: option.danger ? theme.error : theme.text }
                  ]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                    {option.subtitle}
                  </Text>
                </View>
              </View>

              <View style={styles.settingRight}>
                {option.type === 'toggle' && (
                  <Switch
                    value={option.value}
                    onValueChange={option.onToggle}
                    trackColor={{ false: theme.border, true: theme.primary + '40' }}
                    thumbColor={option.value ? theme.primary : theme.textLight}
                  />
                )}
                {(option.type === 'navigation' || option.type === 'action') && (
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={theme.textLight} 
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={[styles.footer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.footerText, { color: theme.textLight }]}>
            Made with ❤️ for anime lovers
          </Text>
          <Text style={[styles.footerText, { color: theme.textLight }]}>
            © 2024 AnimeLight
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    paddingTop: hp(6),
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: hp(2.4),
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingTop: hp(2),
  },
  section: {
    marginHorizontal: wp(4),
    borderRadius: 12,
    marginBottom: hp(2),
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: hp(1.9),
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: hp(1.5),
    lineHeight: hp(2),
  },
  settingRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginHorizontal: wp(4),
    borderRadius: 12,
    paddingVertical: hp(3),
    alignItems: 'center',
    marginBottom: hp(4),
  },
  footerText: {
    fontSize: hp(1.4),
    marginBottom: 4,
    textAlign: 'center',
  },
});
