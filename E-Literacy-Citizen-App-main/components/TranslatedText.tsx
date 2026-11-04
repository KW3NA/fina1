import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

type TranslatedTextProps = TextProps & {
  children: string | number | undefined | null;
  fallbackToOriginal?: boolean;
};

export const TranslatedText: React.FC<TranslatedTextProps> = ({
  children,
  fallbackToOriginal = true,
  ...rest
}) => {
  const { t, } = useLanguage();
  const { colors } = useTheme();
  const [translated, setTranslated] = React.useState<string | number | undefined | null>(children);

  React.useEffect(() => {
    let isMounted = true;
    const value = typeof children === 'number' ? String(children) : children ?? '';
    if (!value) {
      setTranslated(children);
      return;
    }
    t(value)
      .then((res) => {
        if (isMounted) setTranslated(res);
      })
      .catch(() => {
        if (isMounted) setTranslated(fallbackToOriginal ? value : children);
      });
    return () => {
      isMounted = false;
    };
  }, [children, t, fallbackToOriginal]);

  return (
    <Text {...rest} style={[{ color: colors.text }, rest.style]}>{translated as any}</Text>
  );
};

export default TranslatedText;


