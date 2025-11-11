import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/themeContext";
import { hp, wp } from "@/helpers/common";
import Avatar from "./Avatar";
import { useAuth } from "@/context/authContext";
import { getFriends } from "@/services/friendsService";
import { getUserData } from "@/services/userServices";
import { createOrGetConversation } from "../services/chatServices";
import CustomActivityLoader from "./CustomActivityLoader";

const { height: screenHeight } = Dimensions.get("window");

interface SelectFriendModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFriend: (
    conversationId: string,
    otherUserName: string,
    otherUserImage?: string
  ) => void;
}

interface FriendProfile {
  id: string;
  username: string;
  image?: string;
}

const SelectFriendModal: React.FC<SelectFriendModalProps> = ({
  visible,
  onClose,
  onSelectFriend,
}) => {
  const { theme } = useTheme();
  const { user } = useAuth() || {};
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      fetchFriendsList();
    } else {
      slideAnim.setValue(screenHeight);
      opacityAnim.setValue(0);
      setFriends([]); // Clear friends when modal closes
    }
  }, [visible, user?.id]);

  const fetchFriendsList = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: friendIds } = await getFriends(user.id);
      if (friendIds && friendIds.length > 0) {
        const friendsData = await Promise.all(
          friendIds.map((fid: string) => getUserData(fid))
        );
        setFriends(friendsData.filter(Boolean) as FriendProfile[]);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error("Failed to fetch friends for chat:", error);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleFriendPress = async (friend: FriendProfile) => {
    try {
      const conversationId = await createOrGetConversation(friend.id);
      onSelectFriend(conversationId, friend.username, friend.image);
      handleClose();
    } catch (error) {
      console.error("Error starting conversation:", error);
      // Optionally show an alert to the user
    }
  };

  const renderFriendItem = ({ item }: { item: FriendProfile }) => (
    <TouchableOpacity
      style={[styles.friendItem, { backgroundColor: theme.surface }]}
      onPress={() => handleFriendPress(item)}
    >
      <Avatar uri={item.image || ""} size={hp(5)} rounded={hp(2.5)} />
      <Text style={[styles.friendUsername, { color: theme.text }]}>
        {item.username}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          { opacity: opacityAnim, backgroundColor: theme.overlay },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }],
              backgroundColor: theme.background,
            },
          ]}
        >
          <View style={styles.handleBar} />
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Select Friend
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <CustomActivityLoader size={50}/>
          ) : (
            <FlatList
              data={friends}
              renderItem={renderFriendItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.friendsList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons
                    name="people-outline"
                    size={60}
                    color={theme.textLight}
                  />
                  <Text
                    style={[styles.emptyText, { color: theme.textSecondary }]}
                  >
                    No friends found
                  </Text>
                  <Text
                    style={[styles.emptySubtext, { color: theme.textLight }]}
                  >
                    Add friends to start chatting!
                  </Text>
                </View>
              }
            />
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  overlayTouch: { flex: 1 },
  bottomSheet: {
    height: screenHeight * 0.7,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: hp(2.2), fontWeight: "600" },
  closeButton: { padding: 4 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  friendsList: { paddingHorizontal: wp(4), paddingTop: 10 },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  friendUsername: { fontSize: hp(2), fontWeight: "500", flex: 1 },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp(5),
  },
  emptyText: { fontSize: hp(2), fontWeight: "600", marginTop: 16 },
  emptySubtext: { fontSize: hp(1.6), marginTop: 4 },
});

export default SelectFriendModal;
