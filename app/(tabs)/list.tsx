import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { WebView } from 'react-native-webview';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { sendLocationData } from '@/utils/api';
import { useLog } from '@/hooks/use-log';
import { processQueue } from '@/utils/requestQueue';

export default function ListScreen() {
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const handleSendLocationAndReloadWebView = async () => {
    setIsLoading(true);

    try {
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
      if (!result.success) {
        Alert.alert('Error', `Failed to send location data: ${result.message}`);
      } else {
        // If the initial send was successful, process any queued location requests
        processQueue(addLog, '/api/locations');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReloadWebView = async () => {
    setIsRefreshing(true);
    setKey((prevKey) => prevKey + 1);
    try {
      await processQueue(addLog);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance List</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSendLocationAndReloadWebView}
          disabled={isLoading || isRefreshing}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.light.white} />
          ) : (
            <Text style={styles.buttonText}>Tomar lista de nuevo</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.refreshIconContainer}
          onPress={handleReloadWebView}
          disabled={isLoading || isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator color={Colors.light.white} />
          ) : (
            <Ionicons name="refresh" size={24} color={Colors.light.white} />
          )}
        </TouchableOpacity>
      </View>
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
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    padding: 15,
  },
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  buttonText: {
    color: Colors.light.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: Colors.light.background,
    flex: 1,
    paddingVertical: 30,
  },
  refreshIconContainer: {
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    padding: 10,
    width: 50,
  },
  title: {
    color: Colors.light.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  webview: {
    flex: 1,
  },
});
