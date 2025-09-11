import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    nivel_acesso: 'usuario',
    senha: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, loading } = useAuthStore();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !loading) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'cpf') {
      setFormData(prev => ({ ...prev, [name]: formatCPF(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    // Validar senha obrigatória
    if (!formData.senha || formData.senha.length < 3) {
      toast.error('Senha deve ter pelo menos 3 caracteres');
      return false;
    }

    // Validação básica apenas se os campos forem preenchidos
    if (formData.cpf && formData.cpf.replace(/\D/g, '').length !== 11) {
      toast.error('CPF deve ter 11 dígitos');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { registerPendingUser } = useAuthStore.getState();

      const result = await registerPendingUser({
        nome: formData.nome,
        email: '', // Email não é mais obrigatório
        cpf: formData.cpf,
        telefone: '',
        cargo: '',
        senha: formData.senha,
      });

      if (result.success) {
        toast.success(
          'Cadastro realizado com sucesso! Aguarde aprovação e definição de permissões pelo administrador.'
        );
        navigate('/login');
      } else {
        toast.error(result.error || 'Erro ao realizar cadastro');
      }
    } catch (error) {
      toast.error('Erro ao realizar cadastro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Cadastro - Sistema Clínica</title>
      </Helmet>

      <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          {/* Header */}
          <div className='text-center'>
            <div className='mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-4'>
              <UserPlus size={32} className='text-white' />
            </div>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>
              Criar Conta
            </h2>
            <p className='text-gray-600'>Preencha os dados para se cadastrar</p>
          </div>

          {/* Form */}
          <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
            <div className='space-y-4'>
              {/* Nome */}
              <div>
                <label
                  htmlFor='nome'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Nome
                </label>
                <input
                  id='nome'
                  name='nome'
                  type='text'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                  value={formData.nome}
                  onChange={handleInputChange}
                />
              </div>

              {/* CPF */}
              <div>
                <label
                  htmlFor='cpf'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  CPF
                </label>
                <input
                  id='cpf'
                  name='cpf'
                  type='text'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                  value={formData.cpf}
                  onChange={handleInputChange}
                />
              </div>

              {/* Nível de Acesso */}
              <div>
                <label
                  htmlFor='nivel_acesso'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Nível de Acesso
                </label>
                <select
                  id='nivel_acesso'
                  name='nivel_acesso'
                  value={formData.nivel_acesso}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                >
                  <option value='usuario'>Usuário</option>
                  <option value='recepcao'>Recepcionista</option>
                  <option value='profissional'>Profissional</option>
                  <option value='gerente'>Gerente</option>
                  <option value='admin'>Administrador</option>
                  <option value='desenvolvedor'>Desenvolvedor</option>
                </select>
              </div>

              {/* Senha */}
              <div>
                <label
                  htmlFor='senha'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Senha *
                </label>
                <input
                  id='senha'
                  name='senha'
                  type='password'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                  value={formData.senha}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className='pt-4'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
              >
                {isSubmitting ? (
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                ) : (
                  'Criar'
                )}
              </button>
            </div>

            <div className='text-center pt-2'>
              <Link
                to='/login'
                className='w-full inline-block px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200'
              >
                Cancelar
              </Link>
            </div>

            <div className='text-center space-y-2'>
              <p className='text-sm text-gray-600'>
                Já tem uma conta?{' '}
                <Link
                  to='/login'
                  className='font-medium text-green-600 hover:text-green-500 transition-colors'
                >
                  Faça login
                </Link>
              </p>
              <p className='text-xs text-gray-500'>
                Após o cadastro, o administrador definirá suas permissões de
                acesso
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className='text-center text-xs text-gray-500'>
            <p>Sistema de Gestão de Clínica</p>
            <p>© Todos os direitos reservados</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
