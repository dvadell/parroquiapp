# HACKING.md

## App Description

This is a mobile application built with Expo and React Native, likely designed for a parish (parroquia). It features a tab-based navigation structure with a "Scanner" screen and a "List" screen. The Scanner tab has a button that reads a QR code from the camera, which now also captures the GPS location. For each QR code read, the content, GPS location, and timestamp are sent via HTTP POST to a remote server (`https://parroquia.of.ardor.link/api/qr`). This networking functionality is implemented within `utils/api.ts` and used by `app/(tabs)/scanner.tsx`, suggesting functionalities such as scanning for attendance, inventory, or donations with location tracking and centralized data collection. The List screen likely displays data related to the scanned items.

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

To ensure data persistence and reliability, especially in environments with intermittent network connectivity, a request retry mechanism has been implemented for failed POST requests. If a `sendQrData` request fails, it is automatically queued and stored persistently on the device. These queued requests are then retried when the application starts or resumes, and also **after every successful POST request**. There is a **1-second delay** between each retry attempt to prevent overwhelming the server.

**Key Components and Files:**

- **`utils/requestQueue.ts`**: This new file contains the core logic for managing the request queue.
  - `queueRequest(requestDetails)`: Stores a failed request's details (URL, method, headers, body, timestamp) in `AsyncStorage`.
  - `getQueueLength()`: Returns the current number of requests in the queue.
  - `processQueue(addLog)`: Retrieves requests from `AsyncStorage`, attempts to re-send them (with a 1-second delay between each attempt), and removes successfully sent requests from the queue. It also logs the processing status.
- **`utils/api.ts`**: The `sendQrData` function in this file now integrates with the queuing mechanism. If a POST request fails, it calls `queueRequest` to store the request and logs the queuing event to the `LogScreen`. **After a successful POST request, it also triggers `processQueue` to attempt retransmitting any previously failed requests.**
- **`app/(tabs)/scanner.tsx`**: This file, which initiates the `sendQrData` calls, now passes the `addLog` function (from `useLog` hook) to `sendQrData` to enable logging of queuing events.
- **`app/(tabs)/_layout.tsx`**: This layout file is responsible for initiating the `processQueue` function when the application's tab layout component mounts. It retrieves the `addLog` function from the `useLog` context and passes it to `processQueue` to ensure retry attempts are logged.
- **`@react-native-async-storage/async-storage`**: This library is used for persistent storage of the request queue, ensuring that queued requests survive app crashes or device restarts.
