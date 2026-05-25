import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MagicBox - Gestão Financeira",
    short_name: "MagicBox",
    description: "Sistema de Gestão Financeira Inteligente",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#5D87FF", // Alinhado ao Primary do tema padrão
    icons: [
      {
        src: "/images/logos/logo.png",
        sizes: "192x192 256x256 384x384 512x512 1000x1000",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/logos/logo.png",
        sizes: "192x192 256x256 384x384 512x512 1000x1000",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
