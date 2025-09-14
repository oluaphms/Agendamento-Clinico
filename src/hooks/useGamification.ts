import { useGamificationStore } from '@/stores/gamificationStore';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

/**
 * Hook para facilitar a integração da gamificação com outras partes do sistema
 */
export const useGamification = () => {
  const { user } = useAuthStore();
  const {
    userStats,
    loading,
    error,
    initializeUserStats,
    addPoints,
    checkAchievements,
    updateStreak,
  } = useGamificationStore();

  // Inicializar gamificação quando o usuário estiver logado
  useEffect(() => {
    if (user?.id && !userStats) {
      initializeUserStats(user.id);
    }
  }, [user?.id, userStats, initializeUserStats]);

  /**
   * Adiciona pontos e verifica conquistas para uma ação específica
   */
  const trackAction = async (
    action: string,
    points: number,
    reason: string,
    data?: Record<string, unknown>
  ) => {
    if (!userStats) return;

    try {
      // Adicionar pontos
      await addPoints(points, reason);

      // Verificar conquistas
      await checkAchievements(action, data);

      // Atualizar streak
      await updateStreak();
    } catch (error) {
      console.error('Erro ao rastrear ação:', error);
    }
  };

  /**
   * Rastreia criação de agendamento
   */
  const trackAppointmentCreated = async (appointmentData: {
    count: number;
    totalValue?: number;
    professionalId?: string;
  }) => {
    await trackAction(
      'agendamentos',
      5,
      'Criou um agendamento',
      appointmentData
    );
  };

  /**
   * Rastreia criação de paciente
   */
  const trackPatientCreated = async (patientData: {
    count: number;
    isNewPatient?: boolean;
  }) => {
    await trackAction('pacientes', 10, 'Cadastrou um paciente', patientData);
  };

  /**
   * Rastreia criação de profissional
   */
  const trackProfessionalCreated = async (professionalData: {
    count: number;
    specialty?: string;
  }) => {
    await trackAction(
      'profissionais',
      15,
      'Cadastrou um profissional',
      professionalData
    );
  };

  /**
   * Rastreia login do usuário
   */
  const trackLogin = async () => {
    const hour = new Date().getHours();
    await trackAction('login', 2, 'Fez login no sistema', { hour });
  };

  /**
   * Rastreia conclusão de agendamento
   */
  const trackAppointmentCompleted = async (appointmentData: {
    count: number;
    totalValue?: number;
    duration?: number;
  }) => {
    await trackAction(
      'agendamentos',
      8,
      'Concluiu um agendamento',
      appointmentData
    );
  };

  /**
   * Rastreia cancelamento de agendamento
   */
  const trackAppointmentCancelled = async (appointmentData: {
    count: number;
    reason?: string;
  }) => {
    await trackAction(
      'agendamentos',
      1,
      'Cancelou um agendamento',
      appointmentData
    );
  };

  /**
   * Rastreia atualização de perfil
   */
  const trackProfileUpdate = async (profileData: {
    fieldsUpdated: string[];
    isFirstUpdate?: boolean;
  }) => {
    await trackAction('sistema', 3, 'Atualizou o perfil', profileData);
  };

  /**
   * Rastreia uso de relatórios
   */
  const trackReportGenerated = async (reportData: {
    reportType: string;
    recordCount?: number;
    dateRange?: { start: string; end: string };
  }) => {
    await trackAction('sistema', 4, 'Gerou um relatório', reportData);
  };

  /**
   * Rastreia backup do sistema
   */
  const trackBackupCreated = async (backupData: {
    backupSize?: number;
    recordCount?: number;
  }) => {
    await trackAction('sistema', 20, 'Criou backup do sistema', backupData);
  };

  /**
   * Rastreia uso de templates
   */
  const trackTemplateUsed = async (templateData: {
    templateId: string;
    templateType: string;
    isCustom?: boolean;
  }) => {
    await trackAction('sistema', 5, 'Usou um template', templateData);
  };

  /**
   * Rastreia criação de template
   */
  const trackTemplateCreated = async (templateData: {
    templateType: string;
    fieldCount: number;
    isPublic: boolean;
  }) => {
    await trackAction('sistema', 15, 'Criou um template', templateData);
  };

  /**
   * Rastreia atividade de WhatsApp
   */
  const trackWhatsAppMessage = async (messageData: {
    messageType: 'reminder' | 'confirmation' | 'custom';
    recipientCount: number;
    templateUsed?: string;
  }) => {
    await trackAction('sistema', 3, 'Enviou mensagem WhatsApp', messageData);
  };

  /**
   * Rastreia acesso a funcionalidades específicas
   */
  const trackFeatureAccess = async (featureData: {
    featureName: string;
    isFirstAccess?: boolean;
    timeSpent?: number;
  }) => {
    await trackAction('sistema', 2, 'Acessou funcionalidade', featureData);
  };

  /**
   * Rastreia feedback do usuário
   */
  const trackUserFeedback = async (feedbackData: {
    feedbackType: 'rating' | 'suggestion' | 'bug_report';
    rating?: number;
    category?: string;
  }) => {
    await trackAction('sistema', 5, 'Enviou feedback', feedbackData);
  };

  /**
   * Rastreia tempo de sessão
   */
  const trackSessionTime = async (sessionData: {
    duration: number; // em minutos
    pagesVisited: string[];
    actionsPerformed: number;
  }) => {
    await trackAction(
      'sistema',
      Math.min(Math.floor(sessionData.duration / 10), 10),
      'Tempo de sessão',
      sessionData
    );
  };

  return {
    // Estado
    userStats,
    loading,
    error,

    // Métodos gerais
    trackAction,

    // Métodos específicos
    trackAppointmentCreated,
    trackPatientCreated,
    trackProfessionalCreated,
    trackLogin,
    trackAppointmentCompleted,
    trackAppointmentCancelled,
    trackProfileUpdate,
    trackReportGenerated,
    trackBackupCreated,
    trackTemplateUsed,
    trackTemplateCreated,
    trackWhatsAppMessage,
    trackFeatureAccess,
    trackUserFeedback,
    trackSessionTime,

    // Utilitários
    isInitialized: !!userStats,
    hasUnlockedAchievements: userStats
      ? userStats.achievements.some(a => a.isUnlocked)
      : false,
    currentLevel: userStats?.level || 1,
    currentPoints: userStats?.points || 0,
    currentStreak: userStats?.streak || 0,
  };
};
