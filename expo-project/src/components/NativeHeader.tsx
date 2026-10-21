import React from "react";
import { View } from "react-native";
import { Plus } from "lucide-react-native";
import { LumaNativeLogo } from "./LumaNativeLogo";
import { Button, ui } from "./NativeUI";
import { colors as c } from "../theme/colors";
export function NativeHeader({ onImport }: { onImport: () => void }) {
  return (
    <View
      style={[
        ui.between,
        {
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: c.background,
        },
      ]}
    >
      <LumaNativeLogo size={32} />
      <Button
        title="Import"
        onPress={onImport}
        tone="white"
        icon={<Plus size={16} color={c.forest} />}
        style={{
          minHeight: 40,
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 14,
          paddingHorizontal: 12,
        }}
      />
    </View>
  );
}
