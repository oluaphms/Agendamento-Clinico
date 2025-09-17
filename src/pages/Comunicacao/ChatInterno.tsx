// ============================================================================
// PÁGINA: Chat Interno - Sistema de Comunicação
// ============================================================================
// Esta página implementa um sistema de chat interno para comunicação
// entre profissionais da clínica, incluindo mensagens em tempo real.
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  MessageCircle,
  Send,
  Search,
  Filter,
  RefreshCw,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Plus,
  Eye,
  Edit,
  Trash2,
  Settings,
  Zap,
  Bell,
  Shield,
  Users,
  MoreVertical,
  Paperclip,
  Smile,
  Image,
  File,
  Video,
  Mic,
  Phone as PhoneIcon,
  Video as VideoIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { formatDate, formatTime, formatPhone } from '@/lib/utils';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface MensagemChat {
  id: string;
  remetente_id: string;
  destinatario_id: string;
  mensagem: string;
  tipo: 'texto' | 'imagem' | 'arquivo' | 'sistema';
  arquivo_url?: string;
  lida: boolean;
  data_leitura?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  remetente?: {
    nome: string;
    email: string;
    avatar_url?: string;
    cargo: string;
  };
  destinatario?: {
    nome: string;
    email: string;
    avatar_url?: string;
    cargo: string;
  };
}

interface Conversa {
  id: string;
  usuario_id: string;
  nome: string;
  email: string;
  avatar_url?: string;
  cargo: string;
  ultima_mensagem?: string;
  ultima_mensagem_data?: string;
  nao_lidas: number;
  online: boolean;
}

