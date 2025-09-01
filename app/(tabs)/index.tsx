import { Alert, Text, View, StyleSheet, Pressable } from "react-native";
import { Link, useRouter } from 'expo-router';
import CustomButton from "@/components/customButton";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/authContext";
import { hp, wp } from "@/helpers/common";
import { second } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "@/components/Avatar";

export default function Index() {

  const router = useRouter();
  const {setAuth} = useAuth() || {setAuth: () => {}};

  return (
    <View style={styles.container}>
      
      {/* header */}

      <View style={styles.header}>
        <Text style={styles.title}>AnimeLight</Text>
        <View style={styles.icons}>
          <Pressable onPress={() => router.push('/(tabs)/Notification')}>
            <Ionicons name="heart-outline" size={25} color={second.grayDark} />
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/create')}>
            <Ionicons name="add-circle-outline" size={25} color={second.grayDark} />
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/Profile')}>
            {/* Use the latest avatar from context/profile */}
            <Avatar uri={useAuth()?.user?.image} size={hp(4.3)} rounded={20} style={styles.avatarImage} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 7,
    marginHorizontal: wp(4),
  },
  title: {
    color: second.secondary2,
    fontSize: hp(3.2),
    fontWeight: 700,
  },
  avatarImage: {
    height: hp(4.3),
    width: hp(4.3),
    borderRadius: 50,
    borderCurve: 'continuous',
    borderColor: second.grayDark,
    borderWidth: 2,
  },
  icons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  listStyle: {
    padding: 20,
    paddingHorizontal: wp(4)
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: second.text
  },
  pill: {
    position: 'absolute',
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    borderRadius: 20,
    backgroundColor: second.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    fontSize: hp(1.2),
    color: second.white,
    fontWeight: 700,
  }
});
