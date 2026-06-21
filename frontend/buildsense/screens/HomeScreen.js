import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const features = [
    { icon: 'camera',     title: 'Analyse Plot',    desc: 'Upload plot photo for AI analysis',  screen: 'Analyse'  },
    { icon: 'grid',       title: 'Generate Layout', desc: 'AI-powered house layout suggestions', screen: 'Layouts'  },
    { icon: 'calculator', title: 'Cost Estimate',   desc: 'Predict construction costs',          screen: 'Cost'     },
    { icon: 'folder',     title: 'My Projects',     desc: 'View and manage your projects',       screen: 'Projects' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Ionicons name="business" size={60} color="#e94560" />
        <Text style={styles.heroTitle}>BuildSense AI</Text>
        <Text style={styles.heroSub}>Smart property development assistant</Text>
      </View>

      <Text style={styles.sectionTitle}>What would you like to do?</Text>

      <View style={styles.grid}>
        {features.map((f, i) => (
          <TouchableOpacity
            key={i}
            style={styles.card}
            onPress={() => navigation.navigate(f.screen)}
          >
            <Ionicons name={f.icon} size={32} color="#e94560" />
            <Text style={styles.cardTitle}>{f.title}</Text>
            <Text style={styles.cardDesc}>{f.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container    : { flex: 1, backgroundColor: '#0f0f1a' },
  hero         : { alignItems: 'center', padding: 40, paddingTop: 60 },
  heroTitle    : { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  heroSub      : { fontSize: 14, color: '#888', marginTop: 6 },
  sectionTitle : { fontSize: 18, fontWeight: 'bold', color: '#fff', margin: 20, marginBottom: 12 },
  grid         : { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  card         : {
    width          : '46%',
    backgroundColor: '#1a1a2e',
    borderRadius   : 12,
    padding        : 20,
    margin         : '2%',
    alignItems     : 'center',
    borderWidth    : 1,
    borderColor    : '#333',
  },
  cardTitle : { fontSize: 14, fontWeight: 'bold', color: '#fff', marginTop: 10, textAlign: 'center' },
  cardDesc  : { fontSize: 11, color: '#888', marginTop: 6, textAlign: 'center' },
});