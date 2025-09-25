import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WelcomeScreen from '../app/index';

const mockedPush = jest.fn();

jest.mock('expo-router', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');

  return {
    __esModule: true,
    useRouter: () => ({
      push: mockedPush,
    }),
    Link: (props) => {
      const { href, children, asChild } = props;
      if (asChild) {
        const child = React.Children.only(children);
        return React.cloneElement(child as React.ReactElement, {
          onPress: () => mockedPush(href),
        });
      }
      return <>{children}</>;
    },
  };
});

// Mock the theme constants
jest.mock('@/constants/theme', () => ({
  Colors: {
    light: {
      background: '#ffffff',
      tint: '#0a7ea4',
      text: '#000000',
      white: '#ffffff',
    },
  },
}));

describe('WelcomeScreen', () => {
  afterEach(() => {
    mockedPush.mockClear();
  });

  it('renders correctly', () => {
    const { getByText } = render(<WelcomeScreen />);
    expect(getByText('Parroquiapp')).toBeTruthy();
    expect(getByText('QR Scanner')).toBeTruthy();
    expect(getByText('Barcode Scanner')).toBeTruthy();
  });

  it('navigates to QR Scanner screen on button press', () => {
    const { getByText } = render(<WelcomeScreen />);
    const qrScannerButton = getByText('QR Scanner');
    fireEvent.press(qrScannerButton);
    expect(mockedPush).toHaveBeenCalledWith('/(tabs)');
  });

  it('does not navigate when Barcode Scanner button is pressed', () => {
    const { getByText } = render(<WelcomeScreen />);
    const barcodeScannerButton = getByText('Barcode Scanner');
    fireEvent.press(barcodeScannerButton);
    expect(mockedPush).not.toHaveBeenCalled();
  });
});
