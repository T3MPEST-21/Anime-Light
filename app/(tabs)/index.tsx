import { Text, View } from "react-native";
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app.</Text>
      <Link href="/Profile">visit profile</Link>
      <Link href="/Notification">visit Notification</Link>
    </View>
  );
}
