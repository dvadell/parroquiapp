import React from 'react';
import { render, screen } from '@testing-library/react-native';
import LogScreen from '../app/(tabs)/log';
import { useLog } from '../hooks/use-log';

// Mock the useLog hook to control its return value in tests
jest.mock('../hooks/use-log', () => ({
  __esModule: true,
  LogProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLog: jest.fn(),
}));

const mockUseLog = useLog as jest.Mock;

describe('LogScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with no logs', () => {
    mockUseLog.mockReturnValue({
      logs: [],
      addLog: jest.fn(),
    });

    render(<LogScreen />);
    expect(screen.getByText('Log Screen')).toBeTruthy();
    expect(screen.queryByText(/QR Scanned/i)).toBeNull();
  });

  it('renders correctly with QR_SCAN logs', () => {
    const mockLogs = [
      {
        timestamp: new Date().toISOString(),
        type: 'QR_SCAN',
        message: 'QR Scanned: test-qr-data, Location: Lat 0, Lon 0',
        data: {
          qr: 'test-qr-data',
          location: 'Lat 0, Lon 0',
          date: new Date().toISOString(),
        },
      },
    ];

    mockUseLog.mockReturnValue({
      logs: mockLogs,
      addLog: jest.fn(),
    });

    render(<LogScreen />);
    expect(screen.getByText('Log Screen')).toBeTruthy();
    expect(
      screen.getByText(
        /QR_SCAN: QR Scanned: test-qr-data, Location: Lat 0, Lon 0/i
      )
    ).toBeTruthy();
    expect(
      screen.getByText(JSON.stringify(mockLogs[0].data, null, 2))
    ).toBeTruthy();
  });

  it('renders correctly with POST_RESULT logs', () => {
    const mockLogs = [
      {
        timestamp: new Date().toISOString(),
        type: 'POST_RESULT',
        message: 'POST Result: QR data sent successfully.',
        data: { success: true, message: 'QR data sent successfully.' },
      },
    ];

    mockUseLog.mockReturnValue({
      logs: mockLogs,
      addLog: jest.fn(),
    });

    render(<LogScreen />);
    expect(screen.getByText('Log Screen')).toBeTruthy();
    expect(
      screen.getByText(/POST_RESULT: POST Result: QR data sent successfully./i)
    ).toBeTruthy();
    expect(
      screen.getByText(JSON.stringify(mockLogs[0].data, null, 2))
    ).toBeTruthy();
  });

  it('renders multiple logs in correct order (newest first)', () => {
    const oldLog = {
      timestamp: new Date(Date.now() - 10000).toISOString(), // 10 seconds ago
      type: 'QR_SCAN',
      message: 'Old QR Scan',
      data: { qr: 'old-qr' },
    };
    const newLog = {
      timestamp: new Date().toISOString(),
      type: 'POST_RESULT',
      message: 'New POST Result',
      data: { success: true },
    };

    mockUseLog.mockReturnValue({
      logs: [newLog, oldLog],
      addLog: jest.fn(),
    });

    render(<LogScreen />);
    const logItems = screen.getAllByTestId('log-item');

    expect(logItems[0]).toHaveTextContent(/POST_RESULT: New POST Result/);
    expect(logItems[1]).toHaveTextContent(/QR_SCAN: Old QR Scan/);
  });
});
