// useAppStyles.ts
import { useTheme } from "@/contexts/ThemeContext";
import { createTypography } from "@/constants/typography";
import { useMemo } from "react";

export const useAppStyles = () => {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);

  return { colors, typography };
};
