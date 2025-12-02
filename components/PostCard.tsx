import { useTheme } from "@/context/themeContext";
import { PostImage, PostRow } from "@/types/PostRow";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FormattedText from "./FormattedText";
import ImageGalleryModal from "./ImageGalleryModal";

interface PostCardProps {
  post: PostRow;
  visitorId: string;
  onLike: (postId: string, liked: boolean) => void;
  onComment: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  visitorId,
  onLike,
  onComment,
}) => {
  const { theme } = useTheme();
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const liked = post.is_liked;
  const commented = post.comment_count && post.comment_count > 0; // You may want to check if visitor has commented

  const handleLike = () => {
    onLike(post.id, !liked);
  };

  const handleComment = () => {
    onComment(post.id);
  };

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setGalleryVisible(true);
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      {post.body && <FormattedText html={post.body} containerStyle={styles.bodyContainer} />}
      {post.post_images && post.post_images.length > 0 && (
        <View style={styles.imageGrid}>
          {post.post_images.map((img: PostImage, idx: number) => (
            <TouchableOpacity key={idx} onPress={() => openGallery(idx)}>
              <Image
                source={{ uri: img.image_url }}
                style={styles.imageThumb}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={24}
            color={liked ? theme.primary : theme.textSecondary}
          />
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>
            {post.like_count || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleComment}>
          <Ionicons
            name={"chatbubble-ellipses"}
            size={24}
            color={commented ? theme.accent : theme.textSecondary}
          />
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>
            {post.comment_count || 0}
          </Text>
        </TouchableOpacity>
      </View>
      <ImageGalleryModal
        visible={galleryVisible}
        images={
          post.post_images ? post.post_images.map((img) => img.image_url) : []
        }
        captions={
          post.post_images
            ? post.post_images.map((img) => img.caption || "")
            : []
        }
        initialIndex={galleryIndex}
        onClose={() => setGalleryVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  body: {
    fontSize: 16,
    marginBottom: 8,
  },
  bodyContainer: {
    marginBottom: 12,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    marginTop: 8,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 4,
  },
});

export default PostCard;
