import {
    styles as feedStyles,
    formatDate
} from "@/app/(tabs)/index";
import Avatar from "@/components/Avatar";
import EmptyPostPlaceholder from "@/components/EmptyPostPlaceholder";
import { radius } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { hp, wp } from "@/helpers/common";
import { getUserData } from "@/services/userServices";
import { PostRow } from "@/types/PostRow";
import { getPostsByUser } from "@/userPostsService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import CommentsBottomSheet from "./CommentsBottomSheet";
import CustomActivityLoader from "./CustomActivityLoader";
import FormattedText from "./FormattedText";
import ImageGalleryModal from "./ImageGalleryModal";

interface ProfileModalProps {
  visible: boolean;
  userId: string | null;
  onClose: () => void;
  // Optional router prop accepted by some callers (not used by the modal itself)
  router?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Helper function to format date, can be moved to a utils file later
function formatDateFriendly(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = days[date.getDay()];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const mins = date.getMinutes().toString().padStart(2, "0");
  return `${day}, ${d} ${m} ${y}, Time: ${hours}:${mins}`;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  userId,
  onClose,
}) => {
  const { theme, isDark } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const { user: visitor } = useAuth() || {}; // The person viewing the modal
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && userId) {
      fetchProfileAndPosts();
    } else {
      // Reset state when modal is closed or no user
      setProfile(null);
      setPosts([]);
      setLoading(true);
      setPostsLoading(true);
      scrollY.setValue(0);
    }
  }, [userId, visible]);

  useEffect(() => {
    if (!userId || !visible) return;
    let isMounted = true;
    async function fetchPosts() {
      if (!userId) return; // Ensures userId is a string for TypeScript
      setPostsLoading(true);
      try {
        const data = await getPostsByUser(userId, userId);
        if (isMounted) {
          setPosts(data);
        }
      } catch (err) {
        console.error("Failed to fetch modal posts:", err);
      } finally {
        if (isMounted) setPostsLoading(false);
      }
    }
    fetchPosts();
    return () => {
      isMounted = false;
    };
  }, [userId, visible]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.95);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const fetchProfileAndPosts = async () => {
    if (!userId) return;
    setLoading(true);
    setPostsLoading(true);
    try {
      const [profileData, postsData] = await Promise.all([
        getUserData(userId),
        getPostsByUser(userId, visitor?.id),
      ]);
      setProfile(profileData);
      setPosts(postsData);
    } catch (error) {
      console.error("Failed to load profile modal data:", error);
      Alert.alert("Error", "Could not load profile.");
    } finally {
      setLoading(false);
      setPostsLoading(false);
    }
  };

  // --- Animation Values ---
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const AVATAR_MAX_SIZE = hp(12);
  const AVATAR_MIN_SIZE = hp(5);
  const HEADER_MAX_HEIGHT = hp(45);
  const HEADER_MIN_HEIGHT = hp(12);
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const avatarSize = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [AVATAR_MAX_SIZE, AVATAR_MIN_SIZE],
    extrapolate: "clamp",
  });

  const avatarXPosition = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [screenWidth / 2 - AVATAR_MAX_SIZE / 2, wp(4)],
    extrapolate: "clamp",
  });

  const avatarYPosition = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [hp(10), hp(6)],
    extrapolate: "clamp",
  });

  const avatarBorderRadius = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [radius.xxl * 1.4, AVATAR_MIN_SIZE / 2],
    extrapolate: "clamp",
  });

  const collapsedHeaderOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE - 20, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // --- Modal States & Handlers ---
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedCaptions, setSelectedCaptions] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostRow | null>(null);

  const openGallery = (images: string[], captions: string[]) => {
    if (images.length === 0) return;
    setSelectedImages(images);
    setSelectedCaptions(captions);
    setGalleryVisible(true);
  };

  const openComments = (post: PostRow) => {
    setSelectedPost(post);
    setCommentsVisible(true);
  };

  const handleCommentAdded = () => {
    if (selectedPost) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === selectedPost.id
            ? { ...post, comment_count: (post.comment_count || 0) + 1 }
            : post
        )
      );
    }
  };

  const handleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    // Similar logic as in Profile.tsx, using 'visitor'
  };

  const handleShare = async (post: PostRow) => {
    // Similar logic as in Profile.tsx
  };

  // --- Render Functions ---
  const renderItem = ({ item }: { item: PostRow }) => {
    const author = item.profiles;
    const imgs = item.post_images || [];
    const captions = imgs.map((i) => i.caption || "");
    const imageUrls = imgs.map((i) => i.image_url);

    return (
      <View
        style={[
          feedStyles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {/* Post Header */}
        <View style={feedStyles.cardHeader}>
          <Avatar uri={author?.image || ""} size={hp(4.6)} rounded={20} />
          <View style={{ flex: 1 }}>
            <Text style={[feedStyles.username, { color: theme.text }]}>
              {author?.username || "Unknown User"}
            </Text>
            <Text style={[feedStyles.timeText, { color: theme.textSecondary }]}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>

        {item.body ? (
          <FormattedText html={item.body} containerStyle={feedStyles.bodyContainer} />
        ) : null}

        {/* Image Grid, Action Buttons etc. - Copied from Profile.tsx renderItem */}
        {imgs.length > 0 ? (
          <TouchableOpacity
            onPress={() => openGallery(imageUrls, captions)}
            activeOpacity={0.8}
          >
            <View style={feedStyles.imageGrid}>
              {imgs.length === 1 ? (
                <Image
                  source={{ uri: imgs[0].image_url }}
                  style={feedStyles.singleImage}
                  resizeMode="cover"
                />
              ) : imgs.length === 2 ? (
                <>
                  <Image
                    source={{ uri: imgs[0].image_url }}
                    style={feedStyles.twoImageLeft}
                    resizeMode="cover"
                  />
                  <Image
                    source={{ uri: imgs[1].image_url }}
                    style={feedStyles.twoImageRight}
                    resizeMode="cover"
                  />
                </>
              ) : (
                <>
                  <Image
                    source={{ uri: imgs[0].image_url }}
                    style={feedStyles.threeImageTop}
                    resizeMode="cover"
                  />
                  <View style={feedStyles.bottomRow}>
                    <Image
                      source={{ uri: imgs[1].image_url }}
                      style={feedStyles.threeImageBottomLeft}
                      resizeMode="cover"
                    />
                    <View style={feedStyles.threeImageBottomRightContainer}>
                      <Image
                        source={{ uri: imgs[2].image_url }}
                        style={feedStyles.threeImageBottomRight}
                        resizeMode="cover"
                      />
                      {imgs.length > 3 && (
                        <View
                          style={[
                            feedStyles.imageOverlay,
                            { backgroundColor: theme.overlay },
                          ]}
                        >
                          <Text
                            style={[
                              feedStyles.imageOverlayText,
                              { color: theme.buttonText },
                            ]}
                          >
                            +{imgs.length - 3}
                          </Text>
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
        <View style={feedStyles.actionRow}>
          <Pressable
            style={feedStyles.actionButton}
            onPress={() => handleLike(item.id, item.is_liked || false)}
          >
            <Ionicons
              name={item.is_liked ? "heart" : "heart-outline"}
              size={22}
              color={item.is_liked ? theme.accent : theme.textSecondary}
            />
            <Text
              style={[
                feedStyles.actionText,
                { color: theme.textSecondary },
                item.is_liked && { color: theme.accent },
              ]}
            >
              {item.like_count || 0}
            </Text>
          </Pressable>
          <Pressable
            style={feedStyles.actionButton}
            onPress={() => openComments(item)}
          >
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color={theme.textSecondary}
            />
            <Text
              style={[feedStyles.actionText, { color: theme.textSecondary }]}
            >
              {item.comment_count || 0}
            </Text>
          </Pressable>
          <Pressable
            style={feedStyles.actionButton}
            onPress={() => handleShare(item)}
          >
            <Ionicons
              name="share-outline"
              size={22}
              color={theme.textSecondary}
            />
            <Text
              style={[feedStyles.actionText, { color: theme.textSecondary }]}
            >
              Share
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderListHeader = () => {
    if (!profile) return null;
    return (
      <View style={styles.headerContainer}>
        <View style={styles.avatarContainer} />
        <View style={{ alignItems: "center", gap: 4, marginTop: 16 }}>
          <Text style={[styles.username, { color: theme.text }]}>
            {profile.username}
          </Text>
        </View>
        <View style={{ gap: 10, marginTop: 10 }}>
          <View style={styles.info}>
            <Ionicons name="call-outline" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {profile.phone || "No phone number"}
            </Text>
          </View>
          <View style={styles.info}>
            <Ionicons name="star-outline" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {profile.favorite_anime || "No favorite anime"}
            </Text>
          </View>
          <View style={styles.info}>
            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {formatDateFriendly(profile.created_at)}
            </Text>
          </View>
        </View>
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: theme.surface,
            marginVertical: 20,
          }}
        />
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar
        backgroundColor={isDark ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.7)"}
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: opacityAnim,
            backgroundColor: isDark
              ? "rgba(0, 0, 0, 0.95)"
              : "rgba(0, 0, 0, 0.85)",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.background,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          {loading || !profile ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CustomActivityLoader />
            </View>
          ) : (
            <>
              <Animated.FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderListHeader}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                  { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 40,
                }}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                ListEmptyComponent={
                  !postsLoading ? <EmptyPostPlaceholder /> : <View />
                }
              />
              <Animated.View
                style={[
                  styles.collapsedHeaderContent,
                  { opacity: collapsedHeaderOpacity },
                ]}
              >
                <Text style={[styles.collapsedUsername, { color: theme.text }]}>
                  {profile?.username}
                </Text>
              </Animated.View>
              <Animated.View
                style={[
                  styles.avatarPositioner,
                  {
                    top: avatarYPosition,
                    left: avatarXPosition,
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarBorderRadius,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
              >
                <Avatar
                  uri={profile.image || ""}
                  size={AVATAR_MAX_SIZE}
                  rounded={radius.xxl * 1.4}
                />
              </Animated.View>
            </>
          )}
        </Animated.View>
      </Animated.View>
      {/* Other Modals */}
      <ImageGalleryModal
        visible={galleryVisible}
        images={selectedImages}
        captions={selectedCaptions}
        onClose={() => setGalleryVisible(false)}
      />
      <CommentsBottomSheet
        visible={commentsVisible}
        postData={selectedPost}
        onClose={() => setCommentsVisible(false)}
        onCommentAdded={handleCommentAdded}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  overlay: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTouch: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  modalContent: {
    width: screenWidth,
    height: screenHeight,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderRadius: 0,
    paddingTop: 40,
    // alignItems: 'center',
    // justifyContent: 'flex-start',
    elevation: 8,
  },
  closeButton: {
    position: "absolute",
    top: 30,
    right: 24,
    zIndex: 2,
    padding: 8,
  },
  username: {
    fontSize: hp(3),
    fontWeight: "600",
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: hp(2),
    fontWeight: "500",
    marginTop: hp(1),
  },
  avatarPositioner: {
    position: "absolute",
    overflow: "hidden",
    zIndex: 11, // Above the modal content
    marginTop: -5, // avatar should be higher
    marginLeft: 10,
  },
  headerContainer: {
    paddingTop: hp(5) + hp(6), // Make space for the initial avatar position
    position: "relative",
  },
  avatarContainer: {
    height: hp(12),
    alignSelf: "center",
  },
  collapsedHeaderContent: {
    position: "absolute",
    top: hp(6),
    left: wp(4) + hp(5) + 12, // Aligns next to the shrunken avatar
    right: wp(15), // Prevents overlap with close icon
    height: hp(5),
    justifyContent: "center",
    zIndex: 12,
  },
  collapsedUsername: {
    fontSize: hp(2.2),
    fontWeight: "bold",
    textAlign: "left",
  },
});

export default ProfileModal;
