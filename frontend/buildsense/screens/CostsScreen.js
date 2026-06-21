import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API = 'https://epidemic-grieving-removal.ngrok-free.dev';

export default function CostScreen() {
  const [sqft, setSqft]               = useState('900');
  const [bath, setBath]               = useState('2');
  const [bhk, setBhk]                 = useState('2');
  const [cents, setCents]             = useState('3.5');
  const [garden, setGarden]           = useState(true);
  const [aquarium, setAquarium]       = useState(false);
  const [finishing, setFinishing]     = useState(2);
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);

  const predict = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/costs/predict`, {
        total_sqft      : parseFloat(sqft),
        bath            : parseFloat(bath),
        bhk             : parseInt(bhk),
        plot_size_cents : parseFloat(cents),
        has_garden      : garden ? 1 : 0,
        has_aquarium    : aquarium ? 1 : 0,
        finishing_level : finishing
      });
      setResult(res.data);
    } catch (e) {
      Alert.alert('Error', 'Could not predict cost');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cost Estimator</Text>
      <Text style={styles.subtitle}>Predict construction cost for your house</Text>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Total Sqft</Text>
          <TextInput style={styles.input} value={sqft} onChangeText={setSqft} keyboardType="decimal-pad" placeholderTextColor="#555" />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Plot (cents)</Text>
          <TextInput style={styles.input} value={cents} onChangeText={setCents} keyboardType="decimal-pad" placeholderTextColor="#555" />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>BHK</Text>
          <TextInput style={styles.input} value={bhk} onChangeText={setBhk} keyboardType="number-pad" placeholderTextColor="#555" />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Bathrooms</Text>
          <TextInput style={styles.input} value={bath} onChangeText={setBath} keyboardType="decimal-pad" placeholderTextColor="#555" />
        </View>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Garden</Text>
        <Switch value={garden} onValueChange={setGarden} trackColor={{ true: '#e94560' }} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Aquarium</Text>
        <Switch value={aquarium} onValueChange={setAquarium} trackColor={{ true: '#e94560' }} />
      </View>

      <Text style={styles.label}>Finishing Level</Text>
      <View style={styles.finishingRow}>
        {[
          { val: 1, label: 'Basic' },
          { val: 2, label: 'Standard' },
          { val: 3, label: 'Premium' }
        ].map(f => (
          <TouchableOpacity
            key={f.val}
            style={[styles.finishingBtn, finishing === f.val && styles.finishingBtnActive]}
            onPress={() => setFinishing(f.val)}
          >
            <Text style={[styles.finishingText, finishing === f.val && styles.finishingTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.predictBtn} onPress={predict}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <>
              <Ionicons name="calculator" size={20} color="#fff" />
              <Text style={styles.predictBtnText}>Predict Cost</Text>
            </>
        }
      </TouchableOpacity>

      {result && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>Cost Prediction</Text>

          <View style={styles.mainPrice}>
            <Text style={styles.mainPriceLabel}>Estimated Cost</Text>
            <Text style={styles.mainPriceValue}>₹{result.predicted_cost_lakhs} Lakhs</Text>
            <Text style={styles.priceRange}>
              Range: ₹{result.price_range_min_lakhs}L — ₹{result.price_range_max_lakhs}L
            </Text>
          </View>

          <Text style={styles.breakdownTitle}>Cost Breakdown</Text>
          {Object.entries(result.breakdown).map(([key, val]) => (
            <View key={key} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{key.replace('_lakhs', '').replace('_', ' ')}</Text>
              <Text style={styles.breakdownValue}>₹{val}L</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container        : { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  title            : { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  subtitle         : { fontSize: 14, color: '#888', marginBottom: 20 },
  row              : { flexDirection: 'row', marginBottom: 4 },
  inputGroup       : { marginBottom: 14 },
  label            : { fontSize: 13, color: '#888', marginBottom: 6 },
  input            : {
    backgroundColor : '#1a1a2e',
    borderRadius    : 8,
    padding         : 12,
    color           : '#fff',
    fontSize        : 16,
    borderWidth     : 1,
    borderColor     : '#333',
  },
  switchRow        : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  finishingRow     : { flexDirection: 'row', gap: 8, marginBottom: 20 },
  finishingBtn     : {
    flex            : 1,
    padding         : 10,
    borderRadius    : 8,
    borderWidth     : 1,
    borderColor     : '#333',
    alignItems      : 'center',
    backgroundColor : '#1a1a2e',
  },
  finishingBtnActive : { backgroundColor: '#e94560', borderColor: '#e94560' },
  finishingText      : { color: '#888', fontSize: 13 },
  finishingTextActive: { color: '#fff', fontWeight: 'bold' },
  predictBtn       : {
    flexDirection   : 'row',
    backgroundColor : '#e94560',
    padding         : 14,
    borderRadius    : 10,
    alignItems      : 'center',
    justifyContent  : 'center',
    gap             : 8,
    marginBottom    : 20,
  },
  predictBtnText   : { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  results          : { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#333' },
  resultsTitle     : { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  mainPrice        : { alignItems: 'center', marginBottom: 20 },
  mainPriceLabel   : { fontSize: 13, color: '#888' },
  mainPriceValue   : { fontSize: 32, fontWeight: 'bold', color: '#e94560', marginTop: 4 },
  priceRange       : { fontSize: 12, color: '#555', marginTop: 4 },
  breakdownTitle   : { fontSize: 14, fontWeight: 'bold', color: '#e94560', marginBottom: 10 },
  breakdownRow     : { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#333' },
  breakdownLabel   : { fontSize: 13, color: '#888', textTransform: 'capitalize' },
  breakdownValue   : { fontSize: 13, fontWeight: 'bold', color: '#fff' },
});