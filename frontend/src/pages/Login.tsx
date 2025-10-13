import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado (apenas para usuários já autenticados)
  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     console.log('Login - User already authenticated:', user);
  //     console.log('Login - User tipo:', user.tipo);
  //     // Redirecionar baseado no tipo do usuário
  //     if (user.tipo === 'gestor') {
  //       console.log('Login - Redirecting to /gestor');
  //       navigate('/gestor');
  //     } else {
  //       console.log('Login - Redirecting to /dashboard');
  //       navigate('/dashboard');
  //     }
  //   }
  // }, [isAuthenticated, user, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, senha);
      
      if (success) {
        console.log('Login - Login successful, checking user type');
        // Aguardar um momento para o estado ser atualizado
        setTimeout(() => {
          // Verificar o usuário do localStorage para garantir que temos os dados mais recentes
          const savedUser = localStorage.getItem('teleup_user');
          console.log('Login - Saved user from localStorage:', savedUser);
          
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser);
              console.log('Login - Parsed user data:', userData);
              console.log('Login - User tipo:', userData.tipo);
              
              if (userData.tipo === 'gestor') {
                console.log('Login - User is gestor, redirecting to /gestor');
                navigate('/gestor');
              } else if (userData.tipo === 'empresa') {
                console.log('Login - User is empresa, redirecting to /dashboard-empresa');
                navigate('/dashboard-empresa');
              } else if (userData.tipo === 'operador') {
                console.log('Login - User is operador, redirecting to /dashboard');
                navigate('/dashboard');
              } else {
                console.log('Login - Unknown user type, redirecting to dashboard');
                navigate('/dashboard');
              }
            } catch (parseError) {
              console.error('Login - Error parsing user data:', parseError);
              navigate('/dashboard');
            }
          } else {
            console.log('Login - No user data in localStorage, redirecting to dashboard');
            navigate('/dashboard');
          }
        }, 500);
      } else {
        console.log('Login - Login failed');
        setError('Credenciais inválidas. Tente novamente.');
      }
    } catch (err) {
      console.log('Login - Login error:', err);
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
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
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Não tem uma conta?{' '}
              <Link to="/cadastro-empresa" className="text-primary hover:underline">
                Cadastre sua empresa
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
