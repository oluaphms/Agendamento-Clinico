// ============================================================================
// SERVIÇO: WhatsApp - Integração com WhatsApp Business API
// ============================================================================
// Este serviço fornece integração completa com a API do WhatsApp Business
// para envio de mensagens, templates e campanhas.
// ============================================================================

import { supabase } from '@/lib/supabase';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

export interface MensagemWhatsApp {
  id: string;
  numero: string;
  nome: string;
  tipo: 'texto' | 'template' | 'midia' | 'documento';
  conteudo: string;
  status: 'enviada' | 'entregue' | 'lida' | 'falhou' | 'pendente';
  dataEnvio: string;
  dataEntrega?: string;
  dataLeitura?: string;
  templateId?: string;
  midiaUrl?: string;
  resposta?: string;
  agendamentoId?: string;
  pacienteId?: string;
  profissionalId?: string;
  custo?: number;
  erro?: string;
}

export interface TemplateWhatsApp {
  id: string;
  nome: string;
  categoria:
    | 'agendamento'
    | 'lembrete'
    | 'confirmacao'
    | 'cancelamento'
    | 'promocional'
    | 'informativo';
  conteudo: string;
  variaveis: string[];
  aprovado: boolean;
  dataCriacao: string;
  dataAprovacao?: string;
  uso: number;
  status: 'rascunho' | 'pendente' | 'aprovado' | 'rejeitado';
  exemplo: string;
}

export interface CampanhaWhatsApp {
  id: string;
  nome: string;
  descricao: string;
  template: TemplateWhatsApp;
  destinatarios: string[];
  status:
    | 'rascunho'
    | 'agendada'
    | 'enviando'
    | 'concluida'
    | 'pausada'
    | 'cancelada';
  dataCriacao: string;
  dataEnvio?: string;
  dataConclusao?: string;
  totalEnviadas: number;
  totalEntregues: number;
  totalLidas: number;
  totalFalhas: number;
  custoTotal: number;
}

export interface ConfiguracaoWhatsApp {
  token: string;
  numeroTelefone: string;
  webhookUrl: string;
  ativo: boolean;
  limiteDiario: number;
  custoPorMensagem: number;
  horarioFuncionamento: {
    inicio: string;
    fim: string;
    diasSemana: number[];
  };
  respostasAutomaticas: {
    ativo: boolean;
    mensagem: string;
    horarioFora: string;
  };
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const WHATSAPP_API_URL =
  process.env.REACT_APP_WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const WHATSAPP_PHONE_NUMBER_ID =
  process.env.REACT_APP_WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_ACCESS_TOKEN = process.env.REACT_APP_WHATSAPP_ACCESS_TOKEN || '';

// ============================================================================
// FUNÇÕES PRINCIPAIS
// ============================================================================

/**
 * Envia uma mensagem de texto via WhatsApp
 */
export const enviarMensagemTexto = async (
  numero: string,
  conteudo: string,
  pacienteId?: string,
  agendamentoId?: string
): Promise<MensagemWhatsApp> => {
  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: numero,
          type: 'text',
          text: {
            body: conteudo,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao enviar mensagem: ${response.statusText}`);
    }

    const data = await response.json();

    // Salvar no banco de dados
    const mensagem: MensagemWhatsApp = {
      id: data.messages[0].id,
      numero,
      nome: '', // Será preenchido com dados do paciente
      tipo: 'texto',
      conteudo,
      status: 'enviada',
      dataEnvio: new Date().toISOString(),
      pacienteId,
      agendamentoId,
      custo: 0.05, // Custo padrão por mensagem
    };

    await salvarMensagem(mensagem);
    return mensagem;
  } catch (error) {
    console.error('Erro ao enviar mensagem de texto:', error);
    throw error;
  }
};

/**
 * Envia uma mensagem usando template
 */
export const enviarMensagemTemplate = async (
  numero: string,
  templateId: string,
  variaveis: Record<string, string>,
  pacienteId?: string,
  agendamentoId?: string
): Promise<MensagemWhatsApp> => {
  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: numero,
          type: 'template',
          template: {
            name: templateId,
            language: {
              code: 'pt_BR',
            },
            components: [
              {
                type: 'body',
                parameters: Object.values(variaveis).map(valor => ({
                  type: 'text',
                  text: valor,
                })),
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao enviar template: ${response.statusText}`);
    }

