import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendasApi, clientesApi, produtosApi } from "@/services/api";
import type { VendaRequest, ItemVendaRequest } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  PENDENTE: "bg-warning text-warning-foreground",
  CONFIRMADA: "bg-success text-success-foreground",
  CANCELADA: "bg-destructive text-destructive-foreground",
};

export default function VendasPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [searchClienteId, setSearchClienteId] = useState("");
  const [itens, setItens] = useState<ItemVendaRequest[]>([{ produtoId: "", quantidade: 1 }]);

  const { data: clientes = [] } = useQuery({ queryKey: ["clientes"], queryFn: clientesApi.listar });
  const { data: produtos = [] } = useQuery({ queryKey: ["produtos"], queryFn: produtosApi.listar });

  const { data: vendas = [], isLoading, error } = useQuery({
    queryKey: ["vendas", searchClienteId],
    queryFn: () => {
      if (!searchClienteId) return Promise.resolve([]);
      return vendasApi.listarPorCliente(parseInt(searchClienteId));
    },
    enabled: !!searchClienteId,
  });

  const criarMut = useMutation({
    mutationFn: (data: VendaRequest) => vendasApi.criar(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendas"] });
      setOpen(false);
      toast.success("Venda criada!");
    },
    onError: () => toast.error("Erro ao criar venda"),
  });

  const confirmarMut = useMutation({
    mutationFn: (id: string) => vendasApi.confirmar(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vendas"] }); toast.success("Venda confirmada!"); },
    onError: () => toast.error("Erro ao confirmar venda"),
  });

  const cancelarMut = useMutation({
    mutationFn: (id: string) => vendasApi.cancelar(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vendas"] }); toast.success("Venda cancelada!"); },
    onError: () => toast.error("Erro ao cancelar venda"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItens = itens.filter((i) => i.produtoId && i.quantidade > 0);
    if (!clienteId || validItens.length === 0) {
      toast.error("Selecione um cliente e adicione pelo menos um item");
      return;
    }
    criarMut.mutate({ clienteId: parseInt(clienteId), itens: validItens });
  };

  const addItem = () => setItens((prev) => [...prev, { produtoId: "", quantidade: 1 }]);

  const updateItem = (index: number, field: keyof ItemVendaRequest, value: string | number) => {
    setItens((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const removeItem = (index: number) => setItens((prev) => prev.filter((_, i) => i !== index));

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-primary" /> Vendas
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie as vendas realizadas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Nova Venda</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Nova Venda</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label>Cliente</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Itens</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="w-3 h-3 mr-1" /> Item
                  </Button>
                </div>
                {itens.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select value={item.produtoId} onValueChange={(v) => updateItem(idx, "produtoId", v)}>
                        <SelectTrigger><SelectValue placeholder="Produto" /></SelectTrigger>
                        <SelectContent>
                          {produtos.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => updateItem(idx, "quantidade", parseInt(e.target.value) || 1)}
                      />
                    </div>
                    {itens.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full" disabled={criarMut.isPending}>
                Criar Venda
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Buscar vendas por cliente</CardTitle>
            <Select value={searchClienteId} onValueChange={setSearchClienteId}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!searchClienteId ? (
            <p className="p-6 text-muted-foreground text-center">Selecione um cliente para ver suas vendas</p>
          ) : isLoading ? (
            <p className="p-6 text-muted-foreground text-center">Carregando...</p>
          ) : error ? (
            <p className="p-6 text-destructive text-center">Erro ao carregar vendas</p>
          ) : vendas.length === 0 ? (
            <p className="p-6 text-muted-foreground text-center">Nenhuma venda encontrada</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-28">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendas.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono text-xs">{v.id.slice(0, 8)}...</TableCell>
                    <TableCell>{v.itens?.length || 0} itens</TableCell>
                    <TableCell className="font-medium">{formatCurrency(v.total)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[v.status] || ""}>{v.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(v.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      {v.status === "PENDENTE" && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => confirmarMut.mutate(v.id)} title="Confirmar">
                            <Check className="w-4 h-4 text-success" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => cancelarMut.mutate(v.id)} title="Cancelar">
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      )}
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
