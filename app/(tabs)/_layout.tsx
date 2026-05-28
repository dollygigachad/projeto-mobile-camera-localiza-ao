import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function OrganizacaoAbas() {
  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: "#3b82f6",
      tabBarInactiveTintColor: "#cbd5e1",
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: "#e2e8f0",
        backgroundColor: "#fff",
        height: 64,
        paddingBottom: 8,
        paddingTop: 8,
      },
      headerStyle: {
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
      },
      headerTintColor: "#1e293b",
      headerTitleStyle: {
        fontWeight: "700",
        fontSize: 18,
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Galeria",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="images" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Câmera",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="albums"
        options={{
          title: "Álbuns",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
