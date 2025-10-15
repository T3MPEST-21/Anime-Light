import { supabase } from "@/lib/supabase";

export const getPostsByUser = async (userId: string, visitorId?: string) => {
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
      throw error;
    }

    if (!data) return [];

    // Manually fetch related data for each post
    const postsWithDetails = await Promise.all(
      data.map(async (post) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, username, image")
          .eq("id", post.user_id)
          .single();
        const { data: images } = await supabase
          .from("post_images")
          .select("image_url, caption")
          .eq("post_id", post.id);
        const { count: likeCount } = await supabase
          .from("post_likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);
        const { data: userLike } = await supabase
          .from("post_likes")
          .select("id")
          .eq("post_id", post.id)
          .eq("user_id", visitorId || "")
          .single();
        const { count: commentCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        return {
          ...post,
          profiles: profile,
          post_images: images || [],
          like_count: likeCount || 0,
          is_liked: !!userLike,
          comment_count: commentCount || 0,
        };
      })
    );

    return postsWithDetails;
  } catch (error) {
    console.error("Unexpected error fetching user posts:", error);
    return [];
  }
};
