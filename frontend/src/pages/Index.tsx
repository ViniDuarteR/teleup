import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Users, Gift, Trophy, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";

const Index = () => {
  console.log('Index component rendering');
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-primary text-glow">
              TeleUp
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Plataforma gamificada para operadores e gestores de telecomunicações. 
              Transforme produtividade em diversão e conquiste seus objetivos!
            </p>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <Link to="/login">
              <div className="gaming-card-glow p-8 rounded-lg text-center hover:scale-105 transition-all duration-300">
                <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Login</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Acesse o sistema
                </p>
                <Button className="btn-gaming w-full">
                  Entrar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Link>

            <Link to="/dashboard">
              <div className="gaming-card-glow p-8 rounded-lg text-center hover:scale-105 transition-all duration-300">
                <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Dashboard</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Acesse seu painel de operador
                </p>
                <Button className="btn-gaming w-full">
                  Entrar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Link>

            <Link to="/gestor">
              <div className="gaming-card p-8 rounded-lg text-center hover:scale-105 transition-all duration-300">
                <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Painel Gestor</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Monitore sua equipe
                </p>
                <Button variant="secondary" className="btn-secondary-gaming w-full">
                  Acessar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Link>

            <Link to="/loja">
              <div className="gaming-card p-8 rounded-lg text-center hover:scale-105 transition-all duration-300">
                <Gift className="w-12 h-12 text-warning mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Loja</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Troque seus pontos
                </p>
                <Button variant="outline" className="w-full">
                  Explorar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Link>

            <Link to="/conquistas">
              <div className="gaming-card p-8 rounded-lg text-center hover:scale-105 transition-all duration-300">
                <Trophy className="w-12 h-12 text-xp mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Conquistas</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Veja suas medalhas
                </p>
                <Button variant="outline" className="w-full">
                  Ver Galeria
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
