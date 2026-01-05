import { PrismaClient, TipoLancamento } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import "@/lib/zod-config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL não está definida");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================
// SCHEMAS DE VALIDAÇÃO ZOD
// ============================================

const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().nullable(),
  password: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  role: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CategoriaSchema = z.object({
  id: z.number(),
  userId: z.number(),
  nome: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const DespesaSchema = z.object({
  id: z.number(),
  userId: z.number(),
  categoriaId: z.number(),
  nome: z.string(),
  mensalmente: z.boolean(),
  valorEstimado: z.string().nullable(),
  diaVencimento: z.number().nullable(),
  status: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const FonteRendaSchema = z.object({
  id: z.number(),
  userId: z.number(),
  nome: z.string(),
  valorEstimado: z.string().nullable(),
  diaRecebimento: z.number().nullable(),
  mensalmente: z.boolean(),
  categoriaId: z.number(),
  status: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const LancamentoSchema = z.object({
  id: z.number(),
  userId: z.number(),
  tipo: z.enum(["pagamento", "agendamento", "receita"]),
  valor: z.string(),
  data: z.string(),
  descricao: z.string().nullable(),
  despesaId: z.number().nullable(),
  categoriaId: z.number(),
  fonteRendaId: z.number().nullable(),
  parcelas: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function readJSON<T>(filename: string, schema: z.ZodSchema<T>): T[] {
  const dataPath = path.join(process.cwd(), "src", "data", filename);
  const rawData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  return schema.array().parse(rawData);
}

async function seedUsers() {
  console.log("👤 Importando usuários...");
  const users = readJSON("users.json", UserSchema);

  // Hash senhas que não estão hashadas
  const usersData = await Promise.all(
    users.map(async (user) => ({
      username: user.username,
      email: user.email,
      password: user.password.startsWith("$2")
        ? user.password
        : await bcrypt.hash(user.password, 10),
      name: user.name,
      image: user.image,
      role: user.role || "user",
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    }))
  );

  await prisma.user.createMany({ data: usersData, skipDuplicates: true });
  console.log(`✅ ${usersData.length} usuários importados\n`);
}

async function seedCategorias() {
  console.log("📁 Importando categorias...");
  const categorias = readJSON("categorias.json", CategoriaSchema);

  const categoriasData = categorias.map((cat) => ({
    userId: cat.userId,
    nome: cat.nome,
    createdAt: new Date(cat.createdAt),
    updatedAt: new Date(cat.updatedAt),
  }));

  await prisma.categoria.createMany({
    data: categoriasData,
    skipDuplicates: true,
  });
  console.log(`✅ ${categoriasData.length} categorias importadas\n`);
}

async function seedDespesas() {
  console.log("💰 Importando despesas...");
  const despesas = readJSON("despesas.json", DespesaSchema);

  const despesasData = despesas.map((desp) => ({
    userId: desp.userId,
    categoriaId: desp.categoriaId,
    nome: desp.nome,
    mensalmente: desp.mensalmente,
    valorEstimado: desp.valorEstimado,
    diaVencimento: desp.diaVencimento,
    status: desp.status,
    createdAt: new Date(desp.createdAt),
    updatedAt: new Date(desp.updatedAt),
  }));

  await prisma.despesa.createMany({ data: despesasData, skipDuplicates: true });
  console.log(`✅ ${despesasData.length} despesas importadas\n`);
}

async function seedFontesRenda() {
  console.log("💵 Importando fontes de renda...");
  const fontes = readJSON("fonteRendas.json", FonteRendaSchema);

  const fontesData = fontes.map((fonte) => ({
    userId: fonte.userId,
    nome: fonte.nome,
    valorEstimado: fonte.valorEstimado,
    diaRecebimento: fonte.diaRecebimento,
    mensalmente: fonte.mensalmente,
    categoriaId: fonte.categoriaId,
    status: fonte.status,
    createdAt: new Date(fonte.createdAt),
    updatedAt: new Date(fonte.updatedAt),
  }));

  await prisma.fonteRenda.createMany({
    data: fontesData,
    skipDuplicates: true,
  });
  console.log(`✅ ${fontesData.length} fontes de renda importadas\n`);
}

async function seedLancamentos() {
  console.log("📝 Importando lançamentos...");
  const lancamentos = readJSON("lancamentos.json", LancamentoSchema);

  const lancamentosData = lancamentos.map((lanc) => ({
    userId: lanc.userId,
    tipo: lanc.tipo as TipoLancamento,
    valor: lanc.valor,
    data: new Date(lanc.data),
    descricao: lanc.descricao,
    despesaId: lanc.despesaId,
    categoriaId: lanc.categoriaId,
    fonteRendaId: lanc.fonteRendaId,
    parcelas: lanc.parcelas,
    createdAt: new Date(lanc.createdAt),
    updatedAt: new Date(lanc.updatedAt),
  }));

  await prisma.lancamento.createMany({
    data: lancamentosData,
    skipDuplicates: true,
  });
  console.log(`✅ ${lancamentosData.length} lançamentos importados\n`);
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  try {
    // Limpar dados existentes
    console.log("🗑️  Limpando dados existentes...");
    await prisma.$transaction([
      prisma.lancamento.deleteMany(),
      prisma.despesa.deleteMany(),
      prisma.categoria.deleteMany(),
      prisma.fonteRenda.deleteMany(),
      prisma.user.deleteMany(),
    ]);
    console.log("✅ Dados limpos\n");

    // Importar dados
    await seedUsers();
    await seedCategorias();
    await seedDespesas();
    await seedFontesRenda();
    await seedLancamentos();

    console.log("✨ Seed concluído com sucesso!\n");
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Erro de validação Zod:");
      console.error(JSON.stringify(error.issues, null, 2));
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("❌ Erro do Prisma:");
      console.error(`Código: ${error.code}`);
      console.error(`Mensagem: ${error.message}`);
      console.error(`Meta: ${JSON.stringify(error.meta, null, 2)}`);
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      console.error("❌ Erro de validação do Prisma:");
      console.error(error.message);
    } else {
      console.error("❌ Erro ao executar seed:");
      console.error(error);
    }
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed falhou:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
