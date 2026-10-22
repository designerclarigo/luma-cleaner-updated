import React, { useContext, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming,
} from "react-native-reanimated";
import { LumaNativeLogo } from "./LumaNativeLogo";
import { Preferences, Text } from "./NativeUI";
import { welcome as w } from "../theme/welcome";

export function NativeAnimatedSplash({ onFinish, autoDismissMs = 1700, ready = true }: {
  onFinish: () => void;
  autoDismissMs?: number;
  ready?: boolean;
}) {
  const { reducedMotion } = useContext(Preferences);
  const [elapsed, setElapsed] = useState(false), [leaving, setLeaving] = useState(false);
  const callback = useRef(onFinish), done = useRef(false);
  const opacity = useSharedValue(1), mark = useSharedValue(0), type = useSharedValue(0), detail = useSharedValue(0);
  useEffect(() => { callback.current = onFinish; }, [onFinish]);
  useEffect(() => {
    if (reducedMotion) { mark.value = 1; type.value = 1; detail.value = 1; }
    else {
      mark.value = withSpring(1, { damping: 22, stiffness: 140 });
      type.value = withDelay(180, withTiming(1, { duration: 420 }));
      detail.value = withDelay(340, withTiming(1, { duration: 380 }));
    }
    const timer = setTimeout(() => setElapsed(true), reducedMotion ? Math.min(autoDismissMs, 650) : autoDismissMs);
    return () => {
      clearTimeout(timer); cancelAnimation(mark); cancelAnimation(type); cancelAnimation(detail);
    };
  }, [reducedMotion, autoDismissMs, mark, type, detail]);
  useEffect(() => {
    if (ready && elapsed) setLeaving(true);
  }, [ready, elapsed]);
  useEffect(() => {
    if (!leaving) return;
    opacity.value = reducedMotion ? 0 : withTiming(0, { duration: 200 });
    const timer = setTimeout(() => {
      if (!done.current) { done.current = true; callback.current(); }
    }, reducedMotion ? 0 : 200);
    return () => { clearTimeout(timer); cancelAnimation(opacity); };
  }, [leaving, reducedMotion, opacity]);
  const container = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const markStyle = useAnimatedStyle(() => ({ opacity: mark.value, transform: [{ scale: reducedMotion ? 1 : 0.9 + mark.value * 0.1 }] }));
  const typeStyle = useAnimatedStyle(() => ({ opacity: type.value, transform: [{ translateY: reducedMotion ? 0 : (1 - type.value) * 12 }] }));
  const detailStyle = useAnimatedStyle(() => ({ opacity: detail.value }));
  return <Animated.View style={[s.overlay, container]} accessibilityViewIsModal>
    <Pressable style={s.touch} accessibilityRole="button" accessibilityLabel="Continue to Luma"
      accessibilityState={{ disabled: !ready }} disabled={!ready} onPress={() => setLeaving(true)}>
      <View style={s.lockup}>
        <Animated.View style={[s.mark, markStyle]}>
          <View style={s.outline} />
          <LumaNativeLogo size={80} showWordmark={false} color={w.forest} accent={w.champagne} />
        </Animated.View>
        <Animated.View style={typeStyle}><Text maxFontSizeMultiplier={1.4} style={s.title}>Luma</Text></Animated.View>
        <Animated.View style={[s.subtitle, detailStyle]}>
          <View style={s.rule} /><Text style={s.tagline}>Make room for memories.</Text>
        </Animated.View>
      </View>
      <Animated.View style={[s.footer, detailStyle]}>
        <Text style={s.caption}>A LIGHTER LIBRARY. A LITTLE MORE YOU.</Text>
        <Text style={s.continue}>{ready ? "Tap to continue" : "Opening your space…"}</Text>
      </Animated.View>
    </Pressable>
  </Animated.View>;
}

const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 9999, backgroundColor: w.ivory },
  touch: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  lockup: { alignItems: "center", marginBottom: 36 },
  mark: { width: 126, height: 140, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  outline: { position: "absolute", width: 118, height: 138, borderWidth: 1, borderColor: "#E1D8C4",
    borderTopLeftRadius: 62, borderTopRightRadius: 62, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    transform: [{ rotate: "-8deg" }] },
  title: { fontFamily: w.serif, fontSize: 72, lineHeight: 89, letterSpacing: -4, color: w.forest },
  subtitle: { alignItems: "center", gap: 18, marginTop: 13 },
  rule: { width: 27, height: 2, backgroundColor: w.champagne },
  tagline: { fontSize: 14, color: w.muted, textAlign: "center" },
  footer: { position: "absolute", bottom: 32, left: 24, right: 24, alignItems: "center", gap: 12 },
  caption: { fontSize: 8, letterSpacing: 1.7, color: w.forest, textAlign: "center" },
  continue: { fontSize: 10, color: w.muted, textAlign: "center" },
});
