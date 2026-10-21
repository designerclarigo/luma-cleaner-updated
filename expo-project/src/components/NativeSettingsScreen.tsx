import React, { useState } from "react";
import { Platform, Pressable, Switch, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  BellRing,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Edit3,
  Eye,
  Flower2,
  LockKeyhole,
  Play,
  Search,
  ShieldCheck,
  Smartphone,
  Trash2,
  Vibrate,
  X,
} from "lucide-react-native";
import type { LibraryState, SavedState, Settings } from "../core/model";
import type { GallerySnapshot } from "../services/galleryLibrary";
import { currentStreak, formatBytes } from "../core/gallery";
import {
  Button,
  Card,
  Chip,
  Heading,
  Screen,
  Sheet,
  Text,
  ui,
} from "./NativeUI";
import { colors as c } from "../theme/colors";
const questions = [
  [
    "How does swiping work?",
    "Swipe right to keep a memory. Swipe left only marks it for deletion. Open Review to inspect your marked items; Luma then asks the operating system to confirm before deleting device media. Undo restores your last swipe until that item has been deleted.",
  ],
  [
    "Can Luma delete bookmarked memories?",
    "Bookmarked items are protected from Luma’s deletion queue. This protection applies inside Luma; another app or the system gallery can still change or delete them. Remove the bookmark if you want to mark one for deletion.",
  ],
  [
    "Can I recover deleted photos?",
    "Recovery depends on your operating system and gallery provider. Check Recently Deleted or Trash in your gallery. Luma does not keep copies and cannot promise a retention period or restore permanently deleted media.",
  ],
  [
    "Why can I see only selected photos?",
    "Your device may have granted limited access. Use Manage photo access to select more media or allow full access in device Settings. Hidden bookmarks and saved progress are retained.",
  ],
  [
    "Are similar photos automatically detected?",
    "Similar & Bursts groups nearby timestamps with matching dimensions. Review & Bursts uses filename hints. These are review candidates, not an AI duplicate or blur verdict. You make every decision.",
  ],
  [
    "Where is my progress saved?",
    "Decisions, undo history, bookmarks, settings and completed sessions are saved locally. Demo activity uses a separate library. Uninstalling the app or clearing its data removes local progress.",
  ],
  [
    "What does Demo mode do?",
    "Demo mode uses sample images and videos downloaded from public media hosts. Its deletions and storage savings are simulated. It never silently replaces a failed device gallery and cannot delete device media.",
  ],
];
export function NativeSettingsScreen({
  saved,
  library,
  gallery,
  busy,
  onSettings,
  onName,
  onAccess,
  onSplash,
  onOnboard,
  onReset,
  onDiagnostics,
  onCache,
}: {
  saved: SavedState;
  library: LibraryState;
  gallery: GallerySnapshot;
  busy: boolean;
  onSettings: (s: Partial<Settings>) => void;
  onName: (s: string) => void;
  onAccess: () => void;
  onSplash: () => void;
  onOnboard: () => void;
  onReset: () => Promise<void>;
  onDiagnostics: () => Promise<string>;
  onCache: () => Promise<void>;
}) {
  const [tab, setTab] = useState("General"),
    [search, setSearch] = useState(""),
    [open, setOpen] = useState<number | null>(0);
  const [editing, setEditing] = useState(false),
    [draft, setDraft] = useState(saved.name),
    [reset, setReset] = useState(false),
    [diagnostics, setDiagnostics] = useState<string | null>(null);
  const [working, setWorking] = useState(false),
    [notice, setNotice] = useState("");
  const stats = library.stats,
    initials = saved.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  const permission =
    saved.mode === "demo"
      ? "Demo library"
      : gallery.limited
        ? "Selected photos"
        : gallery.granted
          ? "Gallery connected"
          : Platform.OS === "web"
            ? "Native app required"
            : "Access needed";
  const toggle = (
    key: keyof Settings,
    title: string,
    detail: string,
    Icon: typeof Vibrate,
  ) => (
    <Card>
      <View style={ui.row}>
        <View
          style={{ padding: 9, backgroundColor: c.lightMint, borderRadius: 14 }}
        >
          <Icon size={20} color={c.forest} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", fontSize: 13 }}>{title}</Text>
          <Text style={ui.caption}>{detail}</Text>
        </View>
        <Switch
          accessibilityLabel={title}
          value={saved.settings[key]}
          onValueChange={(value) => onSettings({ [key]: value })}
          trackColor={{ false: "#D6DBD2", true: c.forest }}
          thumbColor={c.card}
        />
      </View>
    </Card>
  );
  return (
    <>
      <Screen>
        <Heading
          eyebrow="Made for a little clarity"
          title="Settings"
          subtitle="Luma · Forest edition"
        />
        <View style={{ flexDirection: "row", gap: 5, flexWrap: "wrap" }}>
          {["General", "Profile", "FAQ", "Privacy"].map((t) => (
            <Chip
              key={t}
              title={t}
              active={tab === t}
              onPress={() => setTab(t)}
            />
          ))}
        </View>
        {tab === "General" && (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => setTab("Profile")}
            >
              <Card>
                <View style={ui.row}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: c.mint,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "800", color: c.forest }}>
                      {initials}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "800" }}>{saved.name}</Text>
                    <Text style={ui.caption}>
                      Your personal space for memories
                    </Text>
                  </View>
                  <ChevronRight size={18} color={c.muted} />
                </View>
              </Card>
            </Pressable>
            <Card>
              <View style={ui.row}>
                <ShieldCheck size={23} color={c.forest} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "800" }}>
                    Photo library access
                  </Text>
                  <Text style={ui.caption}>{permission}</Text>
                </View>
              </View>
              <Text style={ui.caption}>
                Choose the photos you share. Your originals stay on your device
                until a confirmed deletion.
              </Text>
              <Button
                title="Manage photo access"
                tone="cream"
                onPress={onAccess}
              />
            </Card>
            <View style={{ gap: 10 }}>
              <Text style={ui.sectionTitle}>Your experience</Text>
              {toggle(
                "hapticsEnabled",
                "Tactile feedback",
                "Gentle feedback for taps and swipes.",
                Vibrate,
              )}
              {toggle(
                "reducedMotion",
                "Reduced motion",
                "Use simpler transitions and less movement.",
                Eye,
              )}
              {toggle(
                "showReviewBeforeFinish",
                "Open review after last swipe",
                "Otherwise, choose Review when you are ready. Deletion always requires review.",
                BellRing,
              )}
            </View>
            <Card>
              <Text style={{ fontWeight: "800" }}>Image cache</Text>
              <Text style={ui.caption}>
                Clear cached previews. Originals, bookmarks and progress are
                preserved.
              </Text>
              <Button
                title="Clear preview cache"
                tone="cream"
                onPress={async () => {
                  try {
                    await onCache();
                    setNotice(
                      "Preview cache cleared. Originals and progress are preserved.",
                    );
                  } catch {
                    setNotice(
                      "The preview cache could not be cleared. Try again.",
                    );
                  }
                }}
              />
              {!!notice && (
                <Text accessibilityLiveRegion="polite" style={ui.caption}>
                  {notice}
                </Text>
              )}
            </Card>
            <View style={{ gap: 10 }}>
              <Text style={ui.sectionTitle}>App tours</Text>
              <Button
                title="Replay animated splash"
                tone="white"
                icon={<Play size={17} color={c.forest} />}
                onPress={onSplash}
              />
              <Button
                title="Replay onboarding"
                tone="white"
                icon={<Flower2 size={17} color={c.forest} />}
                onPress={onOnboard}
              />
            </View>
            <Card>
              <Text style={{ fontWeight: "800" }}>A little guidance</Text>
              <Button
                title="Frequently asked questions"
                tone="cream"
                onPress={() => setTab("FAQ")}
              />
              <Button
                title="Your privacy"
                tone="cream"
                onPress={() => setTab("Privacy")}
              />
              <Button
                title="Check local progress storage"
                tone="cream"
                onPress={async () => {
                  setDiagnostics("Checking…");
                  try {
                    setDiagnostics(await onDiagnostics());
                  } catch (error) {
                    setDiagnostics("Storage check failed. " + String(error));
                  }
                }}
              />
            </Card>
            <Card style={{ borderColor: "#EAD1CD" }}>
              <Text style={{ color: c.coral, fontWeight: "800" }}>
                Reset cleanup progress
              </Text>
              <Text style={ui.caption}>
                Clear the current {saved.mode === "demo" ? "demo" : "device"}{" "}
                library’s progress, bookmarks and statistics. This does not
                delete any media.
              </Text>
              <Button
                title="Reset this library’s progress"
                tone="cream"
                disabled={busy}
                onPress={() => setReset(true)}
              />
            </Card>
          </>
        )}
        {tab === "Profile" && (
          <>
            <LinearGradient
              colors={[c.forest, "#1A382D"]}
              style={{
                borderRadius: 24,
                padding: 24,
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  backgroundColor: c.mint,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: c.forest, fontSize: 25, fontWeight: "800" }}
                >
                  {initials}
                </Text>
              </View>
              <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>
                {saved.name}
              </Text>
              <Button
                title="Edit name"
                tone="mint"
                icon={<Edit3 size={14} color={c.forest} />}
                onPress={() => {
                  setDraft(saved.name);
                  setEditing(true);
                }}
                style={{ minHeight: 40 }}
              />
              <Text style={{ color: "#D9E3D3", fontSize: 11 }}>
                Member since{" "}
                {new Date(saved.joinedAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </LinearGradient>
            <Text style={ui.sectionTitle}>Your impact</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {[
                ["Removed media size", formatBytes(stats.bytesReclaimed)],
                [
                  "Cleaning streak",
                  currentStreak(stats) +
                    (currentStreak(stats) === 1 ? " day" : " days"),
                ],
                ["Memories kept", stats.totalKept],
                ["Items deleted", stats.totalDeleted],
              ].map(([label, value]) => (
                <Card key={label} style={{ width: "48%", flexGrow: 1 }}>
                  <Text
                    style={{
                      color: c.forest,
                      fontSize: 23,
                      fontWeight: "800",
                      lineHeight: 30,
                    }}
                  >
                    {value}
                  </Text>
                  <Text style={ui.caption}>{label}</Text>
                </Card>
              ))}
            </View>
            <Card>
              <View style={ui.row}>
                <Smartphone size={20} color={c.forest} />
                <Text style={{ fontWeight: "700" }}>Local profile</Text>
              </View>
              <Text style={ui.caption}>
                {saved.mode === "demo"
                  ? "Showing sample activity. Device statistics are saved separately."
                  : "No account required. Your profile and personal cleanup history stay on this device."}
              </Text>
            </Card>
          </>
        )}
        {tab === "FAQ" && (
          <>
            <View
              style={[
                ui.row,
                {
                  paddingHorizontal: 14,
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: 16,
                },
              ]}
            >
              <Search size={17} color={c.muted} />
              <TextInput
                accessibilityLabel="Search frequently asked questions"
                placeholder="Search for a little clarity…"
                placeholderTextColor={c.muted}
                value={search}
                onChangeText={setSearch}
                style={{
                  flex: 1,
                  minHeight: 48,
                  fontFamily: "Jakarta400",
                  color: c.ink,
                  fontSize: 12,
                }}
              />
            </View>
            {questions.map(
              ([q, answer], index) =>
                (!search ||
                  (q + answer)
                    .toLowerCase()
                    .includes(search.toLowerCase())) && (
                  <Card key={q} style={{ gap: 8 }}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded: open === index }}
                      onPress={() => setOpen(open === index ? null : index)}
                      style={ui.row}
                    >
                      <Text
                        style={{ flex: 1, fontWeight: "700", fontSize: 13 }}
                      >
                        {q}
                      </Text>
                      <ChevronDown size={17} color={c.forest} />
                    </Pressable>
                    {(open === index || !!search) && (
                      <Text
                        style={[ui.caption, { fontSize: 13, lineHeight: 21 }]}
                      >
                        {answer}
                      </Text>
                    )}
                  </Card>
                ),
            )}
            {search &&
              !questions.some((q) =>
                q.join(" ").toLowerCase().includes(search.toLowerCase()),
              ) && (
                <Text style={ui.caption}>
                  No matching questions. Try “access”, “swipe” or “progress”.
                </Text>
              )}
          </>
        )}
        {tab === "Privacy" && (
          <>
            <Card style={{ backgroundColor: c.lightMint }}>
              <ShieldCheck size={28} color={c.forest} />
              <Text style={{ fontWeight: "800", fontSize: 16 }}>
                Your memories belong to you.
              </Text>
              <Text style={ui.caption}>
                Personal gallery organization happens on your device.
              </Text>
            </Card>
            <Card>
              {[
                [
                  "On-device photo access",
                  "Luma reads the media you permit through your operating system. It does not upload your personal gallery or use cloud AI to inspect your photos.",
                ],
                [
                  "Decisions stay yours",
                  "A swipe marks an item. You review the selection and your operating system confirms deletion. Luma cannot restore permanently deleted originals.",
                ],
                [
                  "Local saved progress",
                  "Your name, settings, bookmarks, decisions and session history are stored on this device. Clearing app data or uninstalling removes these records.",
                ],
                [
                  "Explicit sample mode",
                  "Sample photos and videos load from Unsplash and public video hosts over the internet. Their providers may receive ordinary connection information. Sample progress and device progress are kept separate.",
                ],
                [
                  "Permissions you control",
                  "You can change photo access in device Settings. Limited access may hide media; Luma retains its saved bookmarks and progress. No access is required to explore the explicit demo.",
                ],
              ].map(([title, text]) => (
                <View key={title} style={{ gap: 7, marginBottom: 12 }}>
                  <Text style={{ fontWeight: "800" }}>{title}</Text>
                  <Text style={[ui.caption, { fontSize: 13, lineHeight: 22 }]}>
                    {text}
                  </Text>
                </View>
              ))}
            </Card>
          </>
        )}
      </Screen>
      <Sheet
        visible={editing}
        title="Your name"
        onClose={() => setEditing(false)}
        footer={
          <Button
            title="Save name"
            onPress={() => {
              onName(draft);
              setEditing(false);
            }}
          />
        }
      >
        <View style={{ padding: 20 }}>
          <TextInput
            accessibilityLabel="Profile name"
            value={draft}
            onChangeText={setDraft}
            maxLength={40}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => {
              onName(draft);
              setEditing(false);
            }}
            style={{
              minHeight: 48,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.background,
              borderRadius: 14,
              padding: 12,
              fontFamily: "Jakarta500",
              color: c.ink,
            }}
          />
        </View>
      </Sheet>
      <Sheet
        visible={reset}
        title="Reset this library’s progress?"
        onClose={() => {
          if (!working) setReset(false);
        }}
        footer={
          <>
            <Button
              title="Keep my progress"
              tone="cream"
              disabled={working}
              onPress={() => setReset(false)}
            />
            <Button
              title="Reset progress and bookmarks"
              tone="coral"
              busy={working}
              onPress={async () => {
                setWorking(true);
                try {
                  await onReset();
                  setReset(false);
                } catch {
                  setNotice(
                    "Reset could not be saved. Your media is untouched.",
                  );
                } finally {
                  setWorking(false);
                }
              }}
            />
          </>
        }
      >
        <Text style={[ui.caption, { padding: 20 }]}>
          This clears {saved.mode} bookmarks, statistics, saved session and
          decisions. Your photos and videos remain in your gallery. The other
          library’s progress is preserved.
        </Text>
      </Sheet>
      <Sheet
        visible={diagnostics !== null}
        title="Local storage check"
        onClose={() => setDiagnostics(null)}
        footer={<Button title="Done" onPress={() => setDiagnostics(null)} />}
      >
        <Text selectable style={[ui.caption, { padding: 20 }]}>
          {diagnostics}
        </Text>
      </Sheet>
    </>
  );
}
