import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { clientesApi } from "@/services/api";
import type { ClienteRequest } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const empty: ClienteRequest = { nome: "", email: "", cpf: "", password: "", telefone: "", cep: "" };

const fields = [
  { key: "nome" as const, label: "Nome", type: "text" },
  { key: "email" as const, label: "E-mail", type: "email" },
  { key: "cpf" as const, label: "CPF", type: "text" },
  { key: "password" as const, label: "Senha", type: "password" },
  { key: "telefone" as const, label: "Telefone", type: "text" },
  { key: "cep" as const, label: "CEP", type: "text" },
];

export default function CadastroPage() {
  const [form, setForm] = useState<ClienteRequest>(empty);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await clientesApi.criar(form);
      toast.success("Conta criada com sucesso! Faça login.");
      navigate("/login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Criar Conta</CardTitle>
          <CardDescription>Preencha seus dados para se cadastrar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label>{f.label}</Label>
                <Input
                  type={f.type}
                  value={form[f.key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  required
                />
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Fazer login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
