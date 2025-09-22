jest.mock('react-native-webview', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    WebView: (props) => <View {...props} />,
  };
});

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

jest.mock('@react-native-async-storage/async-storage', () => {
  let cache = {}; // Define cache inside the mock factory

  return {
    getItem: jest.fn((key) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return Promise.resolve(null);
      }
      // eslint-disable-next-line security/detect-object-injection
      return Promise.resolve(cache[key] || null);
    }),
    setItem: jest.fn((key, value) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return Promise.resolve(null);
      }
      // eslint-disable-next-line security/detect-object-injection
      cache[key] = value;
      return Promise.resolve(null);
    }),
    removeItem: jest.fn((key) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return Promise.resolve(null);
      }
      // eslint-disable-next-line security/detect-object-injection
      delete cache[key];
      return Promise.resolve(null);
    }),
    clear: jest.fn(() => {
      cache = {}; // Reset the cache
      return Promise.resolve(null);
    }),
    // Add a helper to reset the cache for tests
    _resetCache: () => {
      cache = {};
    },
  };
});

jest.mock('expo-audio', () => ({
  useAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn(),
  })),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
}));
