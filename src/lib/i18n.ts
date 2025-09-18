import React from 'react'

// Declarações globais para tipos de Event
declare global {
  interface EventListener {
    (evt: Event): void;
  }

  interface Event {
    type: string;
    target?: EventTarget | null;
    currentTarget?: EventTarget | null;
    preventDefault(): void;
    stopPropagation(): void;
    stopImmediatePropagation(): void;
    bubbles: boolean;
    cancelable: boolean;
    defaultPrevented: boolean;
    eventPhase: number;
    isTrusted: boolean;
    timeStamp: number;
  }

  interface EventTarget {
    addEventListener(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: string, listener: EventListener, options?: boolean | EventListenerOptions): void;
    dispatchEvent(event: Event): boolean;
  }

  interface AddEventListenerOptions {
    capture?: boolean;
    once?: boolean;
    passive?: boolean;
    signal?: AbortSignal;
  }

  interface EventListenerOptions {
    capture?: boolean;
  }
}

export interface Translation {
  [key: string]: string | Translation
}

export interface I18nConfig {
  defaultLocale: string
  fallbackLocale: string
  locales: string[]
  namespaces: string[]
}

// Configuração do sistema de internacionalização
export const i18nConfig: I18nConfig = {
  defaultLocale: 'pt-BR',
  fallbackLocale: 'pt-BR',
  locales: ['pt-BR', 'en-US', 'es-ES'],
  namespaces: ['common', 'auth', 'dashboard', 'agenda', 'pacientes', 'usuarios', 'configuracoes']
}

