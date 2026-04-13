// // src/core/lancamentos/utils.ts
// import { Lancamento as PrismaLancamento } from "@prisma/client";
// import { Prisma } from "@prisma/client";

// /**
//  * Calcula o status dinâmico de um lançamento baseado nas regras de negócio:
//  * - EM_ABERTO: valorPago (null ou 0) E data >= HOJE
//  * - VENCIDO: valorPago (null ou 0) E data < HOJE
//  * - PAGO: valorPago IGUAL valor
//  * - INCOMPLETO: valorPago > 0 E valorPago < valor
//  * - EXCEDENTE: valorPago > valor
//  */
// // export function calcularStatusDinamico(lancamento: PrismaLancamento): string {
// //   const hoje = new Date();
// //   hoje.setHours(0, 0, 0, 0);
  
// //   const dataLancamento = new Date(lancamento.data);
// //   dataLancamento.setHours(0, 0, 0, 0);
  
// //   const valor = Number(lancamento.valor);
// //   const valorPago = lancamento.valorPago ? Number(lancamento.valorPago) : 0;
  
// //   // PAGO: valorPago IGUAL valor
// //   if (valorPago === valor && valorPago > 0) {
// //     return "PAGO";
// //   }
  
// //   // EXCEDENTE: valorPago > valor
// //   if (valorPago > valor) {
// //     return "EXCEDENTE";
// //   }
  
// //   // INCOMPLETO: valorPago > 0 E valorPago < valor
// //   if (valorPago > 0 && valorPago < valor) {
// //     return "INCOMPLETO";
// //   }
  
// //   // EM_ABERTO: valorPago (null ou 0) E data >= HOJE
// //   if (valorPago === 0 && dataLancamento >= hoje) {
// //     return "EM_ABERTO";
// //   }
  
// //   // VENCIDO: valorPago (null ou 0) E data < HOJE
// //   if (valorPago === 0 && dataLancamento < hoje) {
// //     return "VENCIDO";
// //   }
  
// //   // Fallback
// //   return "EM_ABERTO";
// // }

// /**
//  * Gera SQL raw para filtrar lançamentos por status dinâmico
//  * Retorna array de IDs que atendem ao critério
//  */
// export async function buscarIdsPorStatusDinamico(
//   prisma: any,
//   status: string,
//   userId?: number
// ): Promise<number[]> {
//   const hoje = new Date();
//   hoje.setHours(0, 0, 0, 0);
//   const hojeSql = hoje.toISOString().split('T')[0];
  
//   let sql = "";
  
//   switch (status) {
//     case "EM_ABERTO":
//       sql = `
//         SELECT id FROM lancamento 
//         WHERE ("valorPago" IS NULL OR "valorPago" = 0) 
//         AND data >= '${hojeSql}'
//         ${userId ? `AND "userId" = ${userId}` : ''}
//       `;
//       break;
      
//     case "VENCIDO":
//       sql = `
//         SELECT id FROM lancamento 
//         WHERE ("valorPago" IS NULL OR "valorPago" = 0) 
//         AND data < '${hojeSql}'
//         ${userId ? `AND "userId" = ${userId}` : ''}
//       `;
//       break;
      
//     case "PAGO":
//       sql = `
//         SELECT id FROM lancamento 
//         WHERE "valorPago" IS NOT NULL 
//         AND "valorPago" > 0
//         AND "valorPago" = valor
//         ${userId ? `AND "userId" = ${userId}` : ''}
//       `;
//       break;
      
//     case "INCOMPLETO":
//       sql = `
//         SELECT id FROM lancamento 
//         WHERE "valorPago" IS NOT NULL 
//         AND "valorPago" > 0 
//         AND "valorPago" < valor
//         ${userId ? `AND "userId" = ${userId}` : ''}
//       `;
//       break;
      
//     case "EXCEDENTE":
//       sql = `
//         SELECT id FROM lancamento 
//         WHERE "valorPago" IS NOT NULL 
//         AND "valorPago" > valor
//         ${userId ? `AND "userId" = ${userId}` : ''}
//       `;
//       break;
      
//     default:
//       return [];
//   }
  
//   const resultado: Array<{ id: number }> = await prisma.$queryRaw(
//     Prisma.sql([sql])
//   );
  
//   return resultado.map((row: { id: number }) => row.id);
// }
