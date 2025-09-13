import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Users, ArrowRight } from "lucide-react";

const Home = () => {
  console.log('Home component rendering');
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-8 max-w-4xl mx-auto px-6">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-primary">
            TeleUp
          </h1>
          <p className="text-xl text-muted-foreground">
            Plataforma gamificada para operadores e gestores de telecomunicações
          </p>
        </div>

        {/* Botões de Acesso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <Link to="/login">
            <div className="p-8 rounded-lg text-center hover:scale-105 transition-all duration-300 bg-primary/10 border border-primary/20">
              <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Login</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Acesse o sistema
              </p>
              <Button className="w-full">
                Entrar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Link>

          <Link to="/debug">
            <div className="p-8 rounded-lg text-center hover:scale-105 transition-all duration-300 bg-secondary/10 border border-secondary/20">
              <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Debug</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Verificar sistema
              </p>
              <Button variant="secondary" className="w-full">
                Debug
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Link>
        </div>

        {/* Informações de Teste */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Credenciais de Teste</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Gestor:</strong> hyttalo@teleup.com / password</p>
              <p><strong>Operador:</strong> mateus@teleup.com / password</p>
            </div>
            <div>
              <p><strong>Operador 2:</strong> guilherme@teleup.com / password</p>
              <p><strong>Operador 3:</strong> vinicius@teleup.com / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
