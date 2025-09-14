// ============================================================================
// PÁGINA: Usuários - Gerenciamento de Usuários do Sistema
// ============================================================================
// Esta página permite gerenciar todos os usuários cadastrados no sistema,
// incluindo visualização, edição e controle de permissões.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Power,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
} from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { supabase, checkSupabaseConnection } from '@/lib/supabase';
import { localDb } from '@/lib/database';
import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Usuario {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  cargo?: string;
  nivel_acesso: string;
  status: 'ativo' | 'inativo' | 'pendente';
  primeiro_acesso: boolean;
  created_at: string;
  updated_at: string;
  ultimo_acesso?: string;
  ultimo_login?: string;
  senha_hash?: string;
}

interface UsuarioFormData {
  nome: string;
  cpf: string;
  telefone: string;
  cargo: string;
  nivel_acesso: string;
  senha: string;
}

// ============================================================================
// DADOS MOCK
// ============================================================================

const MOCK_USUARIOS: Usuario[] = [
  {
    id: '1',
    nome: 'Administrador',
    cpf: '123.456.789-00',
    email: 'admin@clinica.com',
    nivel_acesso: 'admin',
    status: 'ativo',
    primeiro_acesso: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ultimo_acesso: '2024-12-20T10:30:00Z',
  },
  {
    id: '2',
    nome: 'Desenvolvedor Principal',
    cpf: '333.333.333-33',
    email: 'dev@clinica.com',
    nivel_acesso: 'desenvolvedor',
    status: 'ativo',
    primeiro_acesso: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ultimo_acesso: '2024-12-20T16:30:00Z',
  },
  {
    id: '3',
    nome: 'Maria Santos',
    cpf: '987.654.321-00',
    email: 'maria@clinica.com',
    nivel_acesso: 'recepcao',
    status: 'ativo',
    primeiro_acesso: false,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
    ultimo_acesso: '2024-12-20T14:15:00Z',
  },
  {
    id: '4',
    nome: 'Dr. Carlos Mendes',
    cpf: '111.222.333-44',
    email: 'carlos@clinica.com',
    nivel_acesso: 'profissional',
    status: 'ativo',
    primeiro_acesso: false,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
    ultimo_acesso: '2024-12-19T16:45:00Z',
  },
  {
    id: '5',
    nome: 'Ana Costa',
    cpf: '555.666.777-88',
    email: 'ana@clinica.com',
    nivel_acesso: 'recepcao',
    status: 'pendente',
    primeiro_acesso: true,
    created_at: '2024-12-20T09:00:00Z',
    updated_at: '2024-12-20T09:00:00Z',
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Usuarios: React.FC = () => {
  // ============================================================================
  // ESTADO E HOOKS
  // ============================================================================

  const [usuarios, setUsuarios] = useState<Usuario[]>(MOCK_USUARIOS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterNivel, setFilterNivel] = useState<string>('todos');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState<UsuarioFormData>({
    nome: '',
    cpf: '',
    telefone: '',
    cargo: '',
    nivel_acesso: 'usuario',
    senha: '',
  });

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadUsuarios();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadUsuarios = async () => {
    if (loading) return; // Evitar chamadas múltiplas
    setLoading(true);
    try {
      // Verificar se Supabase está disponível
      const isSupabaseConnected = await checkSupabaseConnection();

      if (isSupabaseConnected && supabase) {
        console.log('Buscando usuários do Supabase...');

        // Buscar usuários do Supabase
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar usuários do Supabase:', error);
          // Fallback para dados mock em caso de erro
          setUsuarios(MOCK_USUARIOS);
        } else {
          console.log('Usuários carregados do Supabase:', data?.length || 0);

          // Converter dados do Supabase para o formato esperado
          const usuariosConvertidos = (data || []).map((usuario: any) => ({
            id: usuario.id,
            nome: usuario.nome,
            cpf: usuario.cpf,
            email: usuario.email || `${usuario.cpf}@clinica.local`,
            telefone: usuario.telefone || null,
            cargo: usuario.cargo || null,
            nivel_acesso: usuario.nivel_acesso,
            status: usuario.status,
            primeiro_acesso: usuario.primeiro_acesso || false,
            created_at: usuario.created_at,
            updated_at: usuario.updated_at,
            ultimo_acesso: usuario.ultimo_login,
            ultimo_login: usuario.ultimo_login,
            senha_hash: usuario.senha_hash,
          }));

          setUsuarios(usuariosConvertidos);
        }
      } else {
        console.log('Supabase não disponível, usando banco local...');

        // Buscar usuários do banco local
        const localUsers = await localDb.usuarios.list();
        console.log(
          'Usuários carregados do banco local:',
          localUsers?.length || 0
        );

        if (localUsers && localUsers.length > 0) {
          setUsuarios(localUsers);
        } else {
          // Fallback para dados mock se não houver usuários no banco local
          setUsuarios(MOCK_USUARIOS);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      // Fallback para dados mock em caso de erro
      setUsuarios(MOCK_USUARIOS);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterStatus = (status: string) => {
    setFilterStatus(status);
  };

  const handleFilterNivel = (nivel: string) => {
    setFilterNivel(nivel);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      nome: '',
      cpf: '',
      telefone: '',
      cargo: '',
      nivel_acesso: 'usuario',
      senha: '',
    });
    setShowForm(true);
  };

  const handleEditUser = (usuario: Usuario) => {
    setEditingUser(usuario);
    setFormData({
      nome: usuario.nome,
      cpf: usuario.cpf,
      telefone: usuario.telefone || '',
      cargo: usuario.cargo || '',
      nivel_acesso: usuario.nivel_acesso,
      senha: '',
    });
    setShowForm(true);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsuarios(prev => prev.filter(u => u.id !== id));
      toast.success('Usuário excluído com sucesso!');
    }
  };

  const handleToggleUserStatus = (usuario: Usuario) => {
    const newStatus = usuario.status === 'ativo' ? 'inativo' : 'ativo';
    const message =
      newStatus === 'ativo'
        ? 'Tem certeza que deseja ativar este usuário?'
        : 'Tem certeza que deseja desativar este usuário?';

    if (window.confirm(message)) {
      setUsuarios(prev =>
        prev.map(u =>
          u.id === usuario.id
            ? {
                ...u,
                status: newStatus as 'ativo' | 'inativo' | 'pendente',
                updated_at: new Date().toISOString(),
              }
            : u
        )
      );
      toast.success(
        `Usuário ${newStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`
      );
    }
  };

  const formatCPF = (cpf: string) => {
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Algoritmo de validação do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  };

  const handleSaveUser = () => {
    // Validar campos obrigatórios
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!formData.cpf.trim()) {
      toast.error('CPF é obrigatório');
      return;
    }

    // Validar CPF
    if (!validateCPF(formData.cpf)) {
      toast.error('CPF inválido');
      return;
    }

    // Verificar se CPF já existe
    const cpfExists = usuarios.some(
      u =>
        u.cpf.replace(/\D/g, '') === formData.cpf.replace(/\D/g, '') &&
        (!editingUser || u.id !== editingUser.id)
    );

    if (cpfExists) {
      toast.error('CPF já cadastrado no sistema');
      return;
    }

    // Validar senha obrigatória
    if (!formData.senha || formData.senha.length < 3) {
      toast.error('Senha deve ter pelo menos 3 caracteres');
      return;
    }

    if (editingUser) {
      // Editar usuário existente
      setUsuarios(prev =>
        prev.map(u =>
          u.id === editingUser.id
            ? {
                ...u,
                ...formData,
                updated_at: new Date().toISOString(),
              }
            : u
        )
      );
    } else {
      // Criar novo usuário
      const novoUsuario: Usuario = {
        id: Date.now().toString(),
        ...formData,
        email: `${formData.cpf.replace(/[.\-\s]/g, '')}@clinica.local`,
        status: 'pendente',
        primeiro_acesso: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUsuarios(prev => [...prev, novoUsuario]);
    }

    toast.success(
      editingUser
        ? 'Usuário atualizado com sucesso!'
        : 'Usuário criado com sucesso!'
    );
    setShowForm(false);
    setEditingUser(null);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ativo:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inativo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      pendente:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return colors[status as keyof typeof colors] || colors.ativo;
  };

  const getNivelColor = (nivel: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      desenvolvedor:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      gerente:
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      recepcao: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      profissional:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      usuario: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[nivel as keyof typeof colors] || colors.usuario;
  };

  const getNivelName = (nivel: string) => {
    const names = {
      admin: 'Administrador',
      desenvolvedor: 'Desenvolvedor',
      gerente: 'Gerente',
      recepcao: 'Recepcionista',
      profissional: 'Profissional',
      usuario: 'Usuário',
    };
    return names[nivel as keyof typeof names] || nivel;
  };

  // ============================================================================
  // FILTROS
  // ============================================================================

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch =
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.cpf.includes(searchTerm);

    const matchesStatus =
      filterStatus === 'todos' || usuario.status === filterStatus;
    const matchesNivel =
      filterNivel === 'todos' || usuario.nivel_acesso === filterNivel;

    return matchesSearch && matchesStatus && matchesNivel;
  });

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center'>
                <Users className='mr-3 !text-blue-600' size={32} style={{ color: '#2563eb !important' }} />
                Usuários do Sistema
              </h1>
              <p className='text-gray-600 dark:text-gray-300 mt-2'>
                Gerencie usuários, permissões e acessos ao sistema
              </p>
            </div>
            <Button onClick={handleCreateUser} className='flex items-center'>
              <Plus size={20} className='mr-2' />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Users className='h-8 w-8 text-blue-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Total de Usuários
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {usuarios.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <UserCheck className='h-8 w-8 text-green-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Usuários Ativos
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {usuarios.filter(u => u.status === 'ativo').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <UserX className='h-8 w-8 text-yellow-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Pendentes
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {usuarios.filter(u => u.status === 'pendente').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Shield className='h-8 w-8 text-purple-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Administradores
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {
                      usuarios.filter(u =>
                        ['admin', 'desenvolvedor'].includes(u.nivel_acesso)
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Buscar
                </label>
                <div className='relative'>
                  <Search
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                    size={20}
                  />
                  <Input
                    placeholder='Nome ou CPF...'
                    value={searchTerm}
                    onChange={e => handleSearch(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={e => handleFilterStatus(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                >
                  <option value='todos'>Todos os Status</option>
                  <option value='ativo'>Ativo</option>
                  <option value='inativo'>Inativo</option>
                  <option value='pendente'>Pendente</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Nível de Acesso
                </label>
                <select
                  value={filterNivel}
                  onChange={e => handleFilterNivel(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                >
                  <option value='todos'>Todos os Níveis</option>
                  <option value='admin'>Administrador</option>
                  <option value='desenvolvedor'>Desenvolvedor</option>
                  <option value='gerente'>Gerente</option>
                  <option value='recepcao'>Recepcionista</option>
                  <option value='profissional'>Profissional</option>
                  <option value='usuario'>Usuário</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários ({filteredUsuarios.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200 dark:border-gray-700'>
                    <th className='text-left py-3 px-4 font-medium text-gray-900 dark:text-white'>
                      Usuário
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900 dark:text-white'>
                      CPF
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900 dark:text-white'>
                      Telefone
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900 dark:text-white'>
                      Nível
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900 dark:text-white'>
                      Status
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900 dark:text-white'>
                      Último Acesso
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900 dark:text-white'>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.map(usuario => (
                    <tr
                      key={usuario.id}
                      className='border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                    >
                      <td className='py-4 px-4'>
                        <div>
                          <p className='font-medium text-gray-900 dark:text-white'>
                            {usuario.nome}
                          </p>
                          {usuario.primeiro_acesso && (
                            <Badge variant='outline' className='text-xs'>
                              Primeiro Acesso
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className='py-4 px-4 text-gray-600 dark:text-gray-300'>
                        {usuario.cpf}
                      </td>
                      <td className='py-4 px-4 text-gray-600 dark:text-gray-300'>
                        {usuario.telefone || 'Não informado'}
                      </td>
                      <td className='py-4 px-4'>
                        <Badge className={getNivelColor(usuario.nivel_acesso)}>
                          {getNivelName(usuario.nivel_acesso)}
                        </Badge>
                      </td>
                      <td className='py-4 px-4'>
                        <Badge className={getStatusColor(usuario.status)}>
                          {usuario.status}
                        </Badge>
                      </td>
                      <td className='py-4 px-4 text-gray-600 dark:text-gray-300'>
                        {usuario.ultimo_acesso
                          ? new Date(usuario.ultimo_acesso).toLocaleString(
                              'pt-BR'
                            )
                          : 'Nunca'}
                      </td>
                      <td className='py-4 px-4'>
                        <div className='flex space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEditUser(usuario)}
                            title='Editar usuário'
                          >
                            <Edit size={16} />
                          </Button>
                          {usuario.status !== 'pendente' && (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleToggleUserStatus(usuario)}
                              title={
                                usuario.status === 'ativo'
                                  ? 'Desativar usuário'
                                  : 'Ativar usuário'
                              }
                              className={
                                usuario.status === 'ativo'
                                  ? 'text-red-600 hover:text-red-700'
                                  : 'text-green-600 hover:text-green-700'
                              }
                            >
                              <Power size={16} />
                            </Button>
                          )}
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDeleteUser(usuario.id)}
                            title='Excluir usuário'
                            className='text-red-600 hover:text-red-700'
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Formulário */}
        {showForm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl'>
              {/* Header */}
              <div className='text-center p-6 border-b border-gray-200 dark:border-gray-700'>
                <div className='mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-4'>
                  <Users size={32} className='text-white' />
                </div>
                <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
                <p className='text-gray-600 dark:text-gray-300'>
                  Preencha os dados para se cadastrar
                </p>
              </div>

              {/* Form */}
              <div className='p-6'>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Nome
                    </label>
                    <Input
                      value={formData.nome}
                      onChange={e =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      CPF
                    </label>
                    <Input
                      value={formData.cpf}
                      onChange={e => {
                        const formatted = formatCPF(e.target.value);
                        setFormData({ ...formData, cpf: formatted });
                      }}
                      placeholder='000.000.000-00'
                      maxLength={14}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Telefone
                    </label>
                    <Input
                      value={formData.telefone}
                      onChange={e =>
                        setFormData({ ...formData, telefone: e.target.value })
                      }
                      placeholder='(11) 99999-9999'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Cargo
                    </label>
                    <Input
                      value={formData.cargo}
                      onChange={e =>
                        setFormData({ ...formData, cargo: e.target.value })
                      }
                      placeholder='Ex: Recepcionista, Médico, etc.'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Nível de Acesso
                    </label>
                    <select
                      value={formData.nivel_acesso}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          nivel_acesso: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    >
                      <option value='usuario'>Usuário</option>
                      <option value='recepcao'>Recepcionista</option>
                      <option value='profissional'>Profissional</option>
                      <option value='gerente'>Gerente</option>
                      <option value='admin'>Administrador</option>
                      <option value='desenvolvedor'>Desenvolvedor</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Senha *
                    </label>
                    <Input
                      type='password'
                      value={formData.senha}
                      onChange={e =>
                        setFormData({ ...formData, senha: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className='pt-4'>
                    <Button
                      onClick={handleSaveUser}
                      className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200'
                    >
                      {editingUser ? 'Salvar' : 'Criar'}
                    </Button>
                  </div>

                  <div className='text-center pt-2'>
                    <Button
                      variant='outline'
                      onClick={() => setShowForm(false)}
                      className='w-full'
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Usuarios;