    const data = await response.json();

    const mensagem: MensagemWhatsApp = {
      id: data.messages[0].id,
      numero,
      nome: '', // Será preenchido com dados do paciente
      tipo: 'template',
      conteudo: `Template: ${templateId}`,
      status: 'enviada',
      dataEnvio: new Date().toISOString(),
      templateId,
      pacienteId,
      agendamentoId,
      custo: 0.05,
    };

    await salvarMensagem(mensagem);
    return mensagem;
  } catch (error) {
    console.error('Erro ao enviar template:', error);
    throw error;
  }
};

/**
 * Envia uma mensagem com mídia
 */
export const enviarMensagemMidia = async (
  numero: string,
  midiaUrl: string,
  tipo: 'image' | 'document' | 'video' | 'audio',
  caption?: string,
  pacienteId?: string,
  agendamentoId?: string
): Promise<MensagemWhatsApp> => {
  try {
    const messageBody: any = {
      messaging_product: 'whatsapp',
      to: numero,
      type: tipo,
    };

    messageBody[tipo] = {
      link: midiaUrl,
      caption: caption || '',
    };

    const response = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao enviar mídia: ${response.statusText}`);
    }

    const data = await response.json();

    const mensagem: MensagemWhatsApp = {
      id: data.messages[0].id,
      numero,
      nome: '', // Será preenchido com dados do paciente
      tipo: 'midia',
      conteudo: caption || `Mídia: ${tipo}`,
      status: 'enviada',
      dataEnvio: new Date().toISOString(),
      midiaUrl,
      pacienteId,
      agendamentoId,
      custo: 0.05,
    };

    await salvarMensagem(mensagem);
    return mensagem;
  } catch (error) {
    console.error('Erro ao enviar mídia:', error);
    throw error;
  }
};

/**
 * Salva mensagem no banco de dados
 */
export const salvarMensagem = async (
  mensagem: MensagemWhatsApp
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('mensagens_whatsapp')
      .insert([mensagem]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    throw error;
  }
};

/**
 * Busca mensagens do banco de dados
 */
export const buscarMensagens = async (filtros?: {
  status?: string;
  tipo?: string;
  dataInicio?: string;
  dataFim?: string;
  pacienteId?: string;
}): Promise<MensagemWhatsApp[]> => {
  try {
    let query = supabase
      .from('mensagens_whatsapp')
      .select('*')
      .order('dataEnvio', { ascending: false });

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }

    if (filtros?.dataInicio) {
      query = query.gte('dataEnvio', filtros.dataInicio);
    }

    if (filtros?.dataFim) {
      query = query.lte('dataEnvio', filtros.dataFim);
    }

    if (filtros?.pacienteId) {
      query = query.eq('pacienteId', filtros.pacienteId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    throw error;
  }
};

/**
 * Cria um novo template
 */
export const criarTemplate = async (
  template: Omit<TemplateWhatsApp, 'id' | 'dataCriacao' | 'uso'>
): Promise<TemplateWhatsApp> => {
  try {
    const novoTemplate: TemplateWhatsApp = {
      ...template,
      id: Date.now().toString(),
      dataCriacao: new Date().toISOString(),
      uso: 0,
    };

    const { error } = await supabase
      .from('templates_whatsapp')
      .insert([novoTemplate]);

    if (error) {
      throw error;
    }

    return novoTemplate;
  } catch (error) {
    console.error('Erro ao criar template:', error);
    throw error;
  }
};

/**
 * Busca templates do banco de dados
 */
export const buscarTemplates = async (): Promise<TemplateWhatsApp[]> => {
  try {
    const { data, error } = await supabase
      .from('templates_whatsapp')
      .select('*')
      .order('dataCriacao', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    throw error;
  }
};

/**
 * Cria uma nova campanha
 */
export const criarCampanha = async (
  campanha: Omit<
    CampanhaWhatsApp,
    | 'id'
    | 'dataCriacao'
    | 'totalEnviadas'
    | 'totalEntregues'
    | 'totalLidas'
    | 'totalFalhas'
    | 'custoTotal'
  >
): Promise<CampanhaWhatsApp> => {
  try {
    const novaCampanha: CampanhaWhatsApp = {
      ...campanha,
      id: Date.now().toString(),
      dataCriacao: new Date().toISOString(),
      totalEnviadas: 0,
      totalEntregues: 0,
      totalLidas: 0,
      totalFalhas: 0,
      custoTotal: 0,
    };

    const { error } = await supabase
      .from('campanhas_whatsapp')
      .insert([novaCampanha]);

    if (error) {
      throw error;
    }

    return novaCampanha;
  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    throw error;
  }
};

/**
 * Executa uma campanha
 */
export const executarCampanha = async (campanhaId: string): Promise<void> => {
  try {
    // Buscar campanha
    const { data: campanha, error: campanhaError } = await supabase
      .from('campanhas_whatsapp')
      .select('*')
      .eq('id', campanhaId)
      .single();

    if (campanhaError || !campanha) {
      throw new Error('Campanha não encontrada');
    }

    // Atualizar status para "enviando"
    await supabase
      .from('campanhas_whatsapp')
      .update({ status: 'enviando', dataEnvio: new Date().toISOString() })
      .eq('id', campanhaId);

    // Enviar mensagens para todos os destinatários
    let totalEnviadas = 0;
    let totalEntregues = 0;
    let totalFalhas = 0;
    let custoTotal = 0;

    for (const numero of campanha.destinatarios) {
      try {
        const mensagem = await enviarMensagemTemplate(
          numero,
          campanha.template.id,
          {}, // Variações serão implementadas
          undefined,
          undefined
        );

        totalEnviadas++;
        if (mensagem.status === 'entregue' || mensagem.status === 'lida') {
          totalEntregues++;
        }
        if (mensagem.status === 'falhou') {
          totalFalhas++;
        }
        custoTotal += mensagem.custo || 0;

        // Pequena pausa entre mensagens para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Erro ao enviar mensagem para ${numero}:`, error);
        totalFalhas++;
      }
    }

    // Atualizar estatísticas da campanha
    await supabase
      .from('campanhas_whatsapp')
      .update({
        status: 'concluida',
        dataConclusao: new Date().toISOString(),
        totalEnviadas,
        totalEntregues,
        totalFalhas,
        custoTotal,
      })
      .eq('id', campanhaId);
  } catch (error) {
    console.error('Erro ao executar campanha:', error);
    throw error;
  }
};

