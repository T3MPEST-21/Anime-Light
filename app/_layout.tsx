import { Slot, useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";


export default function RootLayout() {

  return <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <Slot />
      </SafeAreaView>
    </SafeAreaProvider>
}