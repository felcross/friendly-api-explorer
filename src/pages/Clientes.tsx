import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientesApi } from "@/services/api";
import type { ClienteRequest } from "@/types/api";
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
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

const emptyCliente: ClienteRequest = { nome: "", email: "", cpf: "", password: "", telefone: "", cep: "" };

export default function ClientesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ClienteRequest>(emptyCliente);

  const { data: clientes = [], isLoading, error } = useQuery({
    queryKey: ["clientes"],
    queryFn: clientesApi.listar,
  });

  const criarMut = useMutation({
    mutationFn: (data: ClienteRequest) => clientesApi.criar(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clientes"] }); setOpen(false); toast.success("Cliente criado!"); },
    onError: () => toast.error("Erro ao criar cliente"),
  });

  const atualizarMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClienteRequest }) => clientesApi.atualizar(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clientes"] }); setOpen(false); toast.success("Cliente atualizado!"); },
    onError: () => toast.error("Erro ao atualizar cliente"),
  });

  const deletarMut = useMutation({
    mutationFn: (id: number) => clientesApi.deletar(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clientes"] }); toast.success("Cliente removido!"); },
    onError: () => toast.error("Erro ao remover cliente"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId !== null) atualizarMut.mutate({ id: editId, data: form });
    else criarMut.mutate(form);
  };

  const openEdit = (c: typeof clientes[0]) => {
    setEditId(c.id);
    setForm({ nome: c.nome, email: c.email, cpf: c.cpf, password: "", telefone: c.telefone, cep: c.endereco?.cep || "" });
    setOpen(true);
  };

  const openNew = () => {
    setEditId(null);
    setForm(emptyCliente);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" /> Clientes
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie os clientes cadastrados</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editId ? "Editar" : "Novo"} Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(["nome", "email", "cpf", "password", "telefone", "cep"] as const).map((field) => (
                <div key={field} className="space-y-1">
                  <Label className="capitalize">{field === "cep" ? "CEP" : field}</Label>
                  <Input
                    type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    required={field !== "password" || editId === null}
                    placeholder={field === "password" && editId ? "Deixe vazio para manter" : ""}
                  />
                </div>
              ))}
              <Button type="submit" className="w-full" disabled={criarMut.isPending || atualizarMut.isPending}>
                {editId ? "Atualizar" : "Cadastrar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">{clientes.length} clientes encontrados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-muted-foreground text-center">Carregando...</p>
          ) : error ? (
            <p className="p-6 text-destructive text-center">Erro ao carregar clientes. Verifique a conexão com a API.</p>
          ) : clientes.length === 0 ? (
            <p className="p-6 text-muted-foreground text-center">Nenhum cliente cadastrado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.cpf}</TableCell>
                    <TableCell>{c.telefone}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deletarMut.mutate(c.id)}>
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
