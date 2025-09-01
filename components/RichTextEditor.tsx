import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {actions, RichEditor, RichToolbar} from 'react-native-pell-rich-editor'
import { radius, second } from '@/constants/theme';

interface RichTextEditorProps {
  editorRef: React.RefObject<any>;
  onChange: (body: string) => void;
}

const RichTextEditor = ({ editorRef, onChange }: RichTextEditorProps) => {
  return (
    <View style={{minHeight: 285, }}>
      <RichToolbar style={styles.richToolbar} action={[
        actions.setStrikethrough,
        actions.removeFormat,
        actions.setBold,
        actions.setItalic,
        actions.insertOrderedList,
        actions.blockquote,
        actions.alignLeft,
        actions.alignCenter,
        actions.alignRight,
        actions.code,
        actions.line,
        actions.heading1,
        actions.heading4,
      ]} iconMap={{
        [actions.heading1]: ({tintColor}: {tintColor: string}) => <Text style={{color: tintColor}}>H1</Text>,
        [actions.heading4]: ({tintColor}: {tintColor: string}) => <Text style={{color: tintColor}}>H4</Text>,
      }} 
      editorRef={editorRef} disabled={false} flatContainerStyle={styles.listStyle} selectedIconTint={second.primary} />
      <RichEditor ref={editorRef} onChange={onChange} placeholder={"Share what's on your mind..."} editorStyle={styles.contentStyle} containerStyle={styles.rich} />
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