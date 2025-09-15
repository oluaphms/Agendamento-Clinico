// ============================================================================
// SERVIÇOS MOCK PARA CORREÇÃO DE BUILD
// ============================================================================

// Mock do PermissionService
export const PermissionService = {
  saveAllPermissions: async (permissions: any[]) => {
    console.log('Mock: saveAllPermissions', permissions);
    return true;
  },
  getAllPermissions: async () => {
    return [];
  },
  getPermissionsByRole: async (_roleId: string) => {
    return [];
  }
};

// Mock do reportService
export const reportService = {
  getReports: async () => {
    return [];
  },
  getReport: async (_reportId: string) => {
    return null;
  },
  saveReport: async (report: any) => {
    console.log('Mock: saveReport', report);
  },
  deleteReport: async (reportId: string) => {
    console.log('Mock: deleteReport', reportId);
  },
  generateReport: async (_reportId: string, _filters: any[], _userId: string) => {
    return {
      id: _reportId,
      name: 'Mock Report',
      data: [],
      summary: {
        totalRecords: 0,
        totalValue: 0,
        growthRate: 0,
        averageValue: 0
      },
      charts: [],
      generatedAt: new Date(),
      metadata: {
        processingTime: 0,
        recordCount: 0
      }
    };
  }
};

// Tipos estendidos
export interface ReportConfig {
  id: string;
  name: string;
  description?: string;
  type?: string;
  charts?: any[];
}

export interface ReportData {
  id: string;
  name: string;
  data: any[];
  summary?: {
    totalRecords: number;
    totalValue: number;
    growthRate: number;
    averageValue: number;
  };
  charts?: any[];
  generatedAt?: Date;
  metadata?: {
    processingTime: number;
    recordCount: number;
  };
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
  label?: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
  category?: string;
}
