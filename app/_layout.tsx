import { second } from "@/constants/theme";
import { AuthProvider, useAuth } from "@/context/authContext";
import { supabase } from "@/lib/supabase";
import { getUserData } from "@/services/userServices";
import { router, Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Layout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: second.grayDark }}>
          <ContentWithAuth />
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

function ContentWithAuth() {
  const { setAuth, setUserData } = useAuth() || { setAuth: () => { }, setUserData: () => {} };

  useEffect(() => {
    // On mount, check for an existing session
    const checkSessionAndFetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setAuth(session.user);
        // Fetch latest profile from Supabase and update context
        const profile = await getUserData(session.user.id);
        if (profile) {
          setUserData(profile);
        }
        router.replace('/(tabs)');
      } else {
        setAuth(null);
        router.replace('/');
      }
    };

    checkSessionAndFetchProfile();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuth(session.user);
        // Fetch latest profile from Supabase and update context
        const profile = await getUserData(session.user.id);
        if (profile) {
          setUserData(profile);
        }
        router.replace('/(tabs)');
      } else {
        setAuth(null);
        router.replace('/');
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  return <Slot />;
}
