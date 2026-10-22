import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AccessibilityInfo,
  AppState,
  BackHandler,
  Linking,
  Platform,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react-native";
import { NativeAnimatedSplash } from "../src/components/NativeAnimatedSplash";
import { NativeOnboardingModal } from "../src/components/NativeOnboardingModal";
import { NativeHeader } from "../src/components/NativeHeader";
import {
  NativeBottomNav,
  NativeTabType,
} from "../src/components/NativeBottomNav";
import { NativeHomeScreen } from "../src/components/NativeHomeScreen";
import { NativeBookmarksScreen } from "../src/components/NativeBookmarksScreen";
import { NativeInsightsScreen } from "../src/components/NativeInsightsScreen";
import { NativeSettingsScreen } from "../src/components/NativeSettingsScreen";
import { NativeSwipeDeck } from "../src/components/NativeSwipeDeck";
import { NativePhotoDetailModal } from "../src/components/NativePhotoDetailModal";
import { NativeReviewSheet } from "../src/components/NativeReviewSheet";
import { NativeResultsScreen } from "../src/components/NativeResultsScreen";
import {
  Button,
  Card,
  Empty,
  IconButton,
  Preferences,
  Screen,
  Sheet,
  Text,
  ui,
} from "../src/components/NativeUI";
import { colors as c } from "../src/theme/colors";
import { NativeMediaService } from "../src/services/nativeMediaService";
import { GalleryLibrary } from "../src/services/galleryLibrary";
import { GalleryRefreshQueue } from "../src/services/galleryRefresh";
import { LumaStore } from "../src/core/store";
import { StateRepository } from "../src/core/persistence";
import { collections, currentStreak, pendingIds } from "../src/core/gallery";
import type { Collection, MediaItem } from "../src/core/model";

