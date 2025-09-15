import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScannerScreen from '../app/(tabs)/index';
import { Alert } from 'react-native';
import { CameraView as MockCameraView } from 'expo-camera';
import { LogProvider } from '../hooks/use-log';
import { useCameraPermissions } from 'expo-camera';
import { processQueue } from '../utils/requestQueue';
import * as Location from 'expo-location';

// Helper function to render ScannerScreen within LogProvider
const renderWithLogProvider = (component: React.ReactElement) => {
  return render(<LogProvider>{component}</LogProvider>);
};

// Mock Alert.alert directly
jest.spyOn(Alert, 'alert');

// Mock useLog hook
const mockAddLog = jest.fn(); // Define mockAddLog outside
jest.mock('../hooks/use-log', () => {
  const actualModule = jest.requireActual('../hooks/use-log');
  return {
    ...actualModule, // Include all actual exports
    useLog: () => ({
      addLog: mockAddLog, // Use the defined mockAddLog
      logs: [],
    }),
  };
});

// Mock processQueue
jest.mock('../utils/requestQueue', () => ({
  ...jest.requireActual('../utils/requestQueue'), // Import actual functions
  processQueue: jest.fn(), // Mock processQueue
}));

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

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        altitude: 0,
        altitudeAccuracy: 0,
        heading: 0,
        speed: 0,
      },
      timestamp: 0,
    })
  ),
}));

// Get reference to the mocked processQueue for clearing in tests
const mockProcessQueue = processQueue as jest.MockedFunction<
  typeof processQueue
>;

const MOCK_ISO_DATE = '2025-09-13T12:00:00.000Z';

