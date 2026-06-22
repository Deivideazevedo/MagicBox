const nextConfig = {
  reactStrictMode: true,


  // Otimizações de performance para dev e build
  experimental: {
    // Otimiza imports de pacotes pesados
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/lab",
      "@mui/x-data-grid",
      "@mui/x-date-pickers",
      "@tabler/icons-react",
      "lodash",
      "lodash-es",
      "date-fns",
      "react-icons",
    ],

    // Pacotes que devem ser tratados como externos no Server Components
    serverComponentsExternalPackages: ["@prisma/client", "pg", "@prisma/adapter-pg"],


  },

  // Compressão
  compress: true,

  // Powered by header
  poweredByHeader: false,

  // Imagens
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
