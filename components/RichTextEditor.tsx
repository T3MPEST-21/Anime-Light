import { radius } from '@/constants/theme';
import { useTheme } from '@/context/themeContext';
import { hp } from '@/helpers/common';
import React, { useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, View } from 'react-native';
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

  return (
    <View style={{ minHeight: 285 }}>
      {/* Editor Card: toolbar + editor + stats inside one bordered container to avoid overlap */}
      <Animated.View style={[styles.editorCard, { 
        backgroundColor: theme.inputBackground,
        borderColor: borderColorInterpolate,
        shadowOpacity: shadowOpacityInterpolate,
      }]}>
        {/* Horizontal FlatList wrapper avoids ScrollView nesting warnings while keeping toolbar scrollable */}
        <FlatList
          data={[0]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item)}
          renderItem={() => (
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
          }} 
              editor={editorRef} 
              disabled={false} 
              iconTint={theme.textSecondary}
              selectedIconTint={theme.primary}
              disabledIconTint={theme.placeholder}
              flatContainerStyle={styles.listStyle}
            />
          )}
        />

        <RichEditor 
          ref={editorRef} 
          onChange={handleChange} 
          placeholder={"Share what's on your mind..."} 
          editorStyle={{ ...styles.contentStyle, color: theme.text }} 
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
        borderTopRightRadius: radius.xl,
        borderTopLeftRadius: radius.xl,
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 0.5,
        minHeight: 50,
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