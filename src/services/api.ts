import type {
  LoginRequest, LoginResponse,
  ClienteRequest, ClienteResponse,
  ProdutoRequest, ProdutoResponse,
  VendaRequest, VendaResponse,
} from "@/types/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export const authApi = {
  login: (data: LoginRequest) =>
    request<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
};

// Clientes
export const clientesApi = {
  listar: () => request<ClienteResponse[]>("/clientes"),
  buscar: (id: number) => request<ClienteResponse>(`/clientes/${id}`),
  criar: (data: ClienteRequest) =>
    request<ClienteResponse>("/clientes", { method: "POST", body: JSON.stringify(data) }),
  atualizar: (id: number, data: ClienteRequest) =>
    request<ClienteResponse>(`/clientes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletar: (id: number) =>
    request<void>(`/clientes/${id}`, { method: "DELETE" }),
};

// Produtos
export const produtosApi = {
  listar: () => request<ProdutoResponse[]>("/produtos"),
  buscar: (id: string) => request<ProdutoResponse>(`/produtos/${id}`),
  criar: (data: ProdutoRequest) =>
    request<ProdutoResponse>("/produtos", { method: "POST", body: JSON.stringify(data) }),
  atualizar: (id: string, data: ProdutoRequest) =>
    request<ProdutoResponse>(`/produtos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  atualizarEstoque: (id: string, quantidade: number) =>
    request<void>(`/produtos/${id}/estoque/${quantidade}`, { method: "PATCH" }),
  deletar: (id: string) =>
    request<void>(`/produtos/${id}`, { method: "DELETE" }),
};

// Vendas
export const vendasApi = {
  criar: (data: VendaRequest) =>
    request<VendaResponse>("/vendas", { method: "POST", body: JSON.stringify(data) }),
  buscar: (id: string) => request<VendaResponse>(`/vendas/${id}`),
  listarPorCliente: (clienteId: number) =>
    request<VendaResponse[]>(`/vendas/cliente/${clienteId}`),
  confirmar: (id: string) =>
    request<VendaResponse>(`/vendas/${id}/confirmar`, { method: "PATCH" }),
  cancelar: (id: string) =>
    request<VendaResponse>(`/vendas/${id}/cancelar`, { method: "PATCH" }),
};
