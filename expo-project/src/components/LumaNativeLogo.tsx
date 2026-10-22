import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './NativeUI';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';

interface LumaNativeLogoProps {
  size?: number;
  showWordmark?: boolean;
  color?: string;
  accent?: string;
}

export const LumaNativeLogo: React.FC<LumaNativeLogoProps> = ({
  size = 32,
  showWordmark = true,
  color = colors.forest,
  accent,
}) => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        {/* Ambient glow in background */}
        <Circle cx="28" cy="18" r="14" fill={accent ?? colors.mint} fillOpacity={accent ? 0.25 : 0.35} />

        {/* Minimal rounded photo frame with intentional opening in the top-right */}
        <Path
          d="M 28 6 H 14 C 9.58 6 6 9.58 6 14 V 34 C 6 38.42 9.58 42 14 42 H 34 C 38.42 42 42 38.42 42 34 V 20"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Light opening accent: soft angled ray of light emerging from the frame aperture */}
        <Path
          d="M 28 6 L 42 20"
          stroke={accent ?? colors.emerald}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="1 5"
        />

        {/* Interior focal point - subtle serene circle representing memory / lens */}
        <Circle cx="22" cy="26" r="6" stroke={color} strokeWidth="2.5" />
        <Circle cx="24" cy="24" r="2.5" fill={accent ?? colors.emerald} />
      </Svg>

      {showWordmark && (
        <View style={styles.textContainer}>
          <Text style={styles.title}>Luma</Text>
          <Text style={styles.subtitle}>Gallery Cleaner</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.4,
    lineHeight: 19,
  },
  subtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
