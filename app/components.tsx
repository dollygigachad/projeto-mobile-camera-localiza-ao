import { StyleSheet, TextInput, TouchableOpacity, View, Modal, ScrollView, Text as TextComponent } from "react-native";
import { useState } from "react";

// ============== SearchBar ==============
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onFilterPress,
  placeholder = "Procurar por título...",
}: SearchBarProps) {
  return (
    <View style={searchStyles.container}>
      <View style={searchStyles.searchInputContainer}>
        <TextComponent style={searchStyles.searchIcon}>🔍</TextComponent>
        <TextInput
          style={searchStyles.input}
          placeholder={placeholder}
          placeholderTextColor="#cbd5e1"
          value={value}
          onChangeText={onChangeText}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText("")}>
            <TextComponent style={searchStyles.clearIcon}>✕</TextComponent>
          </TouchableOpacity>
        )}
      </View>
      {onFilterPress && (
        <TouchableOpacity style={searchStyles.filterButton} onPress={onFilterPress}>
          <TextComponent style={searchStyles.filterIcon}>⚙️</TextComponent>
        </TouchableOpacity>
      )}
    </View>
  );
}

const searchStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#f8fafc",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1e293b",
  },
  clearIcon: {
    fontSize: 16,
    color: "#94a3b8",
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  filterIcon: {
    fontSize: 20,
  },
});

// ============== FilterModal ==============
interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    dateFrom: string | null;
    dateTo: string | null;
    latitude: number | null;
    longitude: number | null;
    radiusKm: number;
  }) => void;
  currentLat?: number;
  currentLon?: number;
}

export function FilterModal({
  visible,
  onClose,
  onApply,
  currentLat,
  currentLon,
}: FilterModalProps) {
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [useLocation, setUseLocation] = useState(false);
  const [radiusKm, setRadiusKm] = useState("50");

  const handleApply = () => {
    onApply({
      dateFrom,
      dateTo,
      latitude: useLocation && currentLat ? currentLat : null,
      longitude: useLocation && currentLon ? currentLon : null,
      radiusKm: parseInt(radiusKm, 10) || 50,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={filterStyles.overlay}>
        <View style={filterStyles.container}>
          <View style={filterStyles.header}>
            <TextComponent style={filterStyles.title}>Filtros Avançados</TextComponent>
            <TouchableOpacity onPress={onClose}>
              <TextComponent style={filterStyles.closeIcon}>✕</TextComponent>
            </TouchableOpacity>
          </View>

          <ScrollView style={filterStyles.content} showsVerticalScrollIndicator={false}>
            <TextComponent style={filterStyles.sectionTitle}>📅 Data</TextComponent>
            <View style={filterStyles.inputRow}>
              <TextInput
                style={filterStyles.dateInput}
                placeholder="De (YYYY-MM-DD)"
                placeholderTextColor="#cbd5e1"
                value={dateFrom || ""}
                onChangeText={setDateFrom}
              />
              <TextInput
                style={filterStyles.dateInput}
                placeholder="Até (YYYY-MM-DD)"
                placeholderTextColor="#cbd5e1"
                value={dateTo || ""}
                onChangeText={setDateTo}
              />
            </View>

            <TextComponent style={filterStyles.sectionTitle}>📍 Localização</TextComponent>
            <TouchableOpacity
              style={[filterStyles.checkbox, useLocation && filterStyles.checkboxActive]}
              onPress={() => setUseLocation(!useLocation)}
            >
              <TextComponent style={filterStyles.checkboxText}>
                {useLocation ? "✓" : ""} Próximo a minha localização atual
              </TextComponent>
            </TouchableOpacity>

            {useLocation && (
              <View>
                <TextComponent style={filterStyles.label}>Raio de busca (km):</TextComponent>
                <TextInput
                  style={filterStyles.input}
                  placeholder="50"
                  placeholderTextColor="#cbd5e1"
                  value={radiusKm}
                  onChangeText={setRadiusKm}
                  keyboardType="number-pad"
                />
              </View>
            )}
          </ScrollView>

          <View style={filterStyles.footer}>
            <TouchableOpacity style={filterStyles.buttonCancel} onPress={onClose}>
              <TextComponent style={filterStyles.buttonText}>Cancelar</TextComponent>
            </TouchableOpacity>
            <TouchableOpacity style={filterStyles.buttonApply} onPress={handleApply}>
              <TextComponent style={filterStyles.buttonText}>Aplicar</TextComponent>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const filterStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  closeIcon: {
    fontSize: 24,
    color: "#94a3b8",
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginTop: 16,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#1e293b",
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    marginBottom: 12,
  },
  checkboxActive: {
    backgroundColor: "#dbeafe",
    borderColor: "#3b82f6",
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#1e293b",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  buttonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
  },
  buttonApply: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 15,
    color: "#fff",
  },
});

// ============== EditPhotoModal ==============
interface EditPhotoModalProps {
  visible: boolean;
  photo: { id: number; title: string; latitude: number; longitude: number } | null;
  onClose: () => void;
  onSave: (title: string, latitude: number, longitude: number) => void;
}

export function EditPhotoModal({
  visible,
  photo,
  onClose,
  onSave,
}: EditPhotoModalProps) {
  const [title, setTitle] = useState(photo?.title || "");
  const [latitude, setLatitude] = useState(String(photo?.latitude || ""));
  const [longitude, setLongitude] = useState(String(photo?.longitude || ""));

  if (!photo) return null;

  const handleSave = () => {
    if (!title.trim()) {
      alert("Título não pode ser vazio");
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      alert("Coordenadas inválidas");
      return;
    }

    onSave(title, lat, lon);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={editStyles.overlay}>
        <View style={editStyles.container}>
          <View style={editStyles.header}>
            <TextComponent style={editStyles.title}>Editar Foto</TextComponent>
          </View>

          <ScrollView style={editStyles.content} showsVerticalScrollIndicator={false}>
            <TextComponent style={editStyles.label}>Título</TextComponent>
            <TextInput
              style={editStyles.input}
              placeholder="Digite o título"
              placeholderTextColor="#cbd5e1"
              value={title}
              onChangeText={setTitle}
            />

            <TextComponent style={editStyles.label}>Latitude</TextComponent>
            <TextInput
              style={editStyles.input}
              placeholder="Ex: -14.235"
              placeholderTextColor="#cbd5e1"
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="decimal-pad"
            />

            <TextComponent style={editStyles.label}>Longitude</TextComponent>
            <TextInput
              style={editStyles.input}
              placeholder="Ex: -51.925"
              placeholderTextColor="#cbd5e1"
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="decimal-pad"
            />
          </ScrollView>

          <View style={editStyles.footer}>
            <TouchableOpacity style={editStyles.buttonCancel} onPress={onClose}>
              <TextComponent style={editStyles.buttonText}>Cancelar</TextComponent>
            </TouchableOpacity>
            <TouchableOpacity style={editStyles.buttonSave} onPress={handleSave}>
              <TextComponent style={editStyles.buttonText}>Salvar</TextComponent>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const editStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    width: "100%",
    maxHeight: "80%",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1e293b",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  buttonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
  },
  buttonSave: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#10b981",
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 15,
    color: "#fff",
  },
});

