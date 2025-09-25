import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parroquiapp</Text>
      <Link href="/(tabs)" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>QR Scanner</Text>
        </TouchableOpacity>
      </Link>
      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Barcode Scanner</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 40,
    paddingVertical: 15,
  },
  buttonText: {
    color: Colors.light.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
});
