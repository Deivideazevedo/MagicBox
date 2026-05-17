import { createTheme } from "@mui/material/styles";
import { useSelector } from "@/store/hooks";
import { useMemo } from "react";
import { AppState } from "@/store/store";
import components from "./Components";
import typography from "./Typography";
import { shadows, darkshadows } from "./Shadows";
import { DarkThemeColors } from "./DarkThemeColors";
import { LightThemeColors } from "./LightThemeColors";
import { baseDarkTheme, baselightTheme } from "./DefaultColors";
import { ptBR } from "@mui/material/locale";

// Hook para uso dentro do React (memoizado com useMemo)
const ThemeSettings = () => {
  const activeTheme = useSelector((state: AppState) => state.customizer.activeTheme);
  const activeMode = useSelector((state: AppState) => state.customizer.activeMode);
  const borderRadius = useSelector((state: AppState) => state.customizer.borderRadius);

  const theme = useMemo(() => {
    const themeOptions = LightThemeColors.find((t) => t.name === activeTheme);
    const darkThemeOptions = DarkThemeColors.find((t) => t.name === activeTheme);

    // Fallback: usa o primeiro tema se não encontrar o configurado
    const safeThemeOptions = themeOptions || LightThemeColors[0];
    const safeDarkThemeOptions = darkThemeOptions || DarkThemeColors[0];

    const defaultTheme = activeMode === "dark" ? baseDarkTheme : baselightTheme;
    const defaultShadow = activeMode === "dark" ? darkshadows : shadows;
    const themeSelect = activeMode === "dark" ? safeDarkThemeOptions : safeThemeOptions;

    const baseMode = {
      palette: { mode: activeMode },
      shape: { borderRadius },
      shadows: defaultShadow,
      typography,
    };

    const createdTheme = createTheme(
      baseMode,
      defaultTheme,
      ptBR,
      themeSelect
    );
    createdTheme.components = components(createdTheme);
    return createdTheme;
  }, [activeTheme, activeMode, borderRadius]);

  return theme;
};

export { ThemeSettings };