const repository = new StateRepository(AsyncStorage);
const store = new LumaStore(repository, (items) =>
  NativeMediaService.deleteAssets(items),
);
const galleryController = new GalleryLibrary(
  NativeMediaService,
  Platform.OS,
);
export default function LumaApp() {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot),
    gallery = useSyncExternalStore(
      galleryController.subscribe,
      galleryController.getSnapshot,
    );
  const { saved, ready, busy, result } = state,
    library = saved[saved.mode],
    session = library.session;
  const [splash, setSplash] = useState(true),
    [onboard, setOnboard] = useState(false),
    [tab, setTab] = useState<NativeTabType>("clean");
  const [sessionOpen, setSessionOpen] = useState(false),
    [review, setReview] = useState(false),
    [detail, setDetail] = useState<MediaItem | null>(null);
  const [reviewError, setReviewError] = useState("");
  const [importing, setImporting] = useState(false),
    [message, setMessage] = useState<{ title: string; body: string } | null>(
      null,
    );
  const [replacement, setReplacement] = useState<{
    items: MediaItem[];
    title: string;
    key?: string;
  } | null>(null);
  const [albumRows, setAlbumRows] = useState<
      { id: string; title: string; ids: string[] }[]
    >([]),
    [albumError, setAlbumError] = useState("");
  const [systemReduced, setSystemReduced] = useState(false),
    autoReview = useRef("");
  const requestingAccess = useRef(false);
  const accessInFlight = useRef(false);
  const media: MediaItem[] = useMemo(
    () =>
      gallery.mode === saved.mode
        ? gallery.media
            .filter((i) => library.progress[i.id] !== "delete")
            .map((i) => ({
              ...i,
              source: saved.mode,
              albumName:
                i.albumName ||
                albumRows.find((a) => a.ids.includes(i.id))?.title ||
                "Photo library",
            }))
        : [],
    [gallery.media, gallery.mode, saved.mode, library.progress, albumRows],
  );
  const albumCollections: Collection[] = useMemo(
    () =>
      albumRows
            .map((album) => {
              const ids = new Set(album.ids),
                items = media.filter((i) => ids.has(i.id)),
                reviewedCount = items.filter(
                  (i) => library.progress[i.id] || session?.decisions[i.id],
                ).length;
              return {
                key: album.id,
                title: album.title,
                items,
                reviewedCount,
                isCompleted: !!items.length && reviewedCount === items.length,
                totalBytes: items.reduce((n, i) => n + (i.fileSize ?? 0), 0),
                unknownSizes: items.filter((i) => i.fileSize === undefined)
                  .length,
              };
            })
            .filter((i) => i.items.length),
    [saved.mode, albumRows, media, library, session],
  );
  useEffect(() => {
    // Close an open detail/player when its original leaves the authorized catalog.
    if (detail && !media.some((item) => item.id === detail.id)) setDetail(null);
  }, [detail, media]);
  const pending = pendingIds(session),
    marked = media.filter(
      (i) => pending.includes(i.id) && !library.bookmarks.includes(i.id),
    );
  const current = session
    ? media.find((i) => i.id === session.mediaIds[session.currentIndex])
    : undefined;
  const nextCollection = collections(media, library).find(
    (i) => !i.isCompleted,
  );
  const preferences = {
    hapticsEnabled: saved.settings.hapticsEnabled,
    reducedMotion: saved.settings.reducedMotion || systemReduced,
  };
  const refreshQueue = useMemo(
    () => new GalleryRefreshQueue(() => galleryController.load()),
    [],
  );
  let disk: { total: number; free: number } | null = null;
  if (Platform.OS !== "web") {
    try {
      const total = Paths.totalDiskSpace,
        free = Paths.availableDiskSpace;
      if (total > 0) disk = { total, free };
    } catch {}
  }
  useEffect(() => {
    void store.load();
    void AccessibilityInfo.isReduceMotionEnabled().then(setSystemReduced);
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setSystemReduced,
    );
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!ready) return;
    if (!requestingAccess.current) void galleryController.load();
  }, [ready]);
  useEffect(() => {
    NativeMediaService.hapticsEnabled = saved.settings.hapticsEnabled;
  }, [saved.settings.hapticsEnabled]);
  useEffect(() => {
    if (!ready || !gallery.granted || gallery.status === "loading") {
      setAlbumRows([]);
      return;
    }
    if (gallery.refreshing) return;
    let alive = true;
    setAlbumError("");
    void NativeMediaService.getAlbumCollections().then(
      (rows) => {
        if (alive) setAlbumRows(rows);
      },
      () => {
        if (alive)
          setAlbumError(
            "Albums could not be loaded. Refresh your gallery to retry.",
          );
      },
    );
    return () => {
      alive = false;
    };
  }, [ready, gallery.granted, gallery.status, gallery.media, gallery.refreshing]);
  useEffect(() => {
    refreshQueue.setEnabled(
      ready && saved.onboardingDone && Platform.OS !== "web",
    );
    refreshQueue.setBlocked(busy || onboard || importing || splash || gallery.refreshing);
  }, [
    refreshQueue,
    ready,
    saved.onboardingDone,
    busy,
    onboard,
    importing,
    review,
    splash,
    gallery.refreshing,
  ]);
  useEffect(() => {
    refreshQueue.setActive(AppState.currentState === "active");
    const sub = AppState.addEventListener("change", (status) =>
      refreshQueue.setActive(status === "active"),
    );
    return () => sub.remove();
  }, [refreshQueue]);
  useEffect(() => () => refreshQueue.setEnabled(false), [refreshQueue]);
  useEffect(() => {
    if (!ready || !gallery.granted || Platform.OS === "web") return;
    let alive = true;
    let unsubscribe: (() => void) | undefined;
    void NativeMediaService.subscribeToChanges(refreshQueue.request).then(
      (remove) => {
        if (alive) unsubscribe = remove;
        else remove();
      },
      () => {
        if (alive) galleryController.reportWatchError();
      },
    );
    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, [ready, gallery.granted, refreshQueue]);
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (busy) return true;
      if (store.getSnapshot().result) {
        store.clearResult();
        setTab("clean");
        return true;
      }
      if (sessionOpen) {
        setSessionOpen(false);
        return true;
      }
      if (tab !== "clean") {
        setTab("clean");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [sessionOpen, tab, busy]);
  useEffect(() => {
    if (
      sessionOpen &&
      session &&
      session.currentIndex >= session.mediaIds.length &&
      pending.length &&
      saved.settings.showReviewBeforeFinish &&
      autoReview.current !== session.id
    ) {
      autoReview.current = session.id;
      setReview(true);
    }
  }, [
    sessionOpen,
    session?.id,
    session?.currentIndex,
    pending.length,
    saved.settings.showReviewBeforeFinish,
  ]);
  const tell = (title: string, body: string) => setMessage({ title, body });
  const nativeRequired = () => tell(
    "Use the native app",
    "Real gallery access and system deletion confirmation require Luma’s Android or iOS development build. Connect your device library there. No sample photos or simulated deletions are available.",
  );
  const access = async () => {
    if (accessInFlight.current) return;
    accessInFlight.current = true;
    try {
      if (Platform.OS === "web") {
        nativeRequired();
        return;
      }
      if (gallery.limited) {
        await NativeMediaService.manageLimitedAccess();
        await galleryController.load();
        return;
      } else if ((!gallery.canAskAgain && !gallery.granted) || gallery.granted) {
        await Linking.openSettings();
        return;
      }
      await galleryController.load(true);
    } catch (error) {
      tell("Photo access", String(error));
    } finally {
      accessInFlight.current = false;
    }
  };
  const start = (items: MediaItem[], title: string, key?: string) => {
    if (!ready || busy || state.error) {
      tell(
        "Save progress first",
        "Retry saving your progress before starting another session.",
      );
      return;
    }
    if (!items.length) {
      tell(
        "Nothing to review here",
        "This collection has no accessible media right now.",
      );
      return;
    }
    if (session) {
      if (session.collectionKey === (key || title)) {
        setSessionOpen(true);
        return;
      }
      setReplacement({ items, title, key });
      return;
    }
    store.start(items, title, "collection", key || title);
    setSessionOpen(true);
    setTab("clean");
  };
  const finish = async () => {
    if (pending.length) {
      setReview(true);
      return;
    }
    try {
      await store.finish();
      setSessionOpen(false);
    } catch (error) {
      tell("Could not finish", String(error));
    }
  };
  const confirm = async (ids: string[]) => {
    setReviewError("");
    try {
      const deleted = await store.deleteSelected(media, ids);
      galleryController.removeDeleted(deleted);
      if (deleted.length) refreshQueue.request();
      setReview(false);
      if (session && session.currentIndex >= session.mediaIds.length) {
        await store.finish();
        setSessionOpen(false);
      }
    } catch (error) {
      setReviewError(
        "Only confirmed deletions count toward statistics. Remaining marks are available for review. " +
          String(error),
      );
    }
  };
  const pick = async () => {
    try {
      if (Platform.OS === "web") {
        setImporting(false);
        nativeRequired();
        return;
      }
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (picked.canceled) return;
      await galleryController.load();
      const available = NativeMediaService.selectOriginals(
        galleryController.getSnapshot().media,
        picked.assets,
      ).map((i) => ({
        ...i,
        source: "device" as const,
        albumName: i.albumName || "Selected media",
      }));
      setImporting(false);
      if (!available.length || available.length !== picked.assets.length) {
        tell(
          "Gallery access needed",
          "Some selected originals are not accessible through the photo library. Allow access to them and try again. Luma will not delete temporary picker copies.",
        );
        return;
      }
      start(available, "Selected memories");
    } catch (error) {
      tell("Media could not be selected", String(error));
    }
  };
  const bookmarked = media.filter((i) => library.bookmarks.includes(i.id));
  return (
    <Preferences.Provider value={preferences}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: splash ? "#FAF9F6" : c.background }}
        edges={["top", "bottom"]}
      >
        <View
          style={{
            flex: 1,
            minHeight: 0,
            width: "100%",
            maxWidth: 520,
            alignSelf: "center",
          }}
        >
          {!ready ? (
            <Screen>
              <Empty
                title="Opening your space…"
                detail={
                  state.error || "Restoring your saved memories and progress."
                }
                action={
                  state.error ? (
                    <Button
                      title="Retry opening progress"
                      onPress={() => void store.load()}
                    />
                  ) : undefined
                }
              />
            </Screen>
          ) : (
            <>
              {!!state.error && (
                <View style={{ padding: 12, backgroundColor: "#FBE9E4" }}>
                  <Text
                    accessibilityLiveRegion="assertive"
                    style={{ color: c.coral, fontSize: 11 }}
                  >
                    {state.error}
                  </Text>
                  <Button
                    title="Retry saving progress"
                    tone="white"
                    onPress={() => void store.retrySave()}
                  />
                </View>
              )}
              {state.interrupted && (
                <View style={{ padding: 12, backgroundColor: "#FFF4D8" }}>
                  <Text style={{ color: "#785B22", fontSize: 11 }}>
                    A deletion was interrupted. Its outcome is unverified.
                    Refresh your gallery and review the remaining selection;
                    unconfirmed files are excluded from statistics.
                  </Text>
                </View>
              )}
              {result && !sessionOpen ? (
                <NativeResultsScreen
                  result={result}
                  streak={currentStreak(library.stats)}
                  next={nextCollection}
                  onHome={() => {
                    store.clearResult();
                    setTab("clean");
                  }}
                  onNext={() => {
                    store.clearResult();
                    if (nextCollection)
                      start(
                        nextCollection.items.filter(
                          (i) => !library.progress[i.id],
                        ),
                        nextCollection.title,
                        nextCollection.key,
                      );
                  }}
                />
              ) : sessionOpen && session ? (
                <>
                  <View style={[ui.between, { padding: 10 }]}>
                    <IconButton
                      label="Back to gallery"
                      disabled={busy}
                      onPress={() => setSessionOpen(false)}
                    >
                      <ArrowLeft size={22} color={c.forest} />
                    </IconButton>
                    <View style={{ flex: 1, alignItems: "center", gap: 4 }}>
                      <Text
                        numberOfLines={1}
                        style={{ fontWeight: "800", fontSize: 13 }}
                      >
                        {session.title}
                      </Text>
                      <Text style={ui.caption}>
                        {Math.min(
                          session.currentIndex + 1,
                          session.mediaIds.length,
                        )}{" "}
                        of {session.mediaIds.length} · {pending.length} marked
                      </Text>
                      <View
                        style={{
                          width: 100,
                          height: 4,
                          borderRadius: 3,
                          backgroundColor: c.border,
                        }}
                      >
                        <View
                          style={{
                            width: `${session.mediaIds.length ? (session.currentIndex / session.mediaIds.length) * 100 : 100}%`,
                            height: 4,
                            backgroundColor: c.forest,
                            borderRadius: 3,
                          }}
                        />
                      </View>
                    </View>
                    <Button
                      title={"Review (" + pending.length + ")"}
                      onPress={() =>
                        pending.length ? setReview(true) : void finish()
                      }
                      disabled={busy}
                      tone="white"
                      style={{ minHeight: 40, paddingHorizontal: 10 }}
                    />
                  </View>
                  {current && gallery.status === "ready" ? (
                    <NativeSwipeDeck
                      key={current.id}
                      item={current}
                      next={session.mediaIds
                        .slice(
                          session.currentIndex + 1,
                          session.currentIndex + 3,
                        )
                        .map((id) => media.find((i) => i.id === id))
                        .filter((i): i is MediaItem => !!i)}
                      bookmarked={library.bookmarks.includes(current.id)}
                      canUndo={!!session.history.length}
                      disabled={busy || !!state.error}
                      onDecision={(id, d) => store.decide(id, d)}
                      onUndo={() => store.undo()}
                      onBookmark={() => store.bookmark(current.id)}
                      onInfo={() => setDetail(current)}
                    />
                  ) : (
                    <Screen>
                      <Empty
                        title={
                          gallery.status === "loading"
                            ? "Refreshing gallery…"
                            : session.currentIndex >= session.mediaIds.length
                              ? "A little more clarity."
                              : "This memory is unavailable"
                        }
                        detail={
                          session.currentIndex >= session.mediaIds.length
                            ? "You have reviewed this collection. Check your marked items before finishing."
                            : gallery.message ||
                              "Photo access may have changed. Reconnect your gallery to continue; your decisions are saved."
                        }
                        action={
                          <Button
                            title={
                              pending.length
                                ? "Review marked items"
                                : "Finish session"
                            }
                            onPress={() => void finish()}
                            disabled={gallery.status === "loading" || busy}
                          />
                        }
                      />
                      {!!session.history.length && (
                        <Button
                          title="Undo last swipe"
                          tone="white"
                          onPress={() => store.undo()}
                        />
                      )}
                      {session.currentIndex < session.mediaIds.length && (
                        <Button
                          title="Reconnect gallery"
                          onPress={() => void access()}
                        />
                      )}
                      {!current &&
                        gallery.status === "ready" &&
                        session.currentIndex < session.mediaIds.length && (
                          <Button
                            title="Skip unavailable item"
                            tone="cream"
                            onPress={() =>
                              store.skipUnavailable(
                                session.mediaIds[session.currentIndex],
                              )
                            }
                          />
                        )}
                    </Screen>
                  )}
                </>
              ) : (
                <>
                  <NativeHeader onImport={() => setImporting(true)} />
                  {tab === "clean" && (
                    <NativeHomeScreen
                      media={media}
                      library={library}
                      gallery={gallery}
                      name={saved.name}
                      albums={albumCollections}
                      albumError={albumError}
                      disk={disk}
                      onStart={start}
                      onResume={() => setSessionOpen(true)}
                      onAccess={() => void access()}
                      onRefresh={() =>
                        void galleryController.load()
                      }
                    />
                  )}
                  {tab === "bookmarks" && (
                    <NativeBookmarksScreen
                      items={bookmarked}
                      hiddenCount={library.bookmarks.length - bookmarked.length}
                      onOpen={setDetail}
                      onToggle={(id) => store.bookmark(id)}
                      onHome={() => setTab("clean")}
                    />
                  )}
                  {tab === "insights" && (
                    <NativeInsightsScreen
                      media={media}
                      library={library}
                    />
                  )}
                  {tab === "settings" && (
                    <NativeSettingsScreen
                      saved={saved}
                      library={library}
                      gallery={gallery}
                      busy={busy}
                      onSettings={(s) => store.settings(s)}
                      onName={(name) => store.name(name)}
                      onAccess={() => void access()}
                      onSplash={() => setSplash(true)}
                      onOnboard={() => setOnboard(true)}
                      onReset={() => store.resetCurrentLibrary()}
                      onDiagnostics={async () => {
                        const key = "@luma_storage_probe_v1",
                          value = "probe-" + Date.now();
                        await repository.flush();
                        await AsyncStorage.setItem(key, value);
                        const actual = await AsyncStorage.getItem(key);
                        await AsyncStorage.removeItem(key);
                        if (actual !== value)
                          throw new Error("Readback mismatch");
                        return `Local write/read check passed. Saved progress queue flushed. ${media.length} accessible items indexed. Gallery: ${permissionLabel(gallery)}. Platform: ${Platform.OS}. This check does not test physical-device permissions, video playback or deletion.`;
                      }}
                      onCache={async () => {
                        await Image.clearMemoryCache();
                        await Image.clearDiskCache();
                      }}
                    />
                  )}
                  <NativeBottomNav
                    activeTab={tab}
                    onTabChange={setTab}
                    bookmarkCount={library.bookmarks.length}
                  />
                </>
              )}
            </>
          )}
          <NativeReviewSheet
            visible={review}
            items={marked}
            unavailableCount={pending.length - marked.length}
            error={reviewError}
            busy={busy}
            deletionUnavailable={
              NativeMediaService.deletionUnavailableReason()
            }
            onClose={() => {
              setReview(false);
              setReviewError("");
            }}
            onConfirm={(ids) => void confirm(ids)}
          />
          <NativePhotoDetailModal
            item={detail}
            onClose={() => setDetail(null)}
            bookmarked={!!detail && library.bookmarks.includes(detail.id)}
            onBookmark={() => {
              if (detail) store.bookmark(detail.id);
            }}
          />
          <Sheet
            visible={importing}
            title="Choose your memories"
            onClose={() => setImporting(false)}
            footer={
              <Button
                title="Done"
                tone="cream"
                onPress={() => setImporting(false)}
              />
            }
          >
            <View style={{ padding: 20, gap: 12 }}>
              <Text style={ui.caption}>
                Organize original photos and videos from your device gallery.
                Luma keeps your selection local.
              </Text>
              <Button
                title="Select photos and videos"
                onPress={() => void pick()}
              />
              <Button
                title="Connect full gallery"
                tone="cream"
                onPress={() => {
                  setImporting(false);
                  void access();
                }}
              />
            </View>
          </Sheet>
          <Sheet
            visible={!!replacement}
            title="You have a saved session"
            onClose={() => setReplacement(null)}
            footer={
              <>
                <Button
                  title="Resume saved session"
                  onPress={() => {
                    setReplacement(null);
                    setSessionOpen(true);
                  }}
                />
                <Button
                  title="Finish current session first"
                  tone="cream"
                  onPress={() => {
                    setReplacement(null);
                    setSessionOpen(true);
                    void finish();
                  }}
                />
              </>
            }
          >
            <Text style={[ui.caption, { padding: 20 }]}>
              Finish or review “{session?.title}” before starting “
              {replacement?.title}”. Your decisions and undo history are saved.
            </Text>
          </Sheet>
          <Sheet
            visible={!!message}
            title={message?.title || ""}
            onClose={() => setMessage(null)}
            footer={<Button title="Got it" onPress={() => setMessage(null)} />}
          >
            <Text selectable style={[ui.caption, { padding: 20 }]}>
              {message?.body}
            </Text>
          </Sheet>
          <NativeOnboardingModal
            onRequestAccess={async () => {
              if (Platform.OS === "web") throw new Error("Use the native app. Connect your gallery in Luma for Android or iOS.");
              requestingAccess.current = true;
              try {
                await galleryController.load(true);
                const connected = galleryController.getSnapshot();
                if (!connected.granted || connected.status === "error")
                  throw new Error(connected.message || "Photo access is unavailable.");
              } finally {
                requestingAccess.current = false;
              }
            }}
            visible={!splash && ready && (!saved.onboardingDone || onboard)}
            onComplete={async () => {
              await store.onboard();
              setOnboard(false);
              void galleryController.load();
            }}
          />
          {splash && (
            <NativeAnimatedSplash
              onFinish={() => setSplash(false)}
              ready={ready || !!state.error}
              autoDismissMs={preferences.reducedMotion ? 650 : 1700}
            />
          )}
        </View>
      </SafeAreaView>
    </Preferences.Provider>
  );
}
function permissionLabel(gallery: ReturnType<GalleryLibrary["getSnapshot"]>) {
  return gallery.limited
      ? "limited"
      : gallery.granted
        ? "granted"
        : gallery.status;
}
