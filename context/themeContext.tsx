import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { second } from '@/constants/theme';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textLight: string;
  
  // Primary colors
  primary: string;
  primaryLight: string;
  secondary: string;
  
  // Accent colors
  accent: string;
  error: string;
  success: string;
  warning: string;
  
  // Border and divider colors
  border: string;
  divider: string;
  
  // Input colors
  inputBackground: string;
  inputBorder: string;
  placeholder: string;
  
  // Shadow colors
  shadow: string;
  
  // Special colors
  overlay: string;
  skeleton: string;
  buttonText: string;
}

export const lightTheme: ThemeColors = {
  background: second.mainBg,
  surface: second.white,
  card: second.white,
  
  text: second.textDark,
  textSecondary: second.text,
  textLight: second.grayDark,
  
  primary: second.primary,
  primaryLight: second.primarySecond,
  secondary: second.secondary,
  
  accent: second.secondary2,
  error: second.rose,
  success: second.primary,
  warning: second.primarySecond,
  
  border: second.grayLight,
  divider: second.gray,
  
  inputBackground: second.white,
  inputBorder: second.grayLight,
  placeholder: second.grayDark,
  
  shadow: second.dark,
  
  overlay: 'rgba(0, 0, 0, 0.5)',
  skeleton: second.gray,
  buttonText: second.white,
};

export const darkTheme: ThemeColors = {
  background: second.dark,
  surface: second.darkLight,
  card: second.darkLight,
  
  text: second.white,
  textSecondary: second.grayLight,
  textLight: second.gray,
  
  primary: second.primary,
  primaryLight: second.primarySecond,
  secondary: second.secondary,
  
  accent: second.secondary2,
  error: second.rose,
  success: second.primary,
  warning: second.primarySecond,
  
  border: second.gray,
  divider: second.grayDark,
  
  inputBackground: second.darkLight,
  inputBorder: second.gray,
  placeholder: second.grayLight,
  
  shadow: second.textDark,
  
  overlay: 'rgba(0, 0, 0, 0.7)',
  skeleton: second.grayDark,
  buttonText: second.white,
};

interface ThemeContextType {
  theme: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'animelight_theme_preference';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (darkMode: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    saveThemePreference(newTheme);
  };

  const setTheme = (darkMode: boolean) => {
    setIsDark(darkMode);
    saveThemePreference(darkMode);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={theme.background} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
