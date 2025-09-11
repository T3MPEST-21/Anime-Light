import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTheme } from '@/context/themeContext'
import { Ionicons } from '@expo/vector-icons'
import Header from '@/components/Header'
import { hp, wp } from '@/helpers/common'

const chats = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title="Chats"
        ShowBackButton={false}
        marginBottom={0}
      />
      
      <View style={styles.emptyState}>
        <Ionicons name="chatbubbles-outline" size={64} color={theme.textLight} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>No conversations yet</Text>
        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
          Start chatting with other anime enthusiasts!
        </Text>
        <Text style={[styles.comingSoon, { color: theme.primary }]}>
          Chat feature coming soon...
        </Text>
      </View>
    </View>
  )
}

export default chats

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8),
  },
  emptyTitle: {
    fontSize: hp(2.4),
    fontWeight: '600',
    marginTop: hp(2),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: hp(1.8),
    marginTop: hp(1),
    textAlign: 'center',
    lineHeight: hp(2.4),
  },
  comingSoon: {
    fontSize: hp(1.6),
    fontWeight: '500',
    marginTop: hp(2),
    textAlign: 'center',
  },
})