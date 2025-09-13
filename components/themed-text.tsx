import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 32,
    lineHeight: 48,
  },
  defaultSemiBold: {
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 48,
  },
  link: {
    color: Colors.light.tint,
    fontSize: 32,
    lineHeight: 60,
  },
  subtitle: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    lineHeight: 64,
  },
});
