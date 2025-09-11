// Template padrão para relatórios do sistema
export interface ReportData {
  title: string;
  subtitle?: string;
  data: any[];
  columns: {
    key: string;
    label: string;
    format?: (value: any, item?: any) => string;
  }[];
  summary?: {
    label: string;
    value: number;
  }[];
  filters?: Record<string, string>;
}

export const generateReportHTML = (data: ReportData): string => {
  const currentDate = new Date().toLocaleString('pt-BR');
  const userName = localStorage.getItem('userName') || 'Sistema';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${data.title} - Sistema Clínica</title>
        <meta charset="UTF-8">
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
          }
          
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 20px; 
            color: #333;
            line-height: 1.4;
            background: #fff;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
          }
          
          .header h1 { 
            color: #007bff; 
            margin-bottom: 10px; 
            font-size: 28px;
            font-weight: 600;
          }
          
          .header h2 { 
            color: #333; 
            margin-bottom: 15px; 
            font-size: 18px;
            font-weight: 500;
          }
          
          .info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #007bff;
          }
          
          .info p {
            margin: 5px 0;
            font-size: 14px;
          }
          
          .summary {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #bbdefb;
          }
          
          .summary h3 {
            color: #1976d2;
            margin-bottom: 15px;
            font-size: 16px;
            font-weight: 600;
          }
          
          .summary p {
            margin: 8px 0;
            font-size: 14px;
          }
          
          .summary-stats {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 15px;
          }
          
          .summary-stat {
            background: #fff;
            padding: 10px 15px;
            border-radius: 6px;
            border: 1px solid #e1f5fe;
            text-align: center;
            min-width: 120px;
          }
          
          .summary-stat .number {
            font-size: 20px;
            font-weight: bold;
            color: #1976d2;
            display: block;
          }
          
          .summary-stat .label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            font-size: 13px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            background: #fff;
          }
          
          th, td { 
            border: 1px solid #ddd; 
            padding: 12px 8px; 
            text-align: left; 
          }
          
          th { 
            background-color: #007bff; 
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
          }
          
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          
          tr:hover {
            background-color: #e3f2fd;
          }
          
          .status-ativo {
            color: #28a745;
            font-weight: bold;
          }
          
          .status-inativo {
            color: #dc3545;
            font-weight: bold;
          }
          
          .status-pendente {
            color: #ffc107;
            font-weight: bold;
          }
          
          .status-cancelado {
            color: #6c757d;
            font-weight: bold;
          }
          
          .footer { 
            margin-top: 30px; 
            text-align: center; 
            color: #666; 
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          
          .filters-info {
            background: #e9ecef;
            padding: 10px;
            border-radius: 5px;
            margin: 15px 0;
            font-size: 12px;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          @media print {
            .page-break {
              page-break-before: always;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 ${data.title}</h1>
          <h2>Sistema de Gestão de Clínica</h2>
        </div>
        
        <div class="info">
          <p><strong>Relatório gerado em:</strong> ${currentDate}</p>
          <p><strong>Usuário:</strong> ${userName}</p>
        </div>
        
        ${data.summary ? `
        <div class="summary">
          <h3>Resumo Geral</h3>
          <p><strong>Total de ${data.title.split(' ')[2]}:</strong> ${data.data.length}</p>
          ${data.summary.length > 0 ? `
          <div class="summary-stats">
            ${data.summary.map(stat => `
              <div class="summary-stat">
                <span class="number">${stat.value}</span>
                <span class="label">${stat.label}</span>
              </div>
            `).join('')}
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        ${data.filters && Object.keys(data.filters).length > 0 ? `
        <div class="filters-info">
          <strong>Filtros aplicados:</strong>
          ${Object.entries(data.filters).map(([key, value]) => 
            value ? `• ${key}: "${value}"` : ''
          ).filter(Boolean).join(' ')}
        </div>
        ` : ''}
        
        <table>
          <thead>
            <tr>
              ${data.columns.map(col => `<th>${col.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.data.map((item, index) => `
              <tr>
                ${data.columns.map(col => `
                  <td>${col.format ? col.format(item[col.key], item) : (item[col.key] || '')}</td>
                `).join('')}
              </tr>
              ${index > 0 && index % 25 === 0 ? '<tr class="page-break"><td colspan="' + data.columns.length + '"></td></tr>' : ''}
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p><strong>Sistema de Gestão de Clínica</strong> - ${data.title}</p>
          <p>Este relatório foi gerado automaticamente em ${currentDate}</p>
          <p>Total de registros: ${data.data.length} itens</p>
        </div>
      </body>
    </html>
  `;
};

// Função para exportar PDF usando html2pdf.js
export const exportToPDF = async (data: ReportData, filename?: string): Promise<void> => {
  try {
    // Importar html2pdf dinamicamente
    const html2pdf = (await import('html2pdf.js')).default;
    
    const html = generateReportHTML(data);
    const element = document.createElement('div');
    element.innerHTML = html;
    
    const opt = {
      margin: 0.5,
      filename: filename || `relatorio_${data.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw new Error('Erro ao gerar PDF');
  }
};

// Função para imprimir relatório
export const printReport = (data: ReportData): void => {
  const html = generateReportHTML(data);
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    throw new Error('Não foi possível abrir a janela de impressão');
  }
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
};
