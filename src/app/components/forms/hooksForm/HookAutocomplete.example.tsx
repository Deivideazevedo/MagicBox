/**
 * Exemplos de uso do HookAutocomplete
 * 
 * Este arquivo contém exemplos práticos de como utilizar o componente HookAutocomplete
 * em diferentes cenários do MagicBox.
 */

import { useForm } from "react-hook-form";
import { HookAutocomplete } from "./HookAutocomplete";

// ============================================================
// EXEMPLO 1: Autocomplete Simples com Objetos
// ============================================================
type FormData1 = {
  categoriaId: string;
};

interface Categoria {
  id: string;
  nome: string;
  icone?: string;
}

function Example1() {
  const { control } = useForm<FormData1>();
  const categorias: Categoria[] = [
    { id: "1", nome: "Alimentação" },
    { id: "2", nome: "Transporte" },
    { id: "3", nome: "Moradia" },
  ];

  return (
    <HookAutocomplete
      name="categoriaId"
      control={control}
      label="Categoria"
      options={categorias}
      getOptionLabel={(cat) => cat.nome}
      getOptionValue={(cat) => cat.id}
    />
  );
}

// ============================================================
// EXEMPLO 2: Autocomplete Múltiplo
// ============================================================
type FormData2 = {
  contaIds: string[];
};

interface Conta {
  id: string;
  descricao: string;
  ativa: boolean;
}

function Example2() {
  const { control } = useForm<FormData2>();
  const contas: Conta[] = [
    { id: "1", descricao: "Conta Corrente", ativa: true },
    { id: "2", descricao: "Poupança", ativa: true },
    { id: "3", descricao: "Cartão de Crédito", ativa: false },
  ];

  return (
    <HookAutocomplete
      name="contaIds"
      control={control}
      label="Contas"
      multiple
      options={contas}
      getOptionLabel={(conta) => conta.descricao}
      getOptionValue={(conta) => conta.id}
      placeholder="Selecione uma ou mais contas"
    />
  );
}

// ============================================================
// EXEMPLO 3: Autocomplete com Strings Simples
// ============================================================
type FormData3 = {
  status: string;
};

function Example3() {
  const { control } = useForm<FormData3>();
  const statusOptions = ["Ativo", "Inativo", "Pendente", "Cancelado"];

  return (
    <HookAutocomplete
      name="status"
      control={control}
      label="Status"
      options={statusOptions}
    />
  );
}

// ============================================================
// EXEMPLO 4: Autocomplete com FreeSolo (permite digitação livre)
// ============================================================
type FormData4 = {
  descricao: string;
};

function Example4() {
  const { control } = useForm<FormData4>();
  const sugestoes = ["Supermercado", "Farmácia", "Restaurante", "Combustível"];

  return (
    <HookAutocomplete
      name="descricao"
      control={control}
      label="Descrição"
      freeSolo
      options={sugestoes}
      placeholder="Digite ou selecione uma descrição"
    />
  );
}

// ============================================================
// EXEMPLO 5: Autocomplete com Props Customizadas
// ============================================================
type FormData5 = {
  despesaId: string;
};

interface Despesa {
  id: string;
  nome: string;
  categoria: string;
  cor?: string;
}

function Example5() {
  const { control } = useForm<FormData5>();
  const despesas: Despesa[] = [
    { id: "1", nome: "Aluguel", categoria: "Moradia", cor: "#FF5722" },
    { id: "2", nome: "Água", categoria: "Moradia", cor: "#2196F3" },
    { id: "3", nome: "Internet", categoria: "Utilidades", cor: "#9C27B0" },
  ];

  return (
    <HookAutocomplete
      name="despesaId"
      control={control}
      label="Despesa"
      options={despesas}
      getOptionLabel={(desp) => `${desp.nome} (${desp.categoria})`}
      getOptionValue={(desp) => desp.id}
      textFieldProps={{
        variant: "outlined",
        size: "small",
      }}
      disabled={false}
      disableClearable={false}
      loading={false}
      loadingText="Carregando despesas..."
      noOptionsText="Nenhuma despesa encontrada"
    />
  );
}

// ============================================================
// EXEMPLO 6: Autocomplete com Validação e Comparação Customizada
// ============================================================
type FormData6 = {
  fonteRendaId: string;
};

interface FonteRenda {
  id: string;
  descricao: string;
  valor: number;
  ativa: boolean;
}

function Example6() {
  const { control } = useForm<FormData6>();
  const fontes: FonteRenda[] = [
    { id: "1", descricao: "Salário", valor: 5000, ativa: true },
    { id: "2", descricao: "Freelance", valor: 2000, ativa: true },
    { id: "3", descricao: "Investimentos", valor: 500, ativa: false },
  ];

  return (
    <HookAutocomplete
      name="fonteRendaId"
      control={control}
      label="Fonte de Renda"
      options={fontes.filter((f) => f.ativa)} // Filtra apenas ativas
      getOptionLabel={(fonte) =>
        `${fonte.descricao} - R$ ${fonte.valor.toFixed(2)}`
      }
      getOptionValue={(fonte) => fonte.id}
      isOptionEqualToValue={(option, value) => option.id === value.id}
    />
  );
}

// ============================================================
// EXEMPLO 7: Autocomplete com Agrupamento
// ============================================================
type FormData7 = {
  contaId: string;
};

interface ContaComCategoria {
  id: string;
  nome: string;
  categoria: string;
}

function Example7() {
  const { control } = useForm<FormData7>();
  const contas: ContaComCategoria[] = [
    { id: "1", nome: "Supermercado", categoria: "Alimentação" },
    { id: "2", nome: "Restaurante", categoria: "Alimentação" },
    { id: "3", nome: "Combustível", categoria: "Transporte" },
    { id: "4", nome: "Manutenção", categoria: "Transporte" },
  ];

  return (
    <HookAutocomplete
      name="contaId"
      control={control}
      label="Conta"
      options={contas}
      groupBy={(option) => option.categoria}
      getOptionLabel={(conta) => conta.nome}
      getOptionValue={(conta) => conta.id}
    />
  );
}

export {
  Example1,
  Example2,
  Example3,
  Example4,
  Example5,
  Example6,
  Example7,
};
