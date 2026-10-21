import React, { useContext, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Check, Flame, Sparkles } from "lucide-react-native";
import type { CleanupLog, Collection } from "../core/model";
import { formatBytes } from "../core/gallery";
import { colors as c } from "../theme/colors";
import { Button, Card, Preferences, Text, ui } from "./NativeUI";
import { Image } from "expo-image";
import { NativeCelebration } from "./NativeCelebration";
export function NativeResultsScreen({
  result,
  streak,
  next,
  demo,
  onNext,
  onHome,
}: {
  result: CleanupLog;
  streak: number;
  next?: Collection;
  demo: boolean;
  onNext: () => void;
  onHome: () => void;
}) {
  const { reducedMotion } = useContext(Preferences),
    [bytes, setBytes] = useState(reducedMotion ? result.bytesReclaimed : 0);
  useEffect(() => {
    if (reducedMotion) {
      setBytes(result.bytesReclaimed);
      return;
    }
    const begin = Date.now();
    const timer = setInterval(() => {
      const t = Math.min(1, (Date.now() - begin) / 800);
      setBytes(Math.round(result.bytesReclaimed * (1 - Math.pow(1 - t, 3))));
      if (t === 1) clearInterval(timer);
    }, 32);
    return () => clearInterval(timer);
  }, [result, reducedMotion]);
  return (
    <View style={{ flex: 1 }}>
      {!!(result.keptCount + result.deletedCount) && <NativeCelebration />}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 24, gap: 20 }}
      >
        <Animated.View
          entering={reducedMotion ? undefined : FadeInDown.duration(350)}
          style={{ alignItems: "center", gap: 12 }}
        >
          <View
            style={{
              backgroundColor: c.card,
              width: 82,
              height: 82,
              borderRadius: 24,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: c.border,
            }}
          >
            <Check size={42} color={c.forest} />
            <View
              style={{
                position: "absolute",
                right: -8,
                top: -8,
                backgroundColor: c.mint,
                padding: 7,
                borderRadius: 14,
              }}
            >
              <Sparkles size={18} color={c.forest} />
            </View>
          </View>
          <Text
            style={{
              backgroundColor: c.lightMint,
              color: c.forest,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              fontSize: 10,
              fontWeight: "800",
              letterSpacing: 1,
            }}
          >
            {result.keptCount + result.deletedCount
              ? "SESSION REVIEWED"
              : "SESSION CLOSED"}
          </Text>
          <Text style={[ui.title, { textAlign: "center" }]}>
            {result.keptCount + result.deletedCount
              ? "Clutter cleared. Memories kept."
              : "No changes made."}
          </Text>
          <Text style={[ui.caption, { textAlign: "center" }]}>
            {result.sessionTitle} ·{" "}
            {demo ? "Sample session complete" : "Session complete"}
          </Text>
        </Animated.View>
        <Card style={{ padding: 16 }}>
          <LinearGradient
            colors={[c.forest, "#1C3A30"]}
            style={{
              borderRadius: 20,
              padding: 20,
              gap: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#DFE8D4", fontSize: 11 }}>
              {demo ? "SIMULATED SPACE RECLAIMED" : "REMOVED MEDIA SIZE"}
            </Text>
            <Text
              style={{
                color: c.mint,
                fontSize: 32,
                lineHeight: 42,
                fontWeight: "800",
              }}
            >
              {formatBytes(bytes)}
            </Text>
            <Text
              style={{ color: "#D9E1D4", textAlign: "center", fontSize: 11 }}
            >
              {result.deletedCount === 0
                ? "No files deleted. Your memories are kept."
                : result.unknownSizeCount
                  ? `${result.unknownSizeCount} deleted item(s) had unavailable sizes and are excluded from this total.`
                  : demo
                    ? "Sample sizes only; no device storage changed."
                    : "Known media sizes from confirmed deletions."}
            </Text>
            {!demo && result.deletedCount > 0 && (
              <Text
                style={{ color: "#D9E1D4", textAlign: "center", fontSize: 11 }}
              >
                Device free space may update later.
              </Text>
            )}
          </LinearGradient>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {[
              ["Memories kept", result.keptCount, c.forest],
              ["Items deleted", result.deletedCount, c.coral],
            ].map(([label, count, color]) => (
              <View
                key={String(label)}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: color === c.coral ? "#FCF1EF" : c.background,
                  gap: 4,
                }}
              >
                <Text
                  style={{
                    color: String(color),
                    fontSize: 24,
                    lineHeight: 30,
                    fontWeight: "800",
                  }}
                >
                  {count}
                </Text>
                <Text style={ui.caption}>{label}</Text>
              </View>
            ))}
          </View>
          <View style={[ui.row, { justifyContent: "center", padding: 8 }]}>
            <Flame size={18} color="#B47A25" />
            <Text style={{ fontWeight: "700", fontSize: 12 }}>
              {streak} {streak === 1 ? "day" : "days"} of clarity
            </Text>
          </View>
        </Card>
        {next && (
          <Card>
            <Text style={ui.eyebrow}>A little more room?</Text>
            <View style={ui.row}>
              <Image
                source={{
                  uri: next.items[0]?.thumbnailUri || next.items[0]?.uri,
                }}
                style={{ width: 52, height: 52, borderRadius: 14 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "800" }}>{next.title}</Text>
                <Text style={ui.caption}>
                  {next.items.length - next.reviewedCount} unreviewed memories
                </Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
      <View
        style={{
          padding: 16,
          gap: 8,
          borderTopWidth: 1,
          borderColor: c.border,
          backgroundColor: c.background,
        }}
      >
        {next && (
          <Button title="Continue to next collection" onPress={onNext} />
        )}
        <Button title="Return to gallery" onPress={onHome} tone="cream" />
      </View>
    </View>
  );
}
