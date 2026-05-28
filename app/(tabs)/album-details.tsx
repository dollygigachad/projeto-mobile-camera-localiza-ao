import { useRoute, useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RepositorioAlbum from "@/database/repositories/repositorio.album";

interface RouteParams {
  albumId: number;
  albumName: string;
}

export default function AlbumDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as RouteParams;
  
  const [photos, setPhotos] = useState<
    Array<{
      id: number;
      title: string;
      image_uri: string;
      latitude: number;
      longitude: number;
      created_at: string;
    }>
  >([]);

  const albumRepo = new RepositorioAlbum();

  useFocusEffect(
    useCallback(() => {
      if (params?.albumId) {
        setPhotos(albumRepo.getPhotos(params.albumId));
      }
    }, [params?.albumId])
  );

  const handleRemovePhoto = (photoId: number) => {
    Alert.alert(
      "Confirmar",
      "Remover foto do álbum?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            albumRepo.removePhoto(photoId, params.albumId);
            setPhotos(albumRepo.getPhotos(params.albumId));
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {photos.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>📸</Text>
          <Text style={styles.emptyText}>Nenhuma foto neste álbum</Text>
          <Text style={styles.emptySubtext}>
            Adicione fotos da sua galeria
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tile}
              onPress={() => {
                // Aqui você poderia abrir o modal de foto
              }}
              onLongPress={() => handleRemovePhoto(item.id)}
            >
              <Image source={{ uri: item.image_uri }} style={styles.image} />
              <View style={styles.tileInfo}>
                <Text numberOfLines={1} style={styles.tileTitle}>
                  {item.title}
                </Text>
                <Text numberOfLines={1} style={styles.tileDate}>
                  📅 {item.created_at}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
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
  },
  tile: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: "#f1f5f9",
  },
  tileInfo: {
    padding: 12,
    backgroundColor: "#fff",
  },
  tileTitle: {
    fontWeight: "700",
    fontSize: 14,
    color: "#1e293b",
  },
  tileDate: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "400",
  },
});
