import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Users, 
  Calendar, 
  BarChart3, 
  Shield, 
  ArrowRight,
  Heart
} from 'lucide-react';
import CardioMonitor from '../../components/CardioMonitor/CardioMonitor';

const Apresentacao: React.FC = () => {
  const navigate = useNavigate();

  const handleEntrarSistema = () => {
    navigate('/login');
  };

  const handleSaibaMais = () => {
    // Placeholder para futura página institucional
    console.log('Redirecionar para página institucional');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Agendamento Inteligente",
      description: "Sistema completo de agendamentos com calendário interativo"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gestão de Pacientes",
      description: "Controle total de dados e histórico dos pacientes"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Relatórios Avançados",
      description: "Analytics e relatórios detalhados para tomada de decisão"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Segurança Total",
      description: "Proteção de dados com criptografia e backup automático"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col relative">
      {/* Monitor Cardíaco como fundo */}
      <div className="absolute inset-0 opacity-20">
        <CardioMonitor />
      </div>

      {/* Header */}
      <motion.header 
        className="w-full py-6 px-4 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Clínica</span>
          </motion.div>
          

        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <motion.div
          className="w-full max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-8 shadow-lg"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.3 }
              }}
            >
              <Heart className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
              variants={itemVariants}
            >
              Sistema de{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gestão de Clínica
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Organize, gerencie e simplifique a administração da sua clínica com nossa plataforma completa e intuitiva.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={itemVariants}
            >
              <motion.button
                onClick={handleEntrarSistema}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Entrar no Sistema</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-white/20"
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            
          >
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="w-full py-6 px-4 border-t border-white/20 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">
            ©  Sistema de Gestão de Clínica. Todos os direitos reservados.
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default Apresentacao;