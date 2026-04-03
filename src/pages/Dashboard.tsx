import { BarChart3, Users, Package, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Clientes", value: "—", icon: Users, color: "text-primary" },
  { label: "Produtos", value: "—", icon: Package, color: "text-success" },
  { label: "Vendas", value: "—", icon: ShoppingCart, color: "text-warning" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do sistema de vendas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`w-5 h-5 ${color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-display font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">Conecte sua API para ver os dados</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-display">Configuração da API</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Para conectar ao seu BFF, defina a variável de ambiente{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">
              VITE_API_BASE_URL
            </code>{" "}
            com a URL base da sua API.
          </p>
          <p>
            Exemplo:{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">
              VITE_API_BASE_URL=http://localhost:8080
            </code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
