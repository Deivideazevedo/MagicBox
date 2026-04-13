import React from "react";
import { Avatar, AvatarProps, SxProps, Theme } from "@mui/material";
import Image from "next/image";

interface CustomAvatarProps extends AvatarProps {
  src?: string;
  size?: number; // Prop facilitadora para dimensões quadradas
  sx?: SxProps<Theme>;
}

export const CustomAvatar = ({
  src,
  alt,
  sx,
  slotProps,
  slots,
  size,
  ...props
}: CustomAvatarProps) => {

  // 1. Extraímos as dimensões com segurança. 
  // O MUI permite que width/height venham de várias formas, aqui simplificamos:
  const finalSize = size || 40;

  return (
    <Avatar
      src={src || undefined}
      alt={alt}
      // 2. Garantimos que o container do Avatar siga o tamanho definido
      sx={{
        width: finalSize,
        height: finalSize,
        ...sx,
      }}
      slotProps={{
        ...slotProps,
        img: {
          // 3. O Next.js Image precisa de valores numéricos para o cálculo de aspect-ratio
          width: finalSize,
          height: finalSize,
          style: { objectFit: "cover" },
          ...slotProps?.img,
        },
      }}
      {...props}
    />
  );
};

export default CustomAvatar;