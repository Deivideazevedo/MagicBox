"use client";
import Link from "next/link";
import { styled, useTheme } from "@mui/material/styles";
import Image from "next/image";
import { Typography } from "@mui/material";
import { keyframes } from "@mui/system";

const levitate = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-4px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const Logo = () => {
  const theme = useTheme();

  const LinkStyled = styled(Link)(() => ({
    // overflow: "hidden",
    display: "flex",
    alignItems: "flex-end",
    gap: "4px",
    transform: "translateY(-4px)",
    whiteSpace: "nowrap",
    textDecoration: "none",
    "& .logo-icon": {
      display: "inline-flex",
      transform: "translateY(0)",
      transition: "transform 0.2s ease",
      willChange: "transform",
    },
    "&:hover .logo-icon": {
      animation: `${levitate} 1.35s ease-in-out infinite`,
    },
  }));

  return (
    <LinkStyled href="/">
      <span className="logo-icon">
        <Image
          src={"/images/logos/logo.png"}
          alt="MagicBox Icon"
          height={32}
          width={32}
          priority
        />
      </span>
      {/* <Box sx={{ display: "flex", alignItems: "center" }}> */}
      <Typography
        variant="h4"
        component="span"
        sx={{
          fontWeight: 700,
          fontSize: "1.2rem",
          lineHeight: 1.25,
          display: "block",
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        MagicBox
      </Typography>
      {/* </Box> */}
    </LinkStyled>
  );
};

export default Logo;
