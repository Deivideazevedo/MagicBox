const nextConfig = {
  reactStrictMode: true,

  // Força bundling de pacotes ESM que Next.js tenta externalizar por padrão
  transpilePackages: ["@react-pdf/renderer"],

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

    // Otimizações de bundle
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Reduz o tamanho do bundle em dev
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }

    return config;
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
