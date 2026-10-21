import React, { useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { Sparkles, ShieldCheck } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { Preferences, Text } from './NativeUI';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NativeAnimatedSplashProps {
  onFinish: () => void;
  autoDismissMs?: number;
}

export const NativeAnimatedSplash: React.FC<NativeAnimatedSplashProps> = ({
  onFinish,
  autoDismissMs = 2400,
}) => {
  const { reducedMotion } = useContext(Preferences);
  const containerOpacity = useSharedValue(1);
  const containerScale = useSharedValue(1);

  // Logo Animation Shared Values
  const haloScale = useSharedValue(0.6);
  const haloOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const flareOpacity = useSharedValue(0);
  const flareScale = useSharedValue(0.2);

  // Typography Shared Values
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(18);
  const subtitleOpacity = useSharedValue(0);
  const badgeOpacity = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      haloScale.value = 1; haloOpacity.value = .5; logoScale.value = 1; logoOpacity.value = 1;
      flareScale.value = 1; flareOpacity.value = 1; titleOpacity.value = 1;
      titleTranslateY.value = 0; subtitleOpacity.value = 1; badgeOpacity.value = 1;
      const timer = setTimeout(onFinish, autoDismissMs);
      return () => clearTimeout(timer);
    }
    // 1. Halo bloom
    haloScale.value = withTiming(1.2, { duration: 900 });
    haloOpacity.value = withTiming(0.65, { duration: 800 });

    // 2. Logo spring reveal
    logoOpacity.value = withTiming(1, { duration: 400 });
    logoScale.value = withSpring(1, { damping: 14, stiffness: 160 });

    // 3. Aperture flare beam
    flareOpacity.value = withDelay(
      500,
      withSequence(
        withTiming(1, { duration: 250 }),
        withTiming(0.4, { duration: 500 })
      )
    );
    flareScale.value = withDelay(
      500,
      withSpring(1, { damping: 12, stiffness: 180 })
    );

    // 4. Staggered typography
    titleOpacity.value = withDelay(700, withTiming(1, { duration: 450 }));
    titleTranslateY.value = withDelay(700, withSpring(0, { damping: 15, stiffness: 160 }));

    subtitleOpacity.value = withDelay(950, withTiming(1, { duration: 400 }));
    badgeOpacity.value = withDelay(1150, withTiming(1, { duration: 400 }));

    // 5. Auto dismiss transition
    const timer = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 350 }, () => {
        runOnJS(onFinish)();
      });
      containerScale.value = withTiming(1.04, { duration: 350 });
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, []);

  const handleSkip = () => {
    containerOpacity.value = withTiming(0, { duration: 180 }, () => {
      runOnJS(onFinish)();
    });
  };

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const haloAnimatedStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value,
    transform: [{ scale: haloScale.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const flareAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flareOpacity.value,
    transform: [{ scale: flareScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
  }));

  return (
    <Pressable style={styles.touchable} onPress={handleSkip}>
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
        {/* Soft Organic Background Aura */}
        <Animated.View style={[styles.halo, haloAnimatedStyle]} />

        {/* Brand Lockup */}
        <View style={styles.lockup}>
          {/* Logo Badge */}
          <Animated.View style={[styles.logoCard, logoAnimatedStyle]}>
            <Svg width={96} height={96} viewBox="0 0 48 48" fill="none">
              {/* Subtle ambient circle */}
              <Circle cx="28" cy="18" r="14" fill="#DCE8B0" fillOpacity={0.38} />

              {/* Main continuous camera frame with top-right light opening */}
              <Path
                d="M 28 6 H 14 C 9.58 6 6 9.58 6 14 V 34 C 6 38.42 9.58 42 14 42 H 34 C 38.42 42 42 38.42 42 34 V 20"
                stroke={colors.forest}
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Light aperture ray */}
              <Path
                d="M 28 6 L 42 20"
                stroke={colors.emerald}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="1 5"
              />

              {/* Inner memory lens */}
              <Circle
                cx="22"
                cy="26"
                r="6"
                stroke={colors.forest}
                strokeWidth={2.5}
              />
              <Circle cx="24" cy="24" r="2.5" fill={colors.emerald} />
            </Svg>

            {/* Aperture lens flare gleam */}
            <Animated.View style={[styles.flare, flareAnimatedStyle]}>
              <Sparkles size={16} color="#DCE8B0" />
            </Animated.View>
          </Animated.View>

          {/* Brand Wordmark */}
          <Animated.View style={[styles.titleBox, titleAnimatedStyle]}>
            <Text style={styles.brandTitle}>Luma</Text>
          </Animated.View>

          {/* Tagline */}
          <Animated.View style={[styles.subtitleBox, subtitleAnimatedStyle]}>
            <Text style={styles.brandSubtitle}>Make room for memories</Text>
          </Animated.View>

          {/* Privacy Pill Badge */}
          <Animated.View style={[styles.badge, badgeAnimatedStyle]}>
            <ShieldCheck size={13} color={colors.forest} />
            <Text style={styles.badgeText}>Gallery Cleaner · 100% Private</Text>
          </Animated.View>
        </View>

        {/* Bottom Skip Indicator */}
        <View style={styles.footer}>
          <Text style={styles.skipNote}>Tap anywhere to skip</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  touchable: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: (SCREEN_WIDTH * 0.9) / 2,
    backgroundColor: 'rgba(220, 232, 176, 0.45)',
  },
  lockup: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoCard: {
    width: 120,
    height: 120,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E9E2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#18231F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 24,
  },
  flare: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  titleBox: {
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -1,
  },
  subtitleBox: {
    marginBottom: 20,
  },
  brandSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.muted,
    letterSpacing: 0.3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#EDF4EE',
    borderWidth: 1,
    borderColor: 'rgba(45, 128, 96, 0.25)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.forest,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  skipNote: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
