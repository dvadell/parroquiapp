import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '@/constants/theme';

export default function ListScreen() {
  return (
    <View style={styles.container}>
      <Text>List</Text>
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
