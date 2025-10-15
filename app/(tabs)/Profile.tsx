import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import CustomActivityLoader from "@/components/CustomActivityLoader";
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { hp, wp } from "@/helpers/common";
import { radius, second } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import Avatar from "@/components/Avatar";
import EmptyPostPlaceholder from "@/components/EmptyPostPlaceholder";
import { Animated, FlatList, Image, Share } from "react-native";
import { PostRow } from "@/types/PostRow";
import { getPostsByUser } from "@/userPostsService";
import ImageGalleryModal from "@/components/ImageGalleryModal";
import CommentsBottomSheet from "@/components/CommentsBottomSheet";
import ProfileModal from "@/components/ProfileModal";
import {
  styles as feedStyles,
  formatDate,
  stripHtml,
} from "@/app/(tabs)/index";

// Re-using the styles from the feed screen
export {
  styles as feedStyles,
  formatDate,
  stripHtml,
} from "@/app/(tabs)/index";

export default function Profile() {
  const auth = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  // Show loader only while context is undefined (not yet initialized)
  if (auth === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <BackButton onPress={() => router.back()} />
        <View
          style={{
            backgroundColor: theme.background,
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CustomActivityLoader />
        </View>
      </View>
    );
  }

  const { user } = auth;

  // If user is not logged in, show a message
  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.text }}>You are not logged in.</Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/LoginScreen")}>
          <Text style={{ color: theme.primary }}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <UserHeader currentUser={user} router={router} theme={theme} />
    </View>
  );
}

interface ProfileType {
  id: string;
  email?: string;
  full_name?: string;
  username: string;
  favorite_anime?: string;
  created_at?: string;
  phone?: string;
  bio?: string;
  image?: string;
}

interface UserHeaderProps {
  currentUser: any; // Renamed to avoid conflict
  router: any;
  theme: any;
}

// Helper function to help me put the date into a more readable format
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

