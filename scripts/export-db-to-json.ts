import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL não está definida");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const dataPath = path.join(process.cwd(), "src", "data");

async function exportDatabaseToJSON() {
  console.log("📦 Exportando dados do banco para JSON...\n");

  try {
    // ============================================
    // 1. EXPORTAR USUÁRIOS
    // ============================================
    console.log("👤 Exportando usuários...");
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { id: "asc" },
    });

    const usersData = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      name: user.name,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));

    fs.writeFileSync(
      path.join(dataPath, "users.json"),
      JSON.stringify(usersData, null, 2)
    );
    console.log(`✅ ${usersData.length} usuários exportados\n`);

    // ============================================
    // 2. EXPORTAR CATEGORIAS
    // ============================================
    console.log("📁 Exportando categorias...");
    const categorias = await prisma.categoria.findMany({
      where: { deletedAt: null },
      orderBy: { id: "asc" },
    });

    const categoriasData = categorias.map((categoria) => ({
      id: categoria.id,
      userId: categoria.userId,
      nome: categoria.nome,
      createdAt: categoria.createdAt.toISOString(),
      updatedAt: categoria.updatedAt.toISOString(),
    }));

    fs.writeFileSync(
      path.join(dataPath, "categorias.json"),
      JSON.stringify(categoriasData, null, 2)
    );
    console.log(`✅ ${categoriasData.length} categorias exportadas\n`);

    // ============================================
    // 3. EXPORTAR DESPESAS
    // ============================================
    console.log("💰 Exportando despesas...");
    const despesas = await prisma.despesa.findMany({
      where: { deletedAt: null },
      orderBy: { id: "asc" },
    });

    const despesasData = despesas.map((despesa) => ({
      id: despesa.id,
      userId: despesa.userId,
      categoriaId: despesa.categoriaId,
      nome: despesa.nome,
      mensalmente: despesa.mensalmente,
      valorEstimado: despesa.valorEstimado,
      diaVencimento: despesa.diaVencimento,
      status: despesa.status,
      createdAt: despesa.createdAt.toISOString(),
      updatedAt: despesa.updatedAt.toISOString(),
    }));

    fs.writeFileSync(
      path.join(dataPath, "despesas.json"),
      JSON.stringify(despesasData, null, 2)
    );
    console.log(`✅ ${despesasData.length} despesas exportadas\n`);

    // ============================================
    // 4. EXPORTAR FONTES DE RENDA
    // ============================================
    console.log("💵 Exportando fontes de renda...");
    const fontesRenda = await prisma.fonteRenda.findMany({
      where: { deletedAt: null },
      orderBy: { id: "asc" },
    });

    const fontesRendaData = fontesRenda.map((fonte) => ({
      id: fonte.id,
      userId: fonte.userId,
      nome: fonte.nome,
      valorEstimado: fonte.valorEstimado,
      diaRecebimento: fonte.diaRecebimento,
      mensalmente: fonte.mensalmente,
      categoriaId: fonte.categoriaId,
      status: fonte.status,
      createdAt: fonte.createdAt.toISOString(),
      updatedAt: fonte.updatedAt.toISOString(),
    }));

    fs.writeFileSync(
      path.join(dataPath, "fonteRendas.json"),
      JSON.stringify(fontesRendaData, null, 2)
    );
    console.log(`✅ ${fontesRendaData.length} fontes de renda exportadas\n`);

    // ============================================
    // 5. EXPORTAR LANÇAMENTOS
    // ============================================
    console.log("📝 Exportando lançamentos...");
    const lancamentos = await prisma.lancamento.findMany({
      where: { deletedAt: null },
      orderBy: { id: "asc" },
    });

    const lancamentosData = lancamentos.map((lancamento) => ({
      id: lancamento.id,
      userId: lancamento.userId,
      tipo: lancamento.tipo,
      valor: lancamento.valor,
      data: lancamento.data.toISOString(),
      descricao: lancamento.descricao,
      despesaId: lancamento.despesaId,
      categoriaId: lancamento.categoriaId,
      fonteRendaId: lancamento.fonteRendaId,
      parcelas: lancamento.parcelas,
      createdAt: lancamento.createdAt.toISOString(),
      updatedAt: lancamento.updatedAt.toISOString(),
    }));

    fs.writeFileSync(
      path.join(dataPath, "lancamentos.json"),
      JSON.stringify(lancamentosData, null, 2)
    );
    console.log(`✅ ${lancamentosData.length} lançamentos exportados\n`);

    // ============================================
    // RESUMO FINAL
    // ============================================
    console.log("📊 RESUMO DA EXPORTAÇÃO:");
    console.log(`   - ${usersData.length} usuários`);
    console.log(`   - ${categoriasData.length} categorias`);
    console.log(`   - ${despesasData.length} despesas`);
    console.log(`   - ${fontesRendaData.length} fontes de renda`);
    console.log(`   - ${lancamentosData.length} lançamentos`);
    console.log("\n✨ Exportação concluída com sucesso!");
    console.log(`📁 Arquivos salvos em: ${dataPath}\n`);
  } catch (error) {
    console.error("❌ Erro ao exportar dados:", error);
    throw error;
  }
}

exportDatabaseToJSON()
  .catch((e) => {
    console.error("❌ Erro ao executar exportação:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
