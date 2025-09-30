import { supabase } from '@/lib/supabase';

// Send a friend request from requesterId to addresseeId
export const sendFriendRequest = async (requesterId: string, addresseeId: string) => {
  try {
    // Check if a request already exists
    const { data: existing, error: existingError } = await supabase
      .from('friend_requests')
      .select('*')
      .or(`requester_id.eq.${requesterId},addressee_id.eq.${addresseeId}`)
      .or(`requester_id.eq.${addresseeId},addressee_id.eq.${requesterId}`)
      .in('status', ['pending', 'accepted']);
    if (existingError) throw existingError;
    if (existing && existing.length > 0) {
      return { error: 'Request already exists or you are already friends.' };
    }
    // Insert new friend request
    const { data, error } = await supabase
      .from('friend_requests')
      .insert({ requester_id: requesterId, addressee_id: addresseeId, status: 'pending' })
      .select()
      .single();
    if (error) throw error;
    return { data };
  } catch (error) {
    return { error };
  }
};

// Accept a friend request
export const acceptFriendRequest = async (requestId: string) => {
  try {
    // Update request status
    const { data: request, error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();
    if (updateError) throw updateError;
    // Create friendship (mutual)
    const { requester_id, addressee_id } = request;
    const { error: friendshipError } = await supabase
      .from('friendships')
      .insert({ user_id_a: requester_id, user_id_b: addressee_id });
    if (friendshipError) throw friendshipError;
    return { data: request };
  } catch (error) {
    return { error };
  }
};

// Reject a friend request
export const rejectFriendRequest = async (requestId: string) => {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();
    if (error) throw error;
    return { data };
  } catch (error) {
    return { error };
  }
};

// Remove a friend (delete friendship row)
export const removeFriend = async (userIdA: string, userIdB: string) => {
  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`user_id_a.eq.${userIdA},user_id_b.eq.${userIdB}`)
      .or(`user_id_a.eq.${userIdB},user_id_b.eq.${userIdA}`);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { error };
  }
};

// List friends for a user
export const getFriends = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id_a.eq.${userId},user_id_b.eq.${userId}`);
    if (error) throw error;
    // Map to friend user IDs
    const friendIds = data.map((row: any) => row.user_id_a === userId ? row.user_id_b : row.user_id_a);
    return { data: friendIds };
  } catch (error) {
    return { error };
  }
};

// List incoming friend requests
export const getIncomingFriendRequests = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('addressee_id', userId)
      .eq('status', 'pending');
    if (error) throw error;
    return { data };
  } catch (error) {
    return { error };
  }
};

// List outgoing friend requests
export const getOutgoingFriendRequests = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('requester_id', userId)
      .eq('status', 'pending');
    if (error) throw error;
    return { data };
  } catch (error) {
    return { error };
  }
};
