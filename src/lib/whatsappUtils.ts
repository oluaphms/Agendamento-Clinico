// ============================================================================
// UTILITÁRIOS DO WHATSAPP - Sistema Clínica
// ============================================================================
// Este arquivo contém funções para integração com WhatsApp
// ============================================================================

interface Agendamento {
  id: number;
  data: string;
  hora: string;
  status: string;
  observacoes?: string;
  pacientes?: { nome: string; telefone: string };
  profissionais?: { nome: string; especialidade: string };
  servicos?: { nome: string; duracao_min: number; preco: number };
}

// ============================================================================
// FUNÇÕES DE INTEGRAÇÃO COM WHATSAPP
// ============================================================================

export const enviarLembreteWhatsApp = (agendamento: Agendamento) => {
  const { pacientes, profissionais, servicos } = agendamento;
  
  if (!pacientes?.telefone) {
    return { success: false, message: 'Telefone do paciente não encontrado' };
  }

  // Formatar telefone (remover caracteres especiais)
  const telefone = pacientes.telefone.replace(/\D/g, '');
  
  // Criar mensagem personalizada
  const mensagem = criarMensagemLembrete(agendamento);
  
  // URL do WhatsApp Web
  const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
  
  // Abrir WhatsApp em nova aba
  window.open(url, '_blank');
  
  return { success: true, message: 'WhatsApp aberto com sucesso' };
};

export const enviarConfirmacaoWhatsApp = (agendamento: Agendamento) => {
  const { pacientes } = agendamento;
  
  if (!pacientes?.telefone) {
    return { success: false, message: 'Telefone do paciente não encontrado' };
  }

  const telefone = pacientes.telefone.replace(/\D/g, '');
  const mensagem = criarMensagemConfirmacao(agendamento);
  const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
  
  window.open(url, '_blank');
  
  return { success: true, message: 'WhatsApp aberto com sucesso' };
};

export const enviarCancelamentoWhatsApp = (agendamento: Agendamento) => {
  const { pacientes } = agendamento;
  
  if (!pacientes?.telefone) {
    return { success: false, message: 'Telefone do paciente não encontrado' };
  }

  const telefone = pacientes.telefone.replace(/\D/g, '');
  const mensagem = criarMensagemCancelamento(agendamento);
  const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
  
  window.open(url, '_blank');
  
  return { success: true, message: 'WhatsApp aberto com sucesso' };
};

// ============================================================================
// FUNÇÕES AUXILIARES PARA CRIAÇÃO DE MENSAGENS
// ============================================================================

const criarMensagemLembrete = (agendamento: Agendamento): string => {
  const { data, hora, pacientes, profissionais, servicos } = agendamento;
  
  const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
  const horaFormatada = hora;
  
  return `🏥 *Lembrete de Consulta*

Olá ${pacientes?.nome}! 

Este é um lembrete sobre sua consulta agendada:

📅 *Data:* ${dataFormatada}
🕐 *Horário:* ${horaFormatada}
👨‍⚕️ *Profissional:* ${profissionais?.nome}
🩺 *Serviço:* ${servicos?.nome}

Por favor, chegue com 15 minutos de antecedência.

Em caso de dúvidas, entre em contato conosco.

Atenciosamente,
Equipe da Clínica`;
};

const criarMensagemConfirmacao = (agendamento: Agendamento): string => {
  const { data, hora, pacientes, profissionais, servicos } = agendamento;
  
  const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
  
  return `✅ *Consulta Confirmada*

Olá ${pacientes?.nome}!

Sua consulta foi confirmada com sucesso:

📅 *Data:* ${dataFormatada}
🕐 *Horário:* ${hora}
👨‍⚕️ *Profissional:* ${profissionais?.nome}
🩺 *Serviço:* ${servicos?.nome}

Aguardamos você!

Atenciosamente,
Equipe da Clínica`;
};

const criarMensagemCancelamento = (agendamento: Agendamento): string => {
  const { data, hora, pacientes, profissionais, servicos } = agendamento;
  
  const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
  
  return `❌ *Consulta Cancelada*

Olá ${pacientes?.nome}!

Informamos que sua consulta foi cancelada:

📅 *Data:* ${dataFormatada}
🕐 *Horário:* ${hora}
👨‍⚕️ *Profissional:* ${profissionais?.nome}
🩺 *Serviço:* ${servicos?.nome}

Para reagendar, entre em contato conosco.

Atenciosamente,
Equipe da Clínica`;
};

// ============================================================================
// FUNÇÃO PARA ENVIAR MÚLTIPLOS LEMBRETES
// ============================================================================

export const enviarLembretesEmLote = (agendamentos: Agendamento[]) => {
  const agendamentosComTelefone = agendamentos.filter(
    ag => ag.pacientes?.telefone
  );
  
  if (agendamentosComTelefone.length === 0) {
    return { success: false, message: 'Nenhum agendamento com telefone encontrado' };
  }
  
  // Enviar um por vez com delay para evitar spam
  agendamentosComTelefone.forEach((agendamento, index) => {
    setTimeout(() => {
      enviarLembreteWhatsApp(agendamento);
    }, index * 2000); // 2 segundos entre cada envio
  });
  
  return { 
    success: true, 
    message: `${agendamentosComTelefone.length} lembretes enviados` 
  };
};

// ============================================================================
// FUNÇÃO PARA VALIDAR TELEFONE
// ============================================================================

export const validarTelefone = (telefone: string): boolean => {
  // Remove caracteres especiais
  const numeroLimpo = telefone.replace(/\D/g, '');
  
  // Verifica se tem 10 ou 11 dígitos (com DDD)
  return numeroLimpo.length >= 10 && numeroLimpo.length <= 11;
};

// ============================================================================
// FUNÇÃO PARA FORMATAR TELEFONE
// ============================================================================

export const formatarTelefone = (telefone: string): string => {
  const numeroLimpo = telefone.replace(/\D/g, '');
  
  if (numeroLimpo.length === 11) {
    return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2, 7)}-${numeroLimpo.slice(7)}`;
  } else if (numeroLimpo.length === 10) {
    return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2, 6)}-${numeroLimpo.slice(6)}`;
  }
  
  return telefone;
};
