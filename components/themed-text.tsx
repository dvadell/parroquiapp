import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

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
    lineHeight: 48,
    fontWeight: '600',
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    lineHeight: 64,
  },
  subtitle: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 60,
    fontSize: 32,
    color: '#0a7ea4',
  },
});
