import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useTheme } from "@/context/themeContext";

const placeholderImage = require("../assets/images/react-logo.png"); // Use any image from your assets

const EmptyPostPlaceholder: React.FC = () => {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Image source={placeholderImage} style={styles.image} />
      <Text style={[styles.text, { color: theme.textSecondary }]}>
        This user has not posted anything yet.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 16,
    borderRadius: 16,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default EmptyPostPlaceholder;
