import { COLORS } from "@/constants/theme";
import { StyleSheet, Dimensions } from "react-native";

const {width, height} = Dimensions.get("window");

export const AUTH_STYLES = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  brandSection: {
    alignItems: "center",
    marginTop: height * 0.12,
  },
  LogoContainer: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    alignItems: "center",
    marginBottom: 28,
    justifyContent: "center",
    width: 67,
    height: 60,
    borderRadius: 18,
    marginTop: 16,
  },
  appName: {
    fontSize: 42,
    fontWeight: "700",
    fontFamily: "jetBrainsMono-Medium",
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagLines: {
    fontSize: 16,
    fontFamily: "jetBrainsMono-Regular",
    color: COLORS.grey,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
  },
  illustration: {
    width: width * 0.75,
    height: width * 0.75,
    maxHeight: 280,
  },
  loginSection: {
    width: "100%",
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 28,
    width: "100%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  googleIconContainer: {
    width: 24,
    height:24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.surface,
  },
  termsText: {
    textAlign:"center",
    fontSize: 12,
    color: COLORS.grey,
    maxWidth: 200
  }
});