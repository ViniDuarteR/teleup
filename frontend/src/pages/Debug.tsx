import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Debug = () => {
  const clearStorage = () => {
    localStorage.removeItem('teleup_token');
    localStorage.removeItem('teleup_user');
    console.log('LocalStorage cleared');
    window.location.reload();
  };

  const checkStorage = () => {
    const token = localStorage.getItem('teleup_token');
    const user = localStorage.getItem('teleup_user');
    console.log('Token:', token ? 'exists' : 'null');
    console.log('User:', user ? 'exists' : 'null');
    alert(`Token: ${token ? 'exists' : 'null'}\nUser: ${user ? 'exists' : 'null'}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Debug - TeleUp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkStorage} className="w-full">
            Verificar LocalStorage
          </Button>
          <Button onClick={clearStorage} variant="destructive" className="w-full">
            Limpar LocalStorage
          </Button>
          <div className="text-sm text-muted-foreground">
            <p>Use este debug para verificar o estado da autenticação.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Debug;
