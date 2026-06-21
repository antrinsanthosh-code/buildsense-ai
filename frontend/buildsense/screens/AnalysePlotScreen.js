import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API = 'https://epidemic-grieving-removal.ngrok-free.dev';

export default function AnalysePlotScreen() {
  const [image, setImage]       = useState(null);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes : ImagePicker.MediaTypeOptions.Images,
      quality    : 0.8,
    });
    if (!res.canceled) setImage(res.assets[0]);
  };

  const analysePhoto = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri  : image.uri,
        name : 'plot.jpg',
        type : 'image/jpeg',
      });
      const res = await axios.post(`${API}/plots/analyse`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data.analysis);
    } catch (e) {
      Alert.alert('Error', 'Could not analyse image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Plot Analysis</Text>
      <Text style={styles.subtitle}>Upload a photo of your land plot</Text>

      <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
        {image
          ? <Image source={{ uri: image.uri }} style={styles.image} />
          : <>
              <Ionicons name="camera-outline" size={48} color="#e94560" />
              <Text style={styles.uploadText}>Tap to select photo</Text>
            </>
        }
      </TouchableOpacity>

      {image && (
        <TouchableOpacity style={styles.analyseBtn} onPress={analysePhoto}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Ionicons name="scan" size={20} color="#fff" />
                <Text style={styles.analyseBtnText}>Analyse Plot</Text>
              </>
          }
        </TouchableOpacity>
      )}

      {result && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>Analysis Results</Text>

          <View style={styles.resultRow}>
            <Ionicons name="leaf" size={18} color="#2ecc71" />
            <Text style={styles.resultLabel}>Vegetation</Text>
            <Text style={styles.resultValue}>{result.vegetation_percentage}%</Text>
          </View>

          <View style={styles.resultRow}>
            <Ionicons name="globe" size={18} color="#3498db" />
            <Text style={styles.resultLabel}>Soil</Text>
            <Text style={styles.resultValue}>{result.soil_percentage}%</Text>
          </View>

          <View style={styles.resultRow}>
            <Ionicons name="compass" size={18} color="#e74c3c" />
            <Text style={styles.resultLabel}>Orientation</Text>
            <Text style={styles.resultValue}>{result.orientation_estimate}</Text>
          </View>

          <Text style={styles.notesTitle}>Notes:</Text>
          {result.analysis_notes?.map((note, i) => (
            <Text key={i} style={styles.note}>• {note}</Text>
          ))}

          {result.detections?.length > 0 && (
            <>
              <Text style={styles.notesTitle}>Detected objects:</Text>
              {result.detections.map((d, i) => (
                <Text key={i} style={styles.note}>• {d.label} ({Math.round(d.confidence * 100)}%)</Text>
              ))}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container    : { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  title        : { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  subtitle     : { fontSize: 14, color: '#888', marginBottom: 20 },
  uploadBox    : {
    height          : 220,
    backgroundColor : '#1a1a2e',
    borderRadius    : 12,
    borderWidth     : 2,
    borderColor     : '#e94560',
    borderStyle     : 'dashed',
    justifyContent  : 'center',
    alignItems      : 'center',
    marginBottom    : 16,
    overflow        : 'hidden',
  },
  image        : { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadText   : { color: '#888', marginTop: 10, fontSize: 14 },
  analyseBtn   : {
    flexDirection   : 'row',
    backgroundColor : '#e94560',
    padding         : 14,
    borderRadius    : 10,
    alignItems      : 'center',
    justifyContent  : 'center',
    gap             : 8,
    marginBottom    : 20,
  },
  analyseBtnText : { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  results        : { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#333' },
  resultsTitle   : { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  resultRow      : { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  resultLabel    : { flex: 1, fontSize: 14, color: '#888' },
  resultValue    : { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  notesTitle     : { fontSize: 14, fontWeight: 'bold', color: '#e94560', marginTop: 12, marginBottom: 6 },
  note           : { fontSize: 13, color: '#ccc', marginBottom: 4 },
});