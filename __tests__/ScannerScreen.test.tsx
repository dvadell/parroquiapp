import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ScannerScreen from '../app/(tabs)/scanner';
import { Alert } from 'react-native';

// Mock Alert.alert directly
jest.spyOn(Alert, 'alert');

// Mock the theme constants
jest.mock('@/constants/theme', () => ({
  Colors: {
    light: {
      background: '#ffffff',
      text: '#000000',
    },
  },
}));

// Mock expo-camera
jest.mock('expo-camera', () => {
  const { View } = jest.requireActual('react-native'); // Import View here
  return {
    useCameraPermissions: jest.fn(() => [
      { granted: true, status: 'granted' },
      jest.fn(), // Mock requestPermission function
    ]),
    CameraView: jest.fn(({ children }) => {
      // This mock component will allow us to inspect its props
      return <View testID="mock-camera-view">{children}</View>;
    }),
  };
});

describe('ScannerScreen', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset the mock for useCameraPermissions to its default granted state
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('expo-camera').useCameraPermissions.mockReturnValue([
      { granted: true, status: 'granted' },
      jest.fn(),
    ]);
    // Reset the mock for expo-location to its default granted state
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('expo-location').requestForegroundPermissionsAsync.mockReturnValue(
      Promise.resolve({ status: 'granted' })
    );
  });

  it('renders correctly when camera permissions are granted', () => {
    const { getByText } = render(<ScannerScreen />);
    expect(getByText('Scan QR Code')).toBeTruthy();
  });

  it('shows permission request message when permissions are not granted', () => {
    // Mock permissions to be not granted for this specific test
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('expo-camera').useCameraPermissions.mockReturnValueOnce([
      { granted: false, status: 'denied' },
      jest.fn(),
    ]);
    const { getByText } = render(<ScannerScreen />);
    expect(
      getByText('We need your permission to show the camera')
    ).toBeTruthy();
  });

  it('shows requesting permission message when permission status is undetermined', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('expo-camera').useCameraPermissions.mockReturnValueOnce([
      null, // permission is null when undetermined
      jest.fn(),
    ]);
    const { getByText } = render(<ScannerScreen />);
    expect(getByText('Requesting for camera permission...')).toBeTruthy();
  });

  it('calls onBarcodeScanned and shows alert when QR code is scanned', async () => {
    const { getByText } = render(<ScannerScreen />);

    // Get the mock function for CameraView
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const MockCameraView = require('expo-camera').CameraView;

    // Access the props passed to the first call of MockCameraView
    const cameraViewProps = MockCameraView.mock.calls[0][0];

    // Simulate barcode scan
    act(() => {
      cameraViewProps.onBarcodeScanned({ data: 'test-qr-data' });
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'QR Code Scanned!',
        `Data: test-qr-data
Location: Lat 0, Lon 0`,
        [{ text: 'Scan Again', onPress: expect.any(Function) }],
        { cancelable: false }
      );
    });

    // Simulate "Scan Again" button press
    const scanAgainButton = getByText('Tap to Scan Again');
    fireEvent.press(scanAgainButton);
    expect(getByText('Scan QR Code')).toBeTruthy(); // Should go back to scanning state
  });

  it('shows alert when location permission is denied', async () => {
    // Override the default mock for this test
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('expo-location').requestForegroundPermissionsAsync.mockReturnValueOnce(
      Promise.resolve({ status: 'denied' })
    );

    render(<ScannerScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission to access location was denied'
      );
    });
  });
});
