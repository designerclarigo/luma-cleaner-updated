import React, { useEffect, useState } from "react";
import { FlatList, Pressable, ScrollView, View } from "react-native";
import { Check, Info, ShieldCheck } from "lucide-react-native";
import { colors as c } from "../theme/colors";
import type { MediaItem } from "../core/model";
import { bytesLabel, formatBytes, formatDate } from "../core/gallery";
import { Button, IconButton, Sheet, Text, ui } from "./NativeUI";
import { NativeMedia } from "./NativeMedia";
interface Props {
  visible: boolean;
  items: MediaItem[];
  unavailableCount: number;
  error: string;
  demo: boolean;
  busy: boolean;
  deletionUnavailable?: string;
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}
export function NativeReviewSheet({
  visible,
  items,
  unavailableCount,
  error,
  demo,
  busy,
  deletionUnavailable,
  onClose,
  onConfirm,
}: Props) {
  const [selected, setSelected] = useState<string[]>([]),
    [inspected, setInspected] = useState<MediaItem | null>(null);
  const ids = items.map((i) => i.id).join("|");
  useEffect(() => {
    setSelected(items.map((i) => i.id));
  }, [ids]);
  useEffect(() => {
    if (!visible) setInspected(null);
  }, [visible]);
  const close = () => {
    if (!busy) {
      if (inspected) setInspected(null);
      else onClose();
    }
  };
  const footer = inspected ? (
    <Button
      title="Back to deletion review"
      tone="cream"
      onPress={() => setInspected(null)}
    />
  ) : (
    <>
      <Text style={[ui.caption, { textAlign: "center", fontSize: 11 }]}>
        {demo
          ? "Demo simulation only. Your device gallery is untouched."
          : deletionUnavailable ||
            "Your device will ask you to confirm deletion next."}
      </Text>
      <Button
        title="Keep everything"
        tone="cream"
        disabled={busy}
        onPress={() => onConfirm([])}
      />
      <Button
        title={
          demo
            ? `Simulate deletion (${selected.length})`
            : `Delete selected (${selected.length})`
        }
        tone="coral"
        disabled={!selected.length || (!demo && !!deletionUnavailable)}
        busy={busy}
        onPress={() => onConfirm(selected)}
      />
    </>
  );
  return (
    <Sheet
      visible={visible}
      title={inspected ? "Media details" : "Review Marked Deletions"}
      subtitle={
        inspected
          ? inspected.filename
          : `${items.length + unavailableCount} marked items · Nothing deleted yet`
      }
      onClose={close}
      footer={footer}
    >
      {inspected ? (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
          <View style={{ height: 240, borderRadius: 20, overflow: "hidden" }}>
            <NativeMedia item={inspected} />
          </View>
          {[
            ["Filename", inspected.filename],
            ["Date", formatDate(inspected.creationTime)],
            ["File size", formatBytes(inspected.fileSize)],
            ["Album", inspected.albumName],
            ["Dimensions", `${inspected.width} × ${inspected.height}`],
          ].map(([key, value]) => (
            <View key={key} style={ui.between}>
              <Text style={ui.caption}>{key}</Text>
              <Text
                style={{ maxWidth: "68%", textAlign: "right", fontSize: 12 }}
              >
                {value}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
            <View style={ui.between}>
              <View>
                <Text
                  style={{ color: c.coral, fontWeight: "800", fontSize: 15 }}
                >
                  {selected.length} selected
                </Text>
                <Text style={ui.caption}>
                  {bytesLabel(items.filter((i) => selected.includes(i.id)))} to
                  review
                </Text>
              </View>
              <Button
                title={
                  selected.length === items.length
                    ? "Deselect all"
                    : "Select all"
                }
                tone="cream"
                disabled={busy}
                style={{ minHeight: 40, paddingHorizontal: 12 }}
                onPress={() =>
                  setSelected(
                    selected.length === items.length
                      ? []
                      : items.map((i) => i.id),
                  )
                }
              />
            </View>
            <View
              style={[
                ui.row,
                {
                  backgroundColor: "#FFF8E7",
                  padding: 12,
                  borderRadius: 16,
                  alignItems: "flex-start",
                },
              ]}
            >
              <ShieldCheck size={18} color="#94651D" />
              <Text
                style={{
                  flex: 1,
                  color: "#7D602C",
                  fontSize: 11,
                  lineHeight: 18,
                }}
              >
                Take a final look. Unselected memories will be kept. Bookmarked
                items are protected within Luma.
              </Text>
            </View>
            {unavailableCount > 0 && (
              <Text style={ui.caption}>
                {unavailableCount} item(s) are bookmarked or unavailable and
                cannot be submitted for deletion. Continuing keeps them.
              </Text>
            )}
            {!!error && (
              <Text
                accessibilityLiveRegion="assertive"
                style={{ color: c.coral, fontSize: 12 }}
              >
                {error}
              </Text>
            )}
          </View>
          <FlatList
            data={items}
            numColumns={3}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 8 }}
            columnWrapperStyle={{ gap: 8 }}
            renderItem={({ item }) => {
              const active = selected.includes(item.id);
              return (
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: active, disabled: busy }}
                  accessibilityLabel={item.filename}
                  disabled={busy}
                  onPress={() =>
                    setSelected((ids) =>
                      active
                        ? ids.filter((id) => id !== item.id)
                        : [...ids, item.id],
                    )
                  }
                  style={{
                    flex: 1,
                    maxWidth: "32%",
                    aspectRatio: 0.85,
                    borderRadius: 16,
                    overflow: "hidden",
                    borderWidth: 2,
                    borderColor: active ? c.coral : c.border,
                    backgroundColor: c.background,
                  }}
                >
                  <NativeMedia item={item} thumbnail fit="cover" />
                  <View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      top: 5,
                      left: 5,
                      backgroundColor: active ? c.coral : "#FFFFFFDD",
                      borderRadius: 9,
                      width: 18,
                      height: 18,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {active && <Check size={12} color="white" />}
                  </View>
                  <View style={{ position: "absolute", right: 0, top: 0 }}>
                    <IconButton
                      label={"Inspect " + item.filename}
                      disabled={busy}
                      onPress={() => setInspected(item)}
                    >
                      <Info size={17} color="white" fill="#18231F99" />
                    </IconButton>
                  </View>
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: 5,
                      backgroundColor: "#18231FAA",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 8,
                        fontFamily: "Mono",
                      }}
                    >
                      {formatBytes(item.fileSize)}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
        </>
      )}
    </Sheet>
  );
}
