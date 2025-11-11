import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/themeContext";
import { hp, wp } from "@/helpers/common";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "./Avatar";

interface ChatHeaderProps {
  username: string;
  userImage?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ username, userImage }) => {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={theme.text} />
      </TouchableOpacity>
      <Avatar uri={userImage || ""} size={hp(4.5)} rounded={hp(2.25)} />
      <Text style={[styles.title, { color: theme.text }]}>{username}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0", // Use theme.border later
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: "600",
    flex: 1,
  },
});

export default ChatHeader;