// Traduções em português (padrão)
export const ptBR: Record<string, Translation> = {
  common: {
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    cancel: 'Cancelar',
    save: 'Salvar',
    edit: 'Editar',
    delete: 'Excluir',
    confirm: 'Confirmar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    search: 'Buscar',
    filter: 'Filtrar',
    clear: 'Limpar',
    actions: 'Ações',
    status: 'Status',
    date: 'Data',
    time: 'Hora',
    name: 'Nome',
    email: 'E-mail',
    phone: 'Telefone',
    address: 'Endereço',
    save_success: 'Salvo com sucesso!',
    delete_success: 'Excluído com sucesso!',
    update_success: 'Atualizado com sucesso!',
    create_success: 'Criado com sucesso!',
    error_occurred: 'Ocorreu um erro',
    confirm_delete: 'Tem certeza que deseja excluir?',
    no_data: 'Nenhum dado encontrado',
    total_items: 'Total de itens',
    items_per_page: 'Itens por página',
    showing: 'Mostrando',
    of: 'de',
    to: 'até'
  },
  
  auth: {
    login: 'Entrar',
    logout: 'Sair',
    signup: 'Cadastrar',
    email: 'E-mail',
    password: 'Senha',
    confirm_password: 'Confirmar Senha',
    forgot_password: 'Esqueceu sua senha?',
    remember_me: 'Lembrar de mim',
    login_success: 'Login realizado com sucesso!',
    logout_success: 'Logout realizado com sucesso!',
    invalid_credentials: 'Credenciais inválidas',
    password_mismatch: 'As senhas não coincidem',
    password_requirements: 'A senha deve ter pelo menos 3 caracteres',
    account_created: 'Conta criada com sucesso!',
    email_confirmation_sent: 'Email de confirmação enviado!',
    reset_password_sent: 'Email de redefinição enviado!',
    password_reset_success: 'Senha redefinida com sucesso!'
  },
  
  dashboard: {
    title: 'Dashboard',
    overview: 'Visão Geral',
    statistics: 'Estatísticas',
    recent_activity: 'Atividade Recente',
    total_patients: 'Total de Pacientes',
    total_professionals: 'Total de Profissionais',
    total_services: 'Total de Serviços',
    appointments_today: 'Agendamentos Hoje',
    monthly_revenue: 'Receita Mensal',
    system_status: 'Status do Sistema',
    last_update: 'Última Atualização',
    active_system: 'Sistema Ativo',
    system_offline: 'Sistema Offline'
  },
  
  agenda: {
    title: 'Agenda',
    new_appointment: 'Novo Agendamento',
    edit_appointment: 'Editar Agendamento',
    appointment_details: 'Detalhes do Agendamento',
    patient: 'Paciente',
    professional: 'Profissional',
    service: 'Serviço',
    date: 'Data',
    time: 'Hora',
    duration: 'Duração',
    observations: 'Observações',
    status: {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      completed: 'Realizado',
      cancelled: 'Cancelado',
      no_show: 'Ausente'
    },
    filters: {
      date_range: 'Período',
      status: 'Status',
      professional: 'Profissional',
      service: 'Serviço'
    }
  },
  
  pacientes: {
    title: 'Pacientes',
    new_patient: 'Novo Paciente',
    edit_patient: 'Editar Paciente',
    patient_details: 'Detalhes do Paciente',
    cpf: 'CPF',
    birth_date: 'Data de Nascimento',
    age: 'Idade',
    gender: 'Sexo',
    marital_status: 'Estado Civil',
    occupation: 'Profissão',
    emergency_contact: 'Contato de Emergência',
    medical_history: 'Histórico Médico',
    allergies: 'Alergias',
    medications: 'Medicamentos',
    insurance: 'Convênio',
    insurance_number: 'Número do Convênio'
  },
  
  usuarios: {
    title: 'Usuários',
    new_user: 'Novo Usuário',
    edit_user: 'Editar Usuário',
    user_details: 'Detalhes do Usuário',
    role: 'Função',
    access_level: 'Nível de Acesso',
    permissions: 'Permissões',
    last_login: 'Último Login',
    account_status: 'Status da Conta',
    active: 'Ativo',
    inactive: 'Inativo',
    suspended: 'Suspenso',
    roles: {
      admin: 'Administrador',
      manager: 'Gerente',
      user: 'Usuário',
      reception: 'Recepcionista',
      professional: 'Profissional'
    }
  },
  
  configuracoes: {
    title: 'Configurações',
    general: 'Geral',
    notifications: 'Notificações',
    security: 'Segurança',
    appearance: 'Aparência',
    backup: 'Backup',
    integration: 'Integração',
    clinic_name: 'Nome da Clínica',
    clinic_address: 'Endereço da Clínica',
    clinic_phone: 'Telefone da Clínica',
    clinic_email: 'E-mail da Clínica',
    cnpj: 'CNPJ',
    timezone: 'Fuso Horário',
    language: 'Idioma',
    theme: 'Tema',
    auto_backup: 'Backup Automático',
    email_notifications: 'Notificações por E-mail',
    sms_notifications: 'Notificações por SMS'
  }
}

