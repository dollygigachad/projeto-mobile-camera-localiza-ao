import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import RepositorioAlbum from "@/database/repositories/repositorio.album";
import { CreateAlbumModal } from "@/app/components";
import { useCallback } from "react";

export default function Albums() {
  const [albums, setAlbums] = useState<
    Array<{ id: number; name: string; color: string; created_at: string }>
  >([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<number | null>(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);

  const repo = new RepositorioAlbum();

  useFocusEffect(
    useCallback(() => {
      setAlbums(repo.getAll());
    }, [])
  );

  const handleCreateAlbum = (name: string, color: string) => {
    repo.create({ name, color });
    setAlbums(repo.getAll());
    setCreateModalVisible(false);
  };

  const handleDeleteAlbum = () => {
    if (selectedAlbum) {
      Alert.alert(
        "Confirmar",
        "Excluir este álbum?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: () => {
              repo.delete(selectedAlbum);
              setAlbums(repo.getAll());
              setContextMenuVisible(false);
              setSelectedAlbum(null);
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <CreateAlbumModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={handleCreateAlbum}
      />

      {albums.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>📁</Text>
          <Text style={styles.emptyText}>Nenhum álbum ainda</Text>
          <Text style={styles.emptySubtext}>
            Crie um álbum para organizar suas fotos
          </Text>
        </View>
      ) : (
        <FlatList
          data={albums}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.albumCard, { backgroundColor: item.color }]}
              onPress={() => router.push({ pathname: "/(tabs)/album-details", params: { albumId: item.id, albumName: item.name } })}
              onLongPress={() => {
                setSelectedAlbum(item.id);
                setContextMenuVisible(true);
              }}
            >
              <View style={styles.albumContent}>
                <Text style={styles.albumIcon}>📁</Text>
                <Text style={styles.albumName}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal
        visible={contextMenuVisible}
        transparent
        onRequestClose={() => setContextMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.contextOverlay}
          onPress={() => setContextMenuVisible(false)}
        >
          <View style={styles.contextMenu}>
            <TouchableOpacity
              style={styles.contextItem}
              onPress={handleDeleteAlbum}
            >
              <Text style={styles.contextItemText}>🗑️ Excluir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contextItemCancel}
              onPress={() => setContextMenuVisible(false)}
            >
              <Text style={styles.contextItemText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setCreateModalVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 18,
    fontWeight: "500",
  },
  emptySubtext: {
    color: "#cbd5e1",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  albumCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    minHeight: 120,
  },
  albumContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  albumIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  albumName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabIcon: {
    color: "#fff",
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "300",
  },
  contextOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  contextMenu: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contextItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  contextItemCancel: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  contextItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
  },
});
