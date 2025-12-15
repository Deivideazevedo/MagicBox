"use client"
import { useSelector } from "@/store/hooks";
import Link from "next/link";
import { styled, useTheme } from '@mui/material/styles'
import { AppState } from "@/store/store";
import Image from "next/image";
import { Box, Typography } from "@mui/material";

const Logo = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  
  const LinkStyled = styled(Link)(() => ({
    height: customizer.TopbarHeight,
    width: customizer.isCollapse ? "40px" : "200px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
  }));

  return (
    <LinkStyled href="/">
      <Image
        src={customizer.activeMode === "dark" ? "/images/logos/logo-light.png" : "/images/logos/logo-dark.png"}
        alt="Magic Box Icon"
        height={40}
        width={40}
        priority
      />
      {!customizer.isCollapse && (
        <Box sx={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <Typography
            variant="h4"
            component="span"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              fontSize: "1.5rem",
              lineHeight: 1,
            }}
          >
            Magic
          </Typography>
          <Typography
            variant="h4"
            component="span"
            sx={{
              fontWeight: 700,
              color: theme.palette.secondary.main,
              fontSize: "1.5rem",
              lineHeight: 1,
            }}
          >
            Box
          </Typography>
        </Box>
      )}
    </LinkStyled>
  );
};

export default Logo;
