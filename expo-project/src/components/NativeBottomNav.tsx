import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import {
  Bookmark,
  ChartNoAxesCombined,
  Settings2,
  Sparkles,
} from "lucide-react-native";
import { colors as c } from "../theme/colors";
import { IconButton, Preferences, Text } from "./NativeUI";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
export type NativeTabType = "clean" | "bookmarks" | "insights" | "settings";
export function NativeBottomNav({
  activeTab,
  onTabChange,
  bookmarkCount,
}: {
  activeTab: NativeTabType;
  onTabChange: (tab: NativeTabType) => void;
  bookmarkCount: number;
}) {
  const { reducedMotion } = useContext(Preferences);
  const [width, setWidth] = useState(0),
    position = useSharedValue(0);
  useEffect(() => {
    const target =
      (["clean", "bookmarks", "insights", "settings"].indexOf(activeTab) *
        width) /
      4;
    position.value = reducedMotion
      ? target
      : withSpring(target, { stiffness: 450, damping: 35 });
  }, [activeTab, width, reducedMotion]);
  const pill = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));
  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width - 24)}
      style={{
        flexDirection: "row",
        backgroundColor: c.card,
        borderTopWidth: 1,
        borderColor: c.border,
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 6,
            bottom: 6,
            left: 12,
            width: width / 4,
            borderRadius: 16,
            backgroundColor: c.lightForest,
          },
          pill,
        ]}
      />
      {(
        [
          { id: "clean", label: "Clean", Icon: Sparkles },
          { id: "bookmarks", label: "Bookmarks", Icon: Bookmark },
          { id: "insights", label: "Insights", Icon: ChartNoAxesCombined },
          { id: "settings", label: "Settings", Icon: Settings2 },
        ] as const
      ).map(({ id, label, Icon }) => (
        <IconButton
          key={id}
          label={label}
          onPress={() => onTabChange(id)}
          style={{
            flex: 1,
            minHeight: 54,
            gap: 2,
            backgroundColor: "transparent",
          }}
        >
          <View>
            <Icon size={20} color={id === activeTab ? c.forest : c.muted} />
            {id === "bookmarks" && bookmarkCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -5,
                  right: -11,
                  borderRadius: 6,
                  backgroundColor: "#ECD391",
                  minWidth: 13,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 8, fontWeight: "800", lineHeight: 12 }}
                >
                  {bookmarkCount > 99 ? "99+" : bookmarkCount}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={{
              fontSize: 10,
              lineHeight: 15,
              fontWeight: "700",
              color: id === activeTab ? c.forest : c.muted,
            }}
          >
            {label}
          </Text>
        </IconButton>
      ))}
    </View>
  );
}
