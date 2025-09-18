// ============================================================================
// SERVIÇO: NotificationService - Gerenciamento de Notificações em Tempo Real
// ============================================================================
// Este serviço gerencia notificações do sistema integrando com dados reais
// de agendamentos, pagamentos, pacientes e outras operações.
// ============================================================================

import React from 'react';
import { getDatabase } from '@/lib/connectivityManager';
import toast from 'react-hot-toast';

// Declarações globais para resolver erros de tipo
declare global {
  interface NotificationOptions {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    requireInteraction?: boolean;
    silent?: boolean;
    timestamp?: number;
    vibrate?: number[];
    actions?: NotificationAction[];
  }

  interface NotificationAction {
    action: string;
    title: string;
    icon?: string;
  }

  interface ShareData {
    title?: string;
    text?: string;
    url?: string;
    files?: File[];
  }

  interface IntersectionObserverInit {
    root?: Element | null;
    rootMargin?: string;
    threshold?: number | number[];
  }

  namespace NodeJS {
    interface Timeout {
      ref(): NodeJS.Timeout;
      unref(): NodeJS.Timeout;
      refresh(): NodeJS.Timeout;
      hasRef(): boolean;
    }
  }
}

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'success' | 'warning' | 'error' | 'reminder' | 'payment' | 'appointment';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  lida: boolean;
  favorita: boolean;
  arquivada: boolean;
  dataCriacao: string;
  dataLeitura?: string;
  link?: string;
  acoes?: NotificacaoAcao[];
  remetente?: string;
  icone?: string;
  cor?: string;
  usuario_id?: string;
  dados_relacionados?: any;
}

export interface NotificacaoAcao {
  id: string;
  label: string;
  acao: () => void;
  cor: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  icone?: React.ComponentType<any>;
}

// ============================================================================
// CLASSE PRINCIPAL
// ============================================================================

export class NotificationService {
  private static instance: NotificationService;
  private notificacoes: Notificacao[] = [];
  private listeners: ((notificacoes: Notificacao[]) => void)[] = [];

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // ============================================================================
  // INICIALIZAÇÃO
  // ============================================================================

  private async initializeService() {
    try {
      await this.loadNotificacoes();
      await this.startRealTimeMonitoring();
    } catch (error) {
      console.error('Erro ao inicializar serviço de notificações:', error);
    }
  }

  // ============================================================================
  // CARREGAMENTO DE DADOS
  // ============================================================================

  public async loadNotificacoes(): Promise<Notificacao[]> {
    try {
      const db = await getDatabase();
      
      // Buscar notificações do banco de dados
      const { data, error } = await db
        .from('notificacoes')
        .select('*')
        .order('data_criacao', { ascending: false })
        .limit(100);

      if (error) {
        console.warn('Erro ao buscar notificações do banco:', error);
        // Usar dados mock como fallback
        this.notificacoes = this.getMockNotificacoes();
      } else {
        this.notificacoes = data?.map(this.mapDatabaseToNotificacao) || [];
      }

      this.notifyListeners();
      return this.notificacoes;
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      this.notificacoes = this.getMockNotificacoes();
      this.notifyListeners();
      return this.notificacoes;
    }
  }

  // ============================================================================
  // MONITORAMENTO EM TEMPO REAL
  // ============================================================================

  private async startRealTimeMonitoring() {
    try {
      // Verificar agendamentos próximos
      await this.checkAgendamentosProximos();
      
      // Verificar pagamentos pendentes
      await this.checkPagamentosPendentes();
      
      // Verificar novos pacientes
      await this.checkNovosPacientes();
      
      // Verificar backup
      await this.checkBackupStatus();
      
    } catch (error) {
      console.error('Erro no monitoramento em tempo real:', error);
    }
  }

  // ============================================================================
  // VERIFICAÇÕES AUTOMÁTICAS
  // ============================================================================

  private async checkAgendamentosProximos() {
    try {
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(hoje.getDate() + 1);

      const db = await getDatabase();
      const { data: agendamentos } = await db
        .from('agendamentos')
        .select(`
          *,
          pacientes (nome, telefone),
          profissionais (nome, especialidade),
          servicos (nome, duracao_min)
        `)
        .eq('data', amanha.toISOString().split('T')[0])
        .eq('status', 'agendado');

      if (agendamentos && agendamentos.length > 0) {
        await this.criarNotificacao({
          titulo: 'Agendamentos para amanhã',
          mensagem: `Você tem ${agendamentos.length} agendamento(s) para amanhã`,
          tipo: 'reminder',
          prioridade: 'media',
          link: '/app/agenda',
          dados_relacionados: agendamentos
        });
      }
    } catch (error) {
      console.error('Erro ao verificar agendamentos próximos:', error);
    }
  }

  private async checkPagamentosPendentes() {
    try {
      const db = await getDatabase();
      const { data: pagamentos } = await db
        .from('pagamentos')
        .select('*')
        .eq('status', 'pendente')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (pagamentos && pagamentos.length > 0) {
        await this.criarNotificacao({
          titulo: 'Pagamentos pendentes',
          mensagem: `${pagamentos.length} pagamento(s) aguardando confirmação`,
          tipo: 'payment',
          prioridade: 'alta',
          link: '/app/financeiro',
          dados_relacionados: pagamentos
        });
      }
    } catch (error) {
      console.error('Erro ao verificar pagamentos pendentes:', error);
    }
  }

  private async checkNovosPacientes() {
    try {
      const db = await getDatabase();
      const { data: pacientes } = await db
        .from('pacientes')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (pacientes && pacientes.length > 0) {
        await this.criarNotificacao({
          titulo: 'Novos pacientes cadastrados',
          mensagem: `${pacientes.length} novo(s) paciente(s) cadastrado(s) hoje`,
          tipo: 'info',
          prioridade: 'baixa',
          link: '/app/pacientes',
          dados_relacionados: pacientes
        });
      }
    } catch (error) {
      console.error('Erro ao verificar novos pacientes:', error);
    }
  }

  private async checkBackupStatus() {
    try {
      const db = await getDatabase();
      const { data: backups } = await db
        .from('logs_sistema')
        .select('*')
        .eq('acao', 'backup')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (!backups || backups.length === 0) {
        await this.criarNotificacao({
          titulo: 'Backup em atraso',
          mensagem: 'Nenhum backup foi realizado nas últimas 24 horas',
          tipo: 'warning',
          prioridade: 'alta',
          link: '/app/backup'
        });
      }
    } catch (error) {
      console.error('Erro ao verificar status do backup:', error);
    }
  }

  // ============================================================================
  // CRIAÇÃO DE NOTIFICAÇÕES
  // ============================================================================

  public async criarNotificacao(notificacao: Partial<Notificacao>): Promise<void> {
    try {
      const novaNotificacao: Notificacao = {
        id: Date.now().toString(),
        titulo: notificacao.titulo || 'Nova notificação',
        mensagem: notificacao.mensagem || '',
        tipo: notificacao.tipo || 'info',
        prioridade: notificacao.prioridade || 'media',
        lida: false,
        favorita: false,
        arquivada: false,
        dataCriacao: new Date().toISOString(),
        link: notificacao.link,
        acoes: notificacao.acoes,
        remetente: notificacao.remetente || 'Sistema',
        dados_relacionados: notificacao.dados_relacionados,
        ...notificacao
      };

      // Adicionar ao array local
      this.notificacoes.unshift(novaNotificacao);
      
      // Salvar no banco de dados
      await this.salvarNotificacaoNoBanco(novaNotificacao);
      
      // Notificar listeners
      this.notifyListeners();
      
      // Mostrar toast
      this.showNotificationToast(novaNotificacao);
      
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
    }
  }

  private async salvarNotificacaoNoBanco(notificacao: Notificacao): Promise<void> {
    try {
      const db = await getDatabase();
      const { error } = await db
        .from('notificacoes')
        .insert({
          titulo: notificacao.titulo,
          mensagem: notificacao.mensagem,
          tipo: notificacao.tipo,
          prioridade: notificacao.prioridade,
          lida: notificacao.lida,
          favorita: notificacao.favorita,
          arquivada: notificacao.arquivada,
          data_criacao: notificacao.dataCriacao,
          data_leitura: notificacao.dataLeitura,
          link: notificacao.link,
          remetente: notificacao.remetente,
          dados_relacionados: notificacao.dados_relacionados
        });

      if (error) {
        console.warn('Erro ao salvar notificação no banco:', error);
      }
    } catch (error) {
      console.error('Erro ao salvar notificação:', error);
    }
  }

  private showNotificationToast(notificacao: Notificacao): void {
    const toastOptions = {
      duration: 4000,
      icon: this.getTipoIcon(notificacao.tipo)
    };

    switch (notificacao.tipo) {
      case 'success':
        toast.success(notificacao.titulo, toastOptions);
        break;
      case 'error':
        toast.error(notificacao.titulo, toastOptions);
        break;
      case 'warning':
        toast(notificacao.titulo, { ...toastOptions, icon: '⚠️' });
        break;
      default:
        toast(notificacao.titulo, toastOptions);
    }
  }

  // ============================================================================
  // AÇÕES DE NOTIFICAÇÕES
  // ============================================================================

