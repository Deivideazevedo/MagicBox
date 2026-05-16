import { createTheme } from "@mui/material/styles";
import { useSelector } from "@/store/hooks";
import { useEffect, useMemo } from "react";
import { AppState } from "@/store/store";
import components from "./Components";
import typography from "./Typography";
import { shadows, darkshadows } from "./Shadows";
import { DarkThemeColors } from "./DarkThemeColors";
import { LightThemeColors } from "./LightThemeColors";
import { baseDarkTheme, baselightTheme } from "./DefaultColors";
import ptBR from "@mui/material/locale";

// Merge simples e leve (substitui lodash.merge)
const mergeDeep = (target: any, ...sources: any[]): any => {
  if (!sources.length) return target;
  const result = { ...target };
  for (const source of sources) {
    if (!source) continue;
    for (const key of Object.keys(source)) {
      if (
        source[key] instanceof Object &&
        !Array.isArray(source[key]) &&
        result[key] instanceof Object
      ) {
        result[key] = mergeDeep(result[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  return result;
};

// Função pura para criar o tema (usada fora do React)
export const buildThemeInternal = (
  customizer: AppState["customizer"],
  config: any = {}
) => {
  const themeOptions = LightThemeColors.find((t) => t.name === config.theme);
  const darkThemeOptions = DarkThemeColors.find(
    (t) => t.name === config.theme
  );

  // Fallback: usa o primeiro tema se não encontrar o configurado
  const safeThemeOptions = themeOptions || LightThemeColors[0];
  const safeDarkThemeOptions = darkThemeOptions || DarkThemeColors[0];

  const defaultTheme =
    customizer.activeMode === "dark" ? baseDarkTheme : baselightTheme;
  const defaultShadow =
    customizer.activeMode === "dark" ? darkshadows : shadows;
  const themeSelect =
    customizer.activeMode === "dark" ? safeDarkThemeOptions : safeThemeOptions;

  const baseMode = {
    palette: { mode: customizer.activeMode },
    shape: { borderRadius: customizer.borderRadius },
    shadows: defaultShadow,
    typography,
  };

  const theme = createTheme(
    mergeDeep({}, baseMode, defaultTheme, ptBR, themeSelect, {
      direction: config.direction,
    })
  );
  theme.components = components(theme);
  return theme;
};

// Hook para uso dentro do React (memoizado com useMemo)
const ThemeSettings = () => {
  const customizer = useSelector((state: AppState) => state.customizer);

  const theme = useMemo(
    () =>
      buildThemeInternal(customizer, {
        direction: customizer.activeDir,
        theme: customizer.activeTheme,
      }),
    [
      customizer.activeMode,
      customizer.borderRadius,
      customizer.activeDir,
      customizer.activeTheme,
    ]
  );

  useEffect(() => {
    document.dir = customizer.activeDir;
  }, [customizer.activeDir]);

  return theme;
};

export { ThemeSettings };
