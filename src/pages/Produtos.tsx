import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosApi } from "@/services/api";
import type { ProdutoRequest } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

const emptyProduto: ProdutoRequest = { nome: "", descricao: "", preco: 0, estoque: 0 };

export default function ProdutosPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProdutoRequest>(emptyProduto);

  const { data: produtos = [], isLoading, error } = useQuery({
    queryKey: ["produtos"],
    queryFn: produtosApi.listar,
  });

  const criarMut = useMutation({
    mutationFn: (data: ProdutoRequest) => produtosApi.criar(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["produtos"] }); setOpen(false); toast.success("Produto criado!"); },
    onError: () => toast.error("Erro ao criar produto"),
  });

  const atualizarMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProdutoRequest }) => produtosApi.atualizar(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["produtos"] }); setOpen(false); toast.success("Produto atualizado!"); },
    onError: () => toast.error("Erro ao atualizar produto"),
  });

  const deletarMut = useMutation({
    mutationFn: (id: string) => produtosApi.deletar(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["produtos"] }); toast.success("Produto removido!"); },
    onError: () => toast.error("Erro ao remover produto"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) atualizarMut.mutate({ id: editId, data: form });
    else criarMut.mutate(form);
  };

  const openEdit = (p: typeof produtos[0]) => {
    setEditId(p.id);
    setForm({ nome: p.nome, descricao: p.descricao, preco: p.preco, estoque: p.estoque });
    setOpen(true);
  };

  const openNew = () => { setEditId(null); setForm(emptyProduto); setOpen(true); };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <Package className="w-7 h-7 text-primary" /> Produtos
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie o catálogo de produtos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Novo Produto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editId ? "Editar" : "Novo"} Produto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label>Nome</Label>
                <Input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Descrição</Label>
                <Input value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Preço (R$)</Label>
                  <Input type="number" step="0.01" min="0" value={form.preco} onChange={(e) => setForm((f) => ({ ...f, preco: parseFloat(e.target.value) || 0 }))} required />
                </div>
                <div className="space-y-1">
                  <Label>Estoque</Label>
                  <Input type="number" min="0" value={form.estoque} onChange={(e) => setForm((f) => ({ ...f, estoque: parseInt(e.target.value) || 0 }))} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={criarMut.isPending || atualizarMut.isPending}>
                {editId ? "Atualizar" : "Cadastrar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">{produtos.length} produtos encontrados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-muted-foreground text-center">Carregando...</p>
          ) : error ? (
            <p className="p-6 text-destructive text-center">Erro ao carregar produtos. Verifique a conexão com a API.</p>
          ) : produtos.length === 0 ? (
            <p className="p-6 text-muted-foreground text-center">Nenhum produto cadastrado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nome}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">{p.descricao}</TableCell>
                    <TableCell>{formatCurrency(p.preco)}</TableCell>
                    <TableCell>
                      <Badge variant={p.estoque > 0 ? "secondary" : "destructive"}>
                        {p.estoque}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deletarMut.mutate(p.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
