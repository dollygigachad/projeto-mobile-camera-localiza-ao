import RepositorioFoto from "@/database/repositories/repositorio.foto";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

export default function Add() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const repo = new RepositorioFoto();

  useEffect(() => {
    Location.requestForegroundPermissionsAsync();
  }, []);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.text}>Precisamos de acesso à câmera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Permitir Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const result = await cameraRef.current.takePictureAsync();
      await captureLocation();
      setPhoto(result.uri);
    } catch (error) {
      Alert.alert("Erro", "Falha ao tirar foto");
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        await captureLocation();
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar foto da galeria");
    }
  };

  const captureLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setLatitude(loc.coords.latitude);
        setLongitude(loc.coords.longitude);
      }
    } catch (error) {
      console.log("Erro ao capturar localização:", error);
    }
  };

  const handleSaveImage = async (uri: string) => {
    if (!titulo.trim()) {
      Alert.alert("Informe um título");
      return;
    }
    try {
      const nomeArquivo = `foto_${Date.now()}.jpg`;
      const destino = (FileSystem.documentDirectory ?? "") + nomeArquivo;
      await FileSystem.copyAsync({ from: uri, to: destino });
      repo.create({
        title: titulo,
        image_uri: destino,
        latitude: latitude || 0,
        longitude: longitude || 0,
      });
      Alert.alert("Sucesso", "Foto salva com sucesso!");
      setPhoto(null);
      setTitulo("");
      setLatitude(null);
      setLongitude(null);
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar a foto");
      console.log(error);
    }
  };

  const toggleCamera = () => setFacing(facing === "back" ? "front" : "back");
  const discardPhoto = () => {
    setPhoto(null);
    setLatitude(null);
    setLongitude(null);
    setTitulo("");
  };

  if (photo) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.previewContainer}>
          <Text style={styles.sectionTitle}>Prévia da Foto</Text>
          <Image source={{ uri: photo }} style={styles.preview} />

          {latitude !== null && longitude !== null && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationIcon}>📍</Text>
              <View style={styles.locationText}>
                <Text style={styles.locationLabel}>Localização capturada</Text>
                <Text style={styles.coordinates}>
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.inputLabel}>Título da Foto</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite um título descritivo"
            value={titulo}
            onChangeText={setTitulo}
            placeholderTextColor="#cbd5e1"
          />

          <View style={styles.previewButtons}>
            <TouchableOpacity
              style={[styles.button, styles.discard]}
              onPress={discardPhoto}
            >
              <Text style={styles.buttonIcon}>✕</Text>
              <Text style={styles.buttonText}>Descartar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.save]}
              onPress={() => handleSaveImage(photo!)}
            >
              <Text style={styles.buttonIcon}>✓</Text>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Câmera</Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleCamera}>
            <Text style={styles.largeIcon}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={pickFromGallery}
          >
            <Text style={styles.largeIcon}>🖼️</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0f172a" 
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  camera: { 
    flex: 1 
  },
  header: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  previewContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: 16,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#cbd5e1",
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#334155",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#1e293b",
    color: "#e2e8f0",
    fontWeight: "500",
    marginBottom: 16,
  },
  text: { 
    fontSize: 18, 
    marginBottom: 20, 
    textAlign: "center",
    color: "#1e293b",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 15,
  },
  buttonIcon: {
    fontSize: 18,
    color: "#fff",
  },
  preview: { 
    width: "100%",
    height: 300,
    backgroundColor: "#000",
    borderRadius: 12,
    marginBottom: 16,
  },
  previewButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 12,
    marginTop: 20,
  },
  discard: { 
    backgroundColor: "#ef4444",
    flex: 1,
    paddingVertical: 14,
  },
  save: { 
    backgroundColor: "#10b981",
    flex: 1,
    paddingVertical: 14,
  },
  controls: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconButton: { 
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  icon: { 
    fontSize: 18,
    fontWeight: "600",
  },
  largeIcon: {
    fontSize: 32,
    fontWeight: "600",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  captureInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#ef4444",
    borderWidth: 3,
    borderColor: "#fff",
  },
  placeholder: { 
    width: 56 
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  locationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  locationText: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: "#cbd5e1",
    fontWeight: "600",
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 13,
    color: "#3b82f6",
    fontWeight: "500",
    fontFamily: "monospace",
  },
});
