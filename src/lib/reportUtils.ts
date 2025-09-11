import { FileText } from 'lucide-react';

export interface ReportData {
  title: string;
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    format?: (value: any) => string;
  }>;
  filters?: Record<string, any>;
  statistics?: Array<{
    label: string;
    value: string | number;
  }>;
}

export const generatePDFReport = (reportData: ReportData) => {
  const { title, data, columns, filters, statistics } = reportData;
  
  // Estatísticas para o relatório
  const totalItems = data.length;
  const currentDate = new Date().toLocaleString('pt-BR');
  const userName = localStorage.getItem('userName') || 'Sistema';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - Sistema Clínica</title>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 20px; 
            color: #333;
            line-height: 1.4;
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
          
          .header p { 
            color: #666; 
            margin: 5px 0;
            font-size: 14px;
          }
          
          .stats {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            flex-wrap: wrap;
          }
          
          .stat-item {
            text-align: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 5px;
            min-width: 120px;
          }
          
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
          }
          
          .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            font-size: 12px;
          }
          
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          
          th { 
            background-color: #007bff; 
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
          }
          
          tr:nth-child(even) {
            background-color: #f8f9fa;
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
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 ${title}</h1>
          <p><strong>Sistema de Gestão de Clínica</strong></p>
          <p>Relatório gerado em: ${currentDate}</p>
          <p>Usuário: ${userName}</p>
        </div>
        
        ${statistics && statistics.length > 0 ? `
        <div class="stats">
          ${statistics.map(stat => `
            <div class="stat-item">
              <div class="stat-number">${stat.value}</div>
              <div class="stat-label">${stat.label}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        ${filters && Object.keys(filters).length > 0 ? `
        <div class="filters-info">
          <strong>Filtros aplicados:</strong>
          ${Object.entries(filters).map(([key, value]) => 
            value ? `• ${key}: "${value}"` : ''
          ).filter(Boolean).join(' ')}
        </div>
        ` : ''}
        
        <table>
          <thead>
            <tr>
              ${columns.map(col => `<th>${col.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map((item, index) => `
              <tr>
                ${columns.map(col => `
                  <td>${col.format ? col.format(item[col.key]) : (item[col.key] || '')}</td>
                `).join('')}
              </tr>
              ${index > 0 && index % 25 === 0 ? '<tr class="page-break"><td colspan="' + columns.length + '"></td></tr>' : ''}
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p><strong>Sistema de Gestão de Clínica</strong> - ${title}</p>
          <p>Este relatório foi gerado automaticamente em ${currentDate}</p>
          <p>Total de registros: ${totalItems} itens</p>
        </div>
      </body>
    </html>
  `;

  // Criar blob com o conteúdo HTML
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  
  // Criar link para download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
  
  // Adicionar ao DOM temporariamente e clicar
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Limpar o URL do objeto
  URL.revokeObjectURL(link.href);
};

