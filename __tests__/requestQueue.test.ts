import AsyncStorage from '@react-native-async-storage/async-storage';
import { processQueue, queueRequest } from '../utils/requestQueue';

// Mock the log function
const mockLog = jest.fn();

describe('requestQueue', () => {
  let mockFetch: jest.SpyInstance; // Declare mockFetch here

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear AsyncStorage mock data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (AsyncStorage as any)._resetCache();
    mockLog.mockClear();
    jest.useFakeTimers(); // Enable fake timers
    mockFetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() => Promise.resolve({} as Response)); // Mock fetch
  });

  afterEach(() => {
    jest.useRealTimers(); // Restore real timers
    mockFetch.mockRestore(); // Restore original fetch
  });

  it('should process a single queued request with a 1-second delay', async () => {
    // Queue one failed request
    await queueRequest({
      url: 'https://snicolas.lantech.eu.org/api/qr',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qr: 'queued-qr-1' }),
      timestamp: Date.now(),
    });

    const mockFetch = jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'QR data received' }),
        status: 200,
      } as Response)
    );

    const processPromise = processQueue(mockLog);

    // Advance timers by 1 second for the request
    jest.advanceTimersByTime(1000);
    await jest.runAllTimersAsync(); // Allow all timers and microtasks to resolve

    // Expect the request to be sent
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://snicolas.lantech.eu.org/api/qr',
      expect.objectContaining({
        body: JSON.stringify({ qr: 'queued-qr-1' }),
      })
    );
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining(
        'Successfully re-sent queued request: https://snicolas.lantech.eu.org/api/qr'
      )
    );

    await processPromise; // Wait for processQueue to complete

    // Verify that the queue is empty
    const remainingQueueString =
      await AsyncStorage.getItem('failedRequestQueue');
    const remainingQueue = remainingQueueString
      ? JSON.parse(remainingQueueString)
      : [];
    expect(remainingQueue.length).toBe(0);

    mockFetch.mockRestore();
  });

  it('should not process an empty queue', async () => {
    const processPromise = processQueue(mockLog);
    await processPromise;

    expect(mockLog).not.toHaveBeenCalledWith(
      expect.stringContaining('Processing queue')
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
