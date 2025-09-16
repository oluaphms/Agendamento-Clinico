import { create } from 'zustand';
import { supabase, authenticateUser } from '@/lib/supabase';
import { localDb } from '@/lib/database';
import { User, Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  mustChangePassword: boolean;

  // Métodos de autenticação
  signIn: (
    cpf: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: string;
    mustChangePassword?: boolean;
  }>;
  signUp: (
    email: string,
    password: string,
    userData: Record<string, unknown>
  ) => Promise<{ success: boolean; error?: string }>;
  registerPendingUser: (userData: {
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    cargo: string;
    senha: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updatePassword: (
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (
    updates: Record<string, unknown>
  ) => Promise<{ success: boolean; error?: string }>;
  skipPasswordChange: () => Promise<{ success: boolean; error?: string }>;

  // Gerenciamento de estado
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setMustChangePassword: (mustChange: boolean) => void;

  // Inicialização
  initialize: () => Promise<void | (() => void)>;
  fetchUserProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false, // Iniciar como false para evitar loop
  error: null,
  mustChangePassword: false,

  signIn: async (cpf: string, password: string) => {
    try {
      set({ loading: true, error: null });

      // Verificar se deve usar Supabase ou banco local
      const shouldUseSupabase = supabase && !supabase._isLocalDb;

      if (shouldUseSupabase) {
        try {
          const supabaseResult = await authenticateUser(cpf, password);

          if (supabaseResult) {
            const { user, session } = supabaseResult;

            // Buscar dados do usuário na tabela usuarios para verificar primeiro_acesso
            let primeiroAcesso = false;
            try {
              const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('primeiro_acesso')
                .eq('id', user.id)
                .single();

              if (!userError && userData) {
                primeiroAcesso = userData.primeiro_acesso || false;
              } else {
                // Se não encontrar o usuário na tabela, assumir primeiro acesso
                console.warn(
                  'Usuário não encontrado na tabela usuarios, assumindo primeiro acesso'
                );
                primeiroAcesso = true;
              }
            } catch (error) {
              console.warn('Erro ao buscar dados do usuário:', error);
              // Em caso de erro, assumir primeiro acesso
              primeiroAcesso = true;
            }

            set({
              user: user as any,
              session: session as any,
              error: null,
              loading: false,
              mustChangePassword: primeiroAcesso,
            });

            if (primeiroAcesso) {
              toast('Por favor, altere sua senha no primeiro acesso', {
                icon: '🔐',
              });
              return { success: true, mustChangePassword: true };
            } else {
              toast.success('Login realizado com sucesso!');
              return { success: true, mustChangePassword: false };
            }
          } else {
            // Se Supabase não retornou resultado, tentar banco local
            console.log('Supabase auth failed, trying local database...');
          }
        } catch (supabaseError) {
          console.warn(
            'Supabase auth failed, falling back to local database:',
            supabaseError
          );
        }
      }

      // Usar banco local (se Supabase não estiver disponível ou falhou)
      console.log('🔍 Tentando login com banco local:', { cpf, password });
      const localResult = await localDb.auth.signIn({ cpf, password });
      console.log('🔍 Resultado do login local:', localResult);

      if (localResult.data.user) {
        set({
          user: localResult.data.user as any,
          session: localResult.data.session as any,
          error: null,
          loading: false,
          mustChangePassword:
            localResult.data.user.must_change_password || false,
        });

        if (localResult.data.user.must_change_password) {
          toast('Por favor, altere sua senha no primeiro acesso', {
            icon: '🔐',
          });
          return { success: true, mustChangePassword: true };
        } else {
          toast.success('Login realizado com sucesso!');
          return { success: true, mustChangePassword: false };
        }
      }

      // Se chegou aqui, as credenciais estão incorretas
      set({
        error: localResult.error?.message || 'Credenciais inválidas',
        loading: false,
      });
      return {
        success: false,
        error: localResult.error?.message || 'Credenciais inválidas',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro inesperado';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  signUp: async (
    _email: string,
    _password: string,
    _userData: Record<string, unknown>
  ) => {
    // Funcionalidade de registro não implementada no banco mock
    return {
      success: false,
      error: 'Registro não disponível no modo de desenvolvimento',
    };
  },

  registerPendingUser: async userData => {
    try {
      set({ loading: true, error: null });

      // Simular registro de usuário pendente
      // Em produção, isso salvaria no banco de dados
      const pendingUser = {
        id: Date.now().toString(),
        ...userData,
        status: 'approved', // Aprovação automática para desenvolvimento
        created_at: new Date().toISOString(),
        nivel_acesso: 'recepcao', // Nível padrão para novos usuários
      };

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Salvar no localStorage para demonstração
      const existingPendingUsers = JSON.parse(
        localStorage.getItem('pendingUsers') || '[]'
      );
      existingPendingUsers.push(pendingUser);
      localStorage.setItem(
        'pendingUsers',
        JSON.stringify(existingPendingUsers)
      );

      set({ loading: false, error: null });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro inesperado';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  signOut: async () => {
    try {
      if (
        supabase &&
        supabase.auth &&
        typeof supabase.auth.signOut === 'function'
      ) {
        await supabase.auth.signOut();
      }

      // Marcar que o usuário fez logout para redirecionamento correto
      localStorage.setItem('userLoggedOut', 'true');
      localStorage.removeItem('lastVisitedPath');

      set({
        user: null,
        session: null,
        loading: false,
      });

      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  },

  updatePassword: async (password: string) => {
    try {
      const { user } = get();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      set({ loading: true, error: null });

      if (
        supabase &&
        typeof supabase.auth === 'object' &&
        'updateUser' in supabase.auth
      ) {
        // Verificar se há sessão ativa antes de atualizar a senha
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          set({
            error: 'Erro de sessão. Tente fazer login novamente.',
            loading: false,
          });
          return {
            success: false,
            error: 'Erro de sessão. Tente fazer login novamente.',
          };
        }

        if (!session) {
          console.error('Nenhuma sessão ativa encontrada');
          set({
            error: 'Sessão expirada. Tente fazer login novamente.',
            loading: false,
          });
          return {
            success: false,
            error: 'Sessão expirada. Tente fazer login novamente.',
          };
        }

        // Atualizar a senha
        const { error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) {
          console.error('Erro ao atualizar senha:', error);
          set({ error: error.message, loading: false });
          return { success: false, error: error.message };
        }

        // Atualizar o campo primeiro_acesso no banco de dados
        try {
          const { error: updateError } = await supabase
            .from('usuarios')
            .update({
              primeiro_acesso: false,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (updateError) {
            console.warn(
              'Erro ao atualizar primeiro_acesso no banco:',
              updateError
            );
            // Não falhar a operação por causa disso
          }
        } catch (dbError) {
          console.warn('Erro ao atualizar primeiro_acesso:', dbError);
          // Não falhar a operação por causa disso
        }
      } else {
        // Para banco local, atualizar o usuário no localStorage
        console.log('Updating password for local database');

        // Atualizar usuários aprovados no localStorage
        const storedUsers = JSON.parse(
          localStorage.getItem('pendingUsers') || '[]'
        );
        const userIndex = storedUsers.findIndex(
          (u: any) => u.cpf === user.user_metadata?.cpf
        );

        if (userIndex !== -1) {
          storedUsers[userIndex].senha = password;
          storedUsers[userIndex].primeiro_acesso = false;
          storedUsers[userIndex].updated_at = new Date().toISOString();
          localStorage.setItem('pendingUsers', JSON.stringify(storedUsers));
        }

        // Atualizar dados mock se o usuário estiver lá
        const { mockData } = await import('@/lib/mockData');
        const mockUserIndex = mockData.usuarios.findIndex(
          (u: any) => u.cpf === user.user_metadata?.cpf
        );

        if (mockUserIndex !== -1) {
          mockData.usuarios[mockUserIndex].senha = password;
          mockData.usuarios[mockUserIndex].primeiro_acesso = false;
        }
      }

      // Atualizar o estado do usuário para indicar que a senha foi alterada
      set({
        user: {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            primeiro_acesso: false,
          },
        } as any,
        mustChangePassword: false,
        loading: false,
        error: null,
      });

      toast.success('Senha alterada com sucesso!');
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro inesperado';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  skipPasswordChange: async () => {
    try {
      const { user } = get();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      set({ loading: true, error: null });

      // Atualizar o campo primeiro_acesso no banco de dados
      if (supabase && !supabase._isLocalDb) {
        try {
          const { error: updateError } = await supabase
            .from('usuarios')
            .update({
              primeiro_acesso: false,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (updateError) {
            console.warn(
              'Erro ao atualizar primeiro_acesso no Supabase:',
              updateError
            );
            // Continuar mesmo com erro
          }
        } catch (dbError) {
          console.warn(
            'Erro ao atualizar primeiro_acesso no Supabase:',
            dbError
          );
          // Continuar mesmo com erro
        }
      } else {
        // Para banco local, marcar que o usuário não precisa mais alterar a senha
        console.log('Skipping password change for local database');

        // Atualizar usuários aprovados no localStorage
        const storedUsers = JSON.parse(
          localStorage.getItem('pendingUsers') || '[]'
        );
        const userIndex = storedUsers.findIndex(
          (u: any) => u.cpf === user.user_metadata?.cpf
        );

        if (userIndex !== -1) {
          storedUsers[userIndex].primeiro_acesso = false;
          storedUsers[userIndex].updated_at = new Date().toISOString();
          localStorage.setItem('pendingUsers', JSON.stringify(storedUsers));
        }

        // Atualizar dados mock se o usuário estiver lá
        const { mockData } = await import('@/lib/mockData');
        const mockUserIndex = mockData.usuarios.findIndex(
          (u: any) => u.cpf === user.user_metadata?.cpf
        );

        if (mockUserIndex !== -1) {
          mockData.usuarios[mockUserIndex].primeiro_acesso = false;
        }
      }

      // Atualizar o estado do usuário para indicar que não precisa mais alterar a senha
      set({
        user: {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            primeiro_acesso: false,
          },
        } as any,
        mustChangePassword: false,
        loading: false,
        error: null,
      });

      toast.success('Continuando com senha padrão');
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro inesperado';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateProfile: async (_updates: Record<string, unknown>) => {
    // Funcionalidade de atualização de perfil não implementada no banco mock
    return {
      success: false,
      error: 'Atualização de perfil não disponível no modo de desenvolvimento',
    };
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
  setMustChangePassword: (mustChange: boolean) =>
    set({ mustChangePassword: mustChange }),

  initialize: async () => {
    try {
      set({ loading: true });

      // Verificar se o supabase está disponível
      if (
        supabase &&
        supabase.auth &&
        typeof supabase.auth.getSession === 'function'
      ) {
        // Obter sessão atual
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          set({
            user: session.user,
            session: session,
            loading: false,
          });

          // Buscar dados adicionais do usuário
          await get().fetchUserProfile(session.user.id);
        } else {
          set({ loading: false });
        }

        // Escutar mudanças de autenticação (apenas para Supabase)
        let subscription: any = null;
        if (
          supabase &&
          typeof supabase.auth === 'object' &&
          'onAuthStateChange' in supabase.auth
        ) {
          const {
            data: { subscription: authSubscription },
          } = supabase.auth.onAuthStateChange(
            async (event: any, session: any) => {
              if (event === 'SIGNED_IN' && session && (session as any).user) {
                set({
                  user: (session as any).user,
                  session: session as any,
                  loading: false,
                });

                // Buscar dados adicionais do usuário
                await get().fetchUserProfile((session as any).user.id);
              } else if (event === 'SIGNED_OUT') {
                set({
                  user: null,
                  session: null,
                  loading: false,
                });
              }
            }
          );
          subscription = authSubscription;
        }

        // Cleanup da subscription
        return () => {
          if (subscription) {
            subscription.unsubscribe();
          }
        };
      } else {
        // Usar banco local se supabase não estiver disponível
        console.info('Usando banco de dados local para autenticação');
        set({ loading: false });
      }
    } catch (error) {
      console.error('Erro ao inicializar auth:', error);
      set({ loading: false });
    }
  },

  fetchUserProfile: async (_userId: string) => {
    try {
      // No banco mock, não precisamos buscar perfil adicional
      // Os dados já estão no user_metadata
      return;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
    }
  },
}));

// Hook para permissões baseado no usuário atual
export const usePermissions = () => {
  const { user } = useAuthStore();

  const getUserRole = () => {
    if (!user) return null;
    return user.user_metadata?.nivel_acesso || 'usuario';
  };

  const isAdmin = () => getUserRole() === 'admin';
  const isGerente = () => getUserRole() === 'gerente';
  const isUsuario = () => getUserRole() === 'usuario';
  const isRecepcao = () => getUserRole() === 'recepcao';
  const isProfissional = () => getUserRole() === 'profissional';
  const isDesenvolvedor = () => getUserRole() === 'desenvolvedor';

  const canAccess = (requiredRoles: string[]) => {
    const userRole = getUserRole();
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
  };

  return {
    getUserRole,
    isAdmin,
    isGerente,
    isUsuario,
    isRecepcao,
    isProfissional,
    isDesenvolvedor,
    canAccess,
    userRole: getUserRole(),
  };
};
