import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, View, FlatList } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Camera,
  ChevronRight,
  Film,
  Flame,
  HardDrive,
  Layers,
  Shuffle,
  Sparkles,
  Zap,
  History,
} from "lucide-react-native";
import { colors as c } from "../theme/colors";
import {
  bytesLabel,
  burstCandidates,
  collections,
  currentStreak,
  formatBytes,
  onThisDay,
  randomSelection,
  screenshots,
} from "../core/gallery";
import type { Collection, LibraryState, MediaItem } from "../core/model";
import type { GallerySnapshot } from "../services/galleryLibrary";
import { Button, Card, Chip, Empty, Heading, Text, ui } from "./NativeUI";
interface Props {
  media: MediaItem[];
  library: LibraryState;
  gallery: GallerySnapshot;
  name: string;
  albums: Collection[];
  albumError: string;
  disk: { total: number; free: number } | null;
  onStart: (items: MediaItem[], title: string, key?: string) => void;
  onResume: () => void;
  onAccess: () => void;
  onRefresh: () => void;
}
export function NativeHomeScreen({
  media,
  library,
  gallery,
  name,
  albums,
  albumError,
  disk,
  onStart,
  onResume,
  onAccess,
  onRefresh,
}: Props) {
  const [tab, setTab] = useState("months"),
    [filter, setFilter] = useState("All");
  const listRef = useRef<FlatList<Collection>>(null);
  const scrollOffset = useRef(0),
    restoreOffset = useRef<number | null>(null);
  const switchCollectionTab = (next: string) => {
    if (next === tab) return;
    restoreOffset.current = scrollOffset.current;
    setTab(next);
  };
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [gallery.mode]);
  const months = useMemo(() => collections(media, library), [media, library]);
  const shots = screenshots(media),
    bursts = burstCandidates(media),
    videos = media.filter((i) => i.mediaType === "video");
  const review = media.filter(
    (i) => i.mediaType === "photo" && /blur|burst|motion/i.test(i.filename),
  );
  const candidates = [
    ...new Map(
      [...shots, ...bursts, ...videos, ...review].map((i) => [i.id, i]),
    ).values(),
  ];
  const list = (tab === "months" ? months : albums).filter(
    (i) =>
      filter === "All" ||
      (filter === "Completed" ? i.isCompleted : !i.isCompleted),
  );
  const start = (items: MediaItem[], title: string, key?: string) => {
    const fresh = items.filter((i) => !library.progress[i.id]);
    onStart(fresh.length ? fresh : items, title, key);
  };
  const streak = currentStreak(library.stats),
    flashback = onThisDay(media),
    shotIds = new Set(shots.map((i) => i.id));
  const photos = media.filter(
    (i) => i.mediaType === "photo" && !shotIds.has(i.id),
  );
  const row = (group: Collection) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={"Clean " + group.title}
      onPress={() => start(group.items, group.title, group.key)}
      style={({ pressed }) => [
        ui.card,
        ui.row,
        { padding: 14, opacity: pressed ? 0.65 : 1 },
      ]}
    >
      <View style={{ width: 60, height: 60 }}>
        <View
          style={{
            position: "absolute",
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: c.lightMint,
            transform: [{ rotate: "9deg" }],
            left: 5,
            top: 1,
          }}
        />
        <Image
          source={{ uri: group.items[0]?.thumbnailUri || group.items[0]?.uri }}
          contentFit="cover"
          style={{ width: 56, height: 56, borderRadius: 14 }}
        />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ fontWeight: "800", fontSize: 14 }}>{group.title}</Text>
        <Text style={ui.caption}>
          {group.items.length} items · {bytesLabel(group.items)}
        </Text>
        <View
          style={{
            height: 3,
            backgroundColor: c.border,
            borderRadius: 2,
            marginTop: 4,
          }}
        >
          <View
            style={{
              height: 3,
              borderRadius: 2,
              backgroundColor: c.emerald,
              width: `${group.items.length ? (group.reviewedCount / group.items.length) * 100 : 0}%`,
            }}
          />
        </View>
        {group.isCompleted && (
          <Text style={{ fontSize: 10, color: c.emerald, fontWeight: "700" }}>
            ✓ Completed
          </Text>
        )}
      </View>
      <ChevronRight size={18} color={c.forest} />
    </Pressable>
  );
  return (
    <FlatList
      ref={listRef}
      key={tab}
      data={list}
      numColumns={tab === "albums" ? 2 : 1}
      columnWrapperStyle={tab === "albums" ? { gap: 10 } : undefined}
      keyExtractor={(item) => item.key}
      contentContainerStyle={{
        padding: 16,
        paddingTop: 10,
        paddingBottom: 28,
        gap: 10,
      }}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={(event) => {
        scrollOffset.current = event.nativeEvent.contentOffset.y;
      }}
      onContentSizeChange={() => {
        if (restoreOffset.current !== null) {
          listRef.current?.scrollToOffset({
            offset: restoreOffset.current,
            animated: false,
          });
          restoreOffset.current = null;
        }
      }}
      ListHeaderComponent={
        <View style={{ gap: 24, marginBottom: 12 }}>
          <Heading
            eyebrow="Gallery optimizer"
            title={
              "Hello, " +
              (name === "Gallery Curator" ? "Curator" : name.split(" ")[0]) +
              "."
            }
            subtitle="A little clarity for your camera roll."
            right={
              <View
                style={{
                  backgroundColor: "#FFF5DE",
                  padding: 8,
                  borderRadius: 14,
                  flexDirection: "row",
                  gap: 3,
                }}
              >
                <Flame size={14} color="#B37922" />
                <Text
                  style={{ color: "#94651D", fontWeight: "700", fontSize: 11 }}
                >
                  {streak} {streak === 1 ? "day" : "days"}
                </Text>
              </View>
            }
          />
          <View style={ui.between}>
            <Text style={[ui.caption, { fontWeight: "600" }]}>
              {media.length} media items ·{" "}
              {gallery.limited
                  ? "Selected photos"
                  : "Your library"}
            </Text>
            <Pressable
              onPress={onRefresh}
              disabled={gallery.refreshing}
              accessibilityState={{
                disabled: gallery.refreshing,
                busy: gallery.refreshing,
              }}
              accessibilityRole="button"
              style={{ minHeight: 40, justifyContent: "center" }}
            >
              <Text
                style={{ color: c.forest, fontSize: 12, fontWeight: "700" }}
              >
                {gallery.refreshing ? "Refreshing…" : "Refresh"}
              </Text>
            </Pressable>
          </View>
          {(gallery.status !== "ready" || gallery.message) && (
              <Card style={{ backgroundColor: c.lightMint }}>
                <Text style={{ fontWeight: "700" }}>
                  {gallery.status === "loading"
                    ? "Connecting your library…"
                    : gallery.limited
                      ? "Selected photo access"
                      : "Your gallery, on your terms"}
                </Text>
                <Text style={ui.caption}>{gallery.message}</Text>
                {gallery.status !== "loading" && !gallery.refreshing && (
                  <>
                    <Button
                      title={
                        gallery.status === "unsupported"
                          ? "Use the native app"
                          : gallery.limited
                          ? "Manage selected photos"
                          : !gallery.canAskAgain && !gallery.granted
                            ? "Open device Settings"
                            : gallery.status === "error" ||
                                gallery.status === "empty"
                              ? "Retry gallery"
                              : gallery.granted
                                ? "Manage photo access"
                                : "Connect gallery"
                      }
                      onPress={
                        !gallery.limited && (gallery.status === "error" || gallery.status === "empty")
                          ? onRefresh
                          : onAccess
                      }
                    />
                  </>
                )}
              </Card>
            )}
          <LinearGradient
            colors={["#1E3B31", c.forest, c.ink]}
            style={{
              borderRadius: 24,
              padding: 20,
              gap: 20,
              overflow: "hidden",
            }}
          >
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: -55,
                right: -25,
                width: 180,
                height: 180,
                borderRadius: 90,
                backgroundColor: "rgba(220,232,176,.08)",
              }}
            />
            <View style={ui.between}>
              <View style={[ui.row, { flex: 1 }]}>
                <View
                  style={{
                    padding: 10,
                    backgroundColor: "#ffffff12",
                    borderRadius: 14,
                  }}
                >
                  <HardDrive size={20} color={c.mint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#E5EBDF", fontSize: 11 }}>
                    Device Storage
                  </Text>
                  <Text
                    style={{ color: "white", fontWeight: "800", fontSize: 14 }}
                  >
                    {disk
                      ? `${Math.round(((disk.total - disk.free) / disk.total) * 100)}% Used`
                      : "Photo library"}
                  </Text>
                  <Text style={{ color: "#D0DCD0", fontSize: 10 }}>
                    {disk
                      ? formatBytes(disk.total) + " total"
                      : media.length + " accessible items"}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  backgroundColor: "#ffffff16",
                  borderWidth: 1,
                  borderColor: "#ffffff20",
                  borderRadius: 12,
                  padding: 9,
                }}
              >
                <Text style={{ fontSize: 9, color: c.mint, fontWeight: "800" }}>
                  REVIEWED
                </Text>
                <Text
                  style={{
                    color: "white",
                    textAlign: "right",
                    fontSize: 16,
                    fontWeight: "800",
                  }}
                >
                  {media.length
                    ? Math.round(
                        (media.filter((i) => library.progress[i.id]).length /
                          media.length) *
                          100,
                      )
                    : 0}
                  %
                </Text>
              </View>
            </View>
            <View
              style={{
                gap: 10,
                borderTopWidth: 1,
                borderColor: "#ffffff16",
                paddingTop: 16,
              }}
            >
              <View style={ui.between}>
                <Text
                  style={{ color: "#DAE6DC", fontSize: 12, fontWeight: "600" }}
                >
                  Media Storage Breakdown
                </Text>
                <Text style={[ui.mono, { color: "white", fontSize: 10 }]}>
                  {bytesLabel(media)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  height: 8,
                  borderRadius: 8,
                  overflow: "hidden",
                  backgroundColor: "#ffffff15",
                }}
              >
                {[
                  [photos.length, c.emerald],
                  [videos.length, c.mint],
                  [shots.length, c.coral],
                ].map(([n, color], i) => (
                  <View
                    key={i}
                    style={{ flex: Number(n), backgroundColor: String(color) }}
                  />
                ))}
              </View>
              <View style={[ui.between, { flexWrap: "wrap" }]}>
                {[
                  [`Photos (${photos.length})`, c.emerald],
                  [`Videos (${videos.length})`, c.mint],
                  [`Screenshots (${shots.length})`, c.coral],
                ].map(([t, color]) => (
                  <View
                    key={t}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 4,
                        backgroundColor: color,
                      }}
                    />
                    <Text style={{ color: "#DAE6DC", fontSize: 9 }}>{t}</Text>
                  </View>
                ))}
              </View>
              <Text style={{ color: "#C2D0C4", fontSize: 10 }}>
                Distribution by item count
              </Text>
            </View>
            <View
              style={[
                ui.between,
                { borderTopWidth: 1, borderColor: "#ffffff16", paddingTop: 16 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#DAE6DC", fontSize: 11 }}>
                  Ready for your review
                </Text>
                <Text
                  style={{ color: c.mint, fontSize: 20, fontWeight: "800" }}
                >
                  {candidates.length} candidates
                </Text>
              </View>
              <Button
                title="Smart Clean"
                icon={<Zap size={15} color={c.forest} />}
                tone="mint"
                disabled={!candidates.length}
                onPress={() => start(candidates, "Smart Clean")}
                style={{ minHeight: 44, paddingHorizontal: 14 }}
              />
            </View>
          </LinearGradient>
          <View style={{ gap: 10 }}>
            <Text style={ui.sectionTitle}>Smart Categories</Text>
            <Text style={ui.caption}>
              Helpful groups for a closer look. You decide what stays.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {[
                {
                  title: "Similar & Bursts",
                  items: bursts,
                  Icon: Layers,
                  tint: c.lightMint,
                  color: c.forest,
                  hint: "Timestamp candidates",
                },
                {
                  title: "Screenshots",
                  items: shots,
                  Icon: Camera,
                  tint: "#FFF8E8",
                  color: "#AF6E20",
                  hint: bytesLabel(shots),
                },
                {
                  title: "Large Videos",
                  items: [...videos].sort(
                    (a, b) => (b.fileSize ?? 0) - (a.fileSize ?? 0),
                  ),
                  Icon: Film,
                  tint: "#EDF5FF",
                  color: "#4B6CAD",
                  hint: bytesLabel(videos),
                },
                {
                  title: "Review & Bursts",
                  items: review,
                  Icon: Sparkles,
                  tint: "#FCF0EE",
                  color: c.coral,
                  hint: "Review manually",
                },
              ].map(({ title, items, Icon, tint, color, hint }) => (
                <Pressable
                  key={title}
                  accessibilityRole="button"
                  accessibilityLabel={title}
                  onPress={() => start(items, title)}
                  style={({ pressed }) => [
                    ui.card,
                    {
                      width: "48%",
                      flexGrow: 1,
                      padding: 14,
                      gap: 10,
                      opacity: pressed ? 0.65 : 1,
                    },
                  ]}
                >
                  <View style={ui.between}>
                    <View
                      style={{
                        backgroundColor: tint,
                        padding: 9,
                        borderRadius: 14,
                      }}
                    >
                      <Icon size={20} color={color} />
                    </View>
                    <Text
                      style={{
                        color,
                        backgroundColor: tint,
                        fontSize: 10,
                        fontWeight: "700",
                        paddingHorizontal: 5,
                        borderRadius: 6,
                      }}
                    >
                      {items.length} items
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontWeight: "800", fontSize: 12 }}>
                      {title}
                    </Text>
                    <Text style={[ui.caption, { fontSize: 11 }]}>{hint}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
          {library.session && (
            <Card
              style={{ borderColor: "#B6C7B3", backgroundColor: "#F0F3E8" }}
            >
              <View style={ui.row}>
                <History size={20} color={c.forest} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "800" }}>Continue Cleaning</Text>
                  <Text style={ui.caption}>
                    {library.session.title} ·{" "}
                    {Object.keys(library.session.decisions).length} reviewed
                  </Text>
                </View>
              </View>
              <Button title="Resume session" onPress={onResume} />
            </Card>
          )}
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Chip
                title="Month Stacks"
                active={tab === "months"}
                onPress={() => switchCollectionTab("months")}
              />
              <Chip
                title={"Albums (" + albums.length + ")"}
                active={tab === "albums"}
                onPress={() => switchCollectionTab("albums")}
              />
            </View>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {["All", "Uncleaned", "Completed"].map((i) => (
                <Chip
                  key={i}
                  title={i}
                  active={filter === i}
                  onPress={() => setFilter(i)}
                />
              ))}
            </View>
            {tab === "albums" && !!albumError && (
              <Text style={[ui.caption, { color: c.coral }]}>{albumError}</Text>
            )}
          </View>
        </View>
      }
      renderItem={({ item }) =>
        tab === "months" ? (
          row(item)
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={"Clean " + item.title}
            onPress={() => start(item.items, item.title, item.key)}
            style={({ pressed }) => ({
              flex: 1,
              maxWidth: "49%",
              borderRadius: 24,
              overflow: "hidden",
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <View style={{ aspectRatio: 4 / 3 }}>
              <Image
                source={{
                  uri: item.items[0]?.thumbnailUri || item.items[0]?.uri,
                }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
              <Text
                style={{
                  position: "absolute",
                  right: 8,
                  bottom: 8,
                  backgroundColor: "#18231FAA",
                  color: "white",
                  fontSize: 10,
                  paddingHorizontal: 7,
                  borderRadius: 8,
                }}
              >
                {item.items.length} items
              </Text>
            </View>
            <View style={{ padding: 12, gap: 3 }}>
              <Text
                numberOfLines={1}
                style={{ fontWeight: "800", fontSize: 13 }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: item.isCompleted ? c.emerald : c.muted,
                }}
              >
                {item.isCompleted
                  ? "✓ Completed"
                  : `${item.reviewedCount} reviewed`}{" "}
                · {bytesLabel(item.items)}
              </Text>
            </View>
          </Pressable>
        )
      }
      ListEmptyComponent={
        <Empty
          title={
            gallery.status === "loading"
              ? "Loading collections…"
              : "No collections here yet"
          }
          detail={
            filter === "Completed"
              ? "Completed collections appear here after you review their media."
              : "Connect your photo library to see your photos and videos."
          }
        />
      }
      ListFooterComponent={
        media.length ? (
          <View style={{ gap: 12, marginTop: 16 }}>
            <Card>
              <View style={ui.row}>
                <Shuffle size={22} color={c.forest} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "800" }}>
                    A little daily clarity
                  </Text>
                  <Text style={ui.caption}>
                    Review a fresh handful of memories.
                  </Text>
                </View>
              </View>
              <Button
                title="Shuffle 15 memories"
                tone="cream"
                onPress={() => start(randomSelection(media), "Daily Mix")}
              />
            </Card>
            {!!flashback.length && (
              <Button
                title="On this day · Rediscover memories"
                tone="white"
                onPress={() => start(flashback, "On This Day")}
              />
            )}
            <Text style={[ui.caption, { textAlign: "center", fontSize: 11 }]}>
              Marked media stays in your gallery until you review and confirm.
            </Text>
          </View>
        ) : null
      }
    />
  );
}
