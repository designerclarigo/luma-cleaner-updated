import React, { useContext, useEffect } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  SharedValue,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Preferences } from "./NativeUI";
import { colors as c } from "../theme/colors";
function Particle({
  index,
  progress,
  width,
  height,
}: {
  index: number;
  progress: SharedValue<number>;
  width: number;
  height: number;
}) {
  const animated = useAnimatedStyle(() => ({
    opacity: Math.max(0, 1 - progress.value),
    transform: [
      {
        translateX:
          ((index * 47) % Math.max(1, width)) +
          ((index % 5) - 2) * progress.value * 35,
      },
      { translateY: -40 - (index % 9) * 18 + progress.value * (height + 250) },
      { rotate: `${progress.value * (index % 2 ? 500 : -500)}deg` },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: 0,
          top: 0,
          width: index % 3 ? 5 : 7,
          height: 9,
          borderRadius: 2,
          backgroundColor: [c.mint, c.emerald, c.coral, "#D7BA78"][index % 4],
        },
        animated,
      ]}
    />
  );
}
export function NativeCelebration() {
  const { reducedMotion } = useContext(Preferences),
    { width, height } = useWindowDimensions(),
    progress = useSharedValue(0);
  useEffect(() => {
    if (!reducedMotion) progress.value = withTiming(1, { duration: 1600 });
    return () => cancelAnimation(progress);
  }, [reducedMotion]);
  if (reducedMotion) return null;
  return (
    <View
      pointerEvents="none"
      accessible={false}
      style={[StyleSheet.absoluteFill, { overflow: "hidden", zIndex: 1 }]}
    >
      {Array.from({ length: 45 }, (_, index) => (
        <Particle
          key={index}
          index={index}
          progress={progress}
          width={Math.min(520, width)}
          height={height}
        />
      ))}
    </View>
  );
}
