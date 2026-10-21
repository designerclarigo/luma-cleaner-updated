import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { Film, ImageOff } from "lucide-react-native";
import type { MediaItem } from "../core/model";
import { Button, Text, ui } from "./NativeUI";
import { colors as c } from "../theme/colors";

function Video({ item }: { item: MediaItem }) {
  const [attempt, retry] = useState(0);
  return (
    <VideoAttempt key={attempt} item={item} retry={() => retry((n) => n + 1)} />
  );
}
function VideoAttempt({ item, retry }: { item: MediaItem; retry: () => void }) {
  const player = useVideoPlayer(item.uri, (player) => {
    player.loop = false;
  });
  const { status, error } = useEvent(player, "statusChange", {
    status: player.status,
  });
  return (
    <View style={{ flex: 1, backgroundColor: "#101814", width: "100%" }}>
      <VideoView
        player={player}
        style={{ flex: 1 }}
        contentFit="contain"
        nativeControls
        fullscreenOptions={{ enable: true }}
        surfaceType="textureView"
      />
      {status === "loading" && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            inset: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator color={c.mint} />
          <Text style={{ color: "white", marginTop: 8 }}>Loading video…</Text>
        </View>
      )}
      {status === "error" && (
        <View
          style={{
            position: "absolute",
            inset: 0,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            gap: 12,
            backgroundColor: "#101814",
          }}
        >
          <Film color={c.mint} size={30} />
          <Text style={{ color: "white", textAlign: "center" }}>
            This video could not be played.
          </Text>
          <Text style={[ui.caption, { color: "#D6DDD4", textAlign: "center" }]}>
            {error?.message ||
              "Check your connection or photo access and retry."}
          </Text>
          <Button title="Retry video" onPress={retry} tone="mint" />
        </View>
      )}
    </View>
  );
}
export function NativeMedia({
  item,
  thumbnail = false,
  fit = "contain",
}: {
  item: MediaItem;
  thumbnail?: boolean;
  fit?: "contain" | "cover";
}) {
  const [failed, setFailed] = useState(false),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setFailed(false);
    setAttempt(0);
  }, [item.id]);
  if (item.mediaType === "video" && !thumbnail) return <Video item={item} />;
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        backgroundColor: c.background,
        overflow: "hidden",
      }}
    >
      <Image
        key={item.id + "-" + attempt}
        source={{ uri: thumbnail ? item.thumbnailUri || item.uri : item.uri }}
        contentFit={fit}
        contentPosition="center"
        style={{ width: "100%", height: "100%" }}
        transition={120}
        onError={() => setFailed(true)}
        accessibilityLabel={item.filename}
      />
      {failed && (
        <View
          style={{
            position: "absolute",
            inset: 0,
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: 12,
            backgroundColor: c.background,
          }}
        >
          <ImageOff size={24} color={c.muted} />
          {!thumbnail && (
            <>
              <Text style={[ui.caption, { textAlign: "center" }]}>
                Preview unavailable. The original may need to download or photo
                access may have changed.
              </Text>
              <Button
                title="Retry image"
                tone="white"
                onPress={() => {
                  setFailed(false);
                  setAttempt((n) => n + 1);
                }}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
}
