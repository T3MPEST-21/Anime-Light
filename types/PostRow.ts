export interface Profile {
  id: string;
  username?: string;
  image?: string;
}

export interface PostImage {
  image_url: string;
  caption?: string;
}

export interface PostRow {
  id: string;
  body?: string | null;
  created_at?: string;
  user_id: string;
  profiles?: Profile | null;
  post_images?: PostImage[];
  like_count?: number;
  is_liked?: boolean;
  comment_count?: number;
}
