import {
  Alert,
  Button,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import beepSound from '../../assets/sounds/beep.wav';
import { Colors } from '@/constants/theme';
import { sendQrData } from '@/utils/api';
import { useLog } from '@/hooks/use-log';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const { addLog } = useLog();
  const cameraRef = useRef<CameraView>(null);
  const [animationState, setAnimationState] = useState({
    processingText: '',
    showOK: false,
  });

  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const player = useAudioPlayer(beepSound);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
    })();

    (async () => {
      await setAudioModeAsync({
        playsInSilentMode: true,
      });
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
    setIsCameraActive(false);

    try {
      player.seekTo(0);
      player.play();
    } catch {
      // TODO: Handle audio playback error
    }

    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        setScreenshotUri(photo.uri);
      }
    } catch {
      addLog({ type: 'ERROR', message: 'Failed to capture image' });
      // If image capture fails, proceed without a screenshot
    }

    setScanned(true);
    setAnimationState({
      processingText: `Processing ${data}...`,
      showOK: false,
    });

    Animated.timing(floatAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

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

    const result = await sendQrData(payload, addLog);

    addLog({
      type: 'POST_RESULT',
      message: `POST Result: ${result.message}`,
      data: result,
    });

    if (result.success) {
      setAnimationState({
        processingText: `Processing ${data}...`,
        showOK: true,
      });
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setScanned(false);
          setIsCameraActive(true);
          setScreenshotUri(null);
          floatAnim.setValue(0);
          fadeAnim.setValue(1);
        });
      }, 500);
    } else {
      Alert.alert(
        'Error',
        result.message,
        [
          {
            text: 'Continue Scanning',
            onPress: () => {
              setScanned(false);
              setIsCameraActive(true);
              setScreenshotUri(null);
              floatAnim.setValue(0);
              fadeAnim.setValue(1);
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  const animatedStyle = {
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 200],
        }),
      },
    ],
    opacity: fadeAnim,
  };

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'android' ? <StatusBar hidden /> : null}

      <Text style={styles.title}>Scan QR Code</Text>

      <View style={styles.cameraContainer}>
        {scanned && screenshotUri ? (
          <Animated.View style={[styles.cameraContainer, animatedStyle]}>
            <Animated.Image
              source={{ uri: screenshotUri }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        ) : (
          isCameraActive && (
            <CameraView
              ref={cameraRef}
              onBarcodeScanned={
                isCameraActive ? handleBarcodeScanned : undefined
              }
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              style={StyleSheet.absoluteFillObject}
            />
          )
        )}
        {!scanned && (
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
          </View>
        )}
      </View>

      {scanned && (
        <Animated.View
          style={[styles.processingContainer, { opacity: fadeAnim }]}
        >
          <Text style={styles.text}>
            {animationState.processingText}
            {animationState.showOK && <Text style={styles.okText}> OK</Text>}
          </Text>
        </Animated.View>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingVertical: 30, // Added vertical padding
  },
  okText: {
    color: Colors.light.success,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingContainer: {
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    borderRadius: 10,
    padding: 10,
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
