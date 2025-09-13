import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useTheme } from '@/context/themeContext';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from '@/helpers/common';
import { useAuth } from '@/context/authContext';

const Friends = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual data from your backend
  const friends = [
    { id: '1', username: 'AnimeFan123', status: 'online', avatar: null },
    { id: '2', username: 'MangaMaster', status: 'offline', avatar: null },
    { id: '3', username: 'CosplayQueen', status: 'online', avatar: null },
  ];

  const friendRequests = [
    { id: '4', username: 'NewUser42', mutualFriends: 2, avatar: null },
    { id: '5', username: 'AnimeLover99', mutualFriends: 5, avatar: null },
  ];

  const renderFriendsList = () => (
    <ScrollView style={styles.content}>
      {friends.map((friend) => (
        <View 
          key={friend.id} 
          style={[styles.friendItem, { borderBottomColor: theme.border }]}
        >
          <View style={styles.friendInfo}>
            <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
              {friend.avatar ? (
                <Image source={{ uri: friend.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarText, { color: theme.primary }]}>
                  {friend.username.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View>
              <Text style={[styles.friendName, { color: theme.text }]}>{friend.username}</Text>
              <Text style={[styles.friendStatus, { color: theme.textSecondary }]}>
                {friend.status}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.messageButton, { backgroundColor: theme.primary }]}>
            <Ionicons name="chatbubble-ellipses" size={20} color="white" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderFriendRequests = () => (
    <ScrollView style={styles.content}>
      {friendRequests.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people" size={48} color={theme.textLight} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No friend requests yet
          </Text>
        </View>
      ) : (
        friendRequests.map((request) => (
          <View 
            key={request.id} 
            style={[styles.requestItem, { borderBottomColor: theme.border }]}
          >
            <View style={styles.friendInfo}>
              <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
                {request.avatar ? (
                  <Image source={{ uri: request.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={[styles.avatarText, { color: theme.primary }]}>
                    {request.username.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View>
                <Text style={[styles.friendName, { color: theme.text }]}>{request.username}</Text>
                <Text style={[styles.mutualFriends, { color: theme.textSecondary }]}>
                  {request.mutualFriends} mutual friends
                </Text>
              </View>
            </View>
            <View style={styles.requestButtons}>
              <TouchableOpacity 
                style={[styles.acceptButton, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.declineButton, { borderColor: theme.border }]}
              >
                <Text style={[styles.declineButtonText, { color: theme.textSecondary }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderAddFriends = () => (
    <View style={styles.content}>
      <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground }]}>
        <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search for friends..."
          placeholderTextColor={theme.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Suggested Friends
        </Text>
        {[].length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={48} color={theme.textLight} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No suggestions available
            </Text>
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Suggestions will appear here
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Friends</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'friends' && [styles.activeTab, { borderBottomColor: theme.primary }]
          ]} 
          onPress={() => setActiveTab('friends')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'friends' ? theme.primary : theme.textSecondary }
            ]}
          >
            Friends
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'requests' && [styles.activeTab, { borderBottomColor: theme.primary }]
          ]} 
          onPress={() => setActiveTab('requests')}
        >
          <View style={styles.tabBadgeContainer}>
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'requests' ? theme.primary : theme.textSecondary }
              ]}
            >
              Requests
            </Text>
            {friendRequests.length > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                <Text style={styles.badgeText}>{friendRequests.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'add' && [styles.activeTab, { borderBottomColor: theme.primary }]
          ]} 
          onPress={() => setActiveTab('add')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'add' ? theme.primary : theme.textSecondary }
            ]}
          >
            Add Friends
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'friends' && renderFriendsList()}
      {activeTab === 'requests' && renderFriendRequests()}
      {activeTab === 'add' && renderAddFriends()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    marginLeft: 6,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  requestItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  friendStatus: {
    fontSize: 14,
  },
  mutualFriends: {
    fontSize: 13,
  },
  messageButton: {
    padding: 8,
    borderRadius: 20,
  },
  requestButtons: {
    flexDirection: 'row',
    marginTop: 8,
    marginLeft: 60,
  },
  acceptButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  declineButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  declineButtonText: {
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Friends;