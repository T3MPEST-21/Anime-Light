import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "@/context/themeContext";
import { useAuth } from "@/context/authContext";
import { hp, wp } from "@/helpers/common";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "@/components/Avatar";
import { supabase } from "@/lib/supabase";
import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  Message,
} from "../../services/chatServices";
import ChatHeader from "@/components/ChatHeader";

const ChatPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth() || {};
  const { conversationId, otherUserName, otherUserImage } =
    useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const markAsReadDebounced = useRef<any>(null);

  useEffect(() => {
    if (!conversationId || typeof conversationId !== "string") return;

    const conv = conversationId as string;

    fetchMessages(); // Fetch initial messages

    // Debounce the markMessagesAsRead call to avoid excessive updates
    markAsReadDebounced.current = setTimeout(() => {
      if (user?.id) {
        markMessagesAsRead(conv, user.id as string);
      }
    }, 1000); // Mark as read after 1 second of being on screen

    // Set up real-time subscription
    const channel = supabase
      .channel(`chat_room:${conv}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for both INSERT and UPDATE
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conv}`,
        },
        (payload) => {
          const record = payload.new as Message;

          if (payload.eventType === "INSERT") {
            // Handle new message
            setMessages((prev) => {
              // Check if the message is already in the list (e.g., from optimistic update)
              if (!prev.some((msg) => msg.id === record.id)) {
                return [record, ...prev];
              }
              return prev;
            });
            // Scroll to the bottom when a new message arrives
            if (flatListRef.current) {
              flatListRef.current.scrollToOffset({ offset: 0, animated: true });
            }

            // If the new message is from someone else, mark it as read after a delay
            if (user?.id && record.sender_id !== user.id) {
              clearTimeout(markAsReadDebounced.current); // Reset debounce
              markAsReadDebounced.current = setTimeout(() => {
                markMessagesAsRead(conv, user.id as string);
              }, 1000);
            }
          } else if (payload.eventType === "UPDATE") {
            // Handle message status update (e.g., 'read')
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === record.id ? { ...msg, status: record.status } : msg
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      clearTimeout(markAsReadDebounced.current);
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id]);

  // Mark messages as read when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id && typeof conversationId === "string") {
        // Mark messages as read when the screen is focused
        // This handles cases where user navigates back to chat or app comes to foreground
        markMessagesAsRead(conversationId, user.id);
      }
      return () => {
        // Cleanup if needed when screen loses focus
      };
    }, [conversationId, user?.id])
  );

  const fetchMessages = async () => {
    if (!conversationId || typeof conversationId !== "string") return;
    setLoading(true);
    try {
      const fetchedMessages = await getMessages(conversationId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    // Ensure we have a logged-in user with an id and a valid conversationId
    if (
      newMessage.trim() === "" ||
      !user?.id ||
      typeof conversationId !== "string" ||
      sending
    )
      return;

    setSending(true);
    const tempMessage: Message = {
      id: Math.random().toString(), // Temporary ID
      created_at: new Date().toISOString(), // Temporary timestamp
      content: newMessage.trim(),
      sender_id: user.id as string, // asserted because of the guard above
      conversation_id: conversationId as string, // asserted because of the guard above
      status: "pending",
      profile: { username: user.username || "User", image: user.image || "" },
    };

    // Optimistically update the UI
    setMessages((prev) => [tempMessage, ...prev]);
    setNewMessage("");

    try {
      const sentMsg = await sendMessage(
        conversationId as string,
        user.id as string,
        tempMessage.content
      ); // Both are guaranteed here
      // Update the optimistic message with the real ID and created_at from the DB
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempMessage.id ? sentMsg : msg))
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optional: Revert optimistic update on error
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender_id === user?.id;
    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage
            ? styles.ownMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        {!isOwnMessage && (
          <Avatar
            uri={item.profile?.image ?? ""}
            size={hp(4)}
            rounded={hp(2)}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isOwnMessage
              ? { backgroundColor: theme.primary }
              : { backgroundColor: theme.surface },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwnMessage
                ? { color: theme.buttonText }
                : { color: theme.text },
            ]}
          >
            {item.content}
          </Text>
          {isOwnMessage && (
            <Ionicons
              name={
                item.status === "read"
                  ? "checkmark-done"
                  : item.status === "sent"
                  ? "checkmark"
                  : "time-outline"
              }
              size={14}
              color={
                item.status === "read" ? theme.primary : theme.textSecondary
              }
              style={styles.messageStatusIcon}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 90}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ChatHeader
          username={typeof otherUserName === "string" ? otherUserName : "Chat"}
          userImage={
            typeof otherUserImage === "string" ? otherUserImage : undefined
          }
        />
        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            inverted // To show messages from the bottom
          />
        )}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: theme.surface, borderTopColor: theme.border },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.background },
            ]}
            placeholder="Type a message..."
            placeholderTextColor={theme.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.primary }]}
            onPress={handleSendMessage}
          >
            <Ionicons name="send" size={20} color={theme.buttonText} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: wp(4),
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 10,
    gap: 8,
  },
  ownMessageContainer: {
    justifyContent: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    flexDirection: "row", // Allow icon next to text
    alignItems: "flex-end", // Align icon to bottom right of bubble
    gap: 5, // Space between text and icon
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    maxWidth: "80%",
  },
  messageText: {
    fontSize: hp(1.9),
  },
  messageStatusIcon: {
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: hp(1.9),
    maxHeight: 100,
    marginRight: wp(2),
  },
  sendButton: {
    width: hp(5),
    height: hp(5),
    borderRadius: hp(2.5),
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatPage;