// Traduções em inglês
export const enUS: Record<string, Translation> = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    save_success: 'Saved successfully!',
    delete_success: 'Deleted successfully!',
    update_success: 'Updated successfully!',
    create_success: 'Created successfully!',
    error_occurred: 'An error occurred',
    confirm_delete: 'Are you sure you want to delete?',
    no_data: 'No data found',
    total_items: 'Total items',
    items_per_page: 'Items per page',
    showing: 'Showing',
    of: 'of',
    to: 'to'
  },
  
  auth: {
    login: 'Login',
    logout: 'Logout',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirm_password: 'Confirm Password',
    forgot_password: 'Forgot your password?',
    remember_me: 'Remember me',
    login_success: 'Login successful!',
    logout_success: 'Logout successful!',
    invalid_credentials: 'Invalid credentials',
    password_mismatch: 'Passwords do not match',
    password_requirements: 'Password must be at least 3 characters',
    account_created: 'Account created successfully!',
    email_confirmation_sent: 'Email confirmation sent!',
    reset_password_sent: 'Password reset email sent!',
    password_reset_success: 'Password reset successfully!'
  },
  
  dashboard: {
    title: 'Dashboard',
    overview: 'Overview',
    statistics: 'Statistics',
    recent_activity: 'Recent Activity',
    total_patients: 'Total Patients',
    total_professionals: 'Total Professionals',
    total_services: 'Total Services',
    appointments_today: 'Appointments Today',
    monthly_revenue: 'Monthly Revenue',
    system_status: 'System Status',
    last_update: 'Last Update',
    active_system: 'System Active',
    system_offline: 'System Offline'
  },
  
  agenda: {
    title: 'Schedule',
    new_appointment: 'New Appointment',
    edit_appointment: 'Edit Appointment',
    appointment_details: 'Appointment Details',
    patient: 'Patient',
    professional: 'Professional',
    service: 'Service',
    date: 'Date',
    time: 'Time',
    duration: 'Duration',
    observations: 'Observations',
    status: {
      scheduled: 'Scheduled',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
      no_show: 'No Show'
    },
    filters: {
      date_range: 'Date Range',
      status: 'Status',
      professional: 'Professional',
      service: 'Service'
    }
  },
  
  pacientes: {
    title: 'Patients',
    new_patient: 'New Patient',
    edit_patient: 'Edit Patient',
    patient_details: 'Patient Details',
    cpf: 'CPF',
    birth_date: 'Birth Date',
    age: 'Age',
    gender: 'Gender',
    marital_status: 'Marital Status',
    occupation: 'Occupation',
    emergency_contact: 'Emergency Contact',
    medical_history: 'Medical History',
    allergies: 'Allergies',
    medications: 'Medications',
    insurance: 'Insurance',
    insurance_number: 'Insurance Number'
  },
  
  usuarios: {
    title: 'Users',
    new_user: 'New User',
    edit_user: 'Edit User',
    user_details: 'User Details',
    role: 'Role',
    access_level: 'Access Level',
    permissions: 'Permissions',
    last_login: 'Last Login',
    account_status: 'Account Status',
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    roles: {
      admin: 'Administrator',
      manager: 'Manager',
      user: 'User',
      reception: 'Receptionist',
      professional: 'Professional'
    }
  },
  
  
  configuracoes: {
    title: 'Settings',
    general: 'General',
    notifications: 'Notifications',
    security: 'Security',
    appearance: 'Appearance',
    backup: 'Backup',
    integration: 'Integration',
    clinic_name: 'Clinic Name',
    clinic_address: 'Clinic Address',
    clinic_phone: 'Clinic Phone',
    clinic_email: 'Clinic Email',
    cnpj: 'CNPJ',
    timezone: 'Timezone',
    language: 'Language',
    theme: 'Theme',
    auto_backup: 'Auto Backup',
    email_notifications: 'Email Notifications',
    sms_notifications: 'SMS Notifications'
  }
}

