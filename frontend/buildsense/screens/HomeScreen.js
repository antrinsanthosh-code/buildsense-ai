import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const FeatureCard = ({ icon, title, desc, gradient, onPress, delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        delay,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }], opacity }, styles.cardWrapper]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={28} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDesc}>{desc}</Text>
          <View style={styles.cardArrow}>
            <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.7)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen({ navigation }) {
  const headerAnim = useRef(new Animated.Value(-50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const features = [
    {
      icon    : 'scan',
      title   : 'Analyse Plot',
      desc    : 'AI-powered land analysis',
      gradient: ['#e94560', '#c0392b'],
      screen  : 'Analyse',
      delay   : 100,
    },
    {
      icon    : 'home',
      title   : 'Generate Layout',
      desc    : 'Smart house designs',
      gradient: ['#0f3460', '#1a6b9e'],
      screen  : 'Layouts',
      delay   : 200,
    },
    {
      icon    : 'calculator',
      title   : 'Cost Estimate',
      desc    : 'ML-powered prediction',
      gradient: ['#6c3483', '#9b59b6'],
      screen  : 'Cost',
      delay   : 300,
    },
    {
      icon    : 'cube',
      title   : '3D Viewer',
      desc    : 'Visualise your house',
      gradient: ['#1a7a3a', '#2ecc71'],
      screen  : '3D View',
      delay   : 400,
    },
    {
      icon    : 'folder',
      title   : 'My Projects',
      desc    : 'Track all builds',
      gradient: ['#b7470a', '#e67e22'],
      screen  : 'Projects',
      delay   : 500,
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0f', '#0f0f1a', '#0a0a0f']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <Animated.View style={[
          styles.header,
          { transform: [{ translateY: headerAnim }], opacity: headerOpacity }
        ]}>
          <LinearGradient
            colors={['#e94560', '#f5a623']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoBadge}
          >
            <Ionicons name="business" size={24} color="#fff" />
          </LinearGradient>
          <View style={styles.headerText}>
            <Text style={styles.appName}>BuildSense AI</Text>
            <Text style={styles.tagline}>Smart Property Intelligence</Text>
          </View>
        </Animated.View>

        {/* Hero section */}
        <Animated.View style={[styles.hero, { opacity: headerOpacity }]}>
          <LinearGradient
            colors={['rgba(233,69,96,0.15)', 'rgba(15,52,96,0.15)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Text style={styles.heroTitle}>Your AI Property{'\n'}Development Partner</Text>
            <Text style={styles.heroSub}>
              From plot analysis to 3D visualisation — powered by machine learning
            </Text>
            <View style={styles.statsRow}>
              {[
                { val: '18+', label: 'Years Data' },
                { val: 'AI', label: 'Powered' },
                { val: '3D', label: 'Visualise' },
              ].map((s, i) => (
                <View key={i} style={styles.statItem}>
                  <Text style={styles.statVal}>{s.val}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Features */}
        <Text style={styles.sectionTitle}>What would you like to do?</Text>
        <View style={styles.grid}>
          {features.map((f, i) => (
            <FeatureCard
              key={i}
              {...f}
              onPress={() => navigation.navigate(f.screen)}
            />
          ))}
        </View>

        {/* Bottom padding */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = (width - 48) / 2;

const styles = StyleSheet.create({
  container     : { flex: 1, backgroundColor: '#0a0a0f' },
  scroll        : { paddingHorizontal: 16, paddingTop: 60 },
  header        : {
    flexDirection : 'row',
    alignItems    : 'center',
    marginBottom  : 24,
    gap           : 12,
  },
  logoBadge     : {
    width         : 44,
    height        : 44,
    borderRadius  : 12,
    alignItems    : 'center',
    justifyContent: 'center',
  },
  headerText    : { flex: 1 },
  appName       : { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  tagline       : { fontSize: 12, color: '#666', marginTop: 2 },
  hero          : { marginBottom: 28 },
  heroCard      : {
    borderRadius  : 20,
    padding       : 24,
    borderWidth   : 1,
    borderColor   : 'rgba(255,255,255,0.08)',
  },
  heroTitle     : {
    fontSize      : 26,
    fontWeight    : '800',
    color         : '#fff',
    lineHeight    : 34,
    marginBottom  : 10,
  },
  heroSub       : { fontSize: 13, color: '#888', lineHeight: 20, marginBottom: 20 },
  statsRow      : { flexDirection: 'row', gap: 24 },
  statItem      : { alignItems: 'center' },
  statVal       : { fontSize: 20, fontWeight: '800', color: '#e94560' },
  statLabel     : { fontSize: 11, color: '#666', marginTop: 2 },
  sectionTitle  : {
    fontSize      : 16,
    fontWeight    : '700',
    color         : '#fff',
    marginBottom  : 16,
    letterSpacing : 0.3,
  },
  grid          : {
    flexDirection : 'row',
    flexWrap      : 'wrap',
    gap           : 12,
  },
  cardWrapper   : { width: CARD_WIDTH },
  card          : {
    borderRadius  : 20,
    padding       : 20,
    minHeight     : 160,
    justifyContent: 'space-between',
  },
  iconContainer : {
    width         : 48,
    height        : 48,
    borderRadius  : 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems    : 'center',
    justifyContent: 'center',
    marginBottom  : 12,
  },
  cardTitle     : { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  cardDesc      : { fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 16 },
  cardArrow     : { alignSelf: 'flex-end', marginTop: 8 },
});