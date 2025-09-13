import {
  Alert,
  Button,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Colors } from '@/constants/theme';
import { sendQrData } from '@/utils/api';
import { useLog } from '@/hooks/use-log';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { addLog } = useLog();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
    })();
  }, []);

  if (!permission) {
    // Camera permissions are still loading.
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting for camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);

    const currentLocation = await Location.getCurrentPositionAsync({});

    const payload = {
      qr: data,
      location: `Lat ${currentLocation.coords.latitude}, Lon ${currentLocation.coords.longitude}`,
      date: new Date().toISOString(),
    };

    addLog({
      type: 'QR_SCAN',
      message: `QR Scanned: ${payload.qr}, Location: ${payload.location}`,
      data: payload,
    });

    const result = await sendQrData(payload);

    addLog({
      type: 'POST_RESULT',
      message: `POST Result: ${result.message}`,
      data: result,
    });

    if (result.success) {
      Alert.alert(
        'QR Code Scanned!',
        result.message,
        [
          {
            text: 'Scan Again',
            onPress: () => {
              setScanned(false);
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert(
        'Error',
        result.message,
        [
          {
            text: 'Continue Scanning',
            onPress: () => {
              setScanned(false);
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'android' ? <StatusBar hidden /> : null}

      <Text style={styles.title}>Scan QR Code</Text>

      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>
      </View>

      {scanned && (
        <Button
          title={'Tap to Scan Again'}
          onPress={() => {
            setScanned(false);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    backgroundColor: Colors.light.black,
    borderRadius: 10,
    height: 300,
    marginBottom: 20,
    overflow: 'hidden',
    width: 300,
  },
  container: {
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    flex: 1,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    borderColor: Colors.light.white,
    borderRadius: 10,
    borderWidth: 2,
    height: 200,
    width: 200,
  },
  text: {
    color: Colors.light.text,
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    color: Colors.light.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
