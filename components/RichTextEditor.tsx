import { StyleSheet, Text, View } from 'react-native'
import React, { useRef } from 'react'
import {actions, RichEditor, RichToolbar} from 'react-native-pell-rich-editor'
import { radius, second } from '@/constants/theme';

interface RichTextEditorProps {
  editorRef: React.RefObject<RichEditor>;
  onChange: (body: string) => void;
}

const RichTextEditor = ({ editorRef, onChange }: RichTextEditorProps) => {
  
  const handleChange = (html: string) => {
    onChange(html);
  };

  return (
    <View style={{minHeight: 285}}>
      <RichToolbar 
        style={styles.richToolbar} 
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.setStrikethrough,
          actions.removeFormat,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.blockquote,
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,
          actions.code,
          actions.line,
          actions.heading1,
          actions.heading2,
          actions.heading3,
          actions.heading4,
          actions.undo,
          actions.redo,
        ]} 
        iconMap={{
          [actions.heading1]: ({tintColor}: {tintColor: string}) => <Text style={{color: tintColor, fontWeight: 'bold'}}>H1</Text>,
          [actions.heading2]: ({tintColor}: {tintColor: string}) => <Text style={{color: tintColor, fontWeight: 'bold'}}>H2</Text>,
          [actions.heading3]: ({tintColor}: {tintColor: string}) => <Text style={{color: tintColor, fontWeight: 'bold'}}>H3</Text>,
          [actions.heading4]: ({tintColor}: {tintColor: string}) => <Text style={{color: tintColor, fontWeight: 'bold'}}>H4</Text>,
        }} 
        editor={editorRef} 
        disabled={false} 
        iconTint={second.grayDark}
        selectedIconTint={second.primary}
        disabledIconTint={second.gray}
        flatContainerStyle={styles.listStyle}
      />
      <RichEditor 
        ref={editorRef} 
        onChange={handleChange} 
        placeholder={"Share what's on your mind..."} 
        editorStyle={styles.contentStyle} 
        containerStyle={styles.rich}
        initialContentHTML=""
        editorInitializedCallback={() => {
          // Editor is ready
        }}
      />
    </View>
  )
}

export default RichTextEditor

const styles = StyleSheet.create({
    richToolbar: {
        borderTopRightRadius: radius.xl,
        borderTopLeftRadius: radius.xl,
        backgroundColor: second.gray,
    },
    rich: {
        minHeight: 240,
        flex: 1,
        borderWidth: 1.5,
        borderTopWidth: 0,
        borderBottomLeftRadius: radius.xl,
        borderBottomRightRadius: radius.xl,
        padding: 5,
        borderColor: second.gray,
    },
    contentStyle: {
        color: second.text,
    },
    listStyle: {
        paddingHorizontal: 8,
        gap: 3,
        
    }
})