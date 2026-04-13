import React from "react";
import * as TablerIcons from "@tabler/icons-react";

export interface DynamicIconProps {
  name: string | null | undefined;
  size?: number | string;
  color?: string;
  stroke?: number | string;
  fallbackIcon?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  size = 24,
  color = "currentColor",
  stroke = 2,
  fallbackIcon = "IconCategory", // Se o nome não existir, usa esse como padrão
}) => {
  // Pega o componente pelo nome, se não achar tenta o fallback, se não achar tenta o padrão básico
  let IconComponent = name ? (TablerIcons as Record<string, any>)[name] : null;

  if (!IconComponent) {
    IconComponent = (TablerIcons as Record<string, any>)[fallbackIcon];
  }

  if (!IconComponent) {
    IconComponent = TablerIcons.IconCategory;
  }

  return <IconComponent size={size} color={color} stroke={stroke} />;
};
