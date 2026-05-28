import RepositorioFoto, {
    PhotoType,
} from "@/database/repositories/repositorio.foto";
import RepositorioAlbum from "@/database/repositories/repositorio.album";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Share,
} from "react-native";
import { SearchBar, FilterModal, EditPhotoModal } from "@/app/components";

export default function Galeria() {
  const [photos, setPhotos] = useState<Required<PhotoType>[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Required<PhotoType>[]>([]);
  const [fotoAberta, setFotoAberta] = useState<Required<PhotoType> | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Required<PhotoType> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedAlbums, setSelectedAlbums] = useState<Array<{ id: number; name: string }>>([]);
  const [allAlbums, setAllAlbums] = useState<Array<{ id: number; name: string; color: string }>>([]);
  const [showAlbumManager, setShowAlbumManager] = useState(false);
  const [managingPhotoId, setManagingPhotoId] = useState<number | null>(null);

  const fotoRepo = new RepositorioFoto();
  const albumRepo = new RepositorioAlbum();

  useFocusEffect(
    useCallback(() => {
      const allPhotos = fotoRepo.getAll();
      setPhotos(allPhotos);
      setFilteredPhotos(allPhotos);
      setAllAlbums(albumRepo.getAll());
    }, []),
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      const results = fotoRepo.search(query);
      setFilteredPhotos(results);
    },
    []
  );

  const handleApplyFilters = useCallback(
    (filters: {
      dateFrom: string | null;
      dateTo: string | null;
      latitude: number | null;
      longitude: number | null;
      radiusKm: number;
    }) => {
      const results = fotoRepo.search(
        searchQuery,
        filters.dateFrom,
        filters.dateTo,
        filters.latitude,
        filters.longitude,
        filters.radiusKm
      );
      setFilteredPhotos(results);
    },
    [searchQuery]
  );

  function deletar(id: number) {
    Alert.alert("Excluir", "Remover esta foto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          fotoRepo.delete(id);
          const allPhotos = fotoRepo.getAll();
          setPhotos(allPhotos);
          setFilteredPhotos(allPhotos);
        },
      },
    ]);
  }

  const handleEditPhoto = (photo: Required<PhotoType>) => {
    setEditingPhoto(photo);
  };

  const handleSaveEditedPhoto = (title: string, latitude: number, longitude: number) => {
    if (editingPhoto) {
      fotoRepo.update(editingPhoto.id, title, latitude, longitude);
      const allPhotos = fotoRepo.getAll();
      setPhotos(allPhotos);
      setFilteredPhotos(allPhotos);
      
      // Atualizar foto aberta
      const updated = allPhotos.find(p => p.id === editingPhoto.id);
      if (updated) {
        setFotoAberta(updated);
      }
    }
  };

  const handleSharePhoto = async (photo: Required<PhotoType>) => {
    try {
      await Share.share({
        message: `${photo.title}\n\nLocalização: ${photo.latitude.toFixed(4)}, ${photo.longitude.toFixed(4)}`,
        title: photo.title,
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível compartilhar");
    }
  };

  const handleAddToAlbum = (photoId: number) => {
    setManagingPhotoId(photoId);
    const currentAlbums = albumRepo.getAlbumsForPhoto(photoId);
    setSelectedAlbums(currentAlbums);
    setShowAlbumManager(true);
  };

  const handleToggleAlbum = (albumId: number) => {
    if (selectedAlbums.some(a => a.id === albumId)) {
      setSelectedAlbums(selectedAlbums.filter(a => a.id !== albumId));
      if (managingPhotoId) {
        albumRepo.removePhoto(managingPhotoId, albumId);
      }
    } else {
      const album = allAlbums.find(a => a.id === albumId);
      if (album && managingPhotoId) {
        albumRepo.addPhoto(managingPhotoId, albumId);
        setSelectedAlbums([...selectedAlbums, { id: album.id, name: album.name }]);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        onFilterPress={() => setFilterModalVisible(true)}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
      />

      <EditPhotoModal
        visible={!!editingPhoto}
        photo={editingPhoto}
        onClose={() => setEditingPhoto(null)}
        onSave={handleSaveEditedPhoto}
      />

      {/* Album Manager Modal */}
      <Modal
        visible={showAlbumManager}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAlbumManager(false)}
      >
        <View style={styles.albumManagerOverlay}>
          <View style={styles.albumManagerContainer}>
            <View style={styles.albumManagerHeader}>
              <Text style={styles.albumManagerTitle}>Adicionar a Álbuns</Text>
              <TouchableOpacity onPress={() => setShowAlbumManager(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {allAlbums.length === 0 ? (
              <View style={styles.albumManagerEmpty}>
                <Text style={styles.albumManagerEmptyText}>Nenhum álbum criado</Text>
              </View>
            ) : (
              <FlatList
                data={allAlbums}
                keyExtractor={item => String(item.id)}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.albumManagerItem,
                      selectedAlbums.some(a => a.id === item.id) && {
                        backgroundColor: item.color + "20",
                        borderColor: item.color,
                      },
                    ]}
                    onPress={() => handleToggleAlbum(item.id)}
                  >
                    <View
                      style={[
                        styles.albumCheckbox,
                        selectedAlbums.some(a => a.id === item.id) && {
                          backgroundColor: item.color,
                        },
                      ]}
                    >
                      {selectedAlbums.some(a => a.id === item.id) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.albumManagerItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Photo Viewer Modal */}
      <Modal visible={!!fotoAberta} transparent onRequestClose={() => setFotoAberta(null)}>
        <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setFotoAberta(null)}
              style={styles.closeButton}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{fotoAberta?.title}</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 16 }}>
            <Image 
              source={{ uri: fotoAberta?.image_uri }} 
              style={styles.modalImage}
              resizeMode="contain" 
            />
          </View>

          <View style={styles.modalFooter}>
            <View style={styles.infoSection}>
              <Text style={styles.infoIcon}>📅</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Data</Text>
                <Text style={styles.infoValue}>{fotoAberta?.created_at}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Localização GPS</Text>
                {fotoAberta?.latitude && fotoAberta?.longitude ? (
                  <>
                    <Text style={styles.infoValue}>
                      {fotoAberta.latitude.toFixed(6)}
                    </Text>
                    <Text style={styles.infoValue}>
                      {fotoAberta.longitude.toFixed(6)}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.infoValue}>Não disponível</Text>
                )}
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  if (fotoAberta) handleEditPhoto(fotoAberta);
                }}
              >
                <Text style={styles.actionButtonText}>✎ Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  if (fotoAberta) handleSharePhoto(fotoAberta);
                }}
              >
                <Text style={styles.actionButtonText}>📤 Compartilhar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  if (fotoAberta) handleAddToAlbum(fotoAberta.id);
                }}
              >
                <Text style={styles.actionButtonText}>📁 Álbum</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => setFotoAberta(null)} 
              style={styles.closeButtonFooter}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>📸</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? "Nenhuma foto encontrada" : "Nenhuma foto ainda"}
          </Text>
          <Text style={{ color: "#cbd5e1", fontSize: 14, marginTop: 8, textAlign: "center", paddingHorizontal: 32 }}>
            {searchQuery ? "Tente ajustar sua busca" : "Comece capturando suas primeiras fotos"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPhotos}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tile}
              onPress={() => setFotoAberta(item)}
              onLongPress={() => deletar(item.id)}
            >
              <Image source={{ uri: item.image_uri }} style={styles.image} />
              <View style={styles.tileInfo}>
                <Text numberOfLines={1} style={styles.tileTitle}>{item.title}</Text>
                <Text numberOfLines={1} style={styles.tileDate}>📅 {item.created_at}</Text>
                {item.latitude && item.longitude && (
                  <Text numberOfLines={1} style={styles.tileLocation}>
                    📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/(tabs)/add")}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  emptyText: { 
    color: "#94a3b8", 
    fontSize: 18,
    fontWeight: "500",
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
  tileLocation: {
    color: "#3b82f6",
    fontSize: 11,
    marginTop: 3,
    fontWeight: "500",
    fontFamily: "monospace",
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e2e8f0",
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  closeIcon: {
    fontSize: 20,
    color: "#e2e8f0",
    fontWeight: "700",
  },
  modalImage: {
    width: "100%",
    height: "100%",
    maxHeight: 400,
  },
  modalFooter: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#cbd5e1",
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: "#e2e8f0",
    fontWeight: "500",
    fontFamily: "monospace",
  },
  divider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#334155",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "600",
  },
  closeButtonFooter: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#334155",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "600",
  },
  albumManagerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  albumManagerContainer: {
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  albumManagerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  albumManagerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  albumManagerEmpty: {
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  albumManagerEmptyText: {
    fontSize: 14,
    color: "#cbd5e1",
  },
  albumManagerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  albumCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  albumManagerItemText: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
  },
});