// Traduções em espanhol
export const esES: Record<string, Translation> = {
  common: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    save: 'Guardar',
    edit: 'Editar',
    delete: 'Eliminar',
    confirm: 'Confirmar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    search: 'Buscar',
    filter: 'Filtrar',
    clear: 'Limpiar',
    actions: 'Acciones',
    status: 'Estado',
    date: 'Fecha',
    time: 'Hora',
    name: 'Nombre',
    email: 'Correo',
    phone: 'Teléfono',
    address: 'Dirección',
    save_success: '¡Guardado exitosamente!',
    delete_success: '¡Eliminado exitosamente!',
    update_success: '¡Actualizado exitosamente!',
    create_success: '¡Creado exitosamente!',
    error_occurred: 'Ocurrió un error',
    confirm_delete: '¿Está seguro de que desea eliminar?',
    no_data: 'No se encontraron datos',
    total_items: 'Total de elementos',
    items_per_page: 'Elementos por página',
    showing: 'Mostrando',
    of: 'de',
    to: 'a'
  },
  
  auth: {
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    signup: 'Registrarse',
    email: 'Correo',
    password: 'Contraseña',
    confirm_password: 'Confirmar Contraseña',
    forgot_password: '¿Olvidó su contraseña?',
    remember_me: 'Recordarme',
    login_success: '¡Inicio de sesión exitoso!',
    logout_success: '¡Cierre de sesión exitoso!',
    invalid_credentials: 'Credenciales inválidas',
    password_mismatch: 'Las contraseñas no coinciden',
    password_requirements: 'La contraseña debe tener al menos 3 caracteres',
    account_created: '¡Cuenta creada exitosamente!',
    email_confirmation_sent: '¡Correo de confirmación enviado!',
    reset_password_sent: '¡Correo de restablecimiento enviado!',
    password_reset_success: '¡Contraseña restablecida exitosamente!'
  },
  
  dashboard: {
    title: 'Panel de Control',
    overview: 'Resumen',
    statistics: 'Estadísticas',
    recent_activity: 'Actividad Reciente',
    total_patients: 'Total de Pacientes',
    total_professionals: 'Total de Profesionales',
    total_services: 'Total de Servicios',
    appointments_today: 'Citas Hoy',
    monthly_revenue: 'Ingresos Mensuales',
    system_status: 'Estado del Sistema',
    last_update: 'Última Actualización',
    active_system: 'Sistema Activo',
    system_offline: 'Sistema Desconectado'
  },
  
  agenda: {
    title: 'Agenda',
    new_appointment: 'Nueva Cita',
    edit_appointment: 'Editar Cita',
    appointment_details: 'Detalles de la Cita',
    patient: 'Paciente',
    professional: 'Profesional',
    service: 'Servicio',
    date: 'Fecha',
    time: 'Hora',
    duration: 'Duración',
    observations: 'Observaciones',
    status: {
      scheduled: 'Programada',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada',
      no_show: 'No Presentó'
    },
    filters: {
      date_range: 'Rango de Fechas',
      status: 'Estado',
      professional: 'Profesional',
      service: 'Servicio'
    }
  },
  
  pacientes: {
    title: 'Pacientes',
    new_patient: 'Nuevo Paciente',
    edit_patient: 'Editar Paciente',
    patient_details: 'Detalles del Paciente',
    cpf: 'CPF',
    birth_date: 'Fecha de Nacimiento',
    age: 'Edad',
    gender: 'Género',
    marital_status: 'Estado Civil',
    occupation: 'Ocupación',
    emergency_contact: 'Contacto de Emergencia',
    medical_history: 'Historial Médico',
    allergies: 'Alergias',
    medications: 'Medicamentos',
    insurance: 'Seguro',
    insurance_number: 'Número de Seguro'
  },
  
  configuracoes: {
    title: 'Configuración',
    general: 'General',
    notifications: 'Notificaciones',
    security: 'Seguridad',
    appearance: 'Apariencia',
    backup: 'Respaldo',
    integration: 'Integración',
    clinic_name: 'Nombre de la Clínica',
    clinic_address: 'Dirección de la Clínica',
    clinic_phone: 'Teléfono de la Clínica',
    clinic_email: 'Correo de la Clínica',
    cnpj: 'CNPJ',
    timezone: 'Zona Horaria',
    language: 'Idioma',
    theme: 'Tema',
    auto_backup: 'Respaldo Automático',
    email_notifications: 'Notificaciones por Correo',
    sms_notifications: 'Notificaciones por SMS'
  }
}

// Mapa de traduções por idioma
const translations: Record<string, Record<string, Translation>> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES
}

// Classe principal de internacionalização
class I18n {
  private currentLocale: string
  private fallbackLocale: string

  constructor() {
    this.currentLocale = this.getStoredLocale() || i18nConfig.defaultLocale
    this.fallbackLocale = i18nConfig.fallbackLocale
  }

  /**
   * Obtém o idioma atual
   */
  getCurrentLocale(): string {
    return this.currentLocale
  }

