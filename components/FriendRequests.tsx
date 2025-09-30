import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/context/authContext';
import { useTheme } from '@/context/themeContext';
import { getIncomingFriendRequests, acceptFriendRequest, rejectFriendRequest } from '@/services/friendsService';
import { getUserData } from '@/services/userServices';
import Header from '@/components/Header';

const FriendRequests = () => {
  const auth = useAuth();
  const user = auth?.user;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    fetchRequests(user.id);
  }, [user?.id]);

  const fetchRequests = async (userId: string) => {
    setLoading(true);
    const { data: reqs } = await getIncomingFriendRequests(userId);
    let reqsData: any[] = [];
    if (reqs && reqs.length > 0) {
      reqsData = await Promise.all(reqs.map((r: any) => getUserData(r.requester_id).then(u => ({ ...u, requestId: r.id }))));
    }
    setRequests(reqsData);
    setLoading(false);
  };

  const handleAccept = async (requestId: string) => {
    if (!user?.id) return;
    await acceptFriendRequest(requestId);
    fetchRequests(user.id);
  };
  const handleReject = async (requestId: string) => {
    if (!user?.id) return;
    await rejectFriendRequest(requestId);
    fetchRequests(user.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <Header ShowBackButton={true} title="Friend Requests" marginBottom={10} />
      {loading ? <ActivityIndicator color={theme.primary} /> : (
        <FlatList
          data={requests}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.textSecondary }]}>No requests</Text>}
          renderItem={({ item }) => (
            <View style={[styles.userRow, { backgroundColor: theme.surface, borderRadius: 12 }]}> 
              <Avatar uri={item.avatar_url || ''} size={40} />
              <Text style={[styles.username, { color: theme.text }]}>{item.username}</Text>
              <TouchableOpacity onPress={() => handleAccept(item.requestId)} style={[styles.acceptButton, { backgroundColor: theme.success }]}> 
                <Text style={{ color: theme.buttonText }}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleReject(item.requestId)} style={[styles.rejectButton, { backgroundColor: theme.error }]}> 
                <Text style={{ color: theme.buttonText }}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default FriendRequests;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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