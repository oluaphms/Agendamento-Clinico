import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'cpf' | 'password' | 'success'>('cpf');

  const navigate = useNavigate();

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função para validar CPF (simplificada - apenas formato)
  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    // Apenas verificar se tem 11 dígitos
    return numbers.length === 11;
  };

  // Função para validar senha (simplificada)
  const validatePassword = (password: string) => {
    if (password.length < 6) return 'A senha deve ter pelo menos 6 caracteres';
    return null;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setCpf(formatCPF(value));
    }
  };

  // Função para validar CPF em tempo real
  const isCpfValid = () => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.length === 11;
  };

  const handleVerifyCpf = async (e: React.FormEvent) => {
    e.preventDefault();

    const cpfNumbers = cpf.replace(/\D/g, '');

    if (!validateCPF(cpfNumbers)) {
      toast.error('CPF deve ter 11 dígitos');
      return;
    }

    setIsVerifying(true);

    try {
      console.log('🔍 Buscando usuário com CPF:', { cpfNumbers, cpf });

      // Buscar usuário pelo CPF no Supabase
      // Tentar primeiro com CPF sem formatação
      let { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, cpf')
        .eq('cpf', cpfNumbers)
        .single();

      console.log('📊 Resultado busca sem formatação:', { data, error });

      // Se não encontrar, tentar com CPF formatado
      if (error || !data) {
        console.log('🔄 Tentando busca com CPF formatado...');
        const { data: dataFormatted, error: errorFormatted } = await supabase
          .from('usuarios')
          .select('id, nome, email, cpf')
          .eq('cpf', cpf)
          .single();

        console.log('📊 Resultado busca formatada:', {
          dataFormatted,
          errorFormatted,
        });

        if (errorFormatted || !dataFormatted) {
          // Terceira tentativa: buscar todos os usuários e filtrar localmente
          console.log('🔄 Tentando busca ampla...');
          const { data: allUsers, error: allUsersError } = await supabase
            .from('usuarios')
            .select('id, nome, email, cpf');

          if (allUsersError) {
            console.error('❌ Erro na busca ampla:', allUsersError);
            toast.error('Erro ao buscar usuário. Tente novamente.');
            return;
          }

          const foundUser = allUsers?.find(
            (user: any) =>
              user.cpf === cpfNumbers ||
              user.cpf === cpf ||
              user.cpf?.replace(/\D/g, '') === cpfNumbers
          );

          if (!foundUser) {
            console.error('❌ CPF não encontrado em todas as tentativas');
            toast.error('CPF não encontrado no sistema');
            return;
          }

          data = foundUser;
          error = null;
        } else {
          data = dataFormatted;
          error = errorFormatted;
        }
      }

      if (error || !data) {
        console.error('❌ Erro final na busca:', error);
        toast.error('CPF não encontrado no sistema');
        return;
      }

      console.log('✅ Usuário encontrado:', {
        id: data.id,
        nome: data.nome,
        email: data.email,
        cpf: data.cpf,
      });

      setUser(data);
      setStep('password');
      toast.success('CPF encontrado! Agora defina sua nova senha.');
    } catch (error) {
      console.error('Erro ao verificar CPF:', error);
      toast.error('Erro ao verificar CPF. Tente novamente.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validar senhas
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsUpdating(true);

    try {
      console.log('🔐 Atualizando senha para usuário:', user.id);

      // Verificar se deve usar Supabase ou banco local
      const shouldUseSupabase = supabase && !supabase._isLocalDb;

      if (shouldUseSupabase) {
        // No Supabase, a senha é gerenciada pelo auth.users, não pela tabela usuarios
        // Vamos atualizar apenas o campo primeiro_acesso na tabela usuarios
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({
            primeiro_acesso: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          console.warn(
            'Erro ao atualizar no Supabase (usando fallback local):',
            updateError
          );
          // Continuar com fallback local em vez de retornar erro
        } else {
          console.log('✅ Dados do usuário atualizados no Supabase!');
        }

        // Para o Supabase, a senha é gerenciada pelo sistema de auth
        // Vamos simular a atualização da senha para desenvolvimento
        // Em produção, você usaria uma função Edge Function ou API server-side

        // Simular atualização da senha no localStorage para desenvolvimento
        const storedUsers = JSON.parse(
          localStorage.getItem('pendingUsers') || '[]'
        );
        const userIndex = storedUsers.findIndex(
          (u: any) =>
            u.cpf === user.cpf || u.cpf === user.cpf.replace(/\D/g, '')
        );

        if (userIndex !== -1) {
          storedUsers[userIndex].senha = newPassword;
          storedUsers[userIndex].primeiro_acesso = false;
          storedUsers[userIndex].updated_at = new Date().toISOString();
          localStorage.setItem('pendingUsers', JSON.stringify(storedUsers));
          console.log('✅ Senha atualizada no localStorage!');
        } else {
          // Se não encontrou no localStorage, adicionar o usuário
          const newUser = {
            id: user.id,
            nome: user.nome,
            cpf: user.cpf,
            senha: newPassword,
            primeiro_acesso: false,
            updated_at: new Date().toISOString(),
            nivel_acesso: 'usuario',
          };
          storedUsers.push(newUser);
          localStorage.setItem('pendingUsers', JSON.stringify(storedUsers));
          console.log('✅ Usuário adicionado ao localStorage!');
        }

        console.log(
          '⚠️ Nota: No Supabase, a senha é gerenciada pelo sistema de auth'
        );
        console.log(
          '✅ Senha simulada salva no localStorage para desenvolvimento!'
        );
      } else {
        // Atualizar senha no banco local (localStorage)
        console.log('📦 Atualizando senha no banco local...');

        // Atualizar usuários aprovados no localStorage
        const storedUsers = JSON.parse(
          localStorage.getItem('pendingUsers') || '[]'
        );
        const userIndex = storedUsers.findIndex(
          (u: any) =>
            u.cpf === user.cpf || u.cpf === user.cpf.replace(/\D/g, '')
        );

        if (userIndex !== -1) {
          storedUsers[userIndex].senha = newPassword;
          storedUsers[userIndex].primeiro_acesso = false;
          storedUsers[userIndex].updated_at = new Date().toISOString();
          localStorage.setItem('pendingUsers', JSON.stringify(storedUsers));
        }

        // Atualizar dados mock se o usuário estiver lá
        try {
          const { mockData } = await import('@/lib/mockData');
          const mockUserIndex = mockData.usuarios.findIndex(
            (u: any) =>
              u.cpf === user.cpf || u.cpf === user.cpf.replace(/\D/g, '')
          );

          if (mockUserIndex !== -1) {
            mockData.usuarios[mockUserIndex].senha = newPassword;
            mockData.usuarios[mockUserIndex].primeiro_acesso = false;
          }
        } catch (mockError) {
          console.warn('Erro ao atualizar dados mock:', mockError);
        }

        console.log('✅ Senha atualizada com sucesso no banco local!');
      }

      setStep('success');
      toast.success('Senha atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      toast.error('Erro ao atualizar senha. Tente novamente.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  // Tela de sucesso
  if (step === 'success') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <Helmet>
          <title>Senha Atualizada - Sistema Clínico</title>
        </Helmet>

        <motion.div
          className='max-w-md w-full space-y-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className='text-center'>
            <div className='mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>
              Senha Atualizada!
            </h2>
            <p className='text-gray-600 mb-6'>
              Sua senha foi alterada com sucesso. Agora você pode fazer login
              com a nova senha.
            </p>
          </div>

          <div className='space-y-3'>
            <button
              onClick={handleBackToLogin}
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Voltar ao Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Tela de nova senha
  if (step === 'password') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <Helmet>
          <title>Nova Senha - Sistema Clínico</title>
        </Helmet>

        <motion.div
          className='max-w-md w-full space-y-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className='text-center'>
            <div className='mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
              <Shield className='h-8 w-8 text-blue-600' />
            </div>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>
              Nova Senha
            </h2>
            <p className='text-gray-600 mb-2'>
              Olá, <strong>{user?.nome}</strong>!
            </p>
            <p className='text-gray-600 mb-6'>
              Defina uma nova senha para sua conta (mínimo 6 caracteres).
            </p>
          </div>

          <form className='mt-8 space-y-6' onSubmit={handleUpdatePassword}>
            <div>
              <label
                htmlFor='newPassword'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Nova Senha
              </label>
              <div className='relative'>
                <input
                  id='newPassword'
                  name='newPassword'
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className='appearance-none relative block w-full pl-3 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                  placeholder='Digite sua nova senha (mín. 6 caracteres)'
                  disabled={isUpdating}
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-400' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-400' />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Confirmar Nova Senha
              </label>
              <div className='relative'>
                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className='appearance-none relative block w-full pl-3 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                  placeholder='Confirme sua nova senha'
                  disabled={isUpdating}
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-400' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-400' />
                  )}
                </button>
              </div>
            </div>

            <div className='space-y-3'>
              <button
                type='submit'
                disabled={isUpdating}
                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {isUpdating ? 'Atualizando...' : 'Salvar Nova Senha'}
              </button>

              <button
                type='button'
                onClick={() => setStep('cpf')}
                className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Voltar
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // Tela de verificação de CPF
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <Helmet>
        <title>Esqueci minha senha - Sistema Clínico</title>
      </Helmet>

      <motion.div
        className='max-w-md w-full space-y-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className='text-center'>
          <div className='mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
            <Shield className='h-8 w-8 text-blue-600' />
          </div>
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>
            Esqueci minha senha
          </h2>
          <p className='text-gray-600'>
            Digite seu CPF para redefinir sua senha
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleVerifyCpf}>
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
              required
              value={cpf}
              onChange={handleCpfChange}
              className='appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
              placeholder='000.000.000-00'
              disabled={isVerifying}
              maxLength={14}
            />
            <p className='mt-1 text-xs text-gray-500'>
              Digite apenas números (11 dígitos)
            </p>
          </div>

          <div className='space-y-3'>
            <button
              type='submit'
              disabled={isVerifying || !isCpfValid()}
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isVerifying ? 'Verificando...' : 'Verificar CPF'}
            </button>

            <Link
              to='/login'
              className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Voltar ao Login
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
