import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fonts, fontError] = useFonts({
    Jakarta400: require("../assets/fonts/PlusJakartaSans_400Regular.ttf"),
    Jakarta500: require("../assets/fonts/PlusJakartaSans_500Medium.ttf"),
    Jakarta600: require("../assets/fonts/PlusJakartaSans_600SemiBold.ttf"),
    Jakarta700: require("../assets/fonts/PlusJakartaSans_700Bold.ttf"),
    Jakarta800: require("../assets/fonts/PlusJakartaSans_800ExtraBold.ttf"),
    Mono: require("../assets/fonts/JetBrainsMono_400Regular.ttf"),
  });
  useEffect(() => {
    if (fonts || fontError) void SplashScreen.hideAsync();
  }, [fonts, fontError]);
  if (!fonts)
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        {fontError ? (
          <Text>Luma’s fonts could not load. Restart the app to retry.</Text>
        ) : (
          <ActivityIndicator color="#244D3F" />
        )}
      </View>
    );
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
});
