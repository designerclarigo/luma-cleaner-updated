import React, { useContext, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Animated, {
  FadeInRight,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  cancelAnimation,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Coffee,
  Heart,
  Images,
  Info,
  Lock,
  Receipt,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { LumaNativeLogo } from "./LumaNativeLogo";
import { Button, IconButton, Preferences, Text, ui } from "./NativeUI";
import { NativeMediaService } from "../services/nativeMediaService";
import { colors as c } from "../theme/colors";
const scenes = [
  {
    tag: "01. Smart Stack",
    title: "Your memories. Less clutter.",
    subtitle:
      "Find your photos and videos in calm monthly stacks. Start with one collection, at your own pace.",
    footer: "Your originals stay right where they belong.",
  },
  {
    tag: "02. Tactile Swiping",
    title: "Swipe. Keep. Clear.",
    subtitle:
      "Swipe right for memories you love. Swipe left to mark the clutter. Nothing is deleted until you review.",
    footer: "Change your mind? Undo brings your last swipe back.",
  },
  {
    tag: "03. Zero Regrets",
    title: "Make room for what matters.",
    subtitle:
      "A little less clutter. A little more breathing room. Review your marked photos before making space.",
    footer: "Cherished memories stay. Every deletion is your choice.",
  },
  {
    tag: "04. Your Privacy",
    title: "Connect your photo library.",
    subtitle:
      "Allow access to organize your photos and videos. You decide what stays and what goes.",
    footer: "You can change access in your device’s settings at any time.",
  },
];
function PrivacyScene({ height }: { height: number }) {
  const { reducedMotion } = useContext(Preferences);
  const compact = height < 280;
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = reducedMotion
      ? 0
      : withRepeat(
          withTiming(1, {
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true,
        );
    return () => cancelAnimation(pulse);
  }, [reducedMotion]);
  const outerRing = useAnimatedStyle(() => ({
    opacity: 0.3 - pulse.value * 0.16,
    transform: [{ scale: 1 + pulse.value * 0.12 }],
  }));
  const innerRing = useAnimatedStyle(() => ({
    opacity: 0.25 + pulse.value * 0.15,
    transform: [{ scale: 0.96 + pulse.value * 0.08 }],
  }));
  return (
    <LinearGradient
      colors={["#F3F1EB", c.background]}
      style={[privacyStyles.hero, { minHeight: height }]}
    >
      <View style={privacyStyles.badge}>
        <Lock size={11} color={c.forest} />
        <Text style={privacyStyles.badgeText}>ON-DEVICE PRIVACY</Text>
      </View>
      <View
        style={privacyStyles.shieldStage}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View
          style={[privacyStyles.glow, compact && privacyStyles.compactGlow]}
          pointerEvents="none"
        />
        <Animated.View
          style={[
            privacyStyles.ring,
            privacyStyles.outerRing,
            compact && privacyStyles.compactOuterRing,
            outerRing,
          ]}
        />
        <Animated.View
          style={[
            privacyStyles.ring,
            privacyStyles.innerRing,
            compact && privacyStyles.compactInnerRing,
            innerRing,
          ]}
        />
        <View style={[privacyStyles.shield, compact && privacyStyles.compactShield]}>
          <ShieldCheck size={compact ? 38 : 44} strokeWidth={1.7} color={c.emerald} />
        </View>
      </View>
      <View style={privacyStyles.assurances}>
        <View style={privacyStyles.assurance}>
          <Lock size={14} color={c.emerald} />
          <Text style={privacyStyles.assuranceText}>Zero cloud uploads</Text>
        </View>
        <View style={privacyStyles.assurance}>
          <Check size={15} strokeWidth={2} color={c.emerald} />
          <Text style={privacyStyles.assuranceText}>Review before delete</Text>
        </View>
      </View>
    </LinearGradient>
  );
}
function IllustrationCard({
  index,
  spread,
  cleaned,
}: {
  index: number;
  spread: boolean;
  cleaned: boolean;
}) {
  const { reducedMotion } = useContext(Preferences);
  const position = useSharedValue(0),
    gone = useSharedValue(0);
  useEffect(() => {
    position.value = reducedMotion
      ? Number(spread)
      : withSpring(Number(spread), { damping: 16, stiffness: 180 });
    gone.value = reducedMotion
      ? Number(cleaned)
      : withTiming(Number(cleaned), { duration: 550 });
  }, [spread, cleaned, reducedMotion]);
  const animated = useAnimatedStyle(() => ({
    opacity: 0.9 * (1 - gone.value),
    transform: [
      {
        translateX:
          position.value * (index - 1) * 65 + gone.value * (index - 1) * 170,
      },
      {
        translateY:
          (index + 1) * 9 +
          position.value * ((index % 2 ? -35 : 40) - (index + 1) * 9) -
          gone.value * 130,
      },
      {
        rotate: `${(index - 1) * (6 + position.value * 12 + gone.value * 25)}deg`,
      },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 190,
          height: 154,
          borderRadius: 22,
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: c.border,
          padding: 12,
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        },
        animated,
      ]}
    >
      {index === 0 ? (
        <Receipt size={32} color="#A47C2A" />
      ) : index === 1 ? (
        <Coffee size={32} color="#A47C2A" />
      ) : (
        <Camera size={32} color={c.coral} />
      )}
      <Text allowFontScaling={false} style={ui.caption}>
        {["Receipt.png", "MorningRoast.jpg", "Burst_03.jpg"][index]}
      </Text>
    </Animated.View>
  );
}
function Scene({ step, height }: { step: number; height: number }) {
  const { reducedMotion } = useContext(Preferences),
    [spread, setSpread] = useState(false),
    [cleaned, setCleaned] = useState(false),
    [sampleDecision, setSampleDecision] = useState<"keep" | "mark" | null>(null);
  const motion = useSharedValue(0),
    offset = useSharedValue(0);
  useEffect(() => {
    if (!reducedMotion && step === 1)
      motion.value = withRepeat(withTiming(26, { duration: 1600 }), -1, true);
    return () => {
      cancelAnimation(motion);
    };
  }, [step, reducedMotion]);
  const animated = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value + motion.value },
      { rotate: `${(offset.value + motion.value) / 10}deg` },
    ],
  }));
  const pan = Gesture.Pan()
    .enabled(step === 1)
    .activeOffsetX([-12, 12])
    .failOffsetY([-14, 14])
    .onBegin(() => {
      cancelAnimation(motion);
      motion.value = 0;
    })
    .onUpdate((e) => {
      offset.value = e.translationX;
    })
    .onEnd(() => {
      if (Math.abs(offset.value) > 20)
        runOnJS(setSampleDecision)(offset.value > 0 ? "keep" : "mark");
      offset.value = reducedMotion ? 0 : withSpring(0);
    })
    .onFinalize(() => {
      offset.value = reducedMotion ? 0 : withSpring(0);
    });
  const photo =
    step === 0
      ? require("../../assets/onboarding/yosemite.jpg")
      : step === 1
        ? require("../../assets/onboarding/pine-fog.jpg")
        : require("../../assets/onboarding/pacific-cove.jpg");
  if (step === 3) return <PrivacyScene height={height} />;
  return (
    <LinearGradient
      colors={["#F3F1EB", c.background]}
      style={{
        height,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: c.border,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 400"
        style={{ position: "absolute", opacity: 0.15 }}
      >
        <Circle
          cx="200"
          cy="190"
          r="140"
          stroke={c.forest}
          strokeWidth="1.5"
          strokeDasharray="4 8"
          fill="none"
        />
        <Circle
          cx="200"
          cy="190"
          r="90"
          stroke={c.emerald}
          strokeWidth="1"
          fill="none"
        />
      </Svg>
      <View
        style={{
          width: 230,
          height: 230,
          borderRadius: 115,
          backgroundColor: c.lightMint,
          position: "absolute",
          opacity: 0.7,
        }}
      />
      <View
        style={[
          ui.between,
          { position: "absolute", top: 14, left: 18, right: 18 },
        ]}
      >
        <Text
          style={{
            fontSize: 9,
            fontWeight: "800",
            letterSpacing: 0.8,
            color: c.forest,
            backgroundColor: c.mint,
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          {
            [
              "SMART STACK",
              "TACTILE SWIPING",
              "ZERO REGRETS",
              "ON-DEVICE PRIVACY",
            ][step]
          }
        </Text>
        <Text
          style={{
            fontSize: 9,
            color: c.muted,
            backgroundColor: "#FFFFFFCC",
            borderRadius: 12,
            padding: 4,
          }}
        >
          {step === 0
            ? spread
              ? "Camera Roll Chaos"
              : "Organized by Month"
            : step === 1
              ? "Try a gentle swipe"
              : step === 2
                ? "Illustration"
                : "You’re in control"}
        </Text>
      </View>
        <View style={{ width: 260, height: 230, alignItems: "center", justifyContent: "center", transform: [{ scale: Math.min(1, (height - 92) / 230) }] }}
          accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {[0, 1, 2].map((i) => (
            <IllustrationCard
              key={i}
              index={i}
              spread={spread}
              cleaned={cleaned && step === 2}
            />
          ))}
          <GestureDetector gesture={pan}>
            <Animated.View
              style={[
                {
                  width: 224,
                  height: 196,
                  padding: 12,
                  borderRadius: 24,
                  backgroundColor: c.card,
                  borderWidth: 2,
                  borderColor: c.forest,
                  gap: 10,
                  boxShadow: "0 10px 20px #244D3F12",
                },
                step === 1 ? animated : undefined,
              ]}
            >
              <Image
                source={photo}
                style={{ width: "100%", height: 130, borderRadius: 15 }}
                contentFit="contain"
              />
              <View
                style={{
                  position: "absolute",
                  right: 19,
                  top: 20,
                  borderRadius: 12,
                  backgroundColor: c.forest,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Heart size={10} fill={c.mint} color={c.mint} />
                <Text allowFontScaling={false} style={{ color: c.mint, fontSize: 9, fontWeight: "800" }}>
                  Cherished
                </Text>
              </View>
              <View style={ui.between}>
                <Text allowFontScaling={false} style={{ fontSize: 11, fontWeight: "700" }}>
                  {["YosemiteMist.jpg", "PineFog.jpg", "PacificCove.jpg"][step]}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={{ fontFamily: "Mono", fontSize: 10, color: c.emerald }}
                >
                  4.2 MB
                </Text>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>
          <View
            style={{ position: "absolute", bottom: 12, alignSelf: "center" }}
          >
            {step === 1 ? (
              <View style={ui.row}>
                <IconButton
                  label="Try marking sample"
                  onPress={() => {
                    setSampleDecision("mark");
                    if (reducedMotion) return;
                    offset.value = withSpring(-60, {}, () => {
                      offset.value = withSpring(0);
                    });
                  }}
                  style={{ backgroundColor: c.card }}
                >
                  <X size={19} color={c.coral} />
                </IconButton>
                <Text accessibilityLiveRegion="polite" style={{ fontSize: 10, color: c.muted }}>
                  {sampleDecision === "keep" ? "Sample kept" : sampleDecision === "mark" ? "Sample marked" : "Mark ← → Keep"}
                </Text>
                <IconButton
                  label="Try keeping sample"
                  onPress={() => {
                    setSampleDecision("keep");
                    if (reducedMotion) return;
                    offset.value = withSpring(60, {}, () => {
                      offset.value = withSpring(0);
                    });
                  }}
                  style={{ backgroundColor: c.forest }}
                >
                  <Check size={19} color="white" />
                </IconButton>
              </View>
            ) : (
              <Button
                title={
                  step === 0
                    ? spread
                      ? "Tap to organize memories"
                      : "Tap to see clutter spread"
                    : cleaned
                      ? "Reset illustration"
                      : "Simulate cleaning"
                }
                tone="forest"
                icon={<Sparkles size={13} color={c.mint} />}
                onPress={() =>
                  step === 0 ? setSpread(!spread) : setCleaned(!cleaned)
                }
                style={{ minHeight: 32, borderRadius: 18 }}
              />
            )}
          </View>
    </LinearGradient>
  );
}
function StepProgress({ index, step, disabled, onPress }: {
  index: number;
  step: number;
  disabled: boolean;
  onPress: () => void;
}) {
  const { reducedMotion } = useContext(Preferences);
  const filled = useSharedValue(index <= step ? 1 : 0);
  useEffect(() => {
    filled.value = reducedMotion ? Number(index <= step) : withTiming(Number(index <= step), { duration: 220 });
  }, [index, step, reducedMotion, filled]);
  const fillStyle = useAnimatedStyle(() => ({ opacity: filled.value }));
  return <Pressable onPress={onPress} disabled={disabled} hitSlop={{ top: 6, bottom: 6 }}
    accessibilityRole="button" accessibilityLabel={`Introduction ${index + 1} of ${scenes.length}`}
    accessibilityState={{ selected: index === step, disabled }}
    style={{ flex: 1, minHeight: 32, justifyContent: "center" }}>
    <View style={{ height: 4, borderRadius: 2, backgroundColor: c.border, overflow: "hidden" }}>
      <Animated.View style={[{ height: 4, borderRadius: 2, backgroundColor: c.forest }, fillStyle]} />
    </View>
  </Pressable>;
}
export function NativeOnboardingModal({
  visible,
  onComplete,
  onRequestAccess,
}: {
  visible: boolean;
  onComplete: () => void | Promise<void>;
  onRequestAccess?: () => Promise<void>;
}) {
  const [step, setStep] = useState(0),
    [pendingAction, setPendingAction] = useState<"access" | "save" | null>(null),
    [notice, setNotice] = useState("");
  const loading = pendingAction !== null;
  const inFlight = useRef(false), mounted = useRef(true), content = useRef<ScrollView>(null);
  const { height, fontScale } = useWindowDimensions(),
    insets = useSafeAreaInsets(),
    { reducedMotion } = useContext(Preferences);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (visible) {
      setStep(0);
      setNotice("");
    }
  }, [visible]);
  useEffect(() => {
    if (visible) AccessibilityInfo.announceForAccessibility(`Introduction ${step + 1} of ${scenes.length}. ${scenes[step].title}`);
  }, [visible, step]);
  const goTo = (target: number) => {
    if (inFlight.current) return;
    setStep(Math.max(0, Math.min(scenes.length - 1, target)));
    setNotice("");
    content.current?.scrollTo({ y: 0, animated: false });
  };
  const pagePan = Gesture.Pan().enabled(!loading).activeOffsetX([-24, 24]).failOffsetY([-12, 12])
    .onEnd((event) => {
      if (event.translationX < -50 || event.velocityX < -550) runOnJS(goTo)(step + 1);
      else if (event.translationX > 50 || event.velocityX > 550) runOnJS(goTo)(step - 1);
    });
  const finish = async (connect: boolean) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setNotice("");
    setPendingAction(connect ? "access" : "save");
    let accessComplete = !connect;
    try {
      if (connect) {
        if (onRequestAccess) await onRequestAccess();
        else {
          const permission = await NativeMediaService.requestPermissions();
          if (!permission.granted && permission.accessPrivileges !== "limited" && !permission.allowedMediaTypes?.length)
            throw new Error("Photo access wasn’t allowed.");
        }
        accessComplete = true;
        if (mounted.current) setPendingAction("save");
      }
      await onComplete();
    } catch (error) {
      if (mounted.current) setNotice(accessComplete
        ? "Welcome progress couldn’t be saved. Please try again."
        : `${error instanceof Error ? error.message : "Photo access is unavailable."} You can choose Not now and connect your gallery later.`);
    } finally {
      inFlight.current = false;
      if (mounted.current) setPendingAction(null);
    }
  };
  const active = scenes[step];
  const privacy = step === 3;
  return (
    <Modal
      visible={visible}
      animationType={reducedMotion ? "none" : "fade"}
      onRequestClose={() => {
        if (!loading) { if (step > 0) goTo(step - 1); else void finish(false); }
      }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <View
          style={{ flex: 1, maxWidth: 520, alignSelf: "center", width: "100%" }}
        >
          <View
            style={[ui.between, { paddingHorizontal: 24, paddingVertical: 10 }]}
          >
            <LumaNativeLogo size={28} />
            <Button
              title="Skip"
              tone="cream"
              disabled={loading}
              onPress={() => void finish(false)}
              style={{ minHeight: 48, paddingHorizontal: 8 }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 5,
              paddingHorizontal: 24,
              paddingBottom: 2,
            }}
          >
            {scenes.map((_, i) => (
              <StepProgress key={i} index={i} step={step} disabled={loading} onPress={() => goTo(i)} />
            ))}
          </View>
          <ScrollView
            ref={content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: privacy ? 24 : 20,
              paddingTop: privacy ? 16 : 0,
              paddingBottom: privacy ? 20 : 12,
            }}
          >
            <Animated.View
              key={step}
              entering={reducedMotion ? undefined : FadeInRight.duration(260)}
              style={{ gap: privacy ? 20 : 14 }}
            >
              <Scene
                  key={step}
                  step={step}
                height={
                  privacy
                    ? Math.max(
                        244,
                        Math.min(320, (height - insets.top - insets.bottom) * (fontScale > 1.3 ? 0.3 : 0.36)),
                      )
                    : Math.max(
                        240,
                        Math.min(340, height - insets.top - insets.bottom - (fontScale > 1.3 ? 430 : 385)),
                      )
                }
              />
              <GestureDetector gesture={pagePan}>
              <View style={{ paddingHorizontal: 4, gap: 8 }}>
                <Text style={[ui.eyebrow, { fontSize: 10 }]}>{active.tag}</Text>
                <Text
                  accessibilityRole="header"
                  style={
                    privacy
                      ? privacyStyles.title
                      : [ui.title, { fontSize: 26, lineHeight: 33, letterSpacing: -0.8 }]
                  }
                >
                  {privacy ? "Connect your\nphoto library." : active.title}
                </Text>
                <Text
                  style={[
                    ui.caption,
                    privacy ? privacyStyles.subtitle : { fontSize: 13, lineHeight: 21 },
                  ]}
                >
                  {active.subtitle}
                </Text>
              </View>
              </GestureDetector>
              <View
                style={[
                  ui.row,
                  privacy
                    ? privacyStyles.accessNote
                    : {
                        padding: 9,
                        backgroundColor: c.card,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: c.border,
                      },
                ]}
              >
                {privacy ? (
                  <>
                    <View style={privacyStyles.noteIcon}>
                      <Info size={16} color={c.emerald} />
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={{ fontSize: 12, fontWeight: "700" }}>
                        You’re in control
                      </Text>
                      <Text style={privacyStyles.noteText}>{active.footer}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={14} color={c.emerald} />
                    <Text style={{ flex: 1, fontSize: 10, color: c.muted }}>
                      {active.footer}
                    </Text>
                  </>
                )}
              </View>
              {!!notice && (
                <View
                  accessibilityLiveRegion="assertive"
                  style={privacyStyles.notice}
                >
                  <Info size={16} color={c.coral} />
                  <Text style={{ flex: 1, color: c.ink, fontSize: 12 }}>
                    {notice}
                  </Text>
                </View>
              )}
            </Animated.View>
          </ScrollView>
          <View
            style={[
              { paddingHorizontal: 20, paddingBottom: 12, gap: 4 },
              privacy && privacyStyles.actions,
            ]}
          >
            <View style={ui.row}>
              {step > 0 && (
                <IconButton
                  label="Previous onboarding step"
                  disabled={loading}
                  onPress={() => goTo(step - 1)}
                  style={{
                    backgroundColor: c.card,
                    minHeight: privacy ? 56 : 48,
                    width: privacy ? 52 : 48,
                    ...(privacy ? { borderRadius: 18 } : {}),
                    borderWidth: 1,
                    borderColor: c.border,
                  }}
                >
                  <ArrowLeft size={18} color={c.forest} />
                </IconButton>
              )}
              <Button
                title={
                  privacy
                    ? pendingAction
                      ? pendingAction === "access" ? "Connecting…" : "Saving…"
                      : "Connect photo library"
                    : pendingAction ? "Saving…" : "Continue"
                }
                busy={loading}
                onPress={() =>
                  step === 3 ? void finish(true) : goTo(step + 1)
                }
                icon={
                  step === 3 ? (
                    <Images size={18} color="white" />
                  ) : (
                    <ArrowRight size={16} color="white" />
                  )
                }
                style={[
                  { flex: 1 },
                  privacy && {
                    minHeight: 56,
                    borderRadius: 18,
                    outlineColor: c.emerald,
                  },
                ]}
              />
            </View>
            {step === 3 && (
              <Button
                title="Not now"
                disabled={loading}
                tone="cream"
                onPress={() => void finish(false)}
                style={{ minHeight: 44 }}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const privacyStyles = StyleSheet.create({
  hero: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: c.border,
    overflow: "hidden",
    alignItems: "center",
    padding: 18,
    gap: 10,
  },
  glow: {
    position: "absolute",
    width: 214,
    height: 214,
    borderRadius: 107,
    backgroundColor: c.lightMint,
    opacity: 0.6,
  },
  compactGlow: { width: 170, height: 170, borderRadius: 85 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: c.mint,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: c.forest,
  },
  shieldStage: {
    flex: 1,
    width: "100%",
    minHeight: 112,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: { position: "absolute", borderWidth: 1, borderColor: c.emerald },
  outerRing: { width: 168, height: 168, borderRadius: 84 },
  innerRing: { width: 128, height: 128, borderRadius: 64 },
  compactOuterRing: { width: 136, height: 136, borderRadius: 68 },
  compactInnerRing: { width: 104, height: 104, borderRadius: 52 },
  shield: {
    width: 88,
    height: 88,
    borderRadius: 27,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: `${c.forest}26`,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 10px 24px ${c.forest}14`,
  },
  compactShield: { width: 76, height: 76, borderRadius: 24 },
  assurances: { width: "100%", flexDirection: "row", gap: 8 },
  assurance: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: `${c.card}CC`,
    borderRadius: 13,
  },
  assuranceText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    color: c.forest,
  },
  title: {
    fontSize: 30,
    lineHeight: 37,
    fontWeight: "800",
    letterSpacing: -1,
    color: c.ink,
  },
  subtitle: { fontSize: 14, lineHeight: 22 },
  accessNote: {
    padding: 12,
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.card,
  },
  noteIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.lightForest,
  },
  noteText: { fontSize: 11, lineHeight: 17, color: c.muted },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 12,
    backgroundColor: `${c.coral}0D`,
    borderWidth: 1,
    borderColor: `${c.coral}33`,
    borderRadius: 14,
  },
  actions: {
    paddingTop: 12,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
});
