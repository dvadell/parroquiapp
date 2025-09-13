/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  let colorFromProps;
  if (theme === 'light') {
    colorFromProps = props.light;
  } else {
    colorFromProps = props.dark;
  }

  if (colorFromProps) {
    return colorFromProps;
  } else {
    const themeColors = theme === 'light' ? Colors.light : Colors.dark;
    // eslint-disable-next-line security/detect-object-injection
    return themeColors[colorName];
  }
}
