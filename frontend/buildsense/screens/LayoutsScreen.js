import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API = 'https://epidemic-grieving-removal.ngrok-free.dev';

export default function LayoutsScreen({ navigation }) {
  const [plotSize, setPlotSize] = useState('3.5');
  const [location, setLocation] = useState('Thrissur');
  const [layouts, setLayouts]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState(null);

  const generateLayouts = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/layouts/generate`, {
        project_id      : 'test',
        plot_size_cents : parseFloat(plotSize),
        location        : location,
        plot_analysis   : {}
      });
      setLayouts(res.data.layouts);
    } catch (e) {
      Alert.alert('Error', 'Could not generate layouts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Layout Generator</Text>
      <Text style={styles.subtitle}>AI-powered house layout suggestions</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Plot Size (cents)</Text>
        <TextInput
          style={styles.input}
          value={plotSize}
          onChangeText={setPlotSize}
          keyboardType="decimal-pad"
          placeholderTextColor="#555"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholderTextColor="#555"
        />
      </View>

      <TouchableOpacity style={styles.generateBtn} onPress={generateLayouts}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <>
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.generateBtnText}>Generate Layouts</Text>
            </>
        }
      </TouchableOpacity>

      {layouts && layouts.map((layout, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.card, selected === i && styles.cardSelected]}
          onPress={() => setSelected(selected === i ? null : i)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{layout.name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{layout.bhk}</Text>
            </View>
          </View>

          <Text style={styles.cardSqft}>{layout.sqft} sqft</Text>

          <View style={styles.priceRow}>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Build Cost</Text>
              <Text style={styles.priceValue}>₹{layout.estimated_cost_lakhs}L</Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Sell Price</Text>
              <Text style={styles.priceValue}>₹{layout.selling_price_lakhs}L</Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Profit</Text>
              <Text style={[styles.priceValue, { color: '#2ecc71' }]}>
                ₹{layout.selling_price_lakhs - layout.estimated_cost_lakhs}L
              </Text>
            </View>
          </View>

          {selected === i && (
            <>
              <Text style={styles.sectionLabel}>Room Layout:</Text>
              {Object.entries(layout.rooms || {}).map(([room, desc]) => (
                <Text key={room} style={styles.roomItem}>• {room}: {desc}</Text>
              ))}

              <Text style={styles.sectionLabel}>Key Features:</Text>
              {layout.key_features?.map((f, j) => (
                <Text key={j} style={styles.roomItem}>✓ {f}</Text>
              ))}

              <Text style={styles.sectionLabel}>Vastu Notes:</Text>
              <Text style={styles.vastuText}>{layout.vastu_notes}</Text>

              <TouchableOpacity
                style={styles.view3DBtn}
                onPress={() => navigation.navigate('3D View', { layout })}
              >
                <Ionicons name="cube" size={20} color="#fff" />
                <Text style={styles.view3DBtnText}>View in 3D</Text>
              </TouchableOpacity>
            </>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container       : { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  title           : { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  subtitle        : { fontSize: 14, color: '#888', marginBottom: 20 },
  inputGroup      : { marginBottom: 14 },
  label           : { fontSize: 13, color: '#888', marginBottom: 6 },
  input           : {
    backgroundColor : '#1a1a2e',
    borderRadius    : 8,
    padding         : 12,
    color           : '#fff',
    fontSize        : 16,
    borderWidth     : 1,
    borderColor     : '#333',
  },
  generateBtn     : {
    flexDirection   : 'row',
    backgroundColor : '#e94560',
    padding         : 14,
    borderRadius    : 10,
    alignItems      : 'center',
    justifyContent  : 'center',
    gap             : 8,
    marginBottom    : 20,
  },
  generateBtnText : { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card            : {
    backgroundColor : '#1a1a2e',
    borderRadius    : 12,
    padding         : 16,
    marginBottom    : 12,
    borderWidth     : 1,
    borderColor     : '#333',
  },
  cardSelected    : { borderColor: '#e94560' },
  cardHeader      : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle       : { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  badge           : { backgroundColor: '#e9456030', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText       : { color: '#e94560', fontSize: 12, fontWeight: 'bold' },
  cardSqft        : { color: '#888', fontSize: 13, marginBottom: 12 },
  priceRow        : { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceBox        : { alignItems: 'center' },
  priceLabel      : { fontSize: 11, color: '#888' },
  priceValue      : { fontSize: 16, fontWeight: 'bold', color: '#fff', marginTop: 2 },
  sectionLabel    : { fontSize: 13, fontWeight: 'bold', color: '#e94560', marginTop: 14, marginBottom: 6 },
  roomItem        : { fontSize: 12, color: '#ccc', marginBottom: 3 },
  vastuText       : { fontSize: 12, color: '#ccc', fontStyle: 'italic' },
  view3DBtn       : {
    flexDirection   : 'row',
    backgroundColor : '#0f3460',
    padding         : 12,
    borderRadius    : 8,
    alignItems      : 'center',
    justifyContent  : 'center',
    gap             : 8,
    marginTop       : 12,
  },
  view3DBtnText   : { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});