import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Text, View, StyleSheet, Pressable, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/authContext';
import { hp, wp } from '@/helpers/common';
import { second } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '@/components/Avatar';
import CustomActivityLoader from '@/components/CustomActivityLoader';

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
}

// Skeleton loading component
const SkeletonCard = () => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.skeletonAvatar} />
      <View style={{ flex: 1 }}>
        <View style={styles.skeletonUsername} />
        <View style={styles.skeletonTime} />
      </View>
      <View style={styles.skeletonMoreButton} />
    </View>
    
    <View style={styles.skeletonBody} />
    <View style={styles.skeletonBodyShort} />
    
    <View style={styles.skeletonImage} />
    
    <View style={styles.actionRow}>
      <View style={styles.skeletonActionButton} />
      <View style={styles.skeletonActionButton} />
      <View style={styles.skeletonActionButton} />
    </View>
  </View>
);

const SkeletonLoader = () => (
  <View style={styles.skeletonContainer}>
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
    <CustomActivityLoader style={styles.loader} size={70} />
  </View>
);

export default function Index() {
  const router = useRouter();
  const { user } = useAuth() || {};

  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Start with true for initial load
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchPosts = useCallback(async () => {
    if (!refreshing) setLoading(true); // Only show skeleton on initial load, not refresh
    try {
      // First, let's try a simple query to test basic connectivity
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          body,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false });

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

            return {
              ...post,
              profiles: profile,
              post_images: images || []
            };
          })
        );
        
        console.log('Final posts with images:', postsWithProfiles.map(p => ({ 
          id: p.id, 
          imageCount: p.post_images?.length || 0,
          firstImageUrl: p.post_images?.[0]?.image_url 
        })));
        
        setPosts(postsWithProfiles as PostRow[]);
      } else {
        setPosts(data as PostRow[]);
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
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchPosts();

    // Set up realtime subscription for new posts
    const channel = supabase
      .channel('public:posts-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        console.log('New post received:', payload);
        // Refetch posts when a new one is added
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, [fetchPosts]);

  const openGallery = (images: string[], captions: string[]) => {
    console.log('=== OPENING GALLERY ===');
    console.log('Images array:', images);
    console.log('Captions array:', captions);
    console.log('Images length:', images.length);
    
    if (images.length === 0) {
      console.log('No images to display, returning early');
      return;
    }
    
    const imagesParam = encodeURIComponent(images.join(','));
    const captionsParam = encodeURIComponent(captions.join(','));
    
    console.log('Encoded images param:', imagesParam);
    console.log('Encoded captions param:', captionsParam);
    
    router.push({ pathname: '/(main)/Gallery', params: { images: imagesParam, captions: captionsParam } });
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
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Avatar uri={author?.image} size={hp(4.6)} rounded={20} />
          <View style={{ flex: 1 }}>
            <Text style={styles.username}>{author?.username || 'Unknown User'}</Text>
            <Text style={styles.timeText}>{formatDate(item.created_at)}</Text>
          </View>
          <Pressable style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color={second.grayDark} />
          </Pressable>
        </View>

        {item.body ? <Text style={styles.body}>{stripHtml(item.body)}</Text> : null}

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
                        <View style={styles.imageOverlay}>
                          <Text style={styles.imageOverlayText}>+{imgs.length - 3}</Text>
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
          <Pressable style={styles.actionButton}>
            <Ionicons name="heart-outline" size={22} color={second.grayDark} />
            <Text style={styles.actionText}>Like</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={22} color={second.grayDark} />
            <Text style={styles.actionText}>Comment</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Ionicons name="share-outline" size={22} color={second.grayDark} />
            <Text style={styles.actionText}>Share</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>AnimeLight</Text>
        <View style={styles.icons}>
          <Pressable onPress={() => router.push('/(tabs)/Notification')}>
            <Ionicons name="heart-outline" size={25} color={second.grayDark} />
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/create')}>
            <Ionicons name="add-circle-outline" size={25} color={second.grayDark} />
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/Profile')}>
            <Avatar uri={user?.image} size={hp(4.3)} rounded={20} style={styles.avatarImage} />
          </Pressable>
        </View>
      </View>

      {/* Show skeleton loader while loading */}
      {loading ? (
        <SkeletonLoader />
      ) : (
        /* Feed List */
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listStyle}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color={second.gray} />
              <Text style={styles.noPosts}>No posts yet</Text>
              <Text style={styles.noPostsSubtext}>Be the first to share something!</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 7,
    marginHorizontal: wp(4),
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    color: second.secondary2,
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
    color: second.text,
    fontWeight: '600',
    marginTop: 16,
  },
  noPostsSubtext: {
    fontSize: hp(1.8),
    textAlign: 'center',
    color: second.grayDark,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontSize: hp(2.1),
    color: second.text,
    fontWeight: '600',
    marginLeft: 12,
  },
  timeText: {
    fontSize: hp(1.5),
    color: second.grayDark,
    marginLeft: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  body: {
    fontSize: hp(1.9),
    color: second.text,
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
    color: '#fff',
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
    color: second.grayDark,
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
    backgroundColor: '#e0e0e0',
    opacity: 0.6,
  },
  skeletonUsername: {
    width: wp(30),
    height: hp(2.1),
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginLeft: 12,
    opacity: 0.6,
  },
  skeletonTime: {
    width: wp(20),
    height: hp(1.5),
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginLeft: 12,
    marginTop: 4,
    opacity: 0.6,
  },
  skeletonMoreButton: {
    width: 20,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    opacity: 0.6,
  },
  skeletonBody: {
    width: '100%',
    height: hp(1.9),
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 6,
    opacity: 0.6,
  },
  skeletonBodyShort: {
    width: '70%',
    height: hp(1.9),
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 12,
    opacity: 0.6,
  },
  skeletonImage: {
    width: '100%',
    height: hp(32),
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 12,
    opacity: 0.6,
  },
  skeletonActionButton: {
    width: wp(20),
    height: hp(2.2),
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    opacity: 0.6,
  },
});