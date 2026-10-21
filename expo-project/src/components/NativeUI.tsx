import React, { createContext, useContext } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
  StyleProp,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { colors as c } from "../theme/colors";
import { NativeMediaService } from "../services/nativeMediaService";

export const Preferences = createContext({
  hapticsEnabled: true,
  reducedMotion: false,
});
export function Text({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  const fontSize = flat.fontSize ?? 13;
  const weight = Number(flat.fontWeight ?? 400);
  const family =
    weight >= 800
      ? "Jakarta800"
      : weight >= 700
        ? "Jakarta700"
        : weight >= 600
          ? "Jakarta600"
          : weight >= 500
            ? "Jakarta500"
            : "Jakarta400";
  return (
    <RNText
      {...props}
      style={[
        {
          color: c.ink,
          fontSize: 13,
          lineHeight: Math.ceil(fontSize * (fontSize >= 20 ? 1.25 : 1.5)),
        },
        style,
        { fontFamily: flat.fontFamily ?? family, fontWeight: "normal" },
      ]}
    />
  );
}
export function Button({
  title,
  onPress,
  tone = "forest",
  disabled,
  icon,
  style,
  busy,
}: {
  title: string;
  onPress: () => void;
  tone?: "forest" | "cream" | "coral" | "mint" | "white";
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  busy?: boolean;
}) {
  const { hapticsEnabled } = useContext(Preferences);
  const dark = tone === "forest" || tone === "coral";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || busy }}
      disabled={disabled || busy}
      onPress={() => {
        if (hapticsEnabled) void NativeMediaService.triggerHaptic();
        onPress();
      }}
      style={({ pressed }) => [
        ui.button,
        {
          backgroundColor:
            tone === "cream"
              ? c.background
              : tone === "white"
                ? c.card
                : c[tone],
          opacity: disabled || busy ? 0.45 : pressed ? 0.72 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {busy ? <ActivityIndicator color={dark ? "white" : c.forest} /> : icon}
      <Text
        style={{
          color: dark ? "white" : c.forest,
          fontSize: 13,
          fontWeight: "700",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function IconButton({
  label,
  onPress,
  children,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { hapticsEnabled } = useContext(Preferences);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      accessibilityState={{ disabled }}
      hitSlop={4}
      onPress={(event) => {
        event.stopPropagation();
        if (hapticsEnabled) void NativeMediaService.triggerHaptic();
        onPress();
      }}
      style={({ pressed }) => [
        ui.iconButton,
        style,
        { opacity: disabled ? 0.3 : pressed ? 0.55 : 1 },
      ]}
    >
      {children}
    </Pressable>
  );
}
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[ui.card, style]}>{children}</View>;
}
export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={ui.screen}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
export function Heading({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={[ui.row, { alignItems: "flex-start" }]}>
      <View style={{ flex: 1, gap: 4 }}>
        {eyebrow && <Text style={ui.eyebrow}>{eyebrow}</Text>}
        <Text accessibilityRole="header" style={ui.title}>
          {title}
        </Text>
        {subtitle && <Text style={ui.caption}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}
export function Chip({
  title,
  active,
  onPress,
}: {
  title: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 13,
        minHeight: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        backgroundColor: active ? c.forest : c.card,
        opacity: pressed ? 0.65 : 1,
        borderWidth: 1,
        borderColor: active ? c.forest : c.border,
      })}
    >
      <Text
        style={{
          fontWeight: "700",
          fontSize: 11,
          color: active ? "white" : c.muted,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Empty({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <Card style={{ alignItems: "center", gap: 12, paddingVertical: 28 }}>
      <Text style={{ fontSize: 17, fontWeight: "700", textAlign: "center" }}>
        {title}
      </Text>
      <Text style={[ui.caption, { textAlign: "center" }]}>{detail}</Text>
      {action}
    </Card>
  );
}
export function Sheet({
  visible,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets(),
    { height } = useWindowDimensions(),
    { reducedMotion } = useContext(Preferences);
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? "none" : "slide"}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={ui.scrim}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessible={false}
          aria-hidden
          onPress={onClose}
        />
        <View
          accessibilityViewIsModal
          style={[
            ui.sheet,
            {
              maxHeight: height - insets.top - 20,
              paddingBottom: Math.max(12, insets.bottom),
            },
          ]}
        >
          <View
            style={[
              ui.row,
              {
                paddingHorizontal: 20,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderColor: c.border,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                accessibilityRole="header"
                style={{ fontSize: 16, fontWeight: "800" }}
              >
                {title}
              </Text>
              {subtitle && (
                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={ui.caption}
                >
                  {subtitle}
                </Text>
              )}
            </View>
            <IconButton label="Close dialog" onPress={onClose}>
              <X color={c.forest} size={20} />
            </IconButton>
          </View>
          {children}
          {footer && (
            <View
              style={{
                padding: 16,
                paddingBottom: 4,
                gap: 10,
                borderTopWidth: 1,
                borderColor: c.border,
              }}
            >
              {footer}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
export const ui = StyleSheet.create({
  screen: { padding: 16, paddingTop: 10, paddingBottom: 28, gap: 24 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  card: {
    backgroundColor: c.card,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: c.border,
    gap: 12,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  eyebrow: {
    color: c.emerald,
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  caption: { color: c.muted, fontSize: 12, lineHeight: 19 },
  sectionTitle: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  button: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  scrim: {
    flex: 1,
    backgroundColor: "rgba(24,35,31,.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  sheet: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: c.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  mono: { fontFamily: "Mono", fontSize: 11 },
});
