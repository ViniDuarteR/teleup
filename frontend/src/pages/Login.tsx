import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Phone, Users } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirecionar baseado no nível do usuário (nivel >= 10 = gestor)
      if (user.nivel >= 10) {
        navigate('/gestor');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, senha);
      
      if (success) {
        // O redirecionamento será feito pelo useEffect acima
        // baseado no tipo de usuário
      } else {
        setError('Credenciais inválidas. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleLogin = (role: 'operador' | 'gestor') => {
    if (role === 'operador') {
      setEmail('mateus@teleup.com');
      setSenha('password');
    } else {
      setEmail('hyttalo@teleup.com');
      setSenha('password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary text-glow">
            TeleUp
          </h1>
          <p className="text-muted-foreground">
            Faça login para acessar sua conta
          </p>
        </div>

        {/* Login Form */}
        <Card className="gaming-card-glow">
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="gaming-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="gaming-input"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="btn-gaming w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Login Buttons */}
        <div className="space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            Ou use uma conta de demonstração:
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleRoleLogin('operador')}
              className="gaming-card hover:scale-105 transition-all duration-300"
            >
              <Phone className="w-4 h-4 mr-2" />
              Operador
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleRoleLogin('gestor')}
              className="gaming-card hover:scale-105 transition-all duration-300"
            >
              <Users className="w-4 h-4 mr-2" />
              Gestor
            </Button>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Credenciais de demonstração:
          </p>
          <div className="text-xs space-y-1">
            <p><strong>Operador:</strong> mateus@teleup.com / password</p>
            <p><strong>Gestor:</strong> hyttalo@teleup.com / password</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
