import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Users,
  Calendar,
  BarChart3,
  Shield,
  ArrowRight,
  Heart,
} from 'lucide-react';

const ApresentacaoSimple: React.FC = () => {
  const navigate = useNavigate();

  const handleEntrarSistema = () => {
    navigate('/login');
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
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col relative'>
      {/* Header */}
      <header className='w-full py-6 px-4 relative z-10'>
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
          <div className='flex items-center space-x-3'>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex-1 flex items-center justify-center px-4 py-12 relative z-10'>
        <div className='w-full max-w-4xl mx-auto'>
          {/* Hero Section */}
          <div className='text-center mb-16'>
            <div className='inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mb-8'>
              <img
                src='/icons/1024.png'
                alt='Sistema Clínico'
                className='w-full h-full object-contain'
                onError={(e) => {
                  console.log('Erro ao carregar 1024.png, usando fallback');
                  e.currentTarget.src = '/icons/logo-principal.png';
                }}
              />
            </div>

            <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
              <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                Agendamento Clínico
              </span>
            </h1>

            <p className='text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed'>
              Organize, gerencie e simplifique a administração da sua clínica
              com nossa plataforma completa e intuitiva.
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <button
                onClick={handleEntrarSistema}
                className='px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 group'
              >
                <span>Entrar no Sistema</span>
                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-white/20'
              >
                <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white mb-4'>
                  {feature.icon}
                </div>
                <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                  {feature.title}
                </h3>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='w-full py-6 px-4 border-t border-white/20 relative z-10'>
        <div className='max-w-7xl mx-auto text-center'>
          <p className='text-gray-600'>
            © Agendamento Clínico. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ApresentacaoSimple;
