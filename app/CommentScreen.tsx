import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/authContext';
import { second } from '../constants/theme';
import Header from '../components/Header';
import Avatar from '../components/Avatar';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    image: string;
  } | null;
}

export default function CommentScreen() {
  const { postId, postContent } = useLocalSearchParams();
  const authContext = useAuth();
  const user = authContext?.user;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!user_id (
            username,
            image
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments((data || []).map(comment => ({
        ...comment,
        profiles: comment.profiles?.[0] || null
      })));
      
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim(),
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!user_id (
            username,
            image
          )
        `)
        .single();

      if (error) throw error;

      // Create notification for the post owner (if not commenting on own post)
      // We need to get the post owner's ID from the postId
      const { data: postData } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (postData && postData.user_id !== user.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: postData.user_id,
            actor_id: user.id,
            post_id: postId,
            type: 'comment',
            content: newComment.trim()
          });
      }

      setComments(prev => [...prev, {
        ...data,
        profiles: data.profiles[0] // Extract the first profile from the array
      }]);
      
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setSubmitting(false);
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

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Avatar 
        uri={item.profiles?.image || ''} 
        size={32}
        style={styles.avatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.username}>{item.profiles?.username || 'Unknown User'}</Text>
          <Text style={styles.timestamp}>{formatTime(item.created_at)}</Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header 
        title="Comments"
        ShowBackButton={true}
        marginBottom={0}
      />
      
      {/* Post preview */}
      <View style={styles.postPreview}>
        <Text style={styles.postContent} numberOfLines={2}>
          {postContent}
        </Text>
      </View>

      {/* Comments list */}
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        style={styles.commentsList}
        contentContainerStyle={styles.commentsContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={48} color={second.grayLight} />
            <Text style={styles.emptyText}>No comments yet</Text>
            <Text style={styles.emptySubtext}>Be the first to comment!</Text>
          </View>
        }
      />

      {/* Comment input */}
      <View style={styles.inputContainer}>
        <Avatar 
          uri={user?.user_metadata?.avatar_url} 
          size={32}
          style={styles.inputAvatar}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Add a comment..."
          placeholderTextColor={second.grayLight}
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={500}
        />
        <Pressable
          style={[
            styles.sendButton,
            (!newComment.trim() || submitting) && styles.sendButtonDisabled
          ]}
          onPress={handleAddComment}
          disabled={!newComment.trim() || submitting}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={(!newComment.trim() || submitting) ? second.grayLight : second.secondary2} 
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: second.mainBg,
  },
  postPreview: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: second.grayLight,
    backgroundColor: second.white,
  },
  postContent: {
    fontSize: 14,
    color: second.textDark,
    lineHeight: 20,
  },
  commentsList: {
    flex: 1,
  },
  commentsContainer: {
    flexGrow: 1,
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: second.textDark,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: second.grayDark,
  },
  commentText: {
    fontSize: 14,
    color: second.textDark,
    lineHeight: 20,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: second.white,
    borderTopWidth: 1,
    borderTopColor: second.grayLight,
  },
  inputAvatar: {
    marginRight: 12,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: second.grayLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: second.textDark,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 12,
    marginBottom: 8,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
