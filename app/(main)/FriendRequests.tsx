import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import CustomActivityLoader from '@/components/CustomActivityLoader';
import Avatar from '@/components/Avatar';
import { router } from 'expo-router';
import { useAuth } from '@/context/authContext';
import { useTheme } from '@/context/themeContext';
import { getIncomingFriendRequests, getOutgoingFriendRequests, acceptFriendRequest, rejectFriendRequest } from '@/services/friendsService';
import { getUserData } from '@/services/userServices';

import Header from '@/components/Header';

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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 30,
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2222',
    marginHorizontal: 4,
  },
});

const FriendRequests = () => {
  const auth = useAuth();
  const user = auth?.user;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [tab, setTab] = useState<'incoming' | 'pending'>('incoming');


  useEffect(() => {
    if (!user?.id) return;
    fetchRequests(user.id);
  }, [user?.id]);

  const fetchRequests = async (userId: string) => {
    setLoading(true);
    let timeoutId = setTimeout(() => {
      setLoading(false);
      console.log('Timeout: forcibly ending loading state after 10s');
    }, 10000);
    try {
      // Incoming requests
      const incomingRes = await getIncomingFriendRequests(userId);
      console.log('IncomingRes:', incomingRes);
      let reqsData: any[] = [];
      if (incomingRes && incomingRes.data) {
        reqsData = await Promise.all(
          incomingRes.data.map(async (req: any) => {
            try {
              const userData = await getUserData(req.from);
              return {
                ...userData,
                requestId: req.id,
              };
            } catch (err) {
              console.log('getUserData failed for incoming:', req.from, err);
              return null;
            }
          })
        );
        reqsData = reqsData.filter(Boolean);
      }
      setRequests(reqsData);

      // Outgoing (pending) requests
      const outgoingRes = await getOutgoingFriendRequests(userId);
      console.log('OutgoingRes:', outgoingRes);
      let pendData: any[] = [];
      if (outgoingRes && outgoingRes.data) {
        pendData = await Promise.all(
          outgoingRes.data.map(async (req: any) => {
            try {
              const userData = await getUserData(req.to);
              return {
                ...userData,
                requestId: req.id,
              };
            } catch (err) {
              console.log('getUserData failed for outgoing:', req.to, err);
              return null;
            }
          })
        );
        pendData = pendData.filter(Boolean);
      }
      setPending(pendData);
    } catch (error) {
      console.log('fetchRequests error:', error);
      setRequests([]);
      setPending([]);
    } finally {
      setLoading(false);
      clearTimeout(timeoutId);
    }
  }

  const handleAccept = async (requestId: string) => {
    await acceptFriendRequest(requestId);
    if (user?.id) fetchRequests(user.id);
  };

  const handleReject = async (requestId: string) => {
    await rejectFriendRequest(requestId);
    if (user?.id) fetchRequests(user.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <Header title="Friend Requests" ShowBackButton={true} marginBottom={16} />
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: tab === 'incoming' ? theme.primary : '#2222' }]}
          onPress={() => setTab('incoming')}
        >
          <Text style={{ color: tab === 'incoming' ? theme.buttonText : theme.text }}>Incoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: tab === 'pending' ? theme.primary : '#2222' }]}
          onPress={() => setTab('pending')}
        >
          <Text style={{ color: tab === 'pending' ? theme.buttonText : theme.text }}>Pending</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <CustomActivityLoader size={60} style={{ marginTop: 40 }} />
      ) : tab === 'incoming' ? (
        <FlatList
          data={requests}
          keyExtractor={item => item.requestId}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.textSecondary }]}>No requests</Text>}
          renderItem={({ item }) => (
            <View style={[styles.userRow, { backgroundColor: theme.surface, borderRadius: 12 }]}> 
              <TouchableOpacity onPress={() => router.push({ pathname: '/(main)/Profile/[id]', params: { id: item.id } })}>
                <Avatar uri={item.image || item.avatar_url || ''} size={40} />
              </TouchableOpacity>
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
      ) : (
        <FlatList
          data={pending}
          keyExtractor={item => item.requestId}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.textSecondary }]}>No pending requests</Text>}
          renderItem={({ item }) => (
            <View style={[styles.userRow, { backgroundColor: theme.surface, borderRadius: 12 }]}> 
              <TouchableOpacity onPress={() => router.push({ pathname: '/(main)/Profile/[id]', params: { id: item.id } })}>
                <Avatar uri={item.image || item.avatar_url || ''} size={40} />
              </TouchableOpacity>
              <Text style={[styles.username, { color: theme.text }]}>{item.username}</Text>
              <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>Pending</Text>
            </View>
          )}
        />
      )}
    </View>

  );
}

export default FriendRequests;
