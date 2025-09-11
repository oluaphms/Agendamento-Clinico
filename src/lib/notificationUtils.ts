import toast from 'react-hot-toast';
import { getDatabase } from './connectivityManager';

/**
 * Notifica sobre um agendamento cancelado
 */
export const notificarAgendamentoCancelado = async (agendamento: any) => {
  try {
    console.log('Notificando cancelamento do agendamento:', agendamento);

    // Aqui você pode implementar notificações específicas
    // Por exemplo, enviar email, WhatsApp, etc.

    toast.success('Agendamento cancelado com sucesso');
  } catch (error) {
    console.error('Erro ao notificar cancelamento:', error);
    toast.error('Erro ao notificar cancelamento');
  }
};

/**
 * Notifica sobre um agendamento confirmado
 */
export const notificarAgendamentoConfirmado = async (agendamento: any) => {
  try {
    console.log('Notificando confirmação do agendamento:', agendamento);

    // Aqui você pode implementar notificações específicas
    // Por exemplo, enviar email, WhatsApp, etc.

    toast.success('Agendamento confirmado com sucesso');
  } catch (error) {
    console.error('Erro ao notificar confirmação:', error);
    toast.error('Erro ao notificar confirmação');
  }
};

/**
 * Notifica sobre um pagamento realizado
 */
export const notificarPagamentoRealizado = async (agendamento: any) => {
  try {
    console.log('Notificando pagamento realizado:', agendamento);

    // Aqui você pode implementar notificações específicas
    // Por exemplo, enviar email, WhatsApp, etc.

    toast.success('Pagamento registrado com sucesso');
  } catch (error) {
    console.error('Erro ao notificar pagamento:', error);
    toast.error('Erro ao notificar pagamento');
  }
};

/**
 * Verifica agendamentos próximos e envia notificações
 */
export const verificarAgendamentosProximos = async () => {
  try {
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    // Buscar agendamentos para amanhã com retry e fallback
    const { data: agendamentos, error } = await buscarAgendamentosComRetry(
      amanha.toISOString().split('T')[0]
    );

    if (error) {
      console.error('Erro ao buscar agendamentos próximos:', error);

      // Tentar buscar dados do cache local como fallback
      const agendamentosCache = await buscarAgendamentosDoCache(
        amanha.toISOString().split('T')[0]
      );

      if (agendamentosCache && agendamentosCache.length > 0) {
        console.log('Usando dados do cache para agendamentos próximos');
        toast.success(
          `Você tem ${agendamentosCache.length} agendamento(s) para amanhã (dados do cache)`
        );
      } else {
        toast.error('Não foi possível verificar agendamentos próximos');
      }
      return;
    }

    if (agendamentos && agendamentos.length > 0) {
      console.log(
        `Encontrados ${agendamentos.length} agendamento(s) para amanhã`
      );

      // Salvar no cache para uso offline
      await salvarAgendamentosNoCache(agendamentos);

      // Aqui você pode implementar notificações específicas
      // Por exemplo, enviar lembretes por WhatsApp, email, etc.

      // Exemplo de notificação simples
      toast.success(
        `Você tem ${agendamentos.length} agendamento(s) para amanhã`
      );
    }
  } catch (error) {
    console.error('Erro ao verificar agendamentos próximos:', error);

    // Fallback para dados do cache
    try {
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(hoje.getDate() + 1);

      const agendamentosCache = await buscarAgendamentosDoCache(
        amanha.toISOString().split('T')[0]
      );

      if (agendamentosCache && agendamentosCache.length > 0) {
        toast.success(
          `Você tem ${agendamentosCache.length} agendamento(s) para amanhã (dados do cache)`
        );
      }
    } catch (cacheError) {
      console.error('Erro ao buscar dados do cache:', cacheError);
      toast.error('Não foi possível verificar agendamentos próximos');
    }
  }
};

/**
 * Busca agendamentos com mecanismo de retry
 */
async function buscarAgendamentosComRetry(
  data: string,
  maxRetries = 3
): Promise<{ data: any[] | null; error: any }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentativa ${attempt} de buscar agendamentos para ${data}`);

      // Usar o gerenciador de conectividade para obter o banco apropriado
      const db = await getDatabase();

      const { data: agendamentos, error } = await db
        .from('agendamentos')
        .select(
          `
          *,
          pacientes (nome, telefone),
          profissionais (nome, especialidade),
          servicos (nome, duracao_min, preco)
        `
        )
        .eq('data', data)
        .eq('status', 'agendado');

      if (error) {
        console.warn(`Tentativa ${attempt} falhou:`, error);

        if (attempt === maxRetries) {
          return { data: null, error };
        }

        // Aguardar antes da próxima tentativa (backoff exponencial)
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
        continue;
      }

      return { data: agendamentos, error: null };
    } catch (error) {
      console.warn(`Tentativa ${attempt} falhou com exceção:`, error);

      if (attempt === maxRetries) {
        return { data: null, error };
      }

      // Aguardar antes da próxima tentativa
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  return { data: null, error: new Error('Máximo de tentativas excedido') };
}

/**
 * Busca agendamentos do cache local
 */
async function buscarAgendamentosDoCache(data: string): Promise<any[] | null> {
  try {
    const cacheKey = `agendamentos_${data}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const agendamentos = JSON.parse(cached);
      // Verificar se os dados não estão muito antigos (máximo 1 hora)
      const cacheTime = localStorage.getItem(`${cacheKey}_timestamp`);
      if (cacheTime && Date.now() - parseInt(cacheTime) < 3600000) {
        return agendamentos;
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar dados do cache:', error);
    return null;
  }
}

/**
 * Salva agendamentos no cache local
 */
async function salvarAgendamentosNoCache(agendamentos: any[]): Promise<void> {
  try {
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    const data = amanha.toISOString().split('T')[0];

    const cacheKey = `agendamentos_${data}`;
    localStorage.setItem(cacheKey, JSON.stringify(agendamentos));
    localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
  } catch (error) {
    console.error('Erro ao salvar dados no cache:', error);
  }
}
