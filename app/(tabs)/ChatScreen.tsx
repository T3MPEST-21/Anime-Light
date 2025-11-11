import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { getConversations, Conversation } from "../../services/chatServices";
import CustomActivityLoader from "@/components/CustomActivityLoader";
import Header from "@/components/Header";
import Avatar from "@/components/Avatar";
import { hp, wp } from "@/helpers/common";
import { formatDate } from "./index";
import SelectFriendModal from "@/components/SelectFriendModal";
import { Ionicons } from "@expo/vector-icons";

const ChatScreen = () => {
  const { user } = useAuth() || {};
  const { theme } = useTheme();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectFriendModalVisible, setSelectFriendModalVisible] =
    useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getConversations(user.id);
      setConversations(data);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchConversations();
    }, [fetchConversations])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const lastMessageText =
      item.last_message?.sender_id === user?.id
        ? `You: ${item.last_message?.content}`
        : item.last_message?.content || "No messages yet";

    return (
      <TouchableOpacity
        style={[styles.itemContainer, { backgroundColor: theme.surface }]}
        onPress={() =>
          router.push({
            pathname: "/(main)/chat",
            params: {
              conversationId: item.id,
              otherUserName: item.other_participant.username,
              otherUserImage: item.other_participant.image,
            },
          })
        }
      >
        <Avatar
          uri={item.other_participant.image}
          size={hp(6)}
          rounded={hp(3)}
        />
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.username, { color: theme.text }]}>
              {item.other_participant.username}
            </Text>
            <Text style={[styles.time, { color: theme.textSecondary }]}>
              {formatDate(item.last_message_at)}
            </Text>
          </View>
          <Text
            style={[styles.lastMessage, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {lastMessageText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Messages" ShowBackButton={false} marginBottom={0} />
      {loading ? (
        <CustomActivityLoader />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No conversations yet.
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setSelectFriendModalVisible(true)}
      >
        <Ionicons name="add" size={30} color={theme.buttonText} />
      </TouchableOpacity>

      {/* Select Friend Modal */}
      {selectFriendModalVisible && (
        <SelectFriendModal
          visible={selectFriendModalVisible}
          onClose={() => setSelectFriendModalVisible(false)}
          onSelectFriend={(conversationId, otherUserName, otherUserImage) =>
            router.push({
              pathname: "/(main)/chat",
              params: { conversationId, otherUserName, otherUserImage },
            })
          }
        />
      )}
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: wp(4),
    paddingTop: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  username: {
    fontSize: hp(2),
    fontWeight: "bold",
  },
  time: {
    fontSize: hp(1.5),
  },
  lastMessage: {
    fontSize: hp(1.8),
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(20),
  },
  emptyText: {
    fontSize: hp(2),
  },
  fab: {
    position: "absolute",
    bottom: hp(15),
    right: wp(4),
    width: hp(7),
    height: hp(7),
    borderRadius: hp(7) / 2,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