const UserHeader = ({ currentUser, router, theme }: UserHeaderProps) => {
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // States for modals, copied from index.tsx
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedCaptions, setSelectedCaptions] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostRow | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  // --- Animation Values ---
  const AVATAR_MAX_SIZE = hp(12);
  const AVATAR_MIN_SIZE = hp(5);
  const HEADER_MAX_HEIGHT = hp(45); // Approximate height of the profile info section
  const HEADER_MIN_HEIGHT = hp(12); // Height of the collapsed header
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const avatarSize = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [AVATAR_MAX_SIZE, AVATAR_MIN_SIZE],
    extrapolate: "clamp",
  });

  const avatarXPosition = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [
      wp(50) - AVATAR_MAX_SIZE / 2, // Centered
      wp(4), // Left side
    ],
    extrapolate: "clamp",
  });

  const avatarYPosition = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [hp(5), hp(2)], // Adjust start and end Y position
    extrapolate: "clamp",
  });

  const avatarBorderRadius = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [radius.xxl * 1.4, AVATAR_MIN_SIZE / 2], // Animate from rounded square to circle
    extrapolate: "clamp",
  });

  const headerContentOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const fetchProfile = async () => {
    let isMounted = true;
    setLoading(true);
    try {
      const { getUserData } = await import("@/services/userServices");
      const result = await getUserData(currentUser.id);
      if (isMounted && result) {
        setProfile(result);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  const fetchPosts = async () => {
    let isMounted = true;
    setPostsLoading(true);
    try {
      const data = await getPostsByUser(currentUser.id, currentUser.id);
      if (isMounted) {
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch user posts:", err);
    } finally {
      if (isMounted) setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [currentUser.id]);

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Logout Failed", error.message);
    } else {
      router.push("/(auth)/LoginScreen");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => onLogout() },
    ]);
  };

  // --- Logic copied from index.tsx for rendering posts ---

  const handleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    if (!currentUser?.id) return;

    // Optimistically update UI
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            is_liked: !isCurrentlyLiked,
            like_count: isCurrentlyLiked
              ? (post.like_count || 1) - 1
              : (post.like_count || 0) + 1,
          };
        }
        return post;
      })
    );

    try {
      if (isCurrentlyLiked) {
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", currentUser.id);
      } else {
        await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: currentUser.id });
      }
    } catch (error: any) {
      console.error("Error toggling like:", error.message);
      // Revert UI on error
      fetchPosts();
    }
  };

  const handleShare = async (post: PostRow) => {
    try {
      const username = post.profiles?.username || "Someone";
      const postText = post.body
        ? stripHtml(post.body)
        : "Check out this post!";
      await Share.share({
        message: `${username} shared: ${postText}`,
        title: "AnimeLight Post",
      });
    } catch (error: any) {
      Alert.alert("Error", "Failed to share post");
    }
  };

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

  const openProfileModal = (userId: string) => {
    // Don't open a modal for the current user's own profile page
    if (userId === currentUser.id) return;
    setProfileUserId(userId);
    setProfileModalVisible(true);
  };

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
          <TouchableOpacity
            onPress={() => author?.id && openProfileModal(author.id)}
          >
            <Avatar uri={author?.image || ""} size={hp(4.6)} rounded={20} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[feedStyles.username, { color: theme.text }]}>
              {author?.username || "Unknown User"}
            </Text>
            <Text style={[feedStyles.timeText, { color: theme.textSecondary }]}>
              {formatDate(item.created_at)}
            </Text>
          </View>
          <Pressable style={feedStyles.moreButton}>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>
        </View>

        {item.body ? (
          <Text style={[feedStyles.body, { color: theme.text }]}>
            {stripHtml(item.body)}
          </Text>
        ) : null}

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
            {/* likes */}
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
            {/* comments */}
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
            {/* share */}
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
        <View style={{ gap: 15 }}>
          {/* This View is a placeholder to occupy the space of the large avatar */}
          <View style={styles.avatarContainer} />

          {/* username */}
          <View style={{ alignItems: "center", gap: 4, marginTop: 16 }}>
            <Text style={[styles.username, { color: theme.text }]}>
              {profile.username}
            </Text>
          </View>

          {/* details */}
          <View style={{ gap: 10 }}>
            <View style={styles.info}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={theme.primary}
                style={{ marginBottom: -10 }}
              />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                {currentUser.email}
              </Text>
            </View>
            <View style={styles.info}>
              <Ionicons
                name="call-outline"
                size={20}
                color={theme.primary}
                style={{ marginBottom: -10 }}
              />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                {profile.phone || "No phone number"}{" "}
              </Text>
            </View>
            <View style={styles.info}>
              <Ionicons
                name="star-outline"
                size={20}
                color={theme.primary}
                style={{ marginBottom: -10 }}
              />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                {profile.favorite_anime || "No favorite anime"}
              </Text>
            </View>
            <View style={styles.info}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={theme.primary}
                style={{ marginBottom: -10 }}
              />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                {formatDateFriendly(profile.created_at)}
              </Text>
            </View>
            <View style={styles.info}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={theme.primary}
                style={{ marginBottom: -10 }}
              />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                {profile.bio || "No bio"}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: theme.surface,
            marginVertical: 20,
          }}
        />

        {/* Edit Profile Icon - now part of the scrollable header */}
        <Pressable
          style={[styles.editIcon, { backgroundColor: theme.surface }]}
          onPress={() => router.push("/(main)/EditProfile")}
        >
          <Ionicons name="pencil-outline" size={15} color={theme.text} />
        </Pressable>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomActivityLoader />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Failed to load profile data.</Text>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: theme.background, paddingBottom: 100 }}
    >
      <Animated.FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderListHeader}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={
          postsLoading ? (
            <CustomActivityLoader style={{ marginTop: hp(10) }} />
          ) : (
            <EmptyPostPlaceholder />
          )
        }
      />

      {/* This is the container for the elements that stay on top */}
      <Animated.View style={styles.headerBar} pointerEvents="box-none">
        <Header title="Profile" ShowBackButton={false} marginBottom={1} />
        <TouchableOpacity
          style={[
            styles.settingsBtn,
            { backgroundColor: theme.primary + "20" },
          ]}
          onPress={() => router.push("/settings")}
        >
          <Ionicons name="settings-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
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
      </Animated.View>

      {/* Modals */}
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
      <ProfileModal
        visible={profileModalVisible}
        userId={profileUserId}
        onClose={() => setProfileModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  avatarPositioner: {
    position: "absolute",
    overflow: "hidden", // Important for the borderRadius animation
  },
  settingsBtn: {
    position: "absolute",
    right: wp(2),
    top: hp(2),
    padding: 8,
    borderRadius: radius.sm,
    alignItems: "center",
    alignSelf: "center",
  },
  logoutBtn: {
    position: "absolute",
    right: wp(3),
    top: hp(2),
    padding: 5,
    backgroundColor: "#fee2e2",
    borderRadius: radius.sm,
    alignItems: "center",
    alignSelf: "center",
  },
  noPost: {
    fontSize: hp(2.5),
    fontWeight: "500",
    color: second.text,
    textAlign: "center",
    marginTop: hp(20),
  },
  listStyle: {
    paddingBottom: 30,
    paddingHorizontal: hp(4),
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
  username: {
    fontSize: hp(3),
    fontWeight: "600",
  },
  editIcon: {
    position: "absolute",
    top: hp(5) + hp(12) - 25, // Positioned relative to the large avatar's initial spot
    right: wp(50) - hp(12) / 2 - 20,
    padding: 7,
    borderRadius: 50,
    elevation: 7,
    shadowColor: second.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    shadowOpacity: 0.4,
  },
  avatarContainer: {
    height: hp(12),
    alignSelf: "center",
    // This is now just a spacer for the ListHeaderComponent
  },
  headerContainer: {
    // This is the container for the scrollable part of the header
    paddingTop: hp(5), // Make space for the initial avatar position
    position: "relative",
  },
});