// ============== CreateAlbumModal ==============
interface CreateAlbumModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export function CreateAlbumModal({
  visible,
  onClose,
  onCreate,
}: CreateAlbumModalProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");

  const handleCreate = () => {
    if (!name.trim()) {
      alert("Nome do álbum é obrigatório");
      return;
    }
    onCreate(name, selectedColor);
    setName("");
    setSelectedColor("#3b82f6");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={createStyles.overlay}>
        <View style={createStyles.container}>
          <TextComponent style={createStyles.title}>Criar Novo Álbum</TextComponent>

          <TextInput
            style={createStyles.input}
            placeholder="Nome do álbum"
            placeholderTextColor="#cbd5e1"
            value={name}
            onChangeText={setName}
          />

          <TextComponent style={createStyles.colorLabel}>Escolha uma cor:</TextComponent>
          <View style={createStyles.colorGrid}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  createStyles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && createStyles.colorSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && <TextComponent style={createStyles.checkmark}>✓</TextComponent>}
              </TouchableOpacity>
            ))}
          </View>

          <View style={createStyles.footer}>
            <TouchableOpacity style={createStyles.buttonCancel} onPress={onClose}>
              <TextComponent style={createStyles.buttonText}>Cancelar</TextComponent>
            </TouchableOpacity>
            <TouchableOpacity style={createStyles.buttonCreate} onPress={handleCreate}>
              <TextComponent style={createStyles.buttonText}>Criar</TextComponent>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#1e293b",
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  checkmark: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
  },
  buttonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
  },
  buttonCreate: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 15,
    color: "#fff",
  },
});