describe('ScannerScreen', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset the mock for useCameraPermissions to its default granted state
    useCameraPermissions.mockReturnValue([
      { granted: true, status: 'granted' },
      jest.fn(),
    ]);
    // Reset the mock for expo-location to its default granted state
    Location.requestForegroundPermissionsAsync.mockReturnValue(
      Promise.resolve({ status: 'granted' })
    );
    // Mock global.fetch
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'QR data received' }),
        status: 200,
      } as Response)
    );
    // Mock Date.prototype.toISOString
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(MOCK_ISO_DATE);
    // Clear the addLog mock
    mockAddLog.mockClear();
    // Clear AsyncStorage mock data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (AsyncStorage as any)._resetCache();
    // Clear the processQueue mock using the typed reference
    mockProcessQueue.mockClear();
  });

  it('renders correctly when camera permissions are granted', () => {
    const { getByText } = renderWithLogProvider(<ScannerScreen />);
    expect(getByText('Scan QR Code')).toBeTruthy();
  });

  it('shows permission request message when permissions are not granted', () => {
    // Mock permissions to be not granted for this specific test
    useCameraPermissions.mockReturnValueOnce([
      { granted: false, status: 'denied' },
      jest.fn(),
    ]);
    const { getByText } = renderWithLogProvider(<ScannerScreen />);
    expect(
      getByText('We need your permission to show the camera')
    ).toBeTruthy();
  });

  it('shows requesting permission message when permission status is undetermined', () => {
    useCameraPermissions.mockReturnValueOnce([
      null, // permission is null when undetermined
      jest.fn(),
    ]);
    const { getByText } = renderWithLogProvider(<ScannerScreen />);
    expect(getByText('Requesting for camera permission...')).toBeTruthy();
  });

  it('calls onBarcodeScanned and shows alert when QR code is scanned', async () => {
    const { getByText } = renderWithLogProvider(<ScannerScreen />);

    // Get the mock function for CameraView

    // Access the props passed to the first call of MockCameraView
    const cameraViewProps = MockCameraView.mock.calls[0][0];

    // Simulate barcode scan
    act(() => {
      cameraViewProps.onBarcodeScanned({ data: 'test-qr-data' });
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'QR Code Scanned!',
        'QR data sent successfully.',
        [{ text: 'Scan Again', onPress: expect.any(Function) }],
        { cancelable: false }
      );
    });

    // Simulate "Scan Again" button press
    const scanAgainButton = getByText('Tap to Scan Again');
    fireEvent.press(scanAgainButton);
    expect(getByText('Scan QR Code')).toBeTruthy(); // Should go back to scanning state
  });

  it('sends QR data to remote server on successful scan', async () => {
    renderWithLogProvider(<ScannerScreen />);

    const cameraViewProps = MockCameraView.mock.calls[0][0];

    // Mock the fetch response for this specific test
    const mockFetch = jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'QR data received' }),
        status: 200,
      } as Response)
    );

    act(() => {
      cameraViewProps.onBarcodeScanned({ data: 'test-qr-data-post' });
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://parroquia.of.ardor.link/api/qr',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic cGFycm9xdWlhOnBhcnJvcXVpYQ==',
          },
          body: JSON.stringify({
            qr: 'test-qr-data-post',
            location: 'Lat 0, Lon 0', // From mocked getCurrentPositionAsync
            date: MOCK_ISO_DATE, // Date will be dynamic
          }),
        })
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        'QR Code Scanned!',
        'QR data sent successfully.',
        [{ text: 'Scan Again', onPress: expect.any(Function) }],
        { cancelable: false }
      );
    });
    mockFetch.mockRestore(); // Restore original fetch mock
  });

  it('calls processQueue after a successful POST request', async () => {
    renderWithLogProvider(<ScannerScreen />);

    const cameraViewProps = MockCameraView.mock.calls[0][0];

    // Mock the fetch response for a successful POST
    const mockFetch = jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'QR data received' }),
        status: 200,
      } as Response)
    );

    act(() => {
      cameraViewProps.onBarcodeScanned({
        data: 'test-qr-data-success-and-process',
      });
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(processQueue).toHaveBeenCalledTimes(1);
      expect(processQueue).toHaveBeenCalledWith(mockAddLog);
    });

    mockFetch.mockRestore();
  });

  it('shows error alert when POST request to server fails', async () => {
    renderWithLogProvider(<ScannerScreen />);

    const cameraViewProps = MockCameraView.mock.calls[0][0];

    // Mock the fetch response to simulate a failure
    const mockFetch = jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)
    );

    act(() => {
      cameraViewProps.onBarcodeScanned({ data: 'test-qr-data-fail' });
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to send QR data. Queueing.',
        [{ text: 'Continue Scanning', onPress: expect.any(Function) }],
        { cancelable: false }
      );
    });
    mockFetch.mockRestore(); // Restore original fetch mock
  });

  it('shows alert when location permission is denied', async () => {
    // Override the default mock for this test
    Location.requestForegroundPermissionsAsync.mockReturnValueOnce(
      Promise.resolve({ status: 'denied' })
    );

    renderWithLogProvider(<ScannerScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission to access location was denied'
      );
    });
  });

  it('queues failed POST requests and logs the event', async () => {
    // No longer needed, mockAddLog is directly available

    renderWithLogProvider(<ScannerScreen />);

    const cameraViewProps = MockCameraView.mock.calls[0][0];

    // Mock the fetch response to simulate a failure
    const mockFetch = jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Internal Server Error'), // Add text method for errorData
      } as Response)
    );

    act(() => {
      cameraViewProps.onBarcodeScanned({ data: 'test-qr-data-queue' });
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('failedRequestQueue');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'failedRequestQueue',
        expect.any(String) // Expect a string
      );
      const storedQueue = JSON.parse(
        (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      ); // Parse the stored string
      expect(storedQueue).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            url: 'https://parroquia.of.ardor.link/api/qr',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic cGFycm9xdWlhOnBhcnJvcXVpYQ==',
            },
            body: expect.stringContaining('"qr":"test-qr-data-queue"'),
            timestamp: expect.any(Number),
          }),
        ])
      );
      expect(mockAddLog).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'POST_RESULT',
          message: expect.stringContaining(
            'Failed to send QR data. Queueing. ( 1 queued requests )'
          ),
          data: expect.objectContaining({
            error: expect.any(String),
            queuedRequests: 1,
          }),
        })
      );
    });

    mockFetch.mockRestore();
  });
});
