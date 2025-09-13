// utils/api.ts
interface QrDataPayload {
  qr: string;
  location: string;
  date: string;
}

export async function sendQrData(payload: QrDataPayload): Promise<boolean> {
  try {
    const response = await fetch('https://parroquia.of.ardor.link/api/qr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true; // Indicate success
  } catch (error) {
    console.error('Error sending QR data:', error);
    return false; // Indicate failure
  }
}
