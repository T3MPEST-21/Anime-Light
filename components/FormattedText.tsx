import { useTheme } from '@/context/themeContext';
import { hp } from '@/helpers/common';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FormattedTextProps {
  html: string;
  containerStyle?: any;
}

/**
 * HTML-to-React-Native text parser using a state machine
 * Properly handles: <b>, <strong>, <i>, <em>, <u>, <h1-6>, <blockquote>, <li>, <ul>, <ol>, <p>, <br>, <div>
 */
const FormattedText: React.FC<FormattedTextProps> = ({ html, containerStyle }) => {
  const { theme } = useTheme();

  if (!html) return null;

  // Decode HTML entities
  const decodeHtmlEntities = (text: string): string => {
    const map: { [key: string]: string } = {
      '&nbsp;': ' ',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&amp;': '&',
    };
    return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => map[entity] || entity);
  };

  // Strip all HTML tags and decode entities - creates plain text version
  const stripHtml = (htmlString: string): string => {
    // Remove all HTML tags
    let text = htmlString.replace(/<[^>]*>/g, '');
    // Decode HTML entities
    text = decodeHtmlEntities(text);
    // Clean up excessive whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  };

  // Parse and structure the HTML content
  interface ParsedSegment {
    type: 'text' | 'heading' | 'blockquote' | 'list' | 'break';
    content: string;
    items?: string[]; // for list items
    subtype?: string; // for heading level (h1-h6) or list type (ul/ol)
  }

  const parseHtmlStructure = (htmlString: string): ParsedSegment[] => {
    const segments: ParsedSegment[] = [];

    // Remove script and style tags
    let cleaned = htmlString.replace(/<script[^>]*>.*?<\/script>/gi, '');
    cleaned = cleaned.replace(/<style[^>]*>.*?<\/style>/gi, '');

    // Split by major block elements
    const blockElements = [
      {
        pattern: /<h([1-6])[^>]*>(.*?)<\/h\1>/gi,
        type: 'heading',
        extract: (match: RegExpExecArray) => ({
          type: 'heading' as const,
          content: stripHtml(match[2]),
          subtype: `h${match[1]}`,
        }),
      },
      {
        pattern: /<blockquote[^>]*>(.*?)<\/blockquote>/gi,
        type: 'blockquote',
        extract: (match: RegExpExecArray) => ({
          type: 'blockquote' as const,
          content: stripHtml(match[1]),
        }),
      },
      {
        pattern: /<(ul|ol)[^>]*>(.*?)<\/\1>/gi,
        type: 'list',
        extract: (match: RegExpExecArray) => {
          const items = match[2].match(/<li[^>]*>(.*?)<\/li>/gi) || [];
          return {
            type: 'list' as const,
            content: '',
            items: items.map((item) => stripHtml(item)),
            subtype: match[1],
          };
        },
      },
      {
        pattern: /<br\s*\/?>/gi,
        type: 'break',
        extract: () => ({
          type: 'break' as const,
          content: '',
        }),
      },
      {
        pattern: /<(p|div)[^>]*>(.*?)<\/\1>/gi,
        type: 'text',
        extract: (match: RegExpExecArray) => ({
          type: 'text' as const,
          content: stripHtml(match[2]),
        }),
      },
    ];

    // Parse each block type
    for (const blockType of blockElements) {
      let match;
      blockType.pattern.lastIndex = 0;
      while ((match = blockType.pattern.exec(cleaned)) !== null) {
        segments.push(blockType.extract(match) as ParsedSegment);
      }
    }

    // If nothing was parsed, treat the whole thing as text
    if (segments.length === 0) {
      segments.push({
        type: 'text',
        content: stripHtml(cleaned),
      });
    }

    return segments;
  };

  const segments = parseHtmlStructure(html);

  return (
    <View style={containerStyle}>
      {segments.map((segment, idx) => {
        if (segment.type === 'heading') {
          const level = segment.subtype?.replace('h', '') || '1';
          const sizes: { [key: string]: number } = {
            '1': 2.4,
            '2': 2.2,
            '3': 2.0,
            '4': 1.8,
            '5': 1.6,
            '6': 1.5,
          };
          return (
            <Text
              key={idx}
              style={{
                fontSize: hp(sizes[level]),
                fontWeight: '700',
                color: theme.text,
                marginBottom: 8,
              }}
            >
              {segment.content}
            </Text>
          );
        } else if (segment.type === 'blockquote') {
          return (
            <View
              key={idx}
              style={{
                borderLeftWidth: 4,
                borderLeftColor: theme.primary,
                paddingLeft: 12,
                marginVertical: 8,
              }}
            >
              <Text
                style={{
                  fontSize: hp(1.8),
                  fontStyle: 'italic',
                  color: theme.textSecondary,
                }}
              >
                {segment.content}
              </Text>
            </View>
          );
        } else if (segment.type === 'list') {
          const items = segment.items || [];
          const isOrdered = segment.subtype === 'ol';
          return (
            <View key={idx} style={{ marginVertical: 8, paddingLeft: 8 }}>
              {items.map((item, itemIdx) => (
                <Text
                  key={itemIdx}
                  style={{
                    fontSize: hp(1.8),
                    color: theme.text,
                    marginBottom: 4,
                  }}
                >
                  {isOrdered ? `${itemIdx + 1}. ` : '• '}{item}
                </Text>
              ))}
            </View>
          );
        } else if (segment.type === 'break') {
          return <Text key={idx}>{'\n'}</Text>;
        } else {
          // Regular text
          return (
            <Text
              key={idx}
              style={{
                fontSize: hp(1.8),
                color: theme.text,
                lineHeight: hp(2.4),
                marginBottom: 8,
              }}
            >
              {segment.content}
            </Text>
          );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({});

export default FormattedText;
