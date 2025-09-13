// utils/api.ts
interface QrDataPayload {
  qr: string;
  location: string;
  date: string;
}

export async function sendQrData(
  payload: QrDataPayload
): Promise<{ success: boolean; message: string; error?: unknown }> {
  try {
    const response = await fetch('https://parroquia.of.ardor.link/api/qr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorData}`
      );
    }

    return { success: true, message: 'QR data sent successfully.' };
  } catch (error: unknown) {
    return {
      success: false,
      message: 'Failed to send QR data.',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
