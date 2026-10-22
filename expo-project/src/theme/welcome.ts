import { Platform } from "react-native";

/** Palette for the animated splash. Onboarding uses the established app theme. */
export const welcome = {
  ivory: "#FAF9F6",
  forest: "#153E35",
  ink: "#18211E",
  champagne: "#D6BD86",
  muted: "#626D66",
  line: "#E5E6DD",
  soft: "#F0F1EA",
  serif: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" }),
};
