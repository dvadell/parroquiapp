import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { WebView } from 'react-native-webview';
import { useState } from 'react';

export default function ListScreen() {
  const [key, setKey] = useState(0);

  const handleReload = () => {
    setKey((prevKey) => prevKey + 1);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleReload}>
        <Text style={styles.buttonText}>Tomar lista de nuevo</Text>
      </TouchableOpacity>
      <WebView
        key={key}
        style={styles.webview}
        source={{ uri: 'https://parroquia:parroquia@parroquia.of.ardor.link/' }}
        testID="list-webview"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    padding: 15,
  },
  buttonText: {
    color: Colors.light.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: Colors.light.background,
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
