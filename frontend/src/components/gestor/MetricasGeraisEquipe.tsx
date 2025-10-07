import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Phone, 
  Users, 
  Activity, 
  Clock, 
  Trophy 
} from "lucide-react";

interface Metricas {
  chamadasAndamento: number;
  operadoresOnline: {
    online: number;
    total: number;
  };
  eficienciaDiscador: number;
  nivelOciosidade: number;
  totalPontosEquipe: number;
}

interface MetricasGeraisEquipeProps {
  metricas: Metricas;
}

const MetricasGeraisEquipe = ({ metricas }: MetricasGeraisEquipeProps) => {
  const getStatusColor = (valor: number, tipo: string) => {
    switch (tipo) {
      case 'eficiencia':
        return valor >= 85 ? 'text-success' : valor >= 70 ? 'text-warning' : 'text-destructive';
      case 'ociosidade':
        return valor <= 20 ? 'text-success' : valor <= 35 ? 'text-warning' : 'text-destructive';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {/* Chamadas em Andamento */}
      <Card className="gaming-card hover:gaming-card-glow transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Chamadas Ativas
          </CardTitle>
          <Phone className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{metricas.chamadasAndamento}</div>
          <p className="text-xs text-muted-foreground">
            Em andamento agora
          </p>
        </CardContent>
      </Card>

      {/* Operadores Online */}
      <Card className="gaming-card hover:gaming-card-glow transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Operadores Online
          </CardTitle>
          <Users className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            {metricas.operadoresOnline.online} / {metricas.operadoresOnline.total}
          </div>
          <p className="text-xs text-muted-foreground">
            {Math.round((metricas.operadoresOnline.online / metricas.operadoresOnline.total) * 100)}% da equipe
          </p>
        </CardContent>
      </Card>

      {/* Eficiência do Discador */}
      <Card className="gaming-card hover:gaming-card-glow transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Eficiência Discador
          </CardTitle>
          <Activity className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getStatusColor(metricas.eficienciaDiscador, 'eficiencia')}`}>
            {metricas.eficienciaDiscador}%
          </div>
          <p className="text-xs text-muted-foreground">
            Chamadas úteis
          </p>
        </CardContent>
      </Card>

      {/* Nível de Ociosidade */}
      <Card className="gaming-card hover:gaming-card-glow transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ociosidade
          </CardTitle>
          <Clock className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getStatusColor(metricas.nivelOciosidade, 'ociosidade')}`}>
            {metricas.nivelOciosidade}%
          </div>
          <p className="text-xs text-muted-foreground">
            Tempo em espera
          </p>
        </CardContent>
      </Card>

      {/* Total de Pontos da Equipe */}
      <Card className="gaming-card hover:gaming-card-glow transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pontos da Equipe
          </CardTitle>
          <Trophy className="h-4 w-4 text-xp" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-xp">
            {metricas.totalPontosEquipe?.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Pontos hoje
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricasGeraisEquipe;