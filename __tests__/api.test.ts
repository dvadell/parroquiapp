import { sendQrData } from '../utils/api';

// Mock the log function
const mockLog = jest.fn();

describe('api', () => {
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLog.mockClear();
    mockFetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() => Promise.resolve({ ok: true } as Response));
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it('should send QR data with basic authorization header', async () => {
    const payload = {
      qr: 'test-qr',
      location: 'test-location',
      date: '2025-01-01',
    };

    await sendQrData(payload, mockLog);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://parroquia.of.ardor.link/api/qr',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic cGFycm9xdWlhOnBhcnJvcXVpYQ==',
        },
        body: JSON.stringify(payload),
      })
    );
  });
});
