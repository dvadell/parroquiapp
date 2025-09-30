# HACKING.md

## App Description

This is a mobile application built with Expo and React Native, likely designed for a parish (parroquia). It features a tab-based navigation structure with a "Scanner" screen and a "List" screen. The Scanner tab has a button that reads a QR code from the camera, which now also captures the GPS location. For each QR code read, the content, GPS location, and timestamp are sent via HTTP POST to a remote server (`https://snicolas.lantech.eu.org/api/qr`). This networking functionality is implemented within `utils/api.ts` and used by `app/(tabs)/scanner.tsx`, suggesting functionalities such as scanning for attendance, inventory, or donations with location tracking and centralized data collection.

The `List` screen (`app/(tabs)/list.tsx`) allows users to manually send their current GPS location via HTTP POST to a remote server (`https://snicolas.lantech.eu.org/api/locations`) by pressing the "Tomar lista de nuevo" button.

## Modules Used

The application utilizes a variety of modules, primarily from the Expo and React Native ecosystem. Key dependencies include:

- `expo`: Core Expo framework for universal native apps.
- `expo-router`: File-based routing for Expo and React Native.
- `react`: JavaScript library for building user interfaces.
- `react-native`: Framework for building native apps using React.
- `@expo/vector-icons`: Icon library for Expo.
- `@react-navigation/bottom-tabs`: Bottom tab navigator for React Navigation.
- `@react-navigation/native`: Core navigation utilities for React Native.
- `expo-haptics`: Haptic feedback utilities.
- `expo-symbols`: Apple SF Symbols integration for iOS.
- `expo-location`: Provides access to device's location services.
- `react-native-gesture-handler`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-screens`: Libraries for handling gestures, animations, safe area insets, and screen management in React Native.

## Main Screen Files

The primary screen components and their layout are defined in the following files:

- `app/(tabs)/_layout.tsx`: This file defines the main tab navigator, acting as the `HomeScreen` that orchestrates the tab-based navigation between the `ScannerScreen` and `ListScreen`.
- `app/(tabs)/scanner.tsx`: This file contains the `ScannerScreen` component, which is one of the main tabs in the application.
- `app/(tabs)/list.tsx`: This file contains the `ListScreen` component, serving as the other main tab in the application.

## Request Retry Mechanism

To ensure data persistence and reliability, especially in environments with intermittent network connectivity, a request retry mechanism has been implemented for failed POST requests. Both `sendQrData` (for `/api/qr`) and `sendLocationData` (for `/api/locations`) utilize this mechanism. Failed requests are automatically queued and stored persistently on the device.

The retry behavior is differentiated based on the request type:

- **`/api/qr` requests:** These queued requests are retried when the application starts or resumes (via `app/(tabs)/_layout.tsx`), and also after every successful `sendQrData` request (via `utils/api.ts`).
- **`/api/locations` requests:** These queued requests are retried when the "Tomar lista de nuevo" button is pressed in the `List` tab (via `app/(tabs)/list.tsx`).
- **All queued requests:** The entire queue of pending requests can be processed by pressing the small reload button in the `List` screen.

There is a **1-second delay** between each retry attempt to prevent overwhelming the server.

**Key Components and Files:**

- **`utils/requestQueue.ts`**: This file contains the core logic for managing the request queue.
  - `queueRequest(requestDetails)`: Stores a failed request's details (URL, method, headers, body, timestamp) in `AsyncStorage`.
  - `getQueueLength()`: Returns the current number of requests in the queue.
  - `processQueue(addLog, urlFilter?)`: Retrieves requests from `AsyncStorage`, attempts to re-send them (with a 1-second delay between each attempt), and removes successfully sent requests from the queue. It now accepts an optional `urlFilter` to process only requests matching a specific URL. It also logs the processing status.
- **`utils/api.ts`**:
  - The `sendQrData` function integrates with the queuing mechanism. If a POST request fails, it calls `queueRequest`. After a successful `sendQrData` request, it triggers `processQueue` with a filter for `'/api/qr'` to retransmit any previously failed QR requests.
  - The `sendLocationData` function also integrates with the queuing mechanism. If a POST request fails, it calls `queueRequest`. It _does not_ automatically trigger `processQueue` after a successful send.
- **`app/(tabs)/scanner.tsx`**: This file, which initiates the `sendQrData` calls, passes the `addLog` function (from `useLog` hook) to `sendQrData` to enable logging of queuing events.
- **`app/(tabs)/list.tsx`**: This file has two main actions related to the request queue. The `handleSendLocationAndReloadWebView` function (triggered by the "Tomar lista de nuevo" button) calls `processQueue` with a filter for `'/api/locations'` after a successful `sendLocationData` call. The `handleReloadWebView` function (triggered by the small reload button) calls `processQueue` without a filter, processing all pending requests.
- **`app/(tabs)/_layout.tsx`**: This layout file is responsible for initiating `processQueue` when the application's tab layout component mounts. It now calls `processQueue` with a filter for `'/api/qr'` to ensure only failed QR requests are retried on startup.
- **`@react-native-async-storage/async-storage`**: This library is used for persistent storage of the request queue, ensuring that queued requests survive app crashes or device restarts.
