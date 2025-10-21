import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Users, 
  Trophy, 
  TrendingUp, 
  Shield, 
  Zap, 
  Star, 
  ArrowRight,
  CheckCircle,
  BarChart3,
  Target,
  Gamepad2
} from 'lucide-react';

const Homepage = () => {
  const location = useLocation();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Variantes de animação
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  const slideInVariants = {
    hidden: { 
      opacity: 0, 
      x: -50
    },
    visible: { 
      opacity: 1, 
      x: 0
    }
  };

  const slideUpVariants = {
    hidden: { 
      opacity: 0, 
      y: 50
    },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  useEffect(() => {
    if (location.state?.showSuccess) {
      setShowSuccessMessage(true);
      setSuccessMessage(location.state.message || 'Operação realizada com sucesso!');
      
      // Esconder a mensagem após 5 segundos
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const features = [
    {
      icon: <Gamepad2 className="w-8 h-8 text-blue-600" />,
      title: "Gamificação Avançada",
      description: "Transforme seu call center em um ambiente competitivo e motivador com sistema de pontos, níveis e conquistas."
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-600" />,
      title: "Rankings e Competições",
      description: "Rankings em tempo real, competições entre equipes e reconhecimento automático dos melhores operadores."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-green-600" />,
      title: "Métricas Detalhadas",
      description: "Dashboard completo com KPIs, performance individual e em equipe, relatórios automatizados."
    },
    {
      icon: <Target className="w-8 h-8 text-purple-600" />,
      title: "Metas e Objetivos",
      description: "Defina metas personalizadas, acompanhe progresso e motive sua equipe a superar limites."
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Segurança e Compliance",
      description: "Sistema seguro, dados protegidos e compliance com LGPD para sua tranquilidade."
    },
    {
      icon: <Zap className="w-8 h-8 text-orange-600" />,
      title: "Tempo Real",
      description: "Atualizações instantâneas, notificações push e monitoramento em tempo real da performance."
    }
  ];

  const benefits = [
    "Aumento significativo na produtividade dos operadores",
    "Redução na taxa de turnover da equipe",
    "Melhoria na satisfação e motivação dos funcionários",
    "ROI positivo em poucos meses de uso",
    "Interface intuitiva e fácil de usar",
    "Suporte especializado disponível"
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Gerente de Call Center",
      company: "TechCorp Solutions",
      content: "O TeleUp revolucionou nossa operação. Nossos operadores estão mais motivados e produtivos do que nunca!"
    },
    {
      name: "João Santos",
      role: "Diretor de Operações",
      company: "Telecom Brasil",
      content: "A gamificação fez toda a diferença. Reduzimos o turnover e aumentamos significativamente a qualidade do atendimento."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TeleUp
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">Entrar</Button>
              </Link>
              <Link to="/cadastro-empresa">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Começar Agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-md">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="flex-shrink-0 text-green-400 hover:text-green-600"
              >
                <span className="sr-only">Fechar</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <motion.section 
        className="py-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div variants={slideUpVariants}>
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Solução #1 em Gamificação para Call Centers
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            variants={slideUpVariants}
          >
            Transforme seu{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Call Center
            </span>
            <br />
            em uma Experiência{' '}
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Gamificada
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            variants={slideUpVariants}
          >
            Aumente a produtividade, reduza o turnover e motive sua equipe com nosso sistema 
            completo de gamificação para telecomunicações. Resultados garantidos em 30 dias.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            variants={itemVariants}
          >
            <Link to="/cadastro-empresa">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg">
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg">
                Já tenho conta
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            variants={containerVariants}
          >
            <motion.div className="text-center" variants={itemVariants}>
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">Sistema Gamificado</div>
            </motion.div>
            <motion.div className="text-center" variants={itemVariants}>
              <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600">Suporte Disponível</div>
            </motion.div>
            <motion.div className="text-center" variants={itemVariants}>
              <div className="text-4xl font-bold text-purple-600 mb-2">R$ 0</div>
              <div className="text-gray-600">Custo Inicial</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-20 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" variants={slideUpVariants}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o TeleUp?
            </h2>
            <p className="text-xl font-bold text-gray-900 max-w-3xl mx-auto">
              Nossa plataforma foi desenvolvida especificamente para call centers, 
              com foco em resultados mensuráveis e experiência do usuário.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      {feature.icon}
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-blue-600 to-purple-600"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-4xl font-bold text-white mb-8"
            variants={slideUpVariants}
          >
            Resultados Comprovados
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            variants={containerVariants}
          >
            {benefits.map((benefit, index) => (
              <motion.div 
                key={index} 
                className="flex items-center space-x-3 text-white"
                variants={slideInVariants}
              >
                <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                <span className="text-lg">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        className="py-20 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" variants={slideUpVariants}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Empresas de todos os tamanhos já transformaram seus call centers com o TeleUp
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-white-700 mb-6 text-lg italic">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <div className="text-blue-600 font-medium">{testimonial.name}</div>
                      <div className="text-blue-600 font-medium">{testimonial.role}</div>
                      <div className="text-blue-600 font-medium">{testimonial.company}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-4xl font-bold text-gray-900 mb-6"
            variants={slideUpVariants}
          >
            Pronto para transformar seu call center?
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 mb-8"
            variants={slideUpVariants}
          >
            Junte-se a centenas de empresas que já aumentaram sua produtividade com o TeleUp.
            Comece gratuitamente hoje mesmo.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={itemVariants}
          >
            <Link to="/cadastro-empresa">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg">
                Fazer Login
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold">TeleUp</span>
              </div>
              <p className="text-gray-400">
                A plataforma de gamificação líder para call centers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Recursos</a></li>
                <li><a href="#" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">Integrações</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carreiras</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://docs.teleup.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="https://wa.me/5511942579879" target="_blank" rel="noopener noreferrer" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TeleUp. Todos os direitos reservados.</p>
          </div>
          Desenvolvido por <a href="https://www.linkedin.com/in/hyttalo-costa-1991841b2/" target="_blank" rel="noopener noreferrer" className="text-blue-900">Hyttalo Costa</a> e <a href="https://www.linkedin.com/in/vinicius-duarte1/" target="_blank" rel="noopener noreferrer" className="text-blue-900">Vinicius Duarte</a>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
