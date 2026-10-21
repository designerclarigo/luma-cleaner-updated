import React, { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { Bookmark, Film, ShieldCheck } from "lucide-react-native";
import type { MediaItem } from "../core/model";
import { bytesLabel, formatBytes } from "../core/gallery";
import { colors as c } from "../theme/colors";
import { Button, Chip, Empty, Heading, IconButton, Text, ui } from "./NativeUI";
import { NativeMedia } from "./NativeMedia";
export function NativeBookmarksScreen({
  items,
  hiddenCount,
  onOpen,
  onToggle,
  onHome,
}: {
  items: MediaItem[];
  hiddenCount: number;
  onOpen: (item: MediaItem) => void;
  onToggle: (id: string) => void;
  onHome: () => void;
}) {
  const [filter, setFilter] = useState("All");
  const filtered = items.filter(
    (i) =>
      filter === "All" ||
      i.mediaType === (filter === "Photos" ? "photo" : "video"),
  );
  return (
    <FlatList
      data={filtered}
      numColumns={2}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{
        padding: 16,
        paddingTop: 10,
        paddingBottom: 28,
        gap: 12,
      }}
      columnWrapperStyle={{ gap: 12 }}
      ListHeaderComponent={
        <View style={{ gap: 18, marginBottom: 8 }}>
          <Heading
            eyebrow="Cherished memories"
            title="Bookmarks"
            subtitle="Your favorites, always within reach."
            right={
              <View
                style={{
                  backgroundColor: "#F4E9CE",
                  borderRadius: 16,
                  padding: 12,
                }}
              >
                <Bookmark color="#9A701F" size={20} />
              </View>
            }
          />
          <View style={ui.between}>
            <View style={ui.row}>
              <ShieldCheck size={14} color="#9A701F" />
              <Text style={{ color: "#86641E", fontSize: 11 }}>
                Protected within Luma
              </Text>
            </View>
            <Text style={ui.caption}>
              {items.length} items · {bytesLabel(items)}
            </Text>
          </View>
          <View style={ui.row}>
            {["All", "Photos", "Videos"].map((f) => (
              <Chip
                key={f}
                title={f}
                active={f === filter}
                onPress={() => setFilter(f)}
              />
            ))}
          </View>
          {hiddenCount > 0 && (
            <Text style={ui.caption}>
              {hiddenCount} saved bookmark(s) are currently unavailable.
              Reconnect your library to view them; saved bookmarks are retained.
            </Text>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={"Preview " + item.filename}
          onPress={() => onOpen(item)}
          style={({ pressed }) => ({
            flex: 1,
            maxWidth: "48.5%",
            aspectRatio: 0.91,
            borderRadius: 24,
            overflow: "hidden",
            backgroundColor: c.card,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <NativeMedia item={item} thumbnail fit="cover" />
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: 10,
              backgroundColor: "rgba(16,24,20,.72)",
            }}
          >
            <Text
              numberOfLines={1}
              style={{ color: "white", fontSize: 11, fontWeight: "700" }}
            >
              {item.filename}
            </Text>
            <Text
              style={{ color: "#E2E6DF", fontSize: 10, fontFamily: "Mono" }}
            >
              {formatBytes(item.fileSize)}
            </Text>
          </View>
          <View style={{ position: "absolute", top: 7, right: 7 }}>
            <IconButton
              label={"Remove bookmark " + item.filename}
              onPress={() => onToggle(item.id)}
              style={{ backgroundColor: "#F3DF9E", borderRadius: 16 }}
            >
              <Bookmark size={17} color="#80601A" fill="#80601A" />
            </IconButton>
          </View>
          {item.mediaType === "video" && (
            <View
              style={[
                ui.row,
                {
                  position: "absolute",
                  top: 12,
                  left: 10,
                  backgroundColor: "#18231F99",
                  borderRadius: 8,
                  padding: 4,
                  gap: 3,
                },
              ]}
            >
              <Film color="white" size={12} />
              <Text style={{ color: "white", fontSize: 9 }}>
                {Math.round(item.duration ?? 0)}s
              </Text>
            </View>
          )}
        </Pressable>
      )}
      ListEmptyComponent={
        <Empty
          title="Room for your favorites"
          detail="Tap the bookmark on a memory while swiping. Luma will keep it out of your deletion queue."
          action={<Button title="Explore your gallery" onPress={onHome} />}
        />
      }
    />
  );
}
