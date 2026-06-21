import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API = 'https://epidemic-grieving-removal.ngrok-free.dev';

export default function ProjectsScreen() {
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API}/projects/`);
      setProjects(res.data);
    } catch (e) {
      Alert.alert('Error', 'Could not load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    try {
      await axios.post(`${API}/projects/`, {
        name            : `Project ${Date.now()}`,
        plot_size_cents : 3.5,
        location        : 'Kerala'
      });
      fetchProjects();
    } catch (e) {
      Alert.alert('Error', 'Could not create project');
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#e94560" />
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={createProject}>
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={styles.addBtnText}>New Project</Text>
      </TouchableOpacity>

      <FlatList
        data={projects}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="business" size={24} color="#e94560" />
              <Text style={styles.cardTitle}>{item.name}</Text>
            </View>
            <Text style={styles.cardDetail}>Location: {item.location || 'Kerala'}</Text>
            <Text style={styles.cardDetail}>Plot: {item.plot_size_cents || '—'} cents</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="folder-open-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>No projects yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container   : { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  center      : { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  addBtn      : {
    flexDirection    : 'row',
    backgroundColor  : '#e94560',
    padding          : 14,
    borderRadius     : 10,
    alignItems       : 'center',
    justifyContent   : 'center',
    marginBottom     : 16,
    gap              : 8,
  },
  addBtnText  : { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card        : {
    backgroundColor : '#1a1a2e',
    borderRadius    : 12,
    padding         : 16,
    marginBottom    : 12,
    borderWidth     : 1,
    borderColor     : '#333',
  },
  cardHeader  : { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  cardTitle   : { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  cardDetail  : { fontSize: 13, color: '#888', marginTop: 2 },
  statusBadge : {
    marginTop       : 10,
    backgroundColor : '#e9456020',
    paddingVertical : 4,
    paddingHorizontal: 10,
    borderRadius    : 20,
    alignSelf       : 'flex-start',
  },
  statusText  : { color: '#e94560', fontSize: 12, fontWeight: 'bold' },
  emptyText   : { color: '#555', fontSize: 16, marginTop: 12 },
});