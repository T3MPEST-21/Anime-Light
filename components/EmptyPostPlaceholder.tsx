import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useTheme } from "@/context/themeContext";

// placeholder image
const placeholderImage = require("../assets/images/luffy-no-post.png");

const EmptyPostPlaceholder: React.FC = () => {
  const { theme } = useTheme();
  return (
    // empty post placeholder
    <View style={styles.container}>
      <Image source={placeholderImage} style={styles.image} />
      {/* text */}
      <Text style={[styles.text, { color: theme.textSecondary, fontSize:18 }]}>
        it's quiet in here...
        <Text style={[styles.text, { color: theme.textSecondary, fontSize: 14 }]}>
          {/* subtext */}
          looks like they haven't shared anything yet
        </Text>
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
    // fontSize: 16,
    textAlign: "center",
  },
});

export default EmptyPostPlaceholder;
