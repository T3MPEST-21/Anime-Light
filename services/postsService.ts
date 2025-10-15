// Like a post
export const likePost = async (postId: string, userId: string) => {
  const { data, error } = await supabase
    .from("post_likes")
    .insert([{ post_id: postId, user_id: userId }]);
  if (error) {
    console.error("Error liking post:", error);
    return { success: false, error };
  }
  return { success: true, data };
};

// Unlike a post
export const unlikePost = async (postId: string, userId: string) => {
  const { error } = await supabase
    .from("post_likes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);
  if (error) {
    console.error("Error unliking post:", error);
    return { success: false, error };
  }
  return { success: true };
};

// Add a comment to a post
export const addComment = async (
  postId: string,
  userId: string,
  comment: string
) => {
  const { data, error } = await supabase
    .from("post_comments")
    .insert([{ post_id: postId, user_id: userId, comment }]);
  if (error) {
    console.error("Error adding comment:", error);
    return { success: false, error };
  }
  return { success: true, data };
};
import { supabase } from "@/lib/supabase";

// Fetch all posts by a user
export const getPostsByUser = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        id,
        body,
        created_at,
        user_id
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching user posts:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Exception in getPostsByUser:", error);
    return [];
  }
};
