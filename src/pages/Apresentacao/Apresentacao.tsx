import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, BarChart3, Shield, ArrowRight } from 'lucide-react';
import CardioMonitor from '../../components/CardioMonitor/CardioMonitor';

const Apresentacao: React.FC = () => {
  const navigate = useNavigate();

  const handleEntrarSistema = () => {
    navigate('/login');
  };

  // const handleSaibaMais = () => {
  //   // Placeholder para futura página institucional
  //   console.log('Redirecionar para página institucional');
  // };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  const features = [
    {
      icon: <Calendar className='w-6 h-6' />,
      title: 'Agendamento Inteligente',
      description: 'Sistema completo de agendamentos com calendário interativo',
    },
    {
      icon: <Users className='w-6 h-6' />,
      title: 'Gestão de Pacientes',
      description: 'Controle total de dados e histórico dos pacientes',
    },
    {
      icon: <BarChart3 className='w-6 h-6' />,
      title: 'Relatórios Avançados',
      description: 'Analytics e relatórios detalhados para tomada de decisão',
    },
    {
      icon: <Shield className='w-6 h-6' />,
      title: 'Segurança Total',
      description: 'Proteção de dados com criptografia e backup automático',
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col relative'>
      {/* Monitor Cardíaco como fundo */}
      <div className='absolute inset-0 opacity-20'>
        <CardioMonitor />
      </div>

      {/* Header */}
      <motion.header
        className='w-full py-4 sm:py-6 px-4 relative z-10'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
          <motion.div
            className='flex items-center space-x-2 sm:space-x-3'
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className='w-8 h-8 sm:w-10 sm:h-10'>
              <img
                src='/logo.svg'
                alt='Sistema Clínico'
                className='w-full h-full'
              />
            </div>
            <span className='text-lg sm:text-xl font-bold text-gray-800 dark:text-white'>
              Clínica
            </span>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className='flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10'>
        <motion.div
          className='w-full max-w-4xl mx-auto'
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          {/* Hero Section */}
          <div className='text-center mb-12 sm:mb-16'>
            <motion.div
              className='inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-6 sm:mb-8 shadow-lg'
              variants={itemVariants}
              whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.3 },
              }}
            >
              <img
                src='/logo-large.svg'
                alt='Sistema Clínico'
                className='w-full h-full'
              />
            </motion.div>

            <motion.h1
              className='text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6'
              variants={itemVariants}
            >
              Sistema de{' '}
              <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                Gestão de Clínica
              </span>
            </motion.h1>

            <motion.p
              className='text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4'
              variants={itemVariants}
            >
              Organize, gerencie e simplifique a administração da sua clínica
              com nossa plataforma completa e intuitiva.
            </motion.p>

            <motion.div
              className='flex flex-col sm:flex-row gap-4 justify-center items-center'
              variants={itemVariants}
            >
              <motion.button
                onClick={handleEntrarSistema}
                className='px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 group'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Entrar no Sistema</span>
                <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform' />
              </motion.button>
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16'
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className='bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 dark:border-gray-700/20'
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.2 },
                }}
              >
                <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white mb-3 sm:mb-4'>
                  {feature.icon}
                </div>
                <h3 className='text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-2'>
                  {feature.title}
                </h3>
                <p className='text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed'>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Section */}
          <motion.div></motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        className='w-full py-6 px-4 border-t border-white/20 dark:border-gray-700/20 relative z-10'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className='max-w-7xl mx-auto text-center'>
          <p className='text-gray-600 dark:text-gray-400'>
            © Sistema de Gestão de Clínica. Todos os direitos reservados.
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default Apresentacao;
