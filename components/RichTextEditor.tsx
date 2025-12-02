import { radius } from '@/constants/theme';
import { useTheme } from '@/context/themeContext';
import { hp } from '@/helpers/common';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';

interface RichTextEditorProps {
  editorRef: React.RefObject<RichEditor | null>;
  onChange: (body: string) => void;
  maxLength?: number;
}

const RichTextEditor = ({ editorRef, onChange, maxLength = 5000 }: RichTextEditorProps) => {
  const { theme } = useTheme();
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  const handleChange = (html: string) => {
    // Count characters (excluding HTML tags for display purposes)
    const plainText = html.replace(/<[^>]*>/g, '');
    const chars = plainText.length;
    setCharCount(chars);

    // Count words
    const words = plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);

    onChange(html);
  };

  const [editorFocused, setEditorFocused] = useState(false);

  const [focusAnim] = useState(new Animated.Value(0));

  const handleFocus = () => {
    setEditorFocused(true);
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: false,
      speed: 12,
      bounciness: 8,
    }).start();
  };

  const handleBlur = () => {
    setEditorFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColorInterpolate = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.inputBorder, theme.primary],
  });

  const shadowOpacityInterpolate = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.15],
  });

  const charPercentage = (charCount / maxLength) * 100;
  const charColor = charPercentage > 90 ? theme.error : charPercentage > 70 ? theme.warning : theme.textSecondary;

  // Toolbar height used for sticky positioning/padding
  const TOOLBAR_HEIGHT = 52;

  // Helper: parse hex color to RGB
  const hexToRgb = (hex: string) => {
    if (!hex) return null;
    const cleaned = hex.replace('#', '');
    const full = cleaned.length === 3 ? cleaned.split('').map(c => c + c).join('') : cleaned;
    const bigint = parseInt(full, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  };

  // Simple luminance contrast detection -> returns '#000' or '#fff'
  const getReadableTextColor = (bgHex: string) => {
    const rgb = hexToRgb(String(bgHex || '#ffffff'));
    if (!rgb) return '#000';
    // Per ITU-R BT.601
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
    return luminance > 186 ? '#000' : '#fff';
  };

  // Decide editor content text color based on input background for contrast
  const editorTextColor = getReadableTextColor(theme.inputBackground);

  return (
    <View style={{ minHeight: 285 }}>
      {/* Editor Card: toolbar + editor + stats inside one bordered container to avoid overlap */}
      <Animated.View style={[styles.editorCard, { 
        backgroundColor: theme.inputBackground,
        borderColor: borderColorInterpolate,
        shadowOpacity: shadowOpacityInterpolate,
        paddingTop: TOOLBAR_HEIGHT,
      }]}>
        {/* Sticky toolbar: positioned absolutely at top with scrollable content */}
        <View style={[styles.toolbarWrapper, { backgroundColor: theme.surface }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll}>
            <RichToolbar 
              style={[styles.richToolbar, { backgroundColor: theme.surface }]} 
              actions={[
                actions.heading1,
                actions.heading2,
                actions.heading3,
                actions.heading4,
                actions.setBold,
                actions.setItalic,
                actions.setUnderline,
                actions.line,
                actions.insertBulletsList,
                actions.insertOrderedList,
                actions.blockquote,
                actions.alignLeft,
                actions.alignCenter,
                actions.alignRight,
                actions.setTextColor,
                actions.setBackgroundColor,
                actions.undo,
                actions.redo,
                actions.removeFormat,
              ]}
              iconMap={{
                [actions.heading1]: ({tintColor}: {tintColor: string}) => <Text style={{color: tintColor, fontWeight: 'bold', fontSize: 16}}>H1</Text>,
                [actions.heading2]: ({tintColor}: {tintColor: string}) => <Text style={{color: tintColor, fontWeight: 'bold', fontSize: 14}}>H2</Text>,
                [actions.heading3]: ({tintColor}: {tintColor: string}) => <Text style={{color: tintColor, fontWeight: 'bold', fontSize: 12}}>H3</Text>,
                [actions.heading4]: ({tintColor}: {tintColor: string}) => <Text style={{color: tintColor, fontWeight: 'bold', fontSize: 11}}>H4</Text>,
                [actions.setBold]: ({tintColor}: {tintColor: string}) => <MaterialCommunityIcons name="format-bold" size={20} color={tintColor} />,
                [actions.setItalic]: ({tintColor}: {tintColor: string}) => <MaterialCommunityIcons name="format-italic" size={20} color={tintColor} />,
                [actions.setUnderline]: ({tintColor}: {tintColor: string}) => <MaterialCommunityIcons name="format-underline" size={20} color={tintColor} />,
                [actions.insertBulletsList]: ({tintColor}: {tintColor: string}) => <MaterialCommunityIcons name="format-list-bulleted" size={20} color={tintColor} />,
                [actions.insertOrderedList]: ({tintColor}: {tintColor: string}) => <MaterialCommunityIcons name="format-list-numbered" size={20} color={tintColor} />,
                [actions.blockquote]: ({tintColor}: {tintColor: string}) => <MaterialCommunityIcons name="format-quote-close" size={20} color={tintColor} />,
                [actions.undo]: ({tintColor}: {tintColor: string}) => <MaterialCommunityIcons name="undo" size={20} color={tintColor} />,
                [actions.redo]: ({tintColor}: {tintColor: string}) => <MaterialCommunityIcons name="redo" size={20} color={tintColor} />,
              }} 
              editor={editorRef} 
              disabled={false} 
              iconTint={theme.textSecondary}
              selectedIconTint={theme.primary}
              disabledIconTint={theme.placeholder}
              flatContainerStyle={styles.listStyle}
            />
          </ScrollView>
        </View>

        <RichEditor 
          ref={editorRef} 
          onChange={handleChange} 
          placeholder={"Share what's on your mind..."} 
          editorStyle={{ 
            ...styles.contentStyle, 
            color: editorTextColor,
            contentCSSText: `body { color: ${editorTextColor}; background: transparent; } p { color: ${editorTextColor}; }`
          }} 
          containerStyle={styles.richEditorContainer}
          initialContentHTML=""
          editorInitializedCallback={() => {
            // Editor is ready
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {/* Stats: placed inside the same card, with a top separator to avoid overlapping editor content */}
        <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
          <View style={styles.counters}>
            <Text style={[styles.countText, { color: theme.textSecondary }]}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </Text>
            <View style={styles.separator} />
            <Text style={[styles.countText, { color: charColor }]}>
              {charCount}/{maxLength} {charCount === 1 ? 'char' : 'chars'}
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.inputBackground }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(charPercentage, 100)}%`, 
                  backgroundColor: charColor 
                }
              ]} 
            />
          </View>
        </View>
      </Animated.View>
      {/* Floating counter when editor is focused */}
      {editorFocused && (
        <View style={[styles.floatingCounter, { backgroundColor: theme.primary }]}> 
          <Text style={styles.floatingCounterText}>{charCount}</Text>
        </View>
      )}
    </View>
  )
}

export default RichTextEditor

const styles = StyleSheet.create({
    richToolbar: {
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 0.5,
        minHeight: 50,
    },
    toolbarWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 52,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        zIndex: 10,
    },
    rich: {
        minHeight: 240,
        flex: 1,
        borderWidth: 1.5,
        borderTopWidth: 0,
        padding: 12,
    },
    richEditorContainer: {
      minHeight: 200,
      padding: 12,
      borderWidth: 0,
      backgroundColor: 'transparent'
    },
    editorCard: {
      borderWidth: 1.5,
      borderRadius: radius.xl,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
    },
    floatingCounter: {
      position: 'absolute',
      top: 12,
      right: 16,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      minWidth: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    floatingCounterText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: hp(1.8),
      textAlign: 'center',
    },
    contentStyle: {
        paddingLeft: 4,
        paddingRight: 4,
        fontSize: hp(1.9),
        lineHeight: hp(2.8),
    },
    listStyle: {
        paddingHorizontal: 4,
        gap: 2,
        paddingVertical: 6,
    },
    toolbarScroll: {
      paddingHorizontal: 6,
      alignItems: 'center',
      gap: 6,
    },
    statsContainer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.08)',
        padding: 12,
        gap: 10,
        paddingTop: 12,
    },
    counters: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    countText: {
        fontSize: hp(1.5),
        fontWeight: '600',
    },
    separator: {
        width: 1,
        height: 14,
        backgroundColor: 'rgba(0,0,0,0.12)',
        marginHorizontal: 8,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 4,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
})