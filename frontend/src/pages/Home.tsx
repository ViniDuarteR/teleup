import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Home = () => {
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
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: -20,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  const sectionVariants = {
    hidden: { 
      opacity: 0, 
      y: 40
    },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div 
        className="text-center space-y-8 max-w-4xl mx-auto px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="space-y-4" variants={itemVariants}>
          <motion.h1 
            className="text-6xl font-bold text-primary"
            variants={titleVariants}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
          >
            TeleUp
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground"
            variants={itemVariants}
          >
            Plataforma gamificada para operadores e gestores de telecomunicações
          </motion.p>
        </motion.div>

        {/* Botões de Acesso */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16"
          variants={containerVariants}
        >
          <motion.div variants={cardVariants}>
            <Link to="/login">
              <motion.div 
                className="p-8 rounded-lg text-center bg-primary/10 border border-primary/20"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.2)",
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.5,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Login</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Acesse o sistema
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="w-full">
                    Entrar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Sistema de Gamificação */}
        <motion.div 
          className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          whileInView={{ 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.8 }
          }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h3 
            className="text-lg font-semibold mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Sistema de Gamificação
          </motion.h3>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <motion.p
                whileHover={{ 
                  x: 5,
                  transition: { duration: 0.2 }
                }}
              >
                🎮 Sistema completo de gamificação
              </motion.p>
              <motion.p
                whileHover={{ 
                  x: 5,
                  transition: { duration: 0.2 }
                }}
              >
                📊 Métricas e rankings em tempo real
              </motion.p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <motion.p
                whileHover={{ 
                  x: 5,
                  transition: { duration: 0.2 }
                }}
              >
                🏆 Sistema de conquistas e recompensas
              </motion.p>
              <motion.p
                whileHover={{ 
                  x: 5,
                  transition: { duration: 0.2 }
                }}
              >
                👥 Gestão de equipes e operadores
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
