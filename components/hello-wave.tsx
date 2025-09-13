import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

export function HelloWave() {
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  // This is a placeholder for the actual animation logic
  // You would typically trigger this animation on some event
  // For now, let's just set it to a static value to remove the inline style warning
  // A more complete solution would involve a useEffect or similar to start the animation
  rotation.value = withSpring(25);

  return (
    <Animated.Text style={[styles.wave, animatedStyle]}>
      👋
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  wave: {
    fontSize: 56,
    lineHeight: 64,
    marginTop: -6,
  },
});
