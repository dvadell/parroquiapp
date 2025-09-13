import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '@/constants/theme';

export default function ScannerScreen() {
  return (
    <View style={styles.container}>
      <Text>Scanner</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    flex: 1,
    justifyContent: 'center',
  },
});
