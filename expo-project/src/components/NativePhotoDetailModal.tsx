import React from "react";
import { ScrollView, View } from "react-native";
import { Bookmark, ShieldCheck } from "lucide-react-native";
import type { MediaItem } from "../core/model";
import { formatBytes, formatDate } from "../core/gallery";
import { Button, Sheet, Text, ui } from "./NativeUI";
import { NativeMedia } from "./NativeMedia";
import { colors as c } from "../theme/colors";
export function NativePhotoDetailModal({
  item,
  onClose,
  bookmarked,
  onBookmark,
}: {
  item: MediaItem | null;
  onClose: () => void;
  bookmarked: boolean;
  onBookmark: () => void;
}) {
  return (
    <Sheet
      visible={!!item}
      title={item?.mediaType === "video" ? "Video details" : "Photo details"}
      subtitle={item?.filename}
      onClose={onClose}
      footer={
        <Button
          title={bookmarked ? "Remove bookmark" : "Bookmark this memory"}
          tone={bookmarked ? "cream" : "forest"}
          icon={<Bookmark size={16} color={bookmarked ? c.forest : "white"} />}
          onPress={onBookmark}
        />
      }
    >
      {item && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          <View style={{ height: 260, borderRadius: 20, overflow: "hidden" }}>
            <NativeMedia key={item.id} item={item} />
          </View>
          {[
            ["Filename", item.filename],
            ["Date", formatDate(item.creationTime)],
            [
              "Dimensions",
              item.width && item.height
                ? `${item.width} × ${item.height}`
                : "Unavailable",
            ],
            ["File size", formatBytes(item.fileSize)],
            ["Album", item.albumName || "Photo library"],
            ["Type", item.mediaType === "video" ? "Video" : "Photo"],
          ].map(([key, value]) => (
            <View
              key={key}
              style={[
                ui.between,
                {
                  alignItems: "flex-start",
                  flexDirection: key === "Filename" ? "column" : "row",
                  borderBottomWidth: 1,
                  borderColor: c.border,
                  paddingBottom: 10,
                },
              ]}
            >
              <Text style={ui.caption}>{key}</Text>
              <Text
                selectable
                style={{
                  maxWidth: key === "Filename" ? "100%" : "68%",
                  textAlign: key === "Filename" ? "left" : "right",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {value}
              </Text>
            </View>
          ))}
          {bookmarked && (
            <View style={ui.row}>
              <ShieldCheck size={16} color="#9A701F" />
              <Text style={ui.caption}>
                Protected from Luma’s deletion queue.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </Sheet>
  );
}
