// Types matching the BFF DTOs

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface ClienteRequest {
  nome: string;
  email: string;
  cpf: string;
  password: string;
  telefone: string;
  cep: string;
}

export interface EnderecoViaCep {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export interface ClienteResponse {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco: EnderecoViaCep | null;
  createdAt: string;
}

export interface ProdutoRequest {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
}

export interface ProdutoResponse {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  createdAt: string;
}

export interface ItemVendaRequest {
  produtoId: string;
  quantidade: number;
}

export interface ItemVendaResponse {
  produtoId: string;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface VendaRequest {
  clienteId: number;
  itens: ItemVendaRequest[];
}

export type StatusVenda = "PENDENTE" | "CONFIRMADA" | "CANCELADA";

export interface VendaResponse {
  id: string;
  clienteId: number;
  clienteEmail: string;
  itens: ItemVendaResponse[];
  subtotal: number;
  desconto: number;
  total: number;
  status: StatusVenda;
  createdAt: string;
}
