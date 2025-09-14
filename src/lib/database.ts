// Banco de dados local mock para desenvolvimento
import { mockData } from './mockData';
import {
  // hashPassword,
  verifyPassword,
  migratePassword,
  // needsMigration,
} from './passwordUtils';

interface QueryOptions {
  count?: string;
}

interface QueryChain {
  select(columns?: string, options?: QueryOptions): QueryChain;
  order(column: string, options?: { ascending: boolean }): QueryChain;
  range(from: number, to: number): QueryChain;
  eq(col: string, value: unknown): QueryChain;
  neq(col: string, value: unknown): QueryChain;
  gte(col: string, value: unknown): QueryChain;
  lte(col: string, value: unknown): QueryChain;
  gt(col: string, value: unknown): QueryChain;
  lt(col: string, value: unknown): QueryChain;
  in(col: string, values: unknown[]): QueryChain;
  single(): Promise<{ data: unknown; error: unknown; count?: number }>;
  then(
    resolve: (result: {
      data: unknown[];
      error: unknown;
      count?: number;
    }) => void
  ): void;
  insert(
    data: Record<string, unknown>
  ): Promise<{ data: unknown; error: unknown }>;
  update(newData: Record<string, unknown>): {
    eq(col: string, value: unknown): Promise<{ data: unknown; error: unknown }>;
  };
  delete(): {
    eq(col: string, value: unknown): Promise<{ data: unknown; error: unknown }>;
  };
}

