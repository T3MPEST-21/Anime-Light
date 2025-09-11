import React, { useCallback, useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Text, View, StyleSheet, Pressable, FlatList, RefreshControl, Image, TouchableOpacity, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/authContext';
import { useNewPosts } from '@/context/newPostsContext';
import { useTheme } from '@/context/themeContext';
import { hp, wp } from '@/helpers/common';
import { second } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '@/components/Avatar';
import CustomActivityLoader from '@/components/CustomActivityLoader';
import ImageGalleryModal from '@/components/ImageGalleryModal';
import CommentsBottomSheet from '@/components/CommentsBottomSheet';

// Types for our data structure
interface Profile {
  id: string;
  username?: string;
  image?: string;
}

interface PostImage {
  image_url: string;
  caption?: string;
}

interface PostRow {
  id: string;
  body?: string | null;
  created_at?: string;
  user_id: string;
  profiles?: Profile | null;
  post_images?: PostImage[];
  like_count?: number;
  is_liked?: boolean;
  comment_count?: number;
}

// Skeleton loading component
const SkeletonCard = ({ theme }: { theme: any }) => (
  <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
    <View style={styles.cardHeader}>
      <View style={[styles.skeletonAvatar, { backgroundColor: theme.skeleton }]} />
      <View style={{ flex: 1 }}>
        <View style={[styles.skeletonUsername, { backgroundColor: theme.skeleton }]} />
        <View style={[styles.skeletonTime, { backgroundColor: theme.skeleton }]} />
      </View>
      <View style={[styles.skeletonMoreButton, { backgroundColor: theme.skeleton }]} />
    </View>
    
    <View style={[styles.skeletonBody, { backgroundColor: theme.skeleton }]} />
    <View style={[styles.skeletonBodyShort, { backgroundColor: theme.skeleton }]} />
    
    <View style={[styles.skeletonImage, { backgroundColor: theme.skeleton }]} />
    
    <View style={styles.actionRow}>
      <View style={[styles.skeletonActionButton, { backgroundColor: theme.skeleton }]} />
      <View style={[styles.skeletonActionButton, { backgroundColor: theme.skeleton }]} />
      <View style={[styles.skeletonActionButton, { backgroundColor: theme.skeleton }]} />
    </View>
  </View>
);

const SkeletonLoader = ({ theme }: { theme: any }) => (
  <View style={styles.skeletonContainer}>
    <SkeletonCard theme={theme} />
    <SkeletonCard theme={theme} />
    <SkeletonCard theme={theme} />
    <CustomActivityLoader style={styles.loader} size={70} />
  </View>
);

export default function Index() {
  const hasLoadedRef = useRef<boolean>(false);
  const subscriptionRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const isInitialMount = useRef<boolean>(true);
  const POSTS_LOADED_KEY = 'animelight_posts_loaded';
  const POSTS_CACHE_KEY = 'animelight_posts_cache';
  const SCROLL_POSITION_KEY = 'animelight_scroll_position';
  const router = useRouter();
  const { user } = useAuth() || {};
  const { theme } = useTheme();

  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Start with false, only show loading on first load
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const { newPostsCount, setNewPostsCount } = useNewPosts();
  
  // Modal states
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedCaptions, setSelectedCaptions] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostRow | null>(null);

  const fetchPosts = useCallback(async (isRefresh = false, pageNum = 0) => {
    if (!isRefresh && pageNum === 0) setLoading(true); // Only show skeleton on initial load
    if (pageNum > 0) setLoadingMore(true);
    
    const POSTS_PER_PAGE = 10;
    const startIndex = pageNum * POSTS_PER_PAGE;
    
    try {
      // Fetch posts with pagination
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          body,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .range(startIndex, startIndex + POSTS_PER_PAGE - 1);

      console.log('Fetch posts result:', { data, error, dataLength: data?.length });
      
      if (error) {
        console.log('Supabase error details:', error);
        throw error;
      }
      
      // If basic query works, let's try to get profile data separately
      if (data && data.length > 0) {
        const postsWithProfiles = await Promise.all(
          data.map(async (post) => {
            // Get profile data for each post
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, username, image')
              .eq('id', post.user_id)
              .single();

            // Get images for each post
            console.log(`Fetching images for post ${post.id}...`);
            const { data: images, error: imagesError } = await supabase
              .from('post_images')
              .select('image_url, caption')
              .eq('post_id', post.id);

            console.log(`Images for post ${post.id}:`, { images, imagesError, count: images?.length || 0 });

            // Get like count for each post
            const { count: likeCount } = await supabase
              .from('post_likes')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);

            // Check if current user has liked this post
            const { data: userLike } = await supabase
              .from('post_likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user?.id || '')
              .single();

            // Get comment count for each post
            const { count: commentCount } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);

            return {
              ...post,
              profiles: profile,
              post_images: images || [],
              like_count: likeCount || 0,
              is_liked: !!userLike,
              comment_count: commentCount || 0
            };
          })
        );
        
        console.log('Final posts with images:', postsWithProfiles.map(p => ({ 
          id: p.id, 
          imageCount: p.post_images?.length || 0,
          firstImageUrl: p.post_images?.[0]?.image_url 
        })));
        
        if (pageNum === 0) {
          // First page or refresh - replace all posts
          const cachedPosts = JSON.stringify(postsWithProfiles);
          await AsyncStorage.setItem(POSTS_CACHE_KEY, cachedPosts);
          setPosts(postsWithProfiles as PostRow[]);
        } else {
          // Append to existing posts for infinite scroll
          setPosts(prevPosts => [...prevPosts, ...postsWithProfiles as PostRow[]]);
        }
        
        // Check if we have more posts to load
        setHasMorePosts(data.length === POSTS_PER_PAGE);
      } else {
        if (pageNum === 0) {
          setPosts(data as PostRow[]);
        } else {
          setPosts(prevPosts => [...prevPosts, ...data as PostRow[]]);
        }
        setHasMorePosts(data.length === POSTS_PER_PAGE);
      }
    } catch (e: any) {
      console.log('Fetch posts error:', e?.message || e);
      // Show user-friendly error
      if (e?.message?.includes('permission')) {
        Alert.alert('Permission Error', 'Unable to load posts. Please check your database permissions.');
      } else {
        Alert.alert('Error', 'Failed to load posts. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [user?.id]);

  // Handle new post notifications (don't auto-add to feed)
  const handleNewPost = useCallback(async (payload: any) => {
    console.log('New post received:', payload);
    // Only increment counter, don't add to feed automatically
    setNewPostsCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    const initializeFeeds = async () => {
      // Check if this is the first time loading (app restart)
      const hasLoaded = await AsyncStorage.getItem(POSTS_LOADED_KEY);
      
      if (!hasLoaded || isInitialMount.current) {
        // First time loading - show skeleton and fetch fresh data
        setLoading(true);
        await fetchPosts();
        await AsyncStorage.setItem(POSTS_LOADED_KEY, 'true');
        isInitialMount.current = false;
      } else {
        // Returning from navigation - load cached data immediately
        const cachedPosts = await AsyncStorage.getItem(POSTS_CACHE_KEY);
        if (cachedPosts) {
          const parsedPosts = JSON.parse(cachedPosts);
          setPosts(parsedPosts);
        }
        
        // Only restore scroll position during current session (not after app restart)
        if (!isInitialMount.current) {
          setTimeout(async () => {
            const savedScrollPosition = await AsyncStorage.getItem(SCROLL_POSITION_KEY);
            if (savedScrollPosition && flatListRef.current) {
              const scrollOffset = parseFloat(savedScrollPosition);
              flatListRef.current.scrollToOffset({ offset: scrollOffset, animated: false });
            }
          }, 100);
        }
      }
    };

    initializeFeeds();

    fetchPosts(false, 0);

    // Set up realtime subscription for new posts (only once)
    if (!subscriptionRef.current) {
      const channel = supabase
        .channel('public:posts-feed')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, handleNewPost)
        .subscribe();

      subscriptionRef.current = channel;
    }

    return () => {
      // Don't remove channel on every unmount, only on component destruction
      // This prevents losing realtime updates when navigating
    };
  }, [handleNewPost]);

  // Cleanup subscription only when component is truly destroyed
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setNewPostsCount(0); // Reset new posts counter when user refreshes
    setPage(0);
    setHasMorePosts(true);
    fetchPosts(true, 0);
  }, [fetchPosts, setNewPostsCount]);

  const loadMorePosts = useCallback(() => {
    if (!loadingMore && hasMorePosts) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(false, nextPage);
    }
  }, [loadingMore, hasMorePosts, page, fetchPosts]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={[styles.footerLoader, { backgroundColor: theme.background }]}>
        <CustomActivityLoader size={30} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading more posts...</Text>
      </View>
    );
  };

  const handleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    if (!user?.id) return;

    try {
      if (isCurrentlyLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like the post
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;

        // Create notification for the post owner (if not liking own post)
        const post = posts.find(p => p.id === postId);
        if (post && post.user_id !== user.id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: post.user_id,
              actor_id: user.id,
              post_id: postId,
              type: 'like'
            });
        }
      }

      // Update the posts state optimistically
      setPosts((prevPosts: PostRow[]) => 
        prevPosts.map((post: PostRow) => {
          if (post.id === postId) {
            return {
              ...post,
              is_liked: !isCurrentlyLiked,
              like_count: isCurrentlyLiked 
                ? (post.like_count || 1) - 1 
                : (post.like_count || 0) + 1
            };
          }
          return post;
        })
      );
    } catch (error: any) {
      console.error('Error toggling like:', error.message);
    }
  };

  const handleShare = async (post: PostRow) => {
    try {
      const username = post.profiles?.username || 'Someone';
      const postText = post.body || 'Check out this post!';
      const shareContent = `${username} shared: ${postText}`;
      
      const result = await Share.share({
        message: shareContent,
        title: 'AnimeLight Post',
      });
      
      if (result.action === Share.sharedAction) {
        console.log('Post shared successfully');
      }
    } catch (error: any) {
      console.error('Error sharing post:', error.message);
      Alert.alert('Error', 'Failed to share post');
    }
  };

  const openGallery = (images: string[], captions: string[]) => {
    console.log('=== OPENING GALLERY ===');
    console.log('Images array:', images);
    console.log('Captions array:', captions);
    console.log('Images length:', images.length);
    
    if (images.length === 0) {
      console.log('No images to display, returning early');
      return;
    }
    
    setSelectedImages(images);
    setSelectedCaptions(captions);
    setGalleryVisible(true);
  };

  const openComments = (post: PostRow) => {
    setSelectedPost(post);
    setCommentsVisible(true);
  };

  const handleCommentAdded = () => {
    // Refresh the specific post's comment count
    if (selectedPost) {
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === selectedPost.id 
            ? { ...post, comment_count: (post.comment_count || 0) + 1 }
            : post
        )
      );
    }
  };

  const stripHtml = (html?: string | null) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: PostRow }) => {
    const author = item.profiles;
    const imgs = item.post_images || [];
    const captions = imgs.map((i) => i.caption || '');
    const imageUrls = imgs.map((i) => i.image_url);

    console.log(`Rendering post ${item.id} with ${imgs.length} images`);

    return (
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <Avatar uri={author?.image || ''} size={hp(4.6)} rounded={20} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.username, { color: theme.text }]}>{author?.username || 'Unknown User'}</Text>
            <Text style={[styles.timeText, { color: theme.textSecondary }]}>{formatDate(item.created_at)}</Text>
          </View>
          <Pressable style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>

        {item.body ? <Text style={[styles.body, { color: theme.text }]}>{stripHtml(item.body)}</Text> : null}

        {imgs.length > 0 ? (
          <TouchableOpacity onPress={() => {
            console.log(`Tapped on post ${item.id} with ${imgs.length} images`);
            openGallery(imageUrls, captions);
          }} activeOpacity={0.8}>
            <View style={styles.imageGrid}>
              {imgs.length === 1 ? (
                // Single image - full width
                <Image source={{ uri: imgs[0].image_url }} style={styles.singleImage} resizeMode="cover" />
              ) : imgs.length === 2 ? (
                // Two images - side by side
                <>
                  <Image source={{ uri: imgs[0].image_url }} style={styles.twoImageLeft} resizeMode="cover" />
                  <Image source={{ uri: imgs[1].image_url }} style={styles.twoImageRight} resizeMode="cover" />
                </>
              ) : (
                // Three or more images - Facebook style grid
                <>
                  <Image source={{ uri: imgs[0].image_url }} style={styles.threeImageTop} resizeMode="cover" />
                  <View style={styles.bottomRow}>
                    <Image source={{ uri: imgs[1].image_url }} style={styles.threeImageBottomLeft} resizeMode="cover" />
                    <View style={styles.threeImageBottomRightContainer}>
                      <Image source={{ uri: imgs[2].image_url }} style={styles.threeImageBottomRight} resizeMode="cover" />
                      {imgs.length > 3 && (
                        <View style={[styles.imageOverlay, { backgroundColor: theme.overlay }]}>
                          <Text style={[styles.imageOverlayText, { color: theme.buttonText }]}>+{imgs.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <Pressable 
            style={styles.actionButton}
            onPress={() => handleLike(item.id, item.is_liked || false)}
          >
            <Ionicons 
              name={item.is_liked ? "heart" : "heart-outline"} 
              size={22} 
              color={item.is_liked ? theme.accent : theme.textSecondary} 
            />
            <Text style={[styles.actionText, { color: theme.textSecondary }, item.is_liked && { color: theme.accent }]}>
              {item.like_count || 0}
            </Text>
          </Pressable>
          <Pressable 
            style={styles.actionButton}
            onPress={() => openComments(item)}
          >
            <Ionicons name="chatbubble-outline" size={22} color={theme.textSecondary} />
            <Text style={[styles.actionText, { color: theme.textSecondary }]}>
              {item.comment_count || 0} {(item.comment_count || 0) === 1 ? 'Comment' : 'Comments'}
            </Text>
          </Pressable>
          <Pressable 
            style={styles.actionButton}
            onPress={() => handleShare(item)}
          >
            <Ionicons name="share-outline" size={22} color={theme.textSecondary} />
            <Text style={[styles.actionText, { color: theme.textSecondary }]}>Share</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const handleScroll = async (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    // Only save scroll position during current session
    if (!isInitialMount.current) {
      await AsyncStorage.setItem(SCROLL_POSITION_KEY, scrollOffset.toString());
    }
  };

  // Clear scroll position on app restart
  useEffect(() => {
    const clearScrollOnRestart = async () => {
      if (isInitialMount.current) {
        await AsyncStorage.removeItem(SCROLL_POSITION_KEY);
      }
    };
    clearScrollOnRestart();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.primary }]}>AnimeLight</Text>
        <View style={styles.icons}>
          <Pressable onPress={() => router.push('/(tabs)/Notification')}>
            <Ionicons name="heart-outline" size={25} color={theme.textSecondary} />
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/create')}>
            <Ionicons name="add-circle-outline" size={25} color={theme.textSecondary} />
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/Profile')}>
            <Avatar uri={user?.image} size={hp(4.3)} rounded={20} style={styles.avatarImage} />
          </Pressable>
        </View>
      </View>

      {/* Show skeleton loader while loading */}
      {loading ? (
        <SkeletonLoader theme={theme} />
      ) : (
        /* Feed List */
        <FlatList
          ref={flatListRef}
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listStyle}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color={theme.textSecondary} />
              <Text style={[styles.noPosts, { color: theme.text }]}>No posts yet</Text>
              <Text style={[styles.noPostsSubtext, { color: theme.textSecondary }]}>Be the first to share something!</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
        />
      )}
      
      {/* Image Gallery Modal */}
      <ImageGalleryModal
        visible={galleryVisible}
        images={selectedImages}
        captions={selectedCaptions}
        onClose={() => setGalleryVisible(false)}
      />
      
      {/* Comments Bottom Sheet */}
      <CommentsBottomSheet
        visible={commentsVisible}
        postData={selectedPost}
        onClose={() => setCommentsVisible(false)}
        onCommentAdded={handleCommentAdded}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 7,
    marginHorizontal: wp(4),
    paddingVertical: 10,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: hp(3.2),
    fontWeight: '700',
  },
  avatarImage: {
    height: hp(4.3),
    width: hp(4.3),
    borderRadius: 50,
    borderCurve: 'continuous',
    borderColor: second.grayDark,
    borderWidth: 2,
  },
  icons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  listStyle: {
    padding: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(10),
  },
  noPosts: {
    fontSize: hp(2.2),
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 16,
  },
  noPostsSubtext: {
    fontSize: hp(1.8),
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontSize: hp(2.1),
    fontWeight: '600',
    marginLeft: 12,
  },
  timeText: {
    fontSize: hp(1.5),
    marginLeft: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  body: {
    fontSize: hp(1.9),
    lineHeight: hp(2.6),
    marginBottom: 12,
  },
  // Image grid styles
  imageGrid: {
    width: '100%',
    height: hp(32),
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  // Single image
  singleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  // Two images
  twoImageLeft: {
    width: '49.5%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  twoImageRight: {
    width: '49.5%',
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    marginLeft: '1%',
  },
  // Three+ images - Facebook style
  threeImageTop: {
    width: '100%',
    height: '66%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    height: '34%',
    marginTop: 2,
  },
  threeImageBottomLeft: {
    width: '49.5%',
    height: '100%',
    borderBottomLeftRadius: 12,
  },
  threeImageBottomRightContainer: {
    width: '49.5%',
    height: '100%',
    marginLeft: '1%',
    position: 'relative',
  },
  threeImageBottomRight: {
    width: '100%',
    height: '100%',
    borderBottomRightRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomRightRadius: 12,
  },
  imageOverlayText: {
    fontSize: hp(2.5),
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: hp(1.7),
    fontWeight: '500',
  },
  
  // Skeleton loading styles
  skeletonContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
    position: 'relative',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 99,
  },
  skeletonAvatar: {
    width: hp(4.6),
    height: hp(4.6),
    borderRadius: hp(2.3),
    opacity: 0.6,
  },
  skeletonUsername: {
    width: wp(30),
    height: hp(2.1),
    borderRadius: 4,
    marginLeft: 12,
    opacity: 0.6,
  },
  skeletonTime: {
    width: wp(20),
    height: hp(1.5),
    borderRadius: 4,
    marginLeft: 12,
    marginTop: 4,
    opacity: 0.6,
  },
  skeletonMoreButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.6,
  },
  skeletonBody: {
    width: '100%',
    height: hp(1.9),
    borderRadius: 4,
    marginBottom: 6,
    opacity: 0.6,
  },
  skeletonBodyShort: {
    width: '70%',
    height: hp(1.9),
    borderRadius: 4,
    marginBottom: 12,
    opacity: 0.6,
  },
  skeletonImage: {
    width: '100%',
    height: hp(32),
    borderRadius: 12,
    marginBottom: 12,
    opacity: 0.6,
  },
  skeletonActionButton: {
    width: wp(20),
    height: hp(2.2),
    borderRadius: 4,
    opacity: 0.6,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: hp(1.6),
    fontWeight: '500',
  },
});