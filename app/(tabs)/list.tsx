import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '@/constants/theme';
import { WebView } from 'react-native-webview';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { sendLocationData } from '@/utils/api';
import { useLog } from '@/hooks/use-log';

export default function ListScreen() {
  const [key, setKey] = useState(0);
  const { addLog } = useLog();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Permission to access location was denied.'
        );
        return;
      }
    })();
  }, []);

  const handleReload = async () => {
    setKey((prevKey) => prevKey + 1);

    let location;
    try {
      const locationResult = await Location.getCurrentPositionAsync({});
      location = `lat:${locationResult.coords.latitude},lon:${locationResult.coords.longitude}`;
    } catch (error) {
      addLog({
        type: 'LOCATION_SEND',
        message: `Error getting location: ${error}`,
        data: error,
      });
      Alert.alert(
        'Location Error',
        'Could not retrieve your current location.'
      );
      return;
    }

    const result = await sendLocationData(location, addLog);
    if (result.success) {
      Alert.alert('Success', 'Location data sent successfully!');
    } else {
      Alert.alert('Error', `Failed to send location data: ${result.message}`);
    }
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
