import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Check,
  Flame,
  HardDrive,
  ShieldCheck,
  Trash2,
} from "lucide-react-native";
import type { LibraryState, MediaItem } from "../core/model";
import { currentStreak, formatBytes, screenshots } from "../core/gallery";
import { Card, Empty, Heading, Screen, Text, ui } from "./NativeUI";
import { colors as c } from "../theme/colors";
export function NativeInsightsScreen({
  library,
  media,
}: {
  library: LibraryState;
  media: MediaItem[];
}) {
  const stats = library.stats,
    streak = currentStreak(stats),
    shots = screenshots(media),
    shotIds = new Set(shots.map((i) => i.id));
  const distribution = [
    {
      name: "Photos",
      count: media.filter((i) => i.mediaType === "photo" && !shotIds.has(i.id))
        .length,
      color: c.emerald,
    },
    {
      name: "Videos",
      count: media.filter((i) => i.mediaType === "video").length,
      color: c.mint,
    },
    { name: "Screenshots", count: shots.length, color: c.coral },
  ];
  const reviewed = media.filter((i) => library.progress[i.id]).length;
  return (
    <Screen>
      <Heading
        eyebrow="Your space, reimagined"
        title="Insights"
        subtitle="Small moments of clarity add up."
      />
      <LinearGradient
        colors={[c.forest, "#1B392E"]}
        style={{ borderRadius: 24, padding: 22, gap: 16 }}
      >
        <View style={ui.between}>
          <View style={ui.row}>
            <Flame size={22} color={c.mint} />
            <Text
              style={{
                color: c.mint,
                fontWeight: "700",
                fontSize: 11,
                letterSpacing: 1,
              }}
            >
              CLEANING STREAK
            </Text>
          </View>
          <Text style={{ color: "#E6ECD9", fontSize: 10 }}>
            Your activity
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 7 }}>
          <Text
            style={{
              fontSize: 46,
              lineHeight: 58,
              color: "white",
              fontWeight: "800",
            }}
          >
            {streak}
          </Text>
          <Text style={{ color: "#DCE6D6", fontSize: 15 }}>
            {streak === 1 ? "day of clarity" : "days of clarity"}
          </Text>
        </View>
        <Text style={{ color: "#DCE6D6", fontSize: 12 }}>
          {streak
            ? "A calmer camera roll, one day at a time."
            : "Finish a review session to start your streak."}
        </Text>
      </LinearGradient>
      <Card>
        <View style={ui.between}>
          <Text style={ui.sectionTitle}>Your gallery at a glance</Text>
          <Text style={{ color: c.emerald, fontWeight: "800" }}>
            {media.length ? Math.round((reviewed / media.length) * 100) : 0}%
          </Text>
        </View>
        <Text style={ui.caption}>
          {reviewed} of {media.length} accessible items reviewed
        </Text>
        <View
          style={{
            flexDirection: "row",
            height: 12,
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: c.border,
          }}
        >
          {distribution.map((i) => (
            <View
              key={i.name}
              style={{ flex: i.count, backgroundColor: i.color }}
            />
          ))}
        </View>
        {distribution.map((i) => (
          <View key={i.name} style={ui.between}>
            <View style={ui.row}>
              <View
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 5,
                  backgroundColor: i.color,
                }}
              />
              <Text style={ui.caption}>{i.name}</Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: "700" }}>{i.count}</Text>
          </View>
        ))}
        <Text style={{ fontSize: 10, color: c.muted }}>
          Separate categories by item count; screenshots are excluded from
          Photos.
        </Text>
      </Card>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {[
          {
            label: "Removed media size",
            value: formatBytes(stats.bytesReclaimed),
            Icon: HardDrive,
            color: c.forest,
          },
          {
            label: "Memories kept",
            value: String(stats.totalKept),
            Icon: Check,
            color: c.emerald,
          },
          {
            label: "Items deleted",
            value: String(stats.totalDeleted),
            Icon: Trash2,
            color: c.coral,
          },
          {
            label: "Sessions completed",
            value: String(stats.totalSessions),
            Icon: ShieldCheck,
            color: "#A47828",
          },
        ].map(({ label, value, Icon, color }) => (
          <Card key={label} style={{ width: "48%", flexGrow: 1, padding: 16 }}>
            <Icon size={20} color={color} />
            <Text style={{ fontSize: 22, lineHeight: 29, fontWeight: "800" }}>
              {value}
            </Text>
            <Text style={ui.caption}>{label}</Text>
          </Card>
        ))}
      </View>
      {!!stats.unknownSizeCount && (
        <Text style={ui.caption}>
          {stats.unknownSizeCount} confirmed deletion(s) had unavailable file
          sizes and are excluded from the media-size total.
        </Text>
      )}
      <View style={{ gap: 12 }}>
        <Text style={ui.sectionTitle}>Recent clarity</Text>
        {stats.cleanupLogs.length ? (
          stats.cleanupLogs.map((log) => (
            <Card key={log.id} style={{ padding: 16 }}>
              <View style={ui.between}>
                <Text numberOfLines={1} style={{ fontWeight: "800", flex: 1 }}>
                  {log.sessionTitle}
                </Text>
                <Text style={[ui.mono, { color: c.muted, fontSize: 10 }]}>
                  {log.date}
                </Text>
              </View>
              <Text style={ui.caption}>
                {log.keptCount} kept · {log.deletedCount} deleted ·{" "}
                {formatBytes(log.bytesReclaimed)}
                {log.unknownSizeCount ? " + unmeasured files" : ""}
              </Text>
            </Card>
          ))
        ) : (
          <Empty
            title="Your story starts here"
            detail="Completed reviews will appear here, including sessions where you keep everything."
          />
        )}
      </View>
      <Text style={[ui.caption, { textAlign: "center" }]}>
        Your personal media and cleanup history stay on this device.
      </Text>
    </Screen>
  );
}