  /**
   * Define o idioma atual
   */
  setLocale(locale: string): void {
    if (i18nConfig.locales.includes(locale)) {
      this.currentLocale = locale
      localStorage.setItem('i18n_locale', locale)
      
      // Disparar evento de mudança de idioma
      window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale } }))
    }
  }

  /**
   * Obtém o idioma armazenado
   */
  private getStoredLocale(): string | null {
    return localStorage.getItem('i18n_locale')
  }

  /**
   * Traduz uma chave
   */
  t(key: string, namespace: string = 'common'): string {
    const keys = key.split('.')
    let translation: any = translations[this.currentLocale]?.[namespace] || 
                          translations[this.fallbackLocale]?.[namespace]

    // Navegar pela estrutura de tradução
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k]
      } else {
        // Fallback para o idioma padrão
        translation = translations[this.fallbackLocale]?.[namespace]
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object' && fallbackKey in translation) {
            translation = translation[fallbackKey]
          } else {
            return key // Retornar a chave se não encontrar tradução
          }
        }
        break
      }
    }

    return typeof translation === 'string' ? translation : key
  }

  /**
   * Traduz com parâmetros
   */
  tWithParams(key: string, params: Record<string, string | number>, namespace: string = 'common'): string {
    let translation = this.t(key, namespace)
    
    // Substituir parâmetros
    for (const [param, value] of Object.entries(params)) {
      translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), String(value))
    }
    
    return translation
  }

  /**
   * Obtém todas as traduções para um namespace
   */
  getNamespaceTranslations(namespace: string): Translation | null {
    return translations[this.currentLocale]?.[namespace] || 
           translations[this.fallbackLocale]?.[namespace] || 
           null
  }

  /**
   * Verifica se uma chave existe
   */
  hasKey(key: string, namespace: string = 'common'): boolean {
    const keys = key.split('.')
    let translation: any = translations[this.currentLocale]?.[namespace] || 
                          translations[this.fallbackLocale]?.[namespace]

    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k]
      } else {
        return false
      }
    }

    return typeof translation === 'string'
  }

  /**
   * Obtém a lista de idiomas disponíveis
   */
  getAvailableLocales(): string[] {
    return i18nConfig.locales
  }

  /**
   * Obtém informações do idioma
   */
  getLocaleInfo(locale: string) {
    const localeNames: Record<string, string> = {
      'pt-BR': 'Português (Brasil)',
      'en-US': 'English (US)',
      'es-ES': 'Español'
    }

    return {
      code: locale,
      name: localeNames[locale] || locale,
      flag: locale.split('-')[1]?.toLowerCase() || locale
    }
  }
}

// Instância global
export const i18n = new I18n()

// Hook para React
export function useTranslation(namespace: string = 'common') {
  const [locale, setLocale] = React.useState(i18n.getCurrentLocale())

  React.useEffect(() => {
    const handleLocaleChange = (event: CustomEvent) => {
      setLocale(event.detail.locale)
    }

    window.addEventListener('localeChanged', handleLocaleChange as EventListener)
    
    return () => {
      window.removeEventListener('localeChanged', handleLocaleChange as EventListener)
    }
  }, [])

  const t = React.useCallback((key: string) => i18n.t(key, namespace), [namespace])
  const tWithParams = React.useCallback((key: string, params: Record<string, string | number>) => 
    i18n.tWithParams(key, params, namespace), [namespace])

  return {
    t,
    tWithParams,
    locale,
    setLocale: (newLocale: string) => i18n.setLocale(newLocale),
    availableLocales: i18n.getAvailableLocales(),
    localeInfo: i18n.getLocaleInfo(locale)
  }
}

// Função de tradução direta (para uso fora de componentes React)
export function t(key: string, namespace: string = 'common'): string {
  return i18n.t(key, namespace)
}

export function tWithParams(key: string, params: Record<string, string | number>, namespace: string = 'common'): string {
  return i18n.tWithParams(key, params, namespace)
}

export default i18n
