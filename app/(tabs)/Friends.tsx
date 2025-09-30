import { FlatList, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import ProfileModal from '@/components/ProfileModal';
// import { router } from 'expo-router';
import { useAuth } from '@/context/authContext';

import { getFriends, sendFriendRequest } from '@/services/friendsService';
import { getUserData, searchUsers } from '@/services/userServices';
import { useTheme } from '@/context/themeContext';
import { second } from '@/constants/theme';

const Friends = () => {
  const auth = useAuth();
  const user = auth?.user;
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<any[]>([]);
  // Removed requests state
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const openProfileModal = (userId: string) => {
    setSelectedProfileId(userId);
    setProfileModalVisible(true);
  };
  const closeProfileModal = () => {
    setProfileModalVisible(false);
    setSelectedProfileId(null);
  };

  useEffect(() => {
    if (!user || !user.id) return;
    fetchData(user.id);
  }, [user?.id]);

  const fetchData = async (userId: string) => {
    if (!userId) return;
    setLoading(true);
    // Fetch friends
    const { data: friendIds } = await getFriends(userId);
    let friendsData: any[] = [];
    if (friendIds && friendIds.length > 0) {
      friendsData = await Promise.all(friendIds.map((fid: string) => getUserData(fid)));
    }
    setFriends(friendsData);
    setLoading(false);
  };

  // Removed handleAccept and handleReject

  const handleSearch = async () => {
    if (!user?.id) return;
    setSearchLoading(true);
    const results = await searchUsers(search, user.id);
    setSearchResults(results);
    setSearchLoading(false);
  };

  const handleSendRequest = async (targetId: string) => {
    if (!user?.id) return;
    await sendFriendRequest(user.id, targetId);
    setSearch('');
    setSearchResults([]);
    fetchData(user.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <Header ShowBackButton={false} title="Friends" marginBottom={10} />
      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
        <TextInput
          placeholder="Search users..."
          placeholderTextColor={theme.placeholder}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.inputBorder }]}
        />
        <TouchableOpacity onPress={handleSearch} style={[styles.searchButton, { backgroundColor: theme.accent }]}> 
          <Text style={{ color: theme.buttonText }}>Search</Text>
        </TouchableOpacity>
      </View>
      {searchLoading && <ActivityIndicator color={theme.primary} />}
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[styles.userRow, { backgroundColor: theme.surface, borderRadius: 12 }]}> 
              <TouchableOpacity onPress={() => openProfileModal(item.id)}>
                <Avatar uri={item.image || item.avatar_url || ''} size={40} />
              </TouchableOpacity>
              <Text style={[styles.username, { color: theme.text }]}>{item.username}</Text>
              <TouchableOpacity onPress={() => handleSendRequest(item.id)} style={[styles.addButton, { backgroundColor: theme.primary }]}> 
                <Text style={{ color: theme.buttonText }}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      {loading ? <ActivityIndicator color={theme.primary} /> : (
        <>
          {/* Friends List */}
          <View style={styles.subHeading}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Friends</Text>
              <TouchableOpacity onPress={() => router.push('/(main)/FriendRequests')} style={styles.requestBtn}>
              <Text style={{ color: theme.primary }}>Requests</Text>
            </TouchableOpacity>
            </View>
  
          <FlatList
            data={friends}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.textSecondary }]}>No friends yet</Text>}
            renderItem={({ item }) => (
              <View style={[styles.userRow, { backgroundColor: theme.surface, borderRadius: 12 }]}> 
                <TouchableOpacity onPress={() => openProfileModal(item.id)}>
                  <Avatar uri={item.image || item.avatar_url || ''} size={40} />
                </TouchableOpacity>
                <Text style={[styles.username, { color: theme.text }]}>{item.username}</Text>
                {/* Add remove friend button here if needed */}
              </View>
            )}
          />
        </>
      )}
      <ProfileModal
        visible={profileModalVisible}
        userId={selectedProfileId}
        onClose={closeProfileModal}
      />
    </View>
  );
}

export default Friends


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    marginRight: 8,
    fontSize: 16,
  },
  searchButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 10,
    gap: 10,
  },
  username: {
    fontSize: 16,
    flex: 1,
    fontWeight: '500',
  },
  subHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestBtn: {
    //backgroundColor: second.secondary2,
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  acceptButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 4,
  },
  rejectButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 15,
  },
});

