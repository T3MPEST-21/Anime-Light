import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import {wp, hp} from '../helpers/common'
import CustomButton from "@/components/customButton";
import { second } from "@/constants/theme";


export default function Index() {

  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/goku.png")}
        style={styles.logo}
        resizeMode="contain"
      /> 
      {/* title */}
      <View style={{gap: 20}}>
        <Text style={styles.title}>Anime Lite</Text>
        <Text style={styles.subtitle}>Welcome to Anime Light, your go-to app for all your anime needs. Discover the latest anime releases, stay up-to-date with the latest news, and explore a vast library of anime content.</Text>
      </View>
      <View style={styles.footer}>
        <CustomButton title="Get Started" 
          buttonStyle={{marginHorizontal: wp(3)}}
          onPress={()=>router.push('/(auth)/SignupScreen')}
        />
        <View style={styles.bottomContainer}>
          <Text style={styles.loginText}>Already have an account? <Pressable onPress={()=> router.push('/(auth)/LoginScreen')}><Text style={styles.loginBtn}>Login</Text></Pressable></Text>
        </View>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    paddingHorizontal: wp(4),
  },
  logo: {
    width: wp(95),
    height: hp(30),
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2d3748",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: hp(1.7),
    color: "#4a5568",
    textAlign: "center",
    paddingHorizontal: wp(10)
  },
  loginText: {
    fontSize: 16,
    color: "#4a5568",
    textAlign: "center",
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  loginBtn: {
    color: second.secondary2,
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    gap: 10,
    width: '100%', 
    color: "#718096",
    textAlign: "center",
  },
});
