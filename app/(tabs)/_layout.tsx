import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { useLog } from '@/hooks/use-log'; // Import useLog
import { processQueue } from '@/utils/requestQueue'; // Import processQueue

export default function TabLayout() {
  const { addLog } = useLog(); // Get addLog from context

  useEffect(() => {
    // Process the queue when the component mounts, only for QR requests
    processQueue(addLog, '/api/qr');
  }, []); // Empty dependency array means this runs once on mount

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { backgroundColor: 'white', height: 120 },
        tabBarLabelStyle: { fontSize: 20, fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={38} name="camera.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'Lista',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={38} name="list.bullet" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={38} name="doc.plaintext" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