  public async marcarComoLida(id: string): Promise<void> {
    try {
      const notificacao = this.notificacoes.find(n => n.id === id);
      if (notificacao) {
        notificacao.lida = true;
        notificacao.dataLeitura = new Date().toISOString();
        
        // Atualizar no banco
        await this.atualizarNotificacaoNoBanco(id, { lida: true, data_leitura: notificacao.dataLeitura });
        
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }

  public async toggleFavorita(id: string): Promise<void> {
    try {
      const notificacao = this.notificacoes.find(n => n.id === id);
      if (notificacao) {
        notificacao.favorita = !notificacao.favorita;
        
        // Atualizar no banco
        await this.atualizarNotificacaoNoBanco(id, { favorita: notificacao.favorita });
        
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Erro ao toggle favorita:', error);
    }
  }

  public async arquivar(id: string): Promise<void> {
    try {
      const notificacao = this.notificacoes.find(n => n.id === id);
      if (notificacao) {
        notificacao.arquivada = true;
        
        // Atualizar no banco
        await this.atualizarNotificacaoNoBanco(id, { arquivada: true });
        
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Erro ao arquivar notificação:', error);
    }
  }

  public async excluir(id: string): Promise<void> {
    try {
      this.notificacoes = this.notificacoes.filter(n => n.id !== id);
      
      // Remover do banco
      await this.removerNotificacaoDoBanco(id);
      
      this.notifyListeners();
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
    }
  }

  // ============================================================================
  // OPERAÇÕES NO BANCO DE DADOS
  // ============================================================================

  private async atualizarNotificacaoNoBanco(id: string, updates: any): Promise<void> {
    try {
      const db = await getDatabase();
      await db
        .from('notificacoes')
        .update(updates)
        .eq('id', id);
    } catch (error) {
      console.warn('Erro ao atualizar notificação no banco:', error);
    }
  }

  private async removerNotificacaoDoBanco(id: string): Promise<void> {
    try {
      const db = await getDatabase();
      await db
        .from('notificacoes')
        .delete()
        .eq('id', id);
    } catch (error) {
      console.warn('Erro ao remover notificação do banco:', error);
    }
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  private mapDatabaseToNotificacao(data: any): Notificacao {
    return {
      id: data.id,
      titulo: data.titulo,
      mensagem: data.mensagem,
      tipo: data.tipo,
      prioridade: data.prioridade,
      lida: data.lida,
      favorita: data.favorita,
      arquivada: data.arquivada,
      dataCriacao: data.data_criacao,
      dataLeitura: data.data_leitura,
      link: data.link,
      remetente: data.remetente,
      dados_relacionados: data.dados_relacionados
    };
  }

  private getTipoIcon(tipo: string): string {
    switch (tipo) {
      case 'appointment': return '📅';
      case 'payment': return '💰';
      case 'reminder': return '⏰';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '🔔';
    }
  }

  private getMockNotificacoes(): Notificacao[] {
    return [
      {
        id: '1',
        titulo: 'Sistema inicializado',
        mensagem: 'O sistema foi carregado com sucesso e está pronto para uso',
        tipo: 'success',
        prioridade: 'baixa',
        lida: false,
        favorita: false,
        arquivada: false,
        dataCriacao: new Date().toISOString(),
        remetente: 'Sistema'
      }
    ];
  }

  // ============================================================================
  // LISTENERS E OBSERVADORES
  // ============================================================================

  public subscribe(listener: (notificacoes: Notificacao[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notificacoes]));
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  public getNotificacoes(): Notificacao[] {
    return [...this.notificacoes];
  }

  public getNotificacoesNaoLidas(): Notificacao[] {
    return this.notificacoes.filter(n => !n.lida && !n.arquivada);
  }

  public getNotificacoesFavoritas(): Notificacao[] {
    return this.notificacoes.filter(n => n.favorita && !n.arquivada);
  }

  public getNotificacoesArquivadas(): Notificacao[] {
    return this.notificacoes.filter(n => n.arquivada);
  }

  public getTotalNotificacoes(): number {
    return this.notificacoes.length;
  }

  public getTotalNaoLidas(): number {
    return this.getNotificacoesNaoLidas().length;
  }
}

// ============================================================================
// INSTÂNCIA SINGLETON
// ============================================================================

export const notificationService = NotificationService.getInstance();

// ============================================================================
// FUNÇÕES DE CONVENIÊNCIA
// ============================================================================

export const criarNotificacaoAgendamento = async (agendamento: any) => {
  await notificationService.criarNotificacao({
    titulo: 'Novo agendamento',
    mensagem: `Agendamento criado para ${agendamento.paciente?.nome || 'paciente'}`,
    tipo: 'appointment',
    prioridade: 'media',
    link: '/app/agenda',
    dados_relacionados: agendamento
  });
};

export const criarNotificacaoPagamento = async (pagamento: any) => {
  await notificationService.criarNotificacao({
    titulo: 'Pagamento recebido',
    mensagem: `Pagamento de R$ ${pagamento.valor} recebido`,
    tipo: 'payment',
    prioridade: 'alta',
    link: '/app/financeiro',
    dados_relacionados: pagamento
  });
};

export const criarNotificacaoPaciente = async (paciente: any) => {
  await notificationService.criarNotificacao({
    titulo: 'Novo paciente cadastrado',
    mensagem: `${paciente.nome} foi cadastrado no sistema`,
    tipo: 'info',
    prioridade: 'baixa',
    link: '/app/pacientes',
    dados_relacionados: paciente
  });
};
