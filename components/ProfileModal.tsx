import React, { useEffect, useState, useRef } from "react";
import PostCard from "@/components/PostCard";
import EmptyPostPlaceholder from "@/components/EmptyPostPlaceholder";
import { FlatList } from "react-native";
import { PostRow } from "@/types/PostRow";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import Avatar from "@/components/Avatar";
import { getUserData } from "@/services/userServices";
import { useTheme } from "@/context/themeContext";
import CustomActivityLoader from "./CustomActivityLoader";
import { Ionicons } from "@expo/vector-icons";
import { hp, wp } from "@/helpers/common";
import { getPostsByUser } from "@/userPostsService";
import Header from "./Header";

interface ProfileModalProps {
  visible: boolean;
  userId: string | null;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  userId,
  onClose,
}) => {
  const { theme, isDark } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!userId || !visible) return;
    setLoading(true);
    const fetchProfile = async () => {
      const user = await getUserData(userId);
      setProfile(user);
    };
    fetchProfile().finally(() => setLoading(false));
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
            <Text
              style={{ color: theme.text, fontSize: 28, fontWeight: "bold" }}
            >
              ×
            </Text>
          </TouchableOpacity>
          {loading ? (
            <CustomActivityLoader size={20} />
          ) : !profile ? (
            <Text style={{ color: theme.text }}>User not found</Text>
          ) : (
            <>
              <View
                style={[
                  styles.container,
                  { backgroundColor: theme.background },
                ]}
              >
                <View>
                  {/* Profile Avatar */}
                  <View style={{ alignItems: "center" }}>
                    <Avatar
                      uri={profile.image || profile.avatar_url || ""}
                      size={100}
                    />
                    <Text style={[styles.username, { color: theme.text }]}>
                      {profile.username}
                    </Text>
                  </View>
                  {/* Profile Info */}
                  <View style={{ gap: 10 }}>
                    <View style={styles.info}>
                      <Ionicons
                        name="call-outline"
                        size={20}
                        color={theme.primary}
                        style={{ marginBottom: -10 }}
                      />
                      <Text
                        style={[
                          styles.infoText,
                          { color: theme.textSecondary },
                        ]}
                      >
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
                      <Text
                        style={[
                          styles.infoText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {profile.favorite_anime || "No favorite anime"}
                      </Text>
                    </View>
                    <View style={styles.info}>
                      <Ionicons
                        name="document-text-outline"
                        size={20}
                        color={theme.primary}
                        style={{ marginBottom: -10 }}
                      />
                      <Text
                        style={[
                          styles.infoText,
                          { color: theme.textSecondary },
                        ]}
                      >
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

                {/* Posts Section */}
                <View style={{ flex: 1 }}>
                  {postsLoading ? (
                    <CustomActivityLoader />
                  ) : posts.length === 0 ? (
                    <EmptyPostPlaceholder />
                  ) : (
                    <FlatList
                      data={posts}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{ paddingBottom: 30 }}
                      renderItem={({ item }) => (
                        <PostCard
                          post={item}
                          visitorId={userId || ""}
                          onLike={(postId, liked) => {
                            /* TODO: Implement like/unlike logic */
                          }}
                          onComment={(postId) => {
                            /* TODO: Implement comment logic */
                          }}
                        />
                      )}
                    />
                  )}
                </View>
              </View>
            </>
          )}
        </Animated.View>
      </Animated.View>
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
    paddingTop: 60,
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
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 24,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: wp(4),
  },
  infoText: {
    fontSize: hp(2),
    fontWeight: "500",
    textAlign: "center",
    marginTop: hp(1),
  },
});

export default ProfileModal;
