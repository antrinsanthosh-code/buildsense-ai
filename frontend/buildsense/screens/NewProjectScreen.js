import { View, Text, StyleSheet } from 'react-native';

export default function NewProjectScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>New Project — Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container : { flex: 1, backgroundColor: '#0f0f1a', justifyContent: 'center', alignItems: 'center' },
  text      : { color: '#fff', fontSize: 16 },
});