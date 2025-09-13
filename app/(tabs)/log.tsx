import React from 'react';
import { Text, View, StyleSheet, FlatList } from 'react-native';
import { useLog } from '@/hooks/use-log';
import { Colors } from '@/constants/theme';

interface LogEntry {
  timestamp: string;
  type: 'QR_SCAN' | 'POST_RESULT';
  message: string;
  data?: unknown;
}

export default function LogScreen() {
  const { logs } = useLog();

  const renderLogItem = ({ item }: { item: LogEntry }) => (
    <View testID="log-item" style={styles.logItem}>
      <Text style={styles.logTimestamp}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      <Text style={styles.logMessage}>
        <Text style={styles.logMessageType}>{item.type}:</Text> {item.message}
      </Text>
      {item.data && (
        <Text style={styles.logData}>{JSON.stringify(item.data, null, 2)}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Screen</Text>
      <FlatList
        data={logs}
        renderItem={renderLogItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.logList}
        contentContainerStyle={styles.logListContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    flex: 1,
    paddingTop: 20,
  },
  logData: {
    color: Colors.light.darkGray,
    fontSize: 12,
    marginTop: 5,
  },
  logItem: {
    backgroundColor: Colors.light.lightGray,
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
  },
  logList: {
    flex: 1,
    width: '100%',
  },
  logListContent: {
    paddingHorizontal: 10,
  },
  logMessage: {
    fontSize: 14,
    marginTop: 5,
  },
  logMessageType: {
    fontWeight: 'bold',
  },
  logTimestamp: {
    color: Colors.light.mediumGray,
    fontSize: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});