/**
 * Busca campanhas do banco de dados
 */
export const buscarCampanhas = async (): Promise<CampanhaWhatsApp[]> => {
  try {
    const { data, error } = await supabase
      .from('campanhas_whatsapp')
      .select('*')
      .order('dataCriacao', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error);
    throw error;
  }
};

/**
 * Atualiza configurações do WhatsApp
 */
export const atualizarConfiguracao = async (
  configuracao: ConfiguracaoWhatsApp
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('configuracoes_whatsapp')
      .upsert([configuracao]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    throw error;
  }
};

/**
 * Busca configurações do WhatsApp
 */
export const buscarConfiguracao =
  async (): Promise<ConfiguracaoWhatsApp | null> => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_whatsapp')
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      return null;
    }
  };

/**
 * Processa webhook do WhatsApp
 */
export const processarWebhook = async (webhookData: any): Promise<void> => {
  try {
    // Processar diferentes tipos de webhook
    if (webhookData.entry) {
      for (const entry of webhookData.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.value?.messages) {
              for (const message of change.value.messages) {
                // Processar mensagem recebida
                await processarMensagemRecebida(message);
              }
            }

            if (change.value?.statuses) {
              for (const status of change.value.statuses) {
                // Atualizar status da mensagem
                await atualizarStatusMensagem(status.id, status.status);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    throw error;
  }
};

/**
 * Processa mensagem recebida
 */
const processarMensagemRecebida = async (message: any): Promise<void> => {
  try {
    // Salvar mensagem recebida
    const mensagemRecebida: MensagemWhatsApp = {
      id: message.id,
      numero: message.from,
      nome: '', // Será preenchido com dados do paciente
      tipo: 'texto',
      conteudo: message.text?.body || '',
      status: 'entregue',
      dataEnvio: new Date(parseInt(message.timestamp) * 1000).toISOString(),
      dataEntrega: new Date().toISOString(),
    };

    await salvarMensagem(mensagemRecebida);
  } catch (error) {
    console.error('Erro ao processar mensagem recebida:', error);
  }
};

/**
 * Atualiza status da mensagem
 */
const atualizarStatusMensagem = async (
  messageId: string,
  status: string
): Promise<void> => {
  try {
    const statusMap: Record<string, string> = {
      sent: 'enviada',
      delivered: 'entregue',
      read: 'lida',
      failed: 'falhou',
    };

    const novoStatus = statusMap[status] || 'pendente';

    await supabase
      .from('mensagens_whatsapp')
      .update({
        status: novoStatus,
        dataEntrega:
          status === 'delivered' ? new Date().toISOString() : undefined,
        dataLeitura: status === 'read' ? new Date().toISOString() : undefined,
      })
      .eq('id', messageId);
  } catch (error) {
    console.error('Erro ao atualizar status da mensagem:', error);
  }
};

// ============================================================================
// FUNÇÕES DE UTILIDADE
// ============================================================================

/**
 * Valida número de telefone para WhatsApp
 */
export const validarNumeroWhatsApp = (numero: string): boolean => {
  // Remove caracteres não numéricos
  const numeroLimpo = numero.replace(/\D/g, '');

  // Verifica se tem 10 ou 11 dígitos (com DDD)
  return numeroLimpo.length >= 10 && numeroLimpo.length <= 11;
};

/**
 * Formata número para WhatsApp
 */
export const formatarNumeroWhatsApp = (numero: string): string => {
  const numeroLimpo = numero.replace(/\D/g, '');

  // Adiciona código do país se necessário
  if (numeroLimpo.length === 10 || numeroLimpo.length === 11) {
    return `55${numeroLimpo}`;
  }

  return numeroLimpo;
};

/**
 * Gera estatísticas do WhatsApp
 */
export const gerarEstatisticas = async (periodo: {
  inicio: string;
  fim: string;
}) => {
  try {
    const mensagens = await buscarMensagens({
      dataInicio: periodo.inicio,
      dataFim: periodo.fim,
    });

    const estatisticas = {
      total: mensagens.length,
      enviadas: mensagens.filter(m => m.status === 'enviada').length,
      entregues: mensagens.filter(m => m.status === 'entregue').length,
      lidas: mensagens.filter(m => m.status === 'lida').length,
      falhas: mensagens.filter(m => m.status === 'falhou').length,
      custoTotal: mensagens.reduce((total, m) => total + (m.custo || 0), 0),
      porTipo: {
        texto: mensagens.filter(m => m.tipo === 'texto').length,
        template: mensagens.filter(m => m.tipo === 'template').length,
        midia: mensagens.filter(m => m.tipo === 'midia').length,
        documento: mensagens.filter(m => m.tipo === 'documento').length,
      },
    };

    return estatisticas;
  } catch (error) {
    console.error('Erro ao gerar estatísticas:', error);
    throw error;
  }
};
