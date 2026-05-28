import RepositorioFoto, { PhotoType } from "@/database/repositories/repositorio.foto";
import RepositorioAlbum from "@/database/repositories/repositorio.album";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View, Image, Text, TouchableOpacity, FlatList } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function Mapa() {
  const [photos, setPhotos] = useState<Required<PhotoType>[]>([]);
  const [albums, setAlbums] = useState<Array<{ id: number; name: string; color: string }>>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);
  const [displayPhotos, setDisplayPhotos] = useState<Required<PhotoType>[]>([]);

  const fotoRepo = new RepositorioFoto();
  const albumRepo = new RepositorioAlbum();

  useFocusEffect(
    useCallback(() => {
      const allPhotos = fotoRepo.getAll();
      const allAlbums = albumRepo.getAll();
      setPhotos(allPhotos);
      setAlbums(allAlbums);
      setDisplayPhotos(allPhotos);
    }, [])
  );

  const handleSelectAlbum = (albumId: number | null) => {
    setSelectedAlbumId(albumId);
    if (albumId === null) {
      setDisplayPhotos(photos);
    } else {
      const albumPhotos = albumRepo.getPhotos(albumId);
      setDisplayPhotos(albumPhotos);
    }
  };

  return (
    <View style={styles.container}>
      {/* Album Filter */}
      {albums.length > 0 && (
        <View style={styles.filterContainer}>
          <FlatList
            data={[{ id: null, name: "Todas" }, ...albums]}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedAlbumId === item.id && styles.filterButtonActive,
                ]}
                onPress={() => handleSelectAlbum(item.id)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedAlbumId === item.id && styles.filterButtonTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Map */}
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: -14.235,
          longitude: -51.9253,
          latitudeDelta: 40,
          longitudeDelta: 40,
        }}
      >
        {displayPhotos.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.title}
          >
            <View style={styles.pin}>
              <View style={styles.pinBalloon}>
                <Image source={{ uri: p.image_uri }} style={styles.pinImage} resizeMode="cover" />
              </View>
              <View style={styles.pinTail} />
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const PIN_W = 70;
const PIN_H = 70;

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 8,
    zIndex: 10,
  },
  filterContent: {
    paddingHorizontal: 12,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: "#3b82f6",
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  pin: { alignItems: "center" },
  pinBalloon: {
    width: PIN_W,
    height: PIN_H,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "#3b82f6",
    overflow: "hidden",
    backgroundColor: "#3b82f6",
    elevation: 6,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  pinImage: {
    width: "100%",
    height: "100%",
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 18,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#3b82f6",
    marginTop: -2,
  },
});