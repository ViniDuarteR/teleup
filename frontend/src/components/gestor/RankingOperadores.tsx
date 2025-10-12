import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Medal, Award, Crown } from "lucide-react";

interface Operador {
  id: number;
  nome: string;
  avatar: string;
  pontosHoje: number;
  pontosTotal: number;
  nivel: number;
  posicaoRanking: number;
}

interface RankingOperadoresProps {
  operadores: Operador[];
}

const RankingOperadores = ({ operadores }: RankingOperadoresProps) => {
  // Ordenar operadores por pontos de hoje
  const operadoresOrdenados = [...operadores].sort((a, b) => b.pontosHoje - a.pontosHoje);
  
  const top3 = operadoresOrdenados.slice(0, 3);
  const resto = operadoresOrdenados.slice(3);

  const getPodiumIcon = (posicao: number) => {
    switch (posicao) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-slate-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getPodiumHeight = (posicao: number) => {
    switch (posicao) {
      case 1:
        return "h-32";
      case 2:
        return "h-24";
      case 3:
        return "h-20";
      default:
        return "h-16";
    }
  };

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Trophy className="h-5 w-5" />
          Ranking de Operadores
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Pódio dos Top 3 */}
        <div className="flex items-end justify-center gap-4 mb-6">
          {/* 2º Lugar */}
          {top3[1] && (
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center mb-2">
                <Avatar className="w-16 h-16 mb-2 ring-2 ring-slate-400">
                  <AvatarImage src={top3[1].avatar} />
                  <AvatarFallback>{top3[1].nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {getPodiumIcon(2)}
              </div>
              <div className={`${getPodiumHeight(2)} w-20 bg-gradient-to-t from-slate-600 to-slate-500 rounded-t-lg flex flex-col justify-center items-center`}>
                <div className="text-white font-bold text-lg">2º</div>
              </div>
              <div className="text-center mt-2">
                <p className="text-sm font-medium text-foreground">{top3[1].nome.split(' ')[0]}</p>
                <p className="text-xs text-xp font-bold">{top3[1].pontosHoje} pts</p>
              </div>
            </div>
          )}

          {/* 1º Lugar */}
          {top3[0] && (
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center mb-2">
                <Avatar className="w-20 h-20 mb-2 ring-4 ring-yellow-500">
                  <AvatarImage src={top3[0].avatar} />
                  <AvatarFallback>{top3[0].nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {getPodiumIcon(1)}
              </div>
              <div className={`${getPodiumHeight(1)} w-24 bg-gradient-to-t from-yellow-600 to-yellow-500 rounded-t-lg flex flex-col justify-center items-center`}>
                <div className="text-white font-bold text-xl">1º</div>
              </div>
              <div className="text-center mt-2">
                <p className="text-sm font-medium text-foreground">{top3[0].nome.split(' ')[0]}</p>
                <p className="text-xs text-xp font-bold">{top3[0].pontosHoje} pts</p>
              </div>
            </div>
          )}

          {/* 3º Lugar */}
          {top3[2] && (
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center mb-2">
                <Avatar className="w-16 h-16 mb-2 ring-2 ring-amber-600">
                  <AvatarImage src={top3[2].avatar} />
                  <AvatarFallback>{top3[2].nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {getPodiumIcon(3)}
              </div>
              <div className={`${getPodiumHeight(3)} w-20 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-lg flex flex-col justify-center items-center`}>
                <div className="text-white font-bold text-lg">3º</div>
              </div>
              <div className="text-center mt-2">
                <p className="text-sm font-medium text-foreground">{top3[2].nome.split(' ')[0]}</p>
                <p className="text-xs text-xp font-bold">{top3[2].pontosHoje} pts</p>
              </div>
            </div>
          )}
        </div>

        {/* Lista do restante */}
        {resto.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Demais Posições</h4>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {resto.map((operador, index) => (
                  <div
                    key={operador.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-bold text-muted-foreground">
                          {4 + index}º
                        </span>
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={operador.avatar} />
                        <AvatarFallback className="text-xs">
                          {operador.nome.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{operador.nome}</p>
                        <p className="text-xs text-muted-foreground">Nível {operador.nivel}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xp">
                      {operador.pontosHoje} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RankingOperadores;