export const localDb = {
  _isLocalDb: true, // Flag para identificar banco local

  // Função para listar usuários
  usuarios: {
    list: async () => {
      try {
        const usuarios: any[] = [];

        // Adicionar usuários dos dados mock
        if (mockData.usuarios) {
          usuarios.push(
            ...mockData.usuarios.map(usuario => ({
              id: usuario.id.toString(),
              nome: usuario.nome,
              cpf: usuario.cpf,
              email: usuario.email || `${usuario.cpf}@clinica.local`,
              nivel_acesso: usuario.nivel_acesso,
              status: 'ativo',
              primeiro_acesso: usuario.primeiro_acesso || false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ultimo_acesso: new Date().toISOString(),
            }))
          );
        }

        // Adicionar usuários aprovados do localStorage
        const storedUsers = localStorage.getItem('pendingUsers');
        if (storedUsers) {
          const pendingUsers = JSON.parse(storedUsers);
          const approvedUsers = pendingUsers.filter(
            (u: any) => u.status === 'approved'
          );

          approvedUsers.forEach((user: any) => {
            usuarios.push({
              id: user.id,
              nome: user.nome,
              cpf: user.cpf,
              email: user.email || `${user.cpf}@clinica.local`,
              nivel_acesso: user.nivel_acesso || 'recepcao',
              status: 'ativo',
              primeiro_acesso: false,
              created_at: user.created_at || new Date().toISOString(),
              updated_at: user.updated_at || new Date().toISOString(),
              ultimo_acesso: user.ultimo_acesso,
            });
          });
        }

        console.log('Usuários listados do banco local:', usuarios.length);
        return usuarios;
      } catch (error) {
        console.error('Erro ao listar usuários do banco local:', error);
        return [];
      }
    },
  },

  auth: {
    signIn: async (credentials: { cpf: string; password: string }) => {
      try {
        console.log('🔍 [Database] Iniciando autenticação:', credentials);
        // Simular autenticação com dados mock
        const cpfLimpo = credentials.cpf.replace(/[.\-\s]/g, '');
        console.log('🔍 [Database] CPF limpo:', cpfLimpo);

        // Buscar usuário nos dados mock
        let usuario = mockData.usuarios.find(u => u.cpf === cpfLimpo);
        console.log(
          '🔍 [Database] Usuário encontrado nos dados mock:',
          usuario
        );

        // Se não encontrou nos dados mock, verificar usuários aprovados no localStorage
        if (!usuario) {
          const storedUsers = localStorage.getItem('pendingUsers');
          if (storedUsers) {
            const pendingUsers = JSON.parse(storedUsers);
            const approvedUser = pendingUsers.find(
              (u: any) =>
                u.cpf.replace(/[.\-\s]/g, '') === cpfLimpo &&
                u.status === 'approved'
            );

            if (approvedUser) {
              // Converter usuário aprovado para formato de usuário do sistema
              usuario = {
                id: parseInt(approvedUser.id),
                cpf: approvedUser.cpf,
                nome: approvedUser.nome,
                email:
                  approvedUser.email || `${approvedUser.cpf}@clinica.local`,
                nivel_acesso: approvedUser.nivel_acesso || 'recepcao',
                primeiro_acesso: false,
                senha: approvedUser.senha,
                senha_hash: approvedUser.senha_hash || null,
              } as any;
            }
          }
        }

        if (!usuario) {
          return {
            data: { user: null, session: null },
            error: { message: 'Usuário não encontrado' },
          };
        }

        // Verificar senha usando hash
        let senhaValida = false;
        let precisaMigrar = false;

        console.log('🔍 [Database] Verificando senha:', {
          senhaDigitada: credentials.password,
          senhaArmazenada: usuario.senha,
          tipoSenha: typeof usuario.senha,
        });

        if (usuario.senha) {
          // Usar hash se disponível
          const { isValid, needsUpdate } = verifyPassword(
            credentials.password,
            usuario.senha
          );
          senhaValida = isValid;
          precisaMigrar = needsUpdate || false;
          console.log('🔍 [Database] Verificação com hash:', {
            isValid,
            needsUpdate,
          });
        } else if (usuario.senha) {
          // Fallback para senha em texto (migração)
          senhaValida = usuario.senha === credentials.password;
          precisaMigrar = true;
          console.log('🔍 [Database] Verificação com texto simples:', {
            senhaValida,
          });
        }

        if (!senhaValida) {
          return {
            data: { user: null, session: null },
            error: { message: 'Senha incorreta' },
          };
        }

        // Migrar senha se necessário
        if (precisaMigrar && usuario.senha) {
          const { hash } = migratePassword(usuario.senha);
          // usuario.senha_hash = hash;
          // Salvar no localStorage para persistência
          const storedUsers = JSON.parse(
            localStorage.getItem('pendingUsers') || '[]'
          );
          const userIndex = storedUsers.findIndex(
            (u: any) => u.cpf === usuario.cpf
          );
          if (userIndex !== -1) {
            storedUsers[userIndex].senha_hash = hash;
            localStorage.setItem('pendingUsers', JSON.stringify(storedUsers));
          }
        }

        // Criar objeto de usuário compatível
        const user = {
          id: usuario.id.toString(),
          email: usuario.email || `${usuario.cpf}@clinica.local`,
          cpf: usuario.cpf,
          password: credentials.password,
          must_change_password: usuario.primeiro_acesso || false,
          user_metadata: {
            nome: usuario.nome,
            cpf: usuario.cpf,
            nivel_acesso: usuario.nivel_acesso,
            primeiro_acesso: usuario.primeiro_acesso || false,
            telefone: '',
            cargo: 'Funcionário',
            status: 'ativo',
          },
        };

        return {
          data: {
            user,
            session: {
              user,
              access_token: 'mock-token',
              refresh_token: 'mock-refresh-token',
              expires_at: Date.now() + 3600000, // 1 hora
              expires_in: 3600,
              token_type: 'bearer',
            },
          },
          error: null,
        };
      } catch (error) {
        console.error('Erro na autenticação:', error);
        return {
          data: { user: null, session: null },
          error: { message: 'Erro interno do servidor' },
        };
      }
    },

    signOut: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { error: null };
    },

    getSession: async () => {
      // Simular que não há sessão ativa
      return { data: { session: null }, error: null };
    },

    onAuthStateChange: (
      _callback: (event: string, session: unknown) => void
    ) => {
      // Simular listener de mudanças de autenticação
      return { data: { subscription: { unsubscribe: () => {} } } };
    },

    updatePassword: async (_userId: string, _newPassword: string) => {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 300));

      // Em um sistema real, isso seria uma chamada para a API
      // Por enquanto, apenas simulamos o sucesso
      return {
        data: { success: true },
        error: null,
      };
    },
  },

  from: (table: string): QueryChain => {
    console.log('🏗️ Mock DB: Criando query para tabela:', table);

    // Criar um objeto que suporta encadeamento de métodos
    const createChainableQuery = (): QueryChain => {
      // Usar referência direta aos dados originais para que as modificações sejam persistentes
      let currentData =
        (mockData as unknown as Record<string, unknown[]>)[table] || [];
      let currentFilters: Record<string, unknown> = {};
      let currentRange: { from: number; to: number } | null = null;
      let currentCount: number | null = null;

      const query: QueryChain = {
        select: (columns: string = '*', options: QueryOptions = {}) => {
          console.log(
            '📋 Mock DB: Select chamado com columns:',
            columns,
            'options:',
            options
          );
          console.log('📋 Mock DB: Dados atuais para select:', currentData);
          currentCount = options.count === 'exact' ? currentData.length : null;
          return query;
        },

        order: (
          _column: string,
          _options: { ascending: boolean } = { ascending: true }
        ) => {
          return query;
        },

        range: (from: number, to: number) => {
          currentRange = { from, to };
          return query;
        },

        eq: (col: string, value: unknown) => {
          currentFilters[col] = value;
          return query;
        },

        neq: (col: string, value: unknown) => {
          currentFilters[`${col}_neq`] = value;
          return query;
        },

        gte: (col: string, value: unknown) => {
          currentFilters[`${col}_gte`] = value;
          return query;
        },

        lte: (col: string, value: unknown) => {
          currentFilters[`${col}_lte`] = value;
          return query;
        },

        gt: (col: string, value: unknown) => {
          currentFilters[`${col}_gt`] = value;
          return query;
        },

        lt: (col: string, value: unknown) => {
          currentFilters[`${col}_lt`] = value;
          return query;
        },

        in: (col: string, values: unknown[]) => {
          currentFilters[`${col}_in`] = values;
          return query;
        },

        single: () => {
          return Promise.resolve({
            data: applyFilters(currentData)[0] || null,
            error: null,
            count: currentCount || undefined,
          });
        },

        then: (
          resolve: (result: {
            data: unknown[];
            error: unknown;
            count?: number;
          }) => void
        ) => {
          console.log(
            '📤 Mock DB: Then executado, retornando dados:',
            currentData
          );

          try {
            const filteredData = applyFiltersAndPagination(currentData);
            console.log('📤 Mock DB: Dados filtrados:', filteredData);

            resolve({
              data: filteredData,
              error: null,
              count: currentCount || undefined,
            });
          } catch (error) {
            console.error('❌ Mock DB: Erro ao processar dados:', error);
            resolve({
              data: [],
              error: { message: 'Erro ao processar dados', details: error },
              count: 0,
            });
          }
        },

        insert: (data: Record<string, unknown>) => {
          const newItem = {
            id: String(Math.floor(Math.random() * 1000) + 1),
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Adicionar o item ao array
          currentData.push(newItem);

          return Promise.resolve({
            data: newItem,
            error: null,
          });
        },

        update: (newData: Record<string, unknown>) => {
          return {
            eq: (col: string, value: unknown) => {
              // Encontrar o índice do item a ser atualizado
              const index = currentData.findIndex(
                (item: unknown) =>
                  (item as Record<string, unknown>)[col] === value
              );

              if (index !== -1) {
                // Atualizar o item no array
                currentData[index] = {
                  ...(currentData[index] as Record<string, unknown>),
                  ...newData,
                };
                return Promise.resolve({
                  data: currentData[index],
                  error: null,
                });
              } else {
                return Promise.resolve({
                  data: null,
                  error: { message: 'Item não encontrado' },
                });
              }
            },
          };
        },

        delete: () => {
          return {
            eq: (col: string, value: unknown) => {
              console.log(
                '🗑️ Mock DB: Tentando excluir item com',
                col,
                '=',
                value
              );
              console.log('🗑️ Mock DB: Dados atuais:', currentData);

              // Encontrar o índice do item a ser removido
              const index = currentData.findIndex(
                (item: unknown) =>
                  (item as Record<string, unknown>)[col] === value
              );

              console.log('🗑️ Mock DB: Índice encontrado:', index);

              if (index !== -1) {
                // Remover o item do array
                const removedItem = currentData.splice(index, 1);
                console.log('🗑️ Mock DB: Item removido:', removedItem);
                console.log('🗑️ Mock DB: Dados após remoção:', currentData);

                return Promise.resolve({
                  data: null,
                  error: null,
                });
              } else {
                console.log('🗑️ Mock DB: Item não encontrado');
                return Promise.resolve({
                  data: null,
                  error: { message: 'Item não encontrado' },
                });
              }
            },
          };
        },
      };

      // Função para aplicar filtros
      const applyFilters = (data: unknown[]): unknown[] => {
        let filteredData = [...data];

        if (currentFilters.id) {
          filteredData = filteredData.filter(
            (item: unknown) =>
              (item as Record<string, unknown>).id === currentFilters.id
          );
        }
        if (currentFilters.status) {
          filteredData = filteredData.filter(
            (item: unknown) =>
              (item as Record<string, unknown>).status === currentFilters.status
          );
        }
        if (currentFilters.profissional_id) {
          filteredData = filteredData.filter(
            (item: unknown) =>
              (item as Record<string, unknown>).profissional_id ===
              currentFilters.profissional_id
          );
        }
        if (currentFilters.data) {
          filteredData = filteredData.filter(
            (item: unknown) =>
              (item as Record<string, unknown>).data === currentFilters.data
          );
        }
        if (currentFilters.hora) {
          filteredData = filteredData.filter(
            (item: unknown) =>
              (item as Record<string, unknown>).hora === currentFilters.hora
          );
        }
        if (currentFilters.status_neq) {
          filteredData = filteredData.filter(
            (item: unknown) =>
              (item as Record<string, unknown>).status !==
              currentFilters.status_neq
          );
        }
        if (currentFilters.data_in) {
          filteredData = filteredData.filter((item: unknown) =>
            (currentFilters.data_in as unknown[]).includes(
              (item as Record<string, unknown>).data
            )
          );
        }
        if (currentFilters.id_in) {
          filteredData = filteredData.filter((item: unknown) =>
            (currentFilters.id_in as unknown[]).includes(
              (item as Record<string, unknown>).id
            )
          );
        }

        // Filtros de comparação
        if (currentFilters.data_gte) {
          filteredData = filteredData.filter((item: unknown) => {
            const itemDate = (item as Record<string, unknown>).data as string;
            return itemDate >= (currentFilters.data_gte as string);
          });
        }

        if (currentFilters.data_lte) {
          filteredData = filteredData.filter((item: unknown) => {
            const itemDate = (item as Record<string, unknown>).data as string;
            return itemDate <= (currentFilters.data_lte as string);
          });
        }

        if (currentFilters.data_gt) {
          filteredData = filteredData.filter((item: unknown) => {
            const itemDate = (item as Record<string, unknown>).data as string;
            return itemDate > (currentFilters.data_gt as string);
          });
        }

        if (currentFilters.data_lt) {
          filteredData = filteredData.filter((item: unknown) => {
            const itemDate = (item as Record<string, unknown>).data as string;
            return itemDate < (currentFilters.data_lt as string);
          });
        }

        // Filtros numéricos
        if (currentFilters.valor_gte) {
          filteredData = filteredData.filter((item: unknown) => {
            const itemValue = (item as Record<string, unknown>).valor as number;
            return itemValue >= (currentFilters.valor_gte as number);
          });
        }

        if (currentFilters.valor_lte) {
          filteredData = filteredData.filter((item: unknown) => {
            const itemValue = (item as Record<string, unknown>).valor as number;
            return itemValue <= (currentFilters.valor_lte as number);
          });
        }

        return filteredData;
      };

      // Função para aplicar filtros e paginação
      const applyFiltersAndPagination = (data: unknown[]): unknown[] => {
        console.log('🔍 Mock DB: Aplicando filtros e paginação...');
        console.log('🔍 Mock DB: Dados de entrada:', data);
        console.log('🔍 Mock DB: Filtros atuais:', currentFilters);
        console.log('🔍 Mock DB: Range atual:', currentRange);

        let filteredData = applyFilters(data);
        console.log('🔍 Mock DB: Dados após filtros:', filteredData);

        // Aplicar paginação se especificada
        if (currentRange) {
          filteredData = filteredData.slice(
            currentRange.from,
            currentRange.to + 1
          );
          console.log('🔍 Mock DB: Dados após paginação:', filteredData);
        }

        return filteredData;
      };

      return query;
    };

    const queryInstance = createChainableQuery();
    console.log(
      '🏗️ Mock DB: Query criada para tabela:',
      table,
      'com dados:',
      (mockData as unknown as Record<string, unknown[]>)[table]
    );
    return queryInstance;
  },
};
