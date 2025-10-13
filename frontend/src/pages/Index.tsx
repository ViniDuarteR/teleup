import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Users, Gift, Trophy, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { motion } from "framer-motion";

const Index = () => {
  console.log('Index component rendering');
  
  // Variantes de animação
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: -30,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <motion.div 
          className="text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="space-y-4" variants={itemVariants}>
            <motion.h1 
              className="text-6xl font-bold text-primary text-glow"
              variants={titleVariants}
            >
              TeleUp
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Plataforma gamificada para operadores e gestores de telecomunicações. 
              Transforme produtividade em diversão e conquiste seus objetivos!
            </motion.p>
          </motion.div>

          {/* Navigation Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
            variants={containerVariants}
          >
            <motion.div variants={cardVariants}>
              <Link to="/login">
                <motion.div 
                  className="gaming-card-glow p-8 rounded-lg text-center hover:scale-105 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Login</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Acesse o sistema
                  </p>
                  <Button className="btn-gaming w-full">
                    Entrar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Link to="/dashboard">
                <motion.div 
                  className="gaming-card-glow p-8 rounded-lg text-center hover:scale-105 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Dashboard</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Acesse seu painel de operador
                  </p>
                  <Button className="btn-gaming w-full">
                    Entrar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Link to="/gestor">
                <motion.div 
                  className="gaming-card p-8 rounded-lg text-center hover:scale-105 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Painel Gestor</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Monitore sua equipe
                  </p>
                  <Button variant="secondary" className="btn-secondary-gaming w-full">
                    Acessar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Link to="/loja">
                <motion.div 
                  className="gaming-card p-8 rounded-lg text-center hover:scale-105 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(245, 158, 11, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Gift className="w-12 h-12 text-warning mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Loja</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Troque seus pontos
                  </p>
                  <Button variant="outline" className="w-full">
                    Explorar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Link to="/conquistas">
                <motion.div 
                  className="gaming-card p-8 rounded-lg text-center hover:scale-105 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(168, 85, 247, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trophy className="w-12 h-12 text-xp mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Conquistas</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Veja suas medalhas
                  </p>
                  <Button variant="outline" className="w-full">
                    Ver Galeria
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Seção de Recursos */}
      <motion.div 
        className="container mx-auto px-6 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-primary mb-4">
            Recursos da Plataforma
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra todas as funcionalidades que tornam o TeleUp a melhor escolha para sua equipe
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            className="text-center p-6 rounded-lg bg-card border"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Gamificação</h3>
            <p className="text-muted-foreground">
              Sistema completo de pontos, níveis e conquistas para motivar sua equipe
            </p>
          </motion.div>

          <motion.div 
            className="text-center p-6 rounded-lg bg-card border"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestão de Equipe</h3>
            <p className="text-muted-foreground">
              Monitore performance, gerencie operadores e acompanhe métricas em tempo real
            </p>
          </motion.div>

          <motion.div 
            className="text-center p-6 rounded-lg bg-card border"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sistema de Recompensas</h3>
            <p className="text-muted-foreground">
              Loja virtual com prêmios e benefícios para os melhores performers
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
