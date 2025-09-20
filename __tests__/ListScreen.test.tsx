import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ListScreen from '../app/(tabs)/list';
import { LogProvider } from '../hooks/use-log';
import { Alert } from 'react-native';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock the theme constants
jest.mock('@/constants/theme', () => ({
  Colors: {
    light: {
      background: '#ffffff',
      tint: '#0a7ea4',
      white: '#ffffff',
    },
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: 123, longitude: 456 },
    })
  ),
}));

jest.mock('../utils/api', () => ({
  sendLocationData: jest.fn(() =>
    Promise.resolve({ success: true, message: 'Mock success' })
  ),
}));

jest.spyOn(Alert, 'alert');

describe('ListScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <LogProvider>
        <ListScreen />
      </LogProvider>
    );
    expect(getByText('Tomar lista de nuevo')).toBeTruthy();
  });

  it('renders webview with correct source', () => {
    const { getByTestId } = render(
      <LogProvider>
        <ListScreen />
      </LogProvider>
    );
    const webview = getByTestId('list-webview');
    expect(webview.props.source.uri).toBe(
      'https://parroquia:parroquia@parroquia.of.ardor.link/'
    );
  });

  it('reloads webview on button press', async () => {
    const setKey = jest.fn();
    const useStateSpy = jest.spyOn(React, 'useState');
    useStateSpy.mockImplementation((initialValue) => [initialValue, setKey]);

    const { getByText } = render(
      <LogProvider>
        <ListScreen />
      </LogProvider>
    );
    const button = getByText('Tomar lista de nuevo');

    fireEvent.press(button);

    await waitFor(() => {
      expect(setKey).toHaveBeenCalled();
    });
  });
});
