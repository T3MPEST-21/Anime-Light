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
