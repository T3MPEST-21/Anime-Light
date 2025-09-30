// Search users by username (case-insensitive, partial match), excluding the current user
export const searchUsers = async (search: string, excludeUserId: string) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('username', `%${search}%`)
            .neq('id', excludeUserId);
        if (error) {
            console.error('Error searching users:', error);
            return [];
        }
        return data || [];
    } catch (error) {
        console.error('Exception in searchUsers:', error);
        return [];
    }
};
import { supabase } from "@/lib/supabase";

export const getUserData = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('profiles') // Make sure this matches your table name exactly
            .select('*')
            .eq('id', userId);
            
        if (error) {
            console.error('Error fetching user data:', error);
            return null; // Return null instead of throwing to allow handling in the caller
        }
        
        // Return the first profile if found, otherwise return null
        return data && data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('Exception in getUserData:', error);
        return null; // Return null instead of throwing
    }
}
