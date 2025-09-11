// ============================================================================
// UTILITÁRIOS DE EXPORTAÇÃO - Sistema Clínica
// ============================================================================
// Este arquivo contém funções para exportar dados da agenda em diferentes
// formatos: PDF, Excel e CSV.
// ============================================================================

import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Interface para dados de agendamento para exportação
interface AgendamentoExport {
  id: number;
  data: string;
  hora: string;
  paciente: string;
  profissional: string;
  servico: string;
  status: string;
  valor: number;
  pagamento: string;
  observacoes?: string;
}

// ============================================================================
// EXPORTAÇÃO PARA PDF
// ============================================================================

export const exportToPDF = async (
  agendamentos: AgendamentoExport[],
  titulo: string = 'Relatório de Agendamentos'
) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Data de geração
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );
    yPosition += 20;

    // Tabela de dados
    const headers = [
      'Data',
      'Hora',
      'Paciente',
      'Profissional',
      'Serviço',
      'Status',
      'Valor',
      'Pagamento',
    ];

    const colWidths = [25, 15, 35, 30, 25, 20, 20, 20];
    const startX = 10;

    // Cabeçalho da tabela
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    let xPosition = startX;

    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    yPosition += 8;

    // Linha separadora
    doc.line(
      startX,
      yPosition - 2,
      startX + colWidths.reduce((a, b) => a + b, 0),
      yPosition - 2
    );
    yPosition += 5;

    // Dados da tabela
    doc.setFont('helvetica', 'normal');
    agendamentos.forEach(agendamento => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      const rowData = [
        agendamento.data,
        agendamento.hora,
        agendamento.paciente.substring(0, 20), // Limitar tamanho
        agendamento.profissional.substring(0, 15),
        agendamento.servico.substring(0, 15),
        agendamento.status,
        `R$ ${agendamento.valor.toFixed(2)}`,
        agendamento.pagamento,
      ];

      xPosition = startX;
      rowData.forEach((data, index) => {
        doc.text(data, xPosition, yPosition);
        xPosition += colWidths[index];
      });
      yPosition += 6;
    });

    // Rodapé
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, {
        align: 'center',
      });
    }

    // Salvar arquivo
    doc.save(
      `${titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    );

    return { success: true, message: 'PDF exportado com sucesso!' };
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    return { success: false, message: 'Erro ao exportar PDF' };
  }
};

// ============================================================================
// EXPORTAÇÃO PARA EXCEL
// ============================================================================

export const exportToExcel = (
  agendamentos: AgendamentoExport[],
  titulo: string = 'Relatório de Agendamentos'
) => {
  try {
    // Preparar dados para Excel
    const excelData = agendamentos.map(agendamento => ({
      ID: agendamento.id,
      Data: agendamento.data,
      Hora: agendamento.hora,
      Paciente: agendamento.paciente,
      Profissional: agendamento.profissional,
      Serviço: agendamento.servico,
      Status: agendamento.status,
      'Valor (R$)': agendamento.valor,
      Pagamento: agendamento.pagamento,
      Observações: agendamento.observacoes || '',
    }));

    // Criar workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Configurar largura das colunas
    const colWidths = [
      { wch: 8 }, // ID
      { wch: 12 }, // Data
      { wch: 8 }, // Hora
      { wch: 25 }, // Paciente
      { wch: 20 }, // Profissional
      { wch: 20 }, // Serviço
      { wch: 12 }, // Status
      { wch: 12 }, // Valor
      { wch: 12 }, // Pagamento
      { wch: 30 }, // Observações
    ];
    ws['!cols'] = colWidths;

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Agendamentos');

    // Gerar arquivo Excel
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(
      blob,
      `${titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    );

    return { success: true, message: 'Excel exportado com sucesso!' };
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    return { success: false, message: 'Erro ao exportar Excel' };
  }
};

// ============================================================================
// EXPORTAÇÃO PARA CSV
// ============================================================================

export const exportToCSV = (
  agendamentos: AgendamentoExport[],
  titulo: string = 'Relatório de Agendamentos'
) => {
  try {
    // Cabeçalho CSV
    const headers = [
      'ID',
      'Data',
      'Hora',
      'Paciente',
      'Profissional',
      'Serviço',
      'Status',
      'Valor (R$)',
      'Pagamento',
      'Observações',
    ];

    // Converter dados para CSV
    const csvContent = [
      headers.join(','),
      ...agendamentos.map(agendamento =>
        [
          agendamento.id,
          `"${agendamento.data}"`,
          `"${agendamento.hora}"`,
          `"${agendamento.paciente}"`,
          `"${agendamento.profissional}"`,
          `"${agendamento.servico}"`,
          `"${agendamento.status}"`,
          agendamento.valor.toFixed(2),
          `"${agendamento.pagamento}"`,
          `"${agendamento.observacoes || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(
      blob,
      `${titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    );

    return { success: true, message: 'CSV exportado com sucesso!' };
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    return { success: false, message: 'Erro ao exportar CSV' };
  }
};

// ============================================================================
// FUNÇÃO AUXILIAR PARA CONVERTER DADOS
// ============================================================================

export const convertAgendamentosForExport = (
  agendamentos: any[]
): AgendamentoExport[] => {
  return agendamentos.map(agendamento => ({
    id: agendamento.id,
    data: agendamento.data,
    hora: agendamento.hora,
    paciente: agendamento.pacientes?.nome || 'N/A',
    profissional: agendamento.profissionais?.nome || 'N/A',
    servico: agendamento.servicos?.nome || 'N/A',
    status: agendamento.status,
    valor: agendamento.servicos?.preco || 0,
    pagamento: agendamento.pagamentos?.[0]?.status || 'Pendente',
    observacoes: agendamento.observacoes || '',
  }));
};

// ============================================================================
// EXPORTAÇÃO DE RELATÓRIOS
// ============================================================================

export const exportRelatorioAgendamentos = async (
  agendamentos: any[],
  filtros: any,
  tipo: 'pdf' | 'excel' | 'csv'
) => {
  const dadosExport = convertAgendamentosForExport(agendamentos);

  // Gerar título baseado nos filtros
  let titulo = 'Relatório de Agendamentos';
  if (filtros.data_inicio && filtros.data_fim) {
    titulo += ` - ${filtros.data_inicio} a ${filtros.data_fim}`;
  }
  if (filtros.status) {
    titulo += ` - Status: ${filtros.status}`;
  }

  switch (tipo) {
    case 'pdf':
      return await exportToPDF(dadosExport, titulo);
    case 'excel':
      return exportToExcel(dadosExport, titulo);
    case 'csv':
      return exportToCSV(dadosExport, titulo);
    default:
      return { success: false, message: 'Tipo de exportação inválido' };
  }
};
