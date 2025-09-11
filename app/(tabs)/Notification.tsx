import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/authContext';
import { second } from '@/constants/theme';
import { hp } from '@/helpers/common';
import Avatar from '@/components/Avatar';
import Header from '@/components/Header';

interface Notification {
  id: string;
  type: 'like' | 'comment';
  content?: string;
  read: boolean;
  created_at: string;
  actor_profiles: {
    username: string;
    image: string;
  } | null;
  posts: {
    body: string;
  } | null;
}

export default function Notification() {
  const router = useRouter();
  const authContext = useAuth();
  const user = authContext?.user;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          type,
          content,
          read,
          created_at,
          actor_profiles:actor_id (
            username,
            image
          ),
          posts:post_id (
            body
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications((data || []).map(notification => ({
        ...notification,
        actor_profiles: notification.actor_profiles?.[0] || null,
        posts: notification.posts?.[0] || null
      })));
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const isLike = item.type === 'like';
    const username = item.actor_profiles?.username || 'Someone';
    const postPreview = item.posts?.body?.substring(0, 50) || 'your post';
    
    return (
      <Pressable 
        style={[styles.notificationItem, !item.read && styles.unreadNotification]}
        onPress={() => !item.read && markAsRead(item.id)}
      >
        <Avatar 
          uri={item.actor_profiles?.image || ''} 
          size={40}
          style={styles.avatar}
        />
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Ionicons 
              name={isLike ? 'heart' : 'chatbubble'} 
              size={16} 
              color={isLike ? second.secondary2 : second.grayDark}
              style={styles.notificationIcon}
            />
            <Text style={styles.notificationText}>
              <Text style={styles.username}>{username}</Text>
              {isLike ? ' liked your post' : ' commented on your post'}
              {!isLike && item.content && (
                <Text style={styles.commentPreview}>: "{item.content.substring(0, 30)}.."</Text>
              )}
            </Text>
          </View>
          
          <Text style={styles.postPreview} numberOfLines={1}>
            {postPreview}{postPreview.length > 50 ? '...' : ''}
          </Text>
          
          <Text style={styles.timestamp}>{formatTime(item.created_at)}</Text>
        </View>
        
        {!item.read && <View style={styles.unreadDot} />}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Notifications"
        ShowBackButton={false}
        marginBottom={0}
      />
      
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        style={styles.notificationsList}
        contentContainerStyle={styles.notificationsContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={48} color={second.grayLight} />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>You'll see likes and comments here</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: second.mainBg,
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContainer: {
    flexGrow: 1,
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    backgroundColor: second.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: second.grayLight,
  },
  unreadNotification: {
    backgroundColor: second.roseLight,
    borderColor: second.secondary2,
  },
  avatar: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationIcon: {
    marginRight: 6,
  },
  notificationText: {
    fontSize: 14,
    color: second.textDark,
    flex: 1,
  },
  username: {
    fontWeight: '600',
    color: second.textDark,
  },
  commentPreview: {
    fontStyle: 'italic',
    color: second.grayDark,
  },
  postPreview: {
    fontSize: 12,
    color: second.grayDark,
    marginBottom: 4,
    marginLeft: 22,
  },
  timestamp: {
    fontSize: 12,
    color: second.grayLight,
    marginLeft: 22,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: second.secondary2,
    marginLeft: 8,
    alignSelf: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: second.grayDark,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: second.grayLight,
    marginTop: 4,
  },
});
