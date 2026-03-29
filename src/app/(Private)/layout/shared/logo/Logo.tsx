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
  const isExpandedLogo = !customizer.isCollapse || customizer.isSidebarHover;
  
  const LinkStyled = styled(Link)(() => ({
    height: customizer.TopbarHeight,
    width: isExpandedLogo ? "220px" : "44px",
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-end",
    gap: "6px",
    whiteSpace: "nowrap",
    textDecoration: "none",
    transition: "width 0.6s ease-in-out",
  }));

  return (
    <LinkStyled href="/">
      <Image
        src={"/images/logos/logo.png"}
        alt="MagicBox Icon"
        height={46}
        width={46}
        priority
      />
      {isExpandedLogo && (
        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <Typography
            variant="h4"
            component="span"
            sx={{
              fontWeight: 700,
              fontSize: "1.5rem",
              lineHeight: 1.15,
              display: "block",
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            MagicBox
          </Typography>
        </Box>
      )}
    </LinkStyled>
  );
};

export default Logo;
