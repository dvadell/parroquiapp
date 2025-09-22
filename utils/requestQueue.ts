// utils/requestQueue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'failedRequestQueue';

interface RequestDetails {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  timestamp: number; // To track when the request was queued
}

export async function queueRequest(request: RequestDetails): Promise<void> {
  try {
    const currentQueueString = await AsyncStorage.getItem(QUEUE_KEY);
    const currentQueue: RequestDetails[] = currentQueueString
      ? JSON.parse(currentQueueString)
      : [];
    currentQueue.push(request);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(currentQueue));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error: unknown) {
    // Log the error, but don't re-queue as this is an internal error
    // The original request would have already been logged as failed by sendQrData
  }
}

export async function getQueueLength(): Promise<number> {
  try {
    const currentQueueString = await AsyncStorage.getItem(QUEUE_KEY);
    const currentQueue: RequestDetails[] = currentQueueString
      ? JSON.parse(currentQueueString)
      : [];
    return currentQueue.length;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error: unknown) {
    // Log the error, but don't re-queue as this is an internal error
    return 0;
  }
}

export async function processQueue(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  log: (message: string) => void,
  urlFilter?: string
): Promise<void> {
  try {
    const currentQueueString = await AsyncStorage.getItem(QUEUE_KEY);
    const currentQueue: RequestDetails[] = currentQueueString
      ? JSON.parse(currentQueueString)
      : [];

    if (currentQueue.length === 0) {
      return;
    }

    log(`Processing queue with ${currentQueue.length} requests.`);

    const successfulRequests: RequestDetails[] = [];
    const failedRequests: RequestDetails[] = [];

    for (const request of currentQueue) {
      if (urlFilter && !request.url.includes(urlFilter)) {
        failedRequests.push(request); // Keep requests that don't match the filter
        continue;
      }

      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });

        if (response.ok) {
          log(`Successfully re-sent queued request: ${request.url}`);
          successfulRequests.push(request);
        } else {
          const errorData = await response.text();
          log(
            `Failed to re-send queued request (HTTP error): ${request.url}, status: ${response.status}, message: ${errorData}`
          );
          failedRequests.push(request);
        }
      } catch (error: unknown) {
        log(
          `Failed to re-send queued request (network error): ${request.url}, error: ${error instanceof Error ? error.message : String(error)}`
        );
        failedRequests.push(request);
      }
    }

    // Only keep requests that failed again
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(failedRequests));
  } catch (error: unknown) {
    log(
      `Error processing request queue: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
