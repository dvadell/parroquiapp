import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ListScreen from '../app/(tabs)/list';

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

describe('ListScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<ListScreen />);
    expect(getByText('Tomar lista de nuevo')).toBeTruthy();
  });

  it('renders webview with correct source', () => {
    const { getByTestId } = render(<ListScreen />);
    const webview = getByTestId('list-webview');
    expect(webview.props.source.uri).toBe(
      'https://parroquia:parroquia@parroquia.of.ardor.link/'
    );
  });

  it('reloads webview on button press', () => {
    const setKey = jest.fn();
    const useStateSpy = jest.spyOn(React, 'useState');
    useStateSpy.mockImplementation((initialValue) => [initialValue, setKey]);

    const { getByText } = render(<ListScreen />);
    const button = getByText('Tomar lista de nuevo');

    fireEvent.press(button);

    expect(setKey).toHaveBeenCalled();
  });
});
