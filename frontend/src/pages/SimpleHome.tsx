const SimpleHome = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1 style={{ fontSize: '3rem', color: '#3B82F6', marginBottom: '20px' }}>
          TeleUp
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '40px' }}>
          Plataforma gamificada para telecomunicações
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a 
            href="/login" 
            style={{
              display: 'inline-block',
              padding: '15px 30px',
              backgroundColor: '#3B82F6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            🔐 Login
          </a>
          
          <a 
            href="/debug" 
            style={{
              display: 'inline-block',
              padding: '15px 30px',
              backgroundColor: '#6B7280',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            🔧 Debug
          </a>
        </div>
        
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Credenciais de Teste</h3>
          <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6' }}>
            <p><strong>Gestor:</strong> hyttalo@teleup.com / password</p>
            <p><strong>Operador:</strong> mateus@teleup.com / password</p>
            <p><strong>Operador 2:</strong> guilherme@teleup.com / password</p>
            <p><strong>Operador 3:</strong> vinicius@teleup.com / password</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleHome;
