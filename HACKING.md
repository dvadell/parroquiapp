# HACKING.md

## App Description

This is a mobile application built with Expo and React Native, likely designed for a parish (parroquia). It features a tab-based navigation structure with a "Scanner" screen and a "List" screen, suggesting functionalities such as scanning (e.g., QR codes for attendance, inventory, or donations) and displaying lists of related data.

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
- `react-native-gesture-handler`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-screens`: Libraries for handling gestures, animations, safe area insets, and screen management in React Native.

## Main Screen Files

The primary screen components and their layout are defined in the following files:

- `app/(tabs)/_layout.tsx`: This file defines the main tab navigator, acting as the `HomeScreen` that orchestrates the tab-based navigation between the `ScannerScreen` and `ListScreen`.
- `app/(tabs)/scanner.tsx`: This file contains the `ScannerScreen` component, which is one of the main tabs in the application.
- `app/(tabs)/list.tsx`: This file contains the `ListScreen` component, serving as the other main tab in the application.
