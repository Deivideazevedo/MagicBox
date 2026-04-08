"use client";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import PageContainer from "./components/container/PageContainer";
import { ThemedHeroSection } from "@/components/shared/ThemedComponents";
import { Fade, Typography } from "@mui/material";

export default function Loadingx() {
  return (
    <PageContainer
      title="Redirecionando..."
      description="Aguarde enquanto redirecionamos"
    >
      <ThemedHeroSection
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 3,
        }}
      >
        <Fade in timeout={1000}>
          <Box>
            <CircularProgress size={42} sx={{ color: "common.white", mb: 2 }} />
            <Typography
              variant="h4"
              fontWeight={700}
              color="common.white"
              gutterBottom
            >
              Redirecionando...
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "common.white", opacity: 0.9 }}
            >
              Aguarde enquanto redirecionamos você 
            </Typography>
          </Box>
        </Fade>
      </ThemedHeroSection>
    </PageContainer>
  );
}
