import React from 'react';
import { render } from '@testing-library/react-native';
import ListScreen from '../app/(tabs)/list';

// Mock the theme constants
jest.mock('@/constants/theme', () => ({
  Colors: {
    light: {
      background: '#ffffff',
    },
  },
}));

describe('ListScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<ListScreen />);
    expect(getByText('Tomar lista de nuevo')).toBeTruthy();
  });
});
