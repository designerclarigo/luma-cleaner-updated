import React, { useContext, useRef, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Bookmark, Check, Info, RotateCcw, X } from "lucide-react-native";
import { colors as c } from "../theme/colors";
import { formatBytes, formatDate } from "../core/gallery";
import type { Decision, MediaItem } from "../core/model";
import { IconButton, Preferences, Text, ui } from "./NativeUI";
import { NativeMedia } from "./NativeMedia";
import { NativeMediaService } from "../services/nativeMediaService";
export function NativeSwipeDeck({
  item,
  next,
  bookmarked,
  canUndo,
  disabled,
  onDecision,
  onUndo,
  onBookmark,
  onInfo,
}: {
  item: MediaItem;
  next: MediaItem[];
  bookmarked: boolean;
  canUndo: boolean;
  disabled: boolean;
  onDecision: (id: string, d: Decision) => boolean;
  onUndo: () => void;
  onBookmark: () => void;
  onInfo: () => void;
}) {
  const { width } = useWindowDimensions(),
    { reducedMotion, hapticsEnabled } = useContext(Preferences);
  const x = useSharedValue(0),
    y = useSharedValue(0),
    locked = useSharedValue(false),
    fired = useRef(false);
  const [notice, setNotice] = useState("");
  const done = (d: Decision) => {
    if (fired.current) return;
    fired.current = true;
    if (onDecision(item.id, d)) {
      if (hapticsEnabled) void NativeMediaService.triggerHaptic();
    } else {
      // A bookmark, permission/save failure or native prompt may have changed
      // during the exit animation. Recenter an uncommitted decision.
      fired.current = false;
      locked.value = false;
      x.value = withSpring(0);
      y.value = withSpring(0);
      setNotice(
        "This memory was not marked. Check saved progress or bookmarks and try again.",
      );
    }
  };
  const protect = () =>
    setNotice(
      "Bookmarked memories are protected. Remove the bookmark before marking this item.",
    );
  const choose = (d: Decision) => {
    if (locked.value || disabled) return;
    if (d === "delete" && bookmarked) {
      protect();
      return;
    }
    locked.value = true;
    x.value = withTiming(
      (d === "keep" ? 1 : -1) * width * 1.5,
      { duration: reducedMotion ? 0 : 220 },
      (finished) => {
        if (finished) runOnJS(done)(d);
      },
    );
  };
  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      if (!locked.value) {
        x.value = e.translationX;
        y.value = e.translationY * 0.25;
      }
    })
    .onEnd((e) => {
      if (locked.value) return;
      const direction = x.value > 0 ? "keep" : "delete";
      if (
        Math.abs(x.value) > Math.min(width * 0.25, 110) ||
        Math.abs(e.velocityX) > 1000
      ) {
        if (direction === "delete" && bookmarked) {
          runOnJS(protect)();
          x.value = withSpring(0);
          y.value = withSpring(0);
          return;
        }
        locked.value = true;
        x.value = withTiming(
          (direction === "keep" ? 1 : -1) * width * 1.5,
          { duration: reducedMotion ? 0 : 200 },
          (finished) => {
            if (finished) runOnJS(done)(direction);
          },
        );
      } else {
        x.value = withSpring(0, { damping: 18 });
        y.value = withSpring(0);
      }
    })
    .onFinalize(() => {
      if (!locked.value) {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      {
        rotate: `${reducedMotion ? 0 : interpolate(x.value, [-width, width], [-12, 12])}deg`,
      },
    ],
  }));
  const keepStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [20, 100], [0, 1], "clamp"),
  }));
  const deleteStyle = useAnimatedStyle(() => ({
    opacity: interpolate(-x.value, [20, 100], [0, 1], "clamp"),
  }));
  return (
    <View style={{ flex: 1, minHeight: 0, gap: 10 }}>
      <View
        style={{
          flex: 1,
          minHeight: 180,
          marginHorizontal: 20,
          marginTop: 6,
          marginBottom: 4,
        }}
      >
        {next
          .slice(0, 2)
          .reverse()
          .map((i, reverseIndex) => {
            const depth = 2 - reverseIndex;
            return (
              <View
                key={i.id}
                pointerEvents="none"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: c.card,
                  transform: [
                    { translateY: depth * 6 },
                    { scale: 1 - depth * 0.035 },
                  ],
                  overflow: "hidden",
                }}
              >
                <NativeMedia item={i} thumbnail fit="contain" />
              </View>
            );
          })}
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              {
                flex: 1,
                backgroundColor: c.card,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: c.border,
                overflow: "hidden",
                boxShadow: "0 8px 22px #18231F12",
              },
              cardStyle,
            ]}
          >
            <View
              style={{
                flex: 1,
                padding: 7,
                borderRadius: 24,
                overflow: "hidden",
              }}
            >
              <NativeMedia key={item.id} item={item} fit="contain" />
              <View
                pointerEvents="none"
                style={[
                  ui.between,
                  { position: "absolute", top: 16, left: 16, right: 16 },
                ]}
              >
                <Text
                  style={{
                    backgroundColor: "#18231FAA",
                    color: "white",
                    borderRadius: 8,
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    fontSize: 10,
                  }}
                >
                  {formatDate(item.creationTime)}
                </Text>
                <Text
                  style={{
                    backgroundColor: "#18231FAA",
                    color: "white",
                    borderRadius: 8,
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    fontSize: 10,
                  }}
                >
                  {formatBytes(item.fileSize)}
                </Text>
              </View>
            </View>
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  top: 65,
                  left: 20,
                  borderWidth: 3,
                  borderColor: c.emerald,
                  borderRadius: 8,
                  padding: 10,
                  transform: [{ rotate: "-12deg" }],
                  backgroundColor: "#FFFFFFEE",
                },
                keepStyle,
              ]}
            >
              <Text
                style={{
                  color: c.emerald,
                  fontSize: 28,
                  lineHeight: 34,
                  fontWeight: "800",
                }}
              >
                KEEP
              </Text>
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  top: 65,
                  right: 20,
                  borderWidth: 3,
                  borderColor: c.coral,
                  borderRadius: 8,
                  padding: 10,
                  transform: [{ rotate: "12deg" }],
                  backgroundColor: "#FFFFFFEE",
                },
                deleteStyle,
              ]}
            >
              <Text
                style={{
                  color: c.coral,
                  fontSize: 28,
                  lineHeight: 34,
                  fontWeight: "800",
                }}
              >
                MARK
              </Text>
            </Animated.View>
            <View
              style={[
                ui.row,
                { paddingLeft: 16, paddingRight: 5, paddingVertical: 8 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 11, fontWeight: "700" }}
                >
                  {item.filename}
                </Text>
                <Text style={{ color: c.muted, fontSize: 10 }}>
                  {item.albumName} ·{" "}
                  {item.width && item.height
                    ? `${item.width} × ${item.height}`
                    : "Dimensions unavailable"}
                </Text>
              </View>
              <IconButton label="Media details" onPress={onInfo}>
                <Info size={19} color={c.forest} />
              </IconButton>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
      <View
        style={{
          alignItems: "center",
          paddingHorizontal: 14,
          paddingBottom: 8,
          gap: 5,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
          }}
        >
          <IconButton
            label="Mark for deletion"
            disabled={disabled}
            onPress={() => choose("delete")}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: "#E9CECA",
            }}
          >
            <X color={c.coral} size={26} />
          </IconButton>
          <IconButton
            label="Undo last swipe"
            disabled={!canUndo || disabled}
            onPress={onUndo}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
            }}
          >
            <RotateCcw color={c.forest} size={20} />
          </IconButton>
          <IconButton
            label={bookmarked ? "Remove bookmark" : "Bookmark memory"}
            disabled={disabled}
            onPress={() => {
              setNotice("");
              onBookmark();
            }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: bookmarked ? "#F3DF9E" : c.card,
              borderWidth: 1,
              borderColor: c.border,
            }}
          >
            <Bookmark
              color="#9A701F"
              fill={bookmarked ? "#9A701F" : "transparent"}
              size={20}
            />
          </IconButton>
          <IconButton
            label="Keep memory"
            disabled={disabled}
            onPress={() => choose("keep")}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: c.forest,
            }}
          >
            <Check color="white" size={27} />
          </IconButton>
        </View>
        <Text
          accessibilityLiveRegion="polite"
          style={{
            color: notice ? c.coral : c.muted,
            fontSize: 10,
            lineHeight: 15,
            textAlign: "center",
            minHeight: 16,
          }}
        >
          {notice || "Swipe left to mark · Right to keep"}
        </Text>
      </View>
    </View>
  );
}
