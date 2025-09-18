// ============================================================================
// TIPOS GLOBAIS DO SISTEMA CLÍNICO
// ============================================================================
// Definições de tipos compartilhados em toda a aplicação
// ============================================================================

import React from 'react';

// ============================================================================
// TIPOS DE USUÁRIO E AUTENTICAÇÃO
// ============================================================================

export type UserRole =
  | 'admin'
  | 'recepcao'
  | 'profissional'
  | 'usuario'
  | 'gerente'
  | 'desenvolvedor';

export interface User {
  id: string;
  nome: string;
  cpf: string;
  email?: string;
  nivel_acesso: UserRole;
  primeiro_acesso: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser extends User {
  must_change_password?: boolean;
  user_metadata: {
    nome: string;
    nivel_acesso: UserRole;
    primeiro_acesso: boolean;
  };
}

// ============================================================================
// TIPOS DE PACIENTE
// ============================================================================

export interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  data_nascimento: string;
  genero: 'masculino' | 'feminino' | 'outro';
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  convenio?: string;
  categoria?: string;
  tags?: string;
  favorito?: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TIPOS DE PROFISSIONAL
// ============================================================================

export interface Profissional {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  especialidade: string;
  crm?: string;
  crm_cro?: string;
  observacoes?: string;
  ativo: boolean;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TIPOS DE SERVIÇO
// ============================================================================

export interface Servico {
  id: number;
  nome: string;
  descricao?: string;
  duracao_min: number;
  preco: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TIPOS DE AGENDAMENTO
// ============================================================================

export type AgendamentoStatus =
  | 'Agendado'
  | 'Confirmado'
  | 'Realizado'
  | 'Cancelado'
  | 'Falta'
  | 'agendado'
  | 'confirmado'
  | 'realizado'
  | 'cancelado'
  | 'falta';

export interface Agendamento {
  id: number;
  paciente_id: number;
  profissional_id: number;
  servico_id: number;
  data: string;
  hora: string;
  duracao: number;
  status: AgendamentoStatus;
  origem: string;
  valor_pago: number;
  observacoes?: string;
  data_cadastro: string;
  ultima_atualizacao: string;
  // Relacionamentos
  pacientes?: {
    nome: string;
    telefone: string;
  };
  profissionais?: {
    nome: string;
    especialidade: string;
  };
  servicos?: {
    nome: string;
    duracao: number;
    valor: number;
  };
  pagamentos?: Array<{
    status: string;
    valor: number;
    forma_pagamento: string;
  }>;
}

// ============================================================================
// TIPOS DE NOTIFICAÇÃO
// ============================================================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

// ============================================================================
// TIPOS DE MODAL
// ============================================================================

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalState {
  isOpen: boolean;
  content: React.ReactNode | null;
  title?: string;
  size?: ModalSize;
}

// ============================================================================
// TIPOS DE BREADCRUMB
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

// ============================================================================
// TIPOS DE CONFIGURAÇÕES
// ============================================================================

export type Theme = 'light' | 'dark' | 'auto';

export interface AppSettings {
  theme: Theme;
  language: string;
  timezone: string;
}

// ============================================================================
// TIPOS DE FILTROS
// ============================================================================

export interface FilterState {
  [key: string]: unknown;
}

// ============================================================================
// TIPOS DE SIDEBAR
// ============================================================================

export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
}

// ============================================================================
// TIPOS DE ESTADO DA APLICAÇÃO
// ============================================================================

export interface AppState {
  isLoading: boolean;
  notifications: Notification[];
  modal: ModalState;
  sidebar: SidebarState;
  breadcrumb: {
    items: BreadcrumbItem[];
  };
  filters: FilterState;
  settings: AppSettings;
}

// ============================================================================
// TIPOS DE RESPOSTA DA API
// ============================================================================

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  count?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// ============================================================================
// TIPOS DE FORMULÁRIO
// ============================================================================

export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'date'
    | 'select'
    | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: unknown) => string | null;
  };
}

// ============================================================================
// TIPOS DE PAGINAÇÃO
// ============================================================================

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// TIPOS DE ORDENAÇÃO
// ============================================================================

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// TIPOS DE ESTATÍSTICAS
// ============================================================================

export interface MetricCard {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  color?: string;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

// ============================================================================
// TIPOS DE PERMISSÕES
// ============================================================================

export interface Permission {
  resource: string;
  actions: string[];
}

export interface UserPermissions {
  role: UserRole;
  permissions: Permission[];
}

// ============================================================================
// TIPOS DE EXPORTAÇÃO
// ============================================================================

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// ============================================================================
// TIPOS DE INTEGRAÇÃO
// ============================================================================

export interface WhatsAppMessage {
  to: string;
  message: string;
  template?: string;
  variables?: Record<string, string>;
}

export interface EmailMessage {
  to: string | string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

// ============================================================================
// TIPOS DE CACHE
// ============================================================================

export interface CacheItem<T = unknown> {
  key: string;
  value: T;
  expiresAt: number;
  createdAt: number;
}

// ============================================================================
// TIPOS DE VALIDAÇÃO
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// ============================================================================
// TIPOS DE TEMPLATE
// ============================================================================

// ============================================================================
// TIPOS DE GAMIFICAÇÃO
// ============================================================================

export type AchievementCategory =
  | 'agendamentos'
  | 'pacientes'
  | 'profissionais'
  | 'sistema'
  | 'consecutivo';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: AchievementCategory;
  requirement: {
    type: 'count' | 'streak' | 'value' | 'date';
    target: number;
    entity?: string;
  };
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
}

export interface UserStats {
  userId: string;
  level: number;
  experience: number;
  points: number;
  achievements: Achievement[];
  streak: number;
  lastActivity: string;
  totalAgendamentos: number;
  totalPacientes: number;
  totalProfissionais: number;
  created_at: string;
  updated_at: string;
}

export interface GamificationEvent {
  id: string;
  userId: string;
  type: 'achievement_unlocked' | 'level_up' | 'points_earned';
  data: Record<string, unknown>;
  timestamp: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  level: number;
  points: number;
  position: number;
  achievements: number;
}

// ============================================================================
// TIPOS DE TEMPLATES
// ============================================================================

export type TemplateType =
  | 'relatorio'
  | 'formulario'
  | 'email'
  | 'whatsapp'
  | 'sms'
  | 'documento';

export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'select'
    | 'textarea'
    | 'boolean'
    | 'image';
  required: boolean;
  defaultValue?: unknown;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  category: string;
  content: string;
  fields: TemplateField[];
  variables: string[];
  isActive: boolean;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  tags: string[];
}

export interface TemplateInstance {
  id: string;
  templateId: string;
  name: string;
  data: Record<string, unknown>;
  generatedContent: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status?: 'draft' | 'ready' | 'generating' | 'completed' | 'error';
}
