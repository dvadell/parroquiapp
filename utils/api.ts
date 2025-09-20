// utils/api.ts
interface QrDataPayload {
  qr: string;
  location: string;
  date: string;
}

import { queueRequest, getQueueLength, processQueue } from './requestQueue';

export async function sendQrData(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  payload: QrDataPayload,
  addLog: (payload: {
    type: 'QR_SCAN' | 'POST_RESULT';
    message: string;
    data?: unknown;
  }) => void
): Promise<{ success: boolean; message: string; error?: unknown }> {
  const url = 'https://parroquia.of.ardor.link/api/qr';
  const method = 'POST';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic cGFycm9xdWlhOnBhcnJvcXVpYQ==',
  };
  const body = JSON.stringify(payload);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorData}`
      );
    }

    const result = { success: true, message: 'QR data sent successfully.' };
    // Attempt to process the queue after a successful send, only for QR requests
    processQueue(addLog, '/api/qr');
    return result;
  } catch (error: unknown) {
    // Queue the failed request
    const requestDetails = {
      url,
      method,
      headers,
      body,
      timestamp: Date.now(),
    };
    await queueRequest(requestDetails);
    const currentQueueLength = await getQueueLength();

    const errorMessage = 'Failed to send QR data. Queueing.';
    const logMessage = `POST Result: ${errorMessage} ( ${currentQueueLength} queued requests )`;

    addLog({
      type: 'POST_RESULT',
      message: logMessage,
      data: {
        error: error instanceof Error ? error.message : String(error),
        queuedRequests: currentQueueLength,
      },
    });

    return {
      success: false,
      message: errorMessage,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function sendLocationData(
  location: string,
  addLog: (payload: {
    type: 'LOCATION_SEND' | 'POST_RESULT';
    message: string;
    data?: unknown;
  }) => void
): Promise<{ success: boolean; message: string; error?: unknown }> {
  const url = 'https://parroquia.of.ardor.link/api/locations';
  const method = 'POST';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic cGFycm9xdWlhOnBhcnJvcXVpYQ==',
  };
  const body = JSON.stringify({ location });

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorData}`
      );
    }

    const result = {
      success: true,
      message: 'Location data sent successfully.',
    };
    return result;
  } catch (error: unknown) {
    const requestDetails = {
      url,
      method,
      headers,
      body,
      timestamp: Date.now(),
    };
    await queueRequest(requestDetails);
    const currentQueueLength = await getQueueLength();

    const errorMessage = 'Failed to send location data. Queueing.';
    const logMessage = `POST Result: ${errorMessage} ( ${currentQueueLength} queued requests )`;

    addLog({
      type: 'POST_RESULT',
      message: logMessage,
      data: {
        error: error instanceof Error ? error.message : String(error),
        queuedRequests: currentQueueLength,
      },
    });

    return {
      success: false,
      message: errorMessage,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
