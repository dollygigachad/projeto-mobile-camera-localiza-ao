import { initDatabase } from "@/database/db";
import { Stack } from "expo-router";
import { useEffect } from "react";
import "react-native-reanimated";

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
