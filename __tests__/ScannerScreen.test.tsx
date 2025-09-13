import React from 'react';
import { render } from '@testing-library/react-native';
import ScannerScreen from '../app/(tabs)/scanner';

// Mock the theme constants
jest.mock('@/constants/theme', () => ({
  Colors: {
    light: {
      background: '#ffffff',
    },
  },
}));

describe('ScannerScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<ScannerScreen />);
    expect(getByText('Scanner')).toBeTruthy();
  });
});
