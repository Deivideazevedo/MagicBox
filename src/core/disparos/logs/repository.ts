import { prisma } from "@/lib/prisma";

export const disparosLogsRepository = {
  async listarPaginado(limit: number, page: number) {
    const skip = page * limit;

    const [logs, total] = await Promise.all([
      prisma.disparo.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.disparo.count(),
    ]);

    return { logs, total };
  },

  async obterDestinatarios(disparoId: number) {
    return await prisma.disparoEnvio.findMany({
      where: { disparoId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  },
};