interface Filtros {
  busca: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const ChatInterno: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    tipo: '',
    data_inicio: '',
    data_fim: '',
  });
  const [conversaAtiva, setConversaAtiva] = useState<string | null>(null);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [mensagemSelecionada, setMensagemSelecionada] = useState<MensagemChat | null>(null);
  const [usuarioAtual, setUsuarioAtual] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadDados();
  }, [filtros, conversaAtiva]);

  useEffect(() => {
    // Scroll para a última mensagem
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  useEffect(() => {
    // Simular atualizações em tempo real
    const interval = setInterval(() => {
      if (conversaAtiva) {
        loadMensagens();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [conversaAtiva]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadDados = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsuarios(),
        loadConversas(),
        loadMensagens(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do chat');
    } finally {
      setLoading(false);
    }
  };

  const loadUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, avatar_url, cargo')
        .eq('status', 'ativo')
        .order('nome');

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        return;
      }

      setUsuarios(data || []);
      
      // Simular usuário atual (em produção, viria do contexto de autenticação)
      if (data && data.length > 0) {
        setUsuarioAtual(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadConversas = async () => {
    try {
      // Simular conversas (em produção, viria de uma query mais complexa)
      const conversasMock: Conversa[] = usuarios.map(usuario => ({
        id: usuario.id,
        usuario_id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        avatar_url: usuario.avatar_url,
        cargo: usuario.cargo,
        ultima_mensagem: 'Última mensagem...',
        ultima_mensagem_data: new Date().toISOString(),
        nao_lidas: Math.floor(Math.random() * 5),
        online: Math.random() > 0.5,
      }));

      setConversas(conversasMock);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    }
  };

  const loadMensagens = async () => {
    if (!conversaAtiva) return;

    try {
      const { data, error } = await supabase
        .from('chat_interno')
        .select(`
          *,
          remetente:usuarios!remetente_id(nome, email, avatar_url, cargo),
          destinatario:usuarios!destinatario_id(nome, email, avatar_url, cargo)
        `)
        .or(`remetente_id.eq.${conversaAtiva},destinatario_id.eq.${conversaAtiva}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        toast.error('Erro ao carregar mensagens');
        return;
      }

      setMensagens(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    }
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaAtiva || !usuarioAtual) return;

    try {
      const { error } = await supabase
        .from('chat_interno')
        .insert({
          remetente_id: usuarioAtual.id,
          destinatario_id: conversaAtiva,
          mensagem: novaMensagem,
          tipo: 'texto',
          lida: false,
        });

      if (error) {
        console.error('Erro ao enviar mensagem:', error);
        toast.error('Erro ao enviar mensagem');
        return;
      }

      setNovaMensagem('');
      loadMensagens();
      loadConversas();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const marcarComoLida = async (mensagemId: string) => {
    try {
      const { error } = await supabase
        .from('chat_interno')
        .update({ 
          lida: true,
          data_leitura: new Date().toISOString()
        })
        .eq('id', mensagemId);

      if (error) {
        console.error('Erro ao marcar como lida:', error);
        return;
      }

      loadMensagens();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta mensagem?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('chat_interno')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir mensagem:', error);
        toast.error('Erro ao excluir mensagem');
        return;
      }

      toast.success('Mensagem excluída com sucesso');
      loadMensagens();
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
      toast.error('Erro ao excluir mensagem');
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'imagem':
        return <Image className="h-4 w-4" />;
      case 'arquivo':
        return <File className="h-4 w-4" />;
      case 'sistema':
        return <Bell className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'imagem':
        return 'text-blue-500';
      case 'arquivo':
        return 'text-green-500';
      case 'sistema':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const conversasFiltradas = conversas.filter(conversa => {
    const matchesBusca = !filtros.busca || 
      conversa.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      conversa.email.toLowerCase().includes(filtros.busca.toLowerCase());
    
    return matchesBusca;
  });

  const mensagensFiltradas = mensagens.filter(mensagem => {
    const matchesTipo = !filtros.tipo || mensagem.tipo === filtros.tipo;
    const matchesDataInicio = !filtros.data_inicio || 
      new Date(mensagem.created_at) >= new Date(filtros.data_inicio);
    const matchesDataFim = !filtros.data_fim || 
      new Date(mensagem.created_at) <= new Date(filtros.data_fim);
    const matchesBusca = !filtros.busca || 
      mensagem.mensagem.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      mensagem.remetente?.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      mensagem.destinatario?.nome.toLowerCase().includes(filtros.busca.toLowerCase());

    return matchesTipo && matchesDataInicio && matchesDataFim && matchesBusca;
  });

  // Estatísticas
  const totalMensagens = mensagens.length;
  const mensagensNaoLidas = mensagens.filter(m => !m.lida).length;
  const conversasAtivas = conversas.filter(c => c.online).length;
  const totalConversas = conversas.length;

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Helmet>
        <title>Chat Interno - Sistema de Gestão de Clínica</title>
        <meta name="description" content="Sistema de chat interno para comunicação entre profissionais" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                Chat Interno
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Sistema de comunicação interna entre profissionais
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadDados}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="mr-2" size={16} />
                Atualizar
              </button>
              <button
                onClick={() => setModalAberto(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="mr-2" size={16} />
                Nova Conversa
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total de Mensagens
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalMensagens}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Não Lidas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mensagensNaoLidas}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Online
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {conversasAtivas}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Conversas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalConversas}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interface do Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lista de Conversas */}
          <div className="lg:col-span-1">
            <Card className="h-[600px]">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Conversas
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={filtros.busca}
                      onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm w-full"
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2">
                  {conversasFiltradas.map((conversa) => (
                    <div
                      key={conversa.id}
                      onClick={() => setConversaAtiva(conversa.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        conversaAtiva === conversa.id
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                          </div>
                          {conversa.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {conversa.nome}
                            </p>
                            {conversa.nao_lidas > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                {conversa.nao_lidas}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {conversa.ultima_mensagem}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {conversa.ultima_mensagem_data ? formatTime(conversa.ultima_mensagem_data) : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área de Mensagens */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardContent className="p-4 h-full flex flex-col">
                {conversaAtiva ? (
                  <>
                    {/* Header da Conversa */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {conversas.find(c => c.id === conversaAtiva)?.nome}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {conversas.find(c => c.id === conversaAtiva)?.cargo}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <PhoneIcon size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <VideoIcon size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Mensagens */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {mensagensFiltradas.map((mensagem) => {
                        const isRemetente = mensagem.remetente_id === usuarioAtual?.id;
                        
                        return (
                          <div
                            key={mensagem.id}
                            className={`flex ${isRemetente ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isRemetente
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                            }`}>
                              <div className="flex items-center space-x-2 mb-1">
                                {getTipoIcon(mensagem.tipo)}
                                <span className="text-xs opacity-75">
                                  {mensagem.remetente?.nome}
                                </span>
                              </div>
                              <p className="text-sm">{mensagem.mensagem}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs opacity-75">
                                  {formatTime(mensagem.created_at)}
                                </span>
                                {isRemetente && (
                                  <div className="flex items-center space-x-1">
                                    {mensagem.lida ? (
                                      <CheckCircle className="h-3 w-3 text-blue-300" />
                                    ) : (
                                      <Clock className="h-3 w-3 text-blue-300" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input de Mensagem */}
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Paperclip size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Image size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Smile size={16} />
                      </button>
                      <input
                        type="text"
                        placeholder="Digite sua mensagem..."
                        value={novaMensagem}
                        onChange={(e) => setNovaMensagem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                      <button
                        onClick={enviarMensagem}
                        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Selecione uma conversa
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Escolha uma conversa para começar a conversar
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterno;
