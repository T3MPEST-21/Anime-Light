import { supabase } from "@/lib/supabase";

// Type definitions for our chat data
export interface Conversation {
  id: string;
  last_message_at: string;
  other_participant: {
    id: string;
    username: string;
    image: string;
  };
  last_message: {
    content: string;
    sender_id: string;
  } | null;
}

export interface Message {
  id: string;
  created_at: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  status: "pending" | "sent" | "read"; // Added message status
  profile: {
    username: string;
    image: string;
  } | null;
}

/**
 * Fetches all conversations for the currently logged-in user.
 * It also retrieves the profile of the other participant and the last message sent.
 */
export const getConversations = async (
  userId: string
): Promise<Conversation[]> => {
  const { data, error } = await supabase.rpc("get_user_conversations", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }

  return data || [];
};

/**
 * Creates a new conversation with another user if one doesn't already exist,
 * or returns the ID of the existing conversation.
 * @param otherUserId The ID of the user to start a conversation with.
 * @returns The ID of the conversation.
 */
export const createOrGetConversation = async (
  otherUserId: string
): Promise<string> => {
  const { data, error } = await supabase.rpc("create_or_get_conversation", {
    other_user_id: otherUserId,
  });

  if (error) {
    console.error("Error creating or getting conversation:", error);
    throw error;
  }

  return data;
};

/**
 * Fetches all messages for a specific conversation.
 * @param conversationId The ID of the conversation.
 * @returns An array of messages.
 */
export const getMessages = async (
  conversationId: string
): Promise<Message[]> => {
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      id,
      created_at,
      content,
      sender_id,
      conversation_id,
        status,
      profile:profiles (
        username,
        image
      )
    `
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false }); // Important for inverted FlatList

  if (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }

  return (data || []).map((msg) => ({
    ...msg,
    profile: Array.isArray(msg.profile) ? msg.profile[0] : msg.profile,
  }));
};

/**
 * Sends a new message in a conversation.
 */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message> => {
  const { data, error: messageError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content.trim(),
      status: "sent", // Initial status when inserted into DB
    })
    .select(
      `
    id,
    created_at,
    content,
    sender_id,
    conversation_id,
    status,
    profile:profiles (
      username,
      image
    )
  `
    )
    .single();

  if (messageError) throw messageError;
  if (!data) throw new Error("No message data returned after insert.");

  // Also update the `last_message_at` in the parent conversation table
  const { error: convError } = await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);
  if (convError)
    console.error("Failed to update conversation timestamp:", convError);

  return {
    ...data,
    profile: Array.isArray(data.profile) ? data.profile[0] : data.profile,
  };
};

/**
 * Marks messages in a conversation as 'read' for the current user.
 * Only updates messages sent by others that are currently 'sent'.
 */
export const markMessagesAsRead = async (
  conversationId: string,
  currentUserId: string
) => {
  const { error } = await supabase
    .from("messages")
    .update({ status: "read" })
    .eq("conversation_id", conversationId)
    .neq("sender_id", currentUserId) // Only mark messages sent by others
    .eq("status", "sent"); // Only mark messages that haven't been read yet

  if (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};
