import _ from "lodash";
import { createTheme } from "@mui/material/styles";
import { useSelector } from "@/store/hooks";
import { useEffect } from "react";
import { AppState } from "@/store/store";
import components from "./Components";
import typography from "./Typography";
import { shadows, darkshadows } from "./Shadows";
import { DarkThemeColors } from "./DarkThemeColors";
import { LightThemeColors } from "./LightThemeColors";
import { baseDarkTheme, baselightTheme } from "./DefaultColors";
import * as locales from "@mui/material/locale";

/**
 * 🔹 Função PURA
 * Pode ser usada fora do React (Swal, RTK, utils)
 */
export const buildThemeInternal = (
  customizer: AppState["customizer"],
  config: any = {}
) => {
  const themeOptions = LightThemeColors.find((t) => t.name === config.theme);
  const darkThemeOptions = DarkThemeColors.find((t) => t.name === config.theme);

  const defaultTheme =
    customizer.activeMode === "dark" ? baseDarkTheme : baselightTheme;

  const defaultShadow =
    customizer.activeMode === "dark" ? darkshadows : shadows;

  const themeSelect =
    customizer.activeMode === "dark" ? darkThemeOptions : themeOptions;

  const baseMode = {
    palette: { mode: customizer.activeMode },
    shape: { borderRadius: customizer.borderRadius },
    shadows: defaultShadow,
    typography,
  };

  const theme = createTheme(
    _.merge({}, baseMode, defaultTheme, locales, themeSelect, {
      direction: config.direction,
    })
  );

  return theme;
};

/**
 * 🔹 Wrapper com hook (React only)
 */
export const BuildTheme = (config: any = {}) => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = buildThemeInternal(customizer, config);
  theme.components = components(theme);

  return theme;
};

const ThemeSettings = () => {
  const activDir = useSelector((state: AppState) => state.customizer.activeDir);
  const activeTheme = useSelector(
    (state: AppState) => state.customizer.activeTheme
  );
  const theme = BuildTheme({
    direction: activDir,
    theme: activeTheme,
  });
  useEffect(() => {
    document.dir = activDir;
  }, [activDir]);

  return theme;
};

export { ThemeSettings };
