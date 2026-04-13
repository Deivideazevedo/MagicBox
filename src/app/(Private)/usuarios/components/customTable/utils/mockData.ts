// Tipos
export interface Produto {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  cidade: string;
  produtos: Produto[];
}

// Mock de dados - 10 clientes com produtos
export const clientes: Cliente[] = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao@email.com',
    cidade: 'São Paulo',
    produtos: [
      { id: 101, nome: 'Notebook Dell', preco: 3500, quantidade: 2 },
      { id: 102, nome: 'Mouse Logitech', preco: 150, quantidade: 3 },
    ],
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria@email.com',
    cidade: 'Rio de Janeiro',
    produtos: [
      { id: 201, nome: 'Monitor LG 27"', preco: 1200, quantidade: 1 },
      { id: 202, nome: 'Teclado Mecânico', preco: 450, quantidade: 1 },
      { id: 203, nome: 'Webcam HD', preco: 300, quantidade: 2 },
    ],
  },
  {
    id: 3,
    nome: 'Pedro Oliveira',
    email: 'pedro@email.com',
    cidade: 'Belo Horizonte',
    produtos: [{ id: 301, nome: 'Cadeira Gamer', preco: 1800, quantidade: 1 }],
  },
  {
    id: 4,
    nome: 'Ana Costa',
    email: 'ana@email.com',
    cidade: 'Curitiba',
    produtos: [
      { id: 401, nome: 'SSD 1TB Samsung', preco: 600, quantidade: 2 },
      { id: 402, nome: 'Memória RAM 16GB', preco: 400, quantidade: 4 },
    ],
  },
  {
    id: 5,
    nome: 'Carlos Mendes',
    email: 'carlos@email.com',
    cidade: 'Porto Alegre',
    produtos: [
      { id: 501, nome: 'Headset Razer', preco: 800, quantidade: 1 },
      { id: 502, nome: 'Mousepad Grande', preco: 120, quantidade: 2 },
      { id: 503, nome: 'Suporte Monitor', preco: 200, quantidade: 1 },
    ],
  },
  {
    id: 6,
    nome: 'Juliana Rocha',
    email: 'juliana@email.com',
    cidade: 'Brasília',
    produtos: [{ id: 601, nome: 'Impressora HP', preco: 900, quantidade: 1 }],
  },
  {
    id: 7,
    nome: 'Roberto Lima',
    email: 'roberto@email.com',
    cidade: 'Salvador',
    produtos: [
      { id: 701, nome: 'Notebook Lenovo', preco: 4200, quantidade: 1 },
      { id: 702, nome: 'Mochila para Notebook', preco: 180, quantidade: 1 },
    ],
  },
  {
    id: 8,
    nome: 'Fernanda Alves',
    email: 'fernanda@email.com',
    cidade: 'Fortaleza',
    produtos: [
      { id: 801, nome: 'Tablet Samsung', preco: 1500, quantidade: 2 },
      { id: 802, nome: 'Caneta Stylus', preco: 250, quantidade: 2 },
      { id: 803, nome: 'Capa Protetora', preco: 100, quantidade: 2 },
    ],
  },
  {
    id: 9,
    nome: 'Lucas Ferreira',
    email: 'lucas@email.com',
    cidade: 'Recife',
    produtos: [
      { id: 901, nome: 'Câmera DSLR Canon', preco: 5500, quantidade: 1 },
      { id: 902, nome: 'Lente 50mm', preco: 1200, quantidade: 1 },
      { id: 903, nome: 'Tripé Profissional', preco: 400, quantidade: 1 },
      { id: 904, nome: 'Cartão SD 128GB', preco: 200, quantidade: 3 },
    ],
  },
  {
    id: 10,
    nome: 'Patricia Souza',
    email: 'patricia@email.com',
    cidade: 'Manaus',
    produtos: [
      { id: 1001, nome: 'Smart TV 55"', preco: 2800, quantidade: 1 },
      { id: 1002, nome: 'Soundbar JBL', preco: 900, quantidade: 1 },
    ],
  },
];
