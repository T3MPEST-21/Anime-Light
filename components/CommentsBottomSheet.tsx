import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/authContext';
import { useTheme } from '@/context/themeContext';
import { second } from '@/constants/theme';
import { hp, wp } from '@/helpers/common';
import Avatar from '@/components/Avatar';

const { height: screenHeight } = Dimensions.get('window');

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

interface PostData {
  id: string;
  body?: string | null;
  user_id: string;
  profiles?: {
    username?: string;
    image?: string;
  } | null;
}

interface CommentsBottomSheetProps {
  visible: boolean;
  postData: PostData | null;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export default function CommentsBottomSheet({
  visible,
  postData,
  onClose,
  onCommentAdded,
}: CommentsBottomSheetProps) {
  const authContext = useAuth();
  const user = authContext?.user;
  const { theme, isDark } = useTheme();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && postData) {
      // Slide up animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight * 0.3, // Show 70% of screen
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      fetchComments();
    } else {
      // Reset animation
      slideAnim.setValue(screenHeight);
      opacityAnim.setValue(0);
    }
  }, [visible, postData]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const fetchComments = async () => {
    if (!postData?.id) return;
    
    setLoading(true);
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
        .eq('post_id', postData.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments((data || []).map(comment => ({
        ...comment,
        profiles: Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles
      })));
      
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !postData?.id) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postData.id,
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
      if (postData.user_id !== user.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: postData.user_id,
            actor_id: user.id,
            post_id: postData.id,
            type: 'comment',
            content: newComment.trim()
          });
      }

      setComments(prev => [...prev, {
        ...data,
        profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
      }]);
      
      setNewComment('');
      onCommentAdded?.();
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

  const stripHtml = (html?: string | null) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Avatar 
        uri={item.profiles?.image || ''} 
        size={hp(4)}
        style={styles.avatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={[styles.username, { color: theme.primary }]}>@{item.profiles?.username || 'Unknown'}</Text>
          <Text style={[styles.commentText, { color: theme.textSecondary }]}>{item.content}</Text>
          <Text style={[styles.timestamp, { color: theme.textSecondary }]}>{formatTime(item.created_at)}</Text>
        </View>
      </View>
    </View>
  );

  if (!visible || !postData) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Semi-transparent overlay */}
      <Animated.View style={[styles.overlay, { opacity: opacityAnim, backgroundColor: theme.overlay }]}>
        <TouchableOpacity 
          style={styles.overlayTouch} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        {/* Bottom sheet */}
        <Animated.View 
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }],
              backgroundColor: theme.surface,
            },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />
          
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Comments</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Original post preview */}
          <View style={[styles.postPreview, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <View style={styles.postHeader}>
              <Avatar 
                uri={postData.profiles?.image || ''} 
                size={hp(3.5)} 
              />
              <Text style={[styles.postAuthor, { color: theme.primary }]}>@{postData.profiles?.username || 'Unknown'}</Text>
            </View>
            {postData.body && (
              <Text style={[styles.postContent, { color: theme.textSecondary }]}>{stripHtml(postData.body)}</Text>
            )}
          </View>

          {/* Comments list */}
          <KeyboardAvoidingView 
            style={styles.commentsSection}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              style={styles.commentsList}
              contentContainerStyle={styles.commentsContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubble-outline" size={48} color={theme.textLight} />
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No comments yet</Text>
                  <Text style={[styles.emptySubtext, { color: theme.textLight }]}>Be the first to comment!</Text>
                </View>
              }
            />

            {/* Comment input */}
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
              <Avatar 
                uri={user?.user_metadata?.avatar_url} 
                size={hp(3.5)}
              />
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                placeholder="Add a comment..."
                placeholderTextColor={theme.placeholder}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <Pressable
                style={[styles.sendButton, { backgroundColor: theme.primary, opacity: newComment.trim() ? 1 : 0.5 }]}
                onPress={handleAddComment}
                disabled={!newComment.trim() || submitting}
              >
                <Ionicons name="send" size={20} color="white" />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  bottomSheet: {
    height: screenHeight * 0.7,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: second.grayLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: second.grayLight,
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: '600',
    color: second.text,
  },
  closeButton: {
    padding: 4,
  },
  postPreview: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: second.grayLight,
    backgroundColor: '#f8f9fa',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postAuthor: {
    fontSize: hp(1.8),
    fontWeight: '600',
    color: second.text,
    marginLeft: 8,
  },
  postContent: {
    fontSize: hp(1.7),
    color: second.grayDark,
    lineHeight: hp(2.2),
  },
  commentsSection: {
    flex: 1,
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
    fontSize: hp(1.7),
    fontWeight: '600',
    color: second.text,
    marginRight: 8,
  },
  timestamp: {
    marginLeft: 5,
    marginTop: 2,
    fontSize: hp(1.4),
    color: second.grayDark,
  },
  commentText: {
    fontSize: hp(1.7),
    color: second.text,
    lineHeight: hp(2.2),
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: hp(2),
    fontWeight: '600',
    color: second.grayDark,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: hp(1.6),
    color: second.grayLight,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
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
    fontSize: hp(1.7),
    color: second.text,
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
