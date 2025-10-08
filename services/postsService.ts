import { supabase } from '@/lib/supabase';

// Fetch all posts by a user
export const getPostsByUser = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        body,
        created_at,
        user_id
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Exception in getPostsByUser:', error);
    return [];
  }
};
