import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // <--- Novo
import { Pool } from "pg"; // <--- Novo
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Passa o adaptador para o PrismaClient0
const prisma = new PrismaClient({ adapter });

// Ler arquivos JSON
const dataPath = path.join(process.cwd(), "src", "data");
const usersData = JSON.parse(
  fs.readFileSync(path.join(dataPath, "users.json"), "utf-8")
);
const categoriasData = JSON.parse(
  fs.readFileSync(path.join(dataPath, "categorias.json"), "utf-8")
);
const despesasData = JSON.parse(
  fs.readFileSync(path.join(dataPath, "despesas.json"), "utf-8")
);
const fontesRendaData = JSON.parse(
  fs.readFileSync(path.join(dataPath, "fonteRendas.json"), "utf-8")
);
const lancamentosData = JSON.parse(
  fs.readFileSync(path.join(dataPath, "lancamentos.json"), "utf-8")
);

// Mapear IDs antigos (string) para novos (number)
const userIdMap = new Map<string, number>();
const categoriaIdMap = new Map<string, number>();
const despesaIdMap = new Map<string, number>();
const fonteRendaIdMap = new Map<string, number>();

async function main() {
  console.log("🌱 Iniciando migração dos dados JSON para PostgreSQL...\n");

  // ============================================
  // 1. LIMPAR DADOS EXISTENTES
  // ============================================
  console.log("🗑️  Limpando dados existentes...");
  await prisma.lancamento.deleteMany();
  await prisma.despesa.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.fonteRenda.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Dados limpos\n");

  // ============================================
  // 2. MIGRAR USUÁRIOS
  // ============================================
  console.log("👤 Migrando usuários...");
  for (const userData of usersData) {
    // Se a senha não está hashada, fazer hash
    let password = userData.password;
    if (!password.startsWith("$2")) {
      password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email || null,
        password: password,
        name: userData.name || null,
        image: userData.image || null,
        role: userData.role || "user",
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt),
      },
    });

    userIdMap.set(userData.id, user.id);
    console.log(`   ✓ ${user.username} (${userData.id} → ${user.id})`);
  }
  console.log(`✅ ${usersData.length} usuários migrados\n`);

  // ============================================
  // 3. MIGRAR CATEGORIAS
  // ============================================
  console.log("📁 Migrando categorias...");
  for (const categoriaData of categoriasData) {
    const userId = userIdMap.get(categoriaData.userId);

    if (!userId) {
      console.log(
        `   ⚠️  Categoria "${categoriaData.nome}" ignorada (userId ${categoriaData.userId} não encontrado)`
      );
      continue;
    }

    const categoria = await prisma.categoria.create({
      data: {
        userId: userId,
        nome: categoriaData.nome,
        createdAt: new Date(categoriaData.createdAt),
        updatedAt: new Date(categoriaData.updatedAt),
      },
    });

    categoriaIdMap.set(categoriaData.id, categoria.id);
    console.log(
      `   ✓ ${categoria.nome} (${categoriaData.id} → ${categoria.id})`
    );
  }
  console.log(`✅ ${categoriaIdMap.size} categorias migradas\n`);

  // ============================================
  // 4. MIGRAR DESPESAS
  // ============================================
  console.log("💰 Migrando despesas...");
  for (const despesaData of despesasData) {
    const userId = userIdMap.get(despesaData.userId);
    const categoriaId = categoriaIdMap.get(despesaData.categoriaId);

    if (!userId || !categoriaId) {
      console.log(
        `   ⚠️  Despesa "${despesaData.nome}" ignorada (referências inválidas)`
      );
      continue;
    }

    // Converter valorEstimado para string Decimal
    let valorEstimado = null;
    if (
      despesaData.valorEstimado !== null &&
      despesaData.valorEstimado !== undefined &&
      despesaData.valorEstimado !== ""
    ) {
      valorEstimado = String(despesaData.valorEstimado);
    }

    const despesa = await prisma.despesa.create({
      data: {
        userId: userId,
        categoriaId: categoriaId,
        nome: despesaData.nome,
        mensalmente: despesaData.mensalmente || false,
        valorEstimado: valorEstimado,
        diaVencimento: despesaData.diaVencimento || null,
        status: despesaData.status !== undefined ? despesaData.status : true,
        createdAt: new Date(despesaData.createdAt),
        updatedAt: new Date(despesaData.updatedAt),
      },
    });

    despesaIdMap.set(despesaData.id, despesa.id);
    console.log(`   ✓ ${despesa.nome} (${despesaData.id} → ${despesa.id})`);
  }
  console.log(`✅ ${despesaIdMap.size} despesas migradas\n`);

  // ============================================
  // 5. MIGRAR FONTES DE RENDA
  // ============================================
  console.log("💵 Migrando fontes de renda...");
  for (const fonteData of fontesRendaData) {
    const userId = userIdMap.get(fonteData.userId);

    if (!userId) {
      console.log(
        `   ⚠️  Fonte de renda "${fonteData.nome}" ignorada (userId inválido)`
      );
      continue;
    }

    // Converter valorEstimado para string Decimal
    let valorEstimado = null;
    if (
      fonteData.valorEstimado !== null &&
      fonteData.valorEstimado !== undefined &&
      fonteData.valorEstimado !== ""
    ) {
      valorEstimado = String(fonteData.valorEstimado);
    }

    const fonteRenda = await prisma.fonteRenda.create({
      data: {
        userId: userId,
        nome: fonteData.nome,
        valorEstimado: valorEstimado,
        diaRecebimento: fonteData.diaRecebimento || null,
        status: fonteData.status !== undefined ? fonteData.status : true,
        createdAt: new Date(fonteData.createdAt),
        updatedAt: new Date(fonteData.updatedAt),
      },
    });

    fonteRendaIdMap.set(fonteData.id, fonteRenda.id);
    console.log(`   ✓ ${fonteRenda.nome} (${fonteData.id} → ${fonteRenda.id})`);
  }
  console.log(`✅ ${fonteRendaIdMap.size} fontes de renda migradas\n`);

  // ============================================
  // 6. MIGRAR LANÇAMENTOS
  // ============================================
  console.log("📝 Migrando lançamentos...");
  let lancamentosMigrados = 0;

  for (const lancamentoData of lancamentosData) {
    const userId = userIdMap.get(lancamentoData.userId);

    if (!userId) {
      console.log(`   ⚠️  Lançamento ignorado (userId inválido)`);
      continue;
    }

    // Mapear fonteRendaId
    const despesaId = lancamentoData.despesaId
      ? despesaIdMap.get(lancamentoData.despesaId) || null
      : null;
    // Mapear fonteRendaId
    const categoriaId =  categoriaIdMap.get(lancamentoData.categoriaId);

    // Mapear fonteRendaId
    const fonteRendaId = lancamentoData.fonteRendaId
      ? fonteRendaIdMap.get(lancamentoData.fonteRendaId) || null
      : null;

    // Validar que tem despesa OU fonte de renda
    if (!despesaId && !fonteRendaId) {
      console.log(
        `   ⚠️  Lançamento ignorado (sem despesa ou fonte de renda válida)`
      );
      continue;
    }

    // Converter valores para string Decimal
    const valor = String(lancamentoData.valor);
    const valorPago =
      lancamentoData.valorPago !== null &&
      lancamentoData.valorPago !== undefined
        ? String(lancamentoData.valorPago)
        : null;

    try {
      const lancamento = await prisma.lancamento.create({
        data: {
          userId: userId,
          tipo: lancamentoData.tipo as any,
          valor: valor,
          data: new Date(lancamentoData.data),
          descricao: lancamentoData.descricao,
          despesaId: despesaId,
          categoriaId: Number(categoriaId), // Manter contaId como alias
          fonteRendaId: fonteRendaId,
          parcelas: lancamentoData.parcelas || null,
          createdAt: new Date(lancamentoData.createdAt),
          updatedAt: new Date(lancamentoData.updatedAt),
        },
      });

      lancamentosMigrados++;
      console.log(
        `   ✓ ${lancamento.tipo} - ${lancamento?.descricao?.substring(0, 30)}...`
      );
    } catch (error: any) {
      console.log(`   ⚠️  Erro ao migrar lançamento: ${error.message}`);
    }
  }
  console.log(`✅ ${lancamentosMigrados} lançamentos migrados\n`);

  // ============================================
  // RESUMO FINAL
  // ============================================
  console.log("📊 RESUMO DA MIGRAÇÃO:");
  console.log(`   - ${userIdMap.size} usuários`);
  console.log(`   - ${categoriaIdMap.size} categorias`);
  console.log(`   - ${despesaIdMap.size} despesas`);
  console.log(`   - ${fonteRendaIdMap.size} fontes de renda`);
  console.log(`   - ${lancamentosMigrados} lançamentos`);
  console.log("\n✨ Migração concluída com sucesso!\n");

  // Salvar mapeamento de IDs para referência futura
  const mapping = {
    users: Object.fromEntries(userIdMap),
    categorias: Object.fromEntries(categoriaIdMap),
    despesas: Object.fromEntries(despesaIdMap),
    fontesRenda: Object.fromEntries(fonteRendaIdMap),
  };

  fs.writeFileSync(
    path.join(dataPath, "id-mapping.json"),
    JSON.stringify(mapping, null, 2)
  );
  console.log("💾 Mapeamento de IDs salvo em src/data/id-mapping.json\n");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar migração:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
