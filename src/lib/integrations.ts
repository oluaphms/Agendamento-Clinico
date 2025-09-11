// ============================================================================
// SISTEMA DE INTEGRAÇÕES EXTERNAS
// ============================================================================
// Sistema para integração com APIs externas
// ============================================================================

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'oauth' | 'sftp';
  baseUrl: string;
  apiKey?: string;
  secret?: string;
  timeout?: number;
  retries?: number;
  enabled: boolean;
  headers?: Record<string, string>;
  auth?: {
    type: 'bearer' | 'basic' | 'apikey' | 'oauth2';
    token?: string;
    username?: string;
    password?: string;
  };
}

export interface IntegrationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  headers?: Record<string, string>;
}

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  signature?: string;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
}

// ============================================================================
// CONFIGURAÇÕES DE INTEGRAÇÕES
// ============================================================================

export const INTEGRATION_TYPES = {
  // APIs de terceiros
  CEP_API: {
    id: 'cep-api',
    name: 'API de CEP',
    type: 'api' as const,
    baseUrl: 'https://viacep.com.br/ws',
    timeout: 5000,
    retries: 3,
  },
  
  WHATSAPP_API: {
    id: 'whatsapp-api',
    name: 'WhatsApp Business API',
    type: 'api' as const,
    baseUrl: 'https://graph.facebook.com/v17.0',
    timeout: 10000,
    retries: 2,
  },
  
  EMAIL_SERVICE: {
    id: 'email-service',
    name: 'Serviço de Email',
    type: 'api' as const,
    baseUrl: 'https://api.sendgrid.com/v3',
    timeout: 10000,
    retries: 3,
  },
  
  SMS_SERVICE: {
    id: 'sms-service',
    name: 'Serviço de SMS',
    type: 'api' as const,
    baseUrl: 'https://api.twilio.com/2010-04-01',
    timeout: 10000,
    retries: 2,
  },
  
  PAYMENT_GATEWAY: {
    id: 'payment-gateway',
    name: 'Gateway de Pagamento',
    type: 'api' as const,
    baseUrl: 'https://api.stripe.com/v1',
    timeout: 15000,
    retries: 3,
  },
  
  // Webhooks
  WEBHOOK_GENERAL: {
    id: 'webhook-general',
    name: 'Webhook Genérico',
    type: 'webhook' as const,
    baseUrl: '',
    timeout: 5000,
    retries: 1,
  },
} as const;

// ============================================================================
// CLASSE BASE PARA INTEGRAÇÕES
// ============================================================================

export class IntegrationService {
  private config: IntegrationConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutos

  constructor(config: IntegrationConfig) {
    this.config = config;
  }

  // ============================================================================
  // MÉTODOS DE REQUISIÇÃO
  // ============================================================================
  
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<IntegrationResponse<T>> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const headers = this.buildHeaders(options.headers);
      
      const response = await fetch(url, {
        ...options,
        headers,
        timeout: this.config.timeout || 10000,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
          statusCode: response.status,
        };
      }

      return {
        success: true,
        data,
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  async get<T = any>(endpoint: string, useCache = true): Promise<IntegrationResponse<T>> {
    if (useCache) {
      const cached = this.getFromCache<T>(endpoint);
      if (cached) {
        return { success: true, data: cached };
      }
    }

    const response = await this.request<T>(endpoint, { method: 'GET' });
    
    if (response.success && useCache) {
      this.setCache(endpoint, response.data);
    }

    return response;
  }

  async post<T = any>(endpoint: string, data: any): Promise<IntegrationResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async put<T = any>(endpoint: string, data: any): Promise<IntegrationResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(endpoint: string): Promise<IntegrationResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ============================================================================
  // MÉTODOS DE CACHE
  // ============================================================================
  
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // ============================================================================
  // MÉTODOS DE AUTENTICAÇÃO
  // ============================================================================
  
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...customHeaders,
    };

    if (this.config.auth) {
      switch (this.config.auth.type) {
        case 'bearer':
          if (this.config.auth.token) {
            headers.Authorization = `Bearer ${this.config.auth.token}`;
          }
          break;
        case 'basic':
          if (this.config.auth.username && this.config.auth.password) {
            const credentials = btoa(`${this.config.auth.username}:${this.config.auth.password}`);
            headers.Authorization = `Basic ${credentials}`;
          }
          break;
        case 'apikey':
          if (this.config.apiKey) {
            headers['X-API-Key'] = this.config.apiKey;
          }
          break;
      }
    }

    return headers;
  }

  // ============================================================================
  // MÉTODOS DE CONFIGURAÇÃO
  // ============================================================================
  
  updateConfig(newConfig: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): IntegrationConfig {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  enable(): void {
    this.config.enabled = true;
  }

  disable(): void {
    this.config.enabled = false;
  }
}

// ============================================================================
// SERVIÇOS ESPECÍFICOS
// ============================================================================

/**
 * Serviço de integração com API de CEP
 */
export class CEPIntegrationService extends IntegrationService {
  constructor() {
    super(INTEGRATION_TYPES.CEP_API);
  }

  async getCEP(cep: string): Promise<IntegrationResponse<{
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
  }>> {
    const cleanCEP = cep.replace(/\D/g, '');
    return this.get(`/${cleanCEP}/json/`);
  }
}

/**
 * Serviço de integração com WhatsApp
 */
export class WhatsAppIntegrationService extends IntegrationService {
  constructor(accessToken: string) {
    super({
      ...INTEGRATION_TYPES.WHATSAPP_API,
      auth: {
        type: 'bearer',
        token: accessToken,
      },
    });
  }

  async sendMessage(
    to: string,
    message: string,
    templateId?: string
  ): Promise<IntegrationResponse<{ id: string; status: string }>> {
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    };

    if (templateId) {
      data.type = 'template';
      data.template = {
        name: templateId,
        language: { code: 'pt_BR' },
      };
    }

    return this.post(`/${this.config.baseUrl.split('/').pop()}/messages`, data);
  }

  async sendTemplate(
    to: string,
    templateName: string,
    parameters: string[]
  ): Promise<IntegrationResponse<{ id: string; status: string }>> {
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters: parameters.map(param => ({ type: 'text', text: param })),
          },
        ],
      },
    };

    return this.post(`/${this.config.baseUrl.split('/').pop()}/messages`, data);
  }
}

/**
 * Serviço de integração com Email
 */
export class EmailIntegrationService extends IntegrationService {
  constructor(apiKey: string) {
    super({
      ...INTEGRATION_TYPES.EMAIL_SERVICE,
      auth: {
        type: 'apikey',
        token: apiKey,
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    content: string,
    from?: string
  ): Promise<IntegrationResponse<{ message_id: string }>> {
    const data = {
      personalizations: [
        {
          to: [{ email: to }],
          subject,
        },
      ],
      from: { email: from || 'noreply@clinica.com' },
      content: [
        {
          type: 'text/html',
          value: content,
        },
      ],
    };

    return this.post('/mail/send', data);
  }

  async sendTemplateEmail(
    to: string,
    templateId: string,
    dynamicData: Record<string, any>
  ): Promise<IntegrationResponse<{ message_id: string }>> {
    const data = {
      personalizations: [
        {
          to: [{ email: to }],
          dynamic_template_data: dynamicData,
        },
      ],
      from: { email: 'noreply@clinica.com' },
      template_id: templateId,
    };

    return this.post('/mail/send', data);
  }
}

/**
 * Serviço de integração com SMS
 */
export class SMSIntegrationService extends IntegrationService {
  constructor(accountSid: string, authToken: string) {
    super({
      ...INTEGRATION_TYPES.SMS_SERVICE,
      auth: {
        type: 'basic',
        username: accountSid,
        password: authToken,
      },
    });
  }

  async sendSMS(
    to: string,
    message: string,
    from?: string
  ): Promise<IntegrationResponse<{ sid: string; status: string }>> {
    const data = new URLSearchParams({
      To: to,
      Body: message,
      From: from || '+1234567890',
    });

    return this.post(`/Accounts/${this.config.auth?.username}/Messages.json`, data);
  }
}

/**
 * Serviço de integração com Gateway de Pagamento
 */
export class PaymentIntegrationService extends IntegrationService {
  constructor(secretKey: string) {
    super({
      ...INTEGRATION_TYPES.PAYMENT_GATEWAY,
      auth: {
        type: 'bearer',
        token: secretKey,
      },
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'brl',
    metadata?: Record<string, any>
  ): Promise<IntegrationResponse<{ id: string; client_secret: string }>> {
    const data = {
      amount: Math.round(amount * 100), // Converter para centavos
      currency,
      metadata,
    };

    return this.post('/payment_intents', data);
  }

  async createCustomer(
    email: string,
    name: string,
    metadata?: Record<string, any>
  ): Promise<IntegrationResponse<{ id: string; email: string }>> {
    const data = {
      email,
      name,
      metadata,
    };

    return this.post('/customers', data);
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, any>
  ): Promise<IntegrationResponse<{ id: string; status: string }>> {
    const data = {
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
    };

    return this.post('/subscriptions', data);
  }
}

// ============================================================================
// GERENCIADOR DE INTEGRAÇÕES
// ============================================================================

export class IntegrationManager {
  private integrations: Map<string, IntegrationService> = new Map();

  registerIntegration(id: string, service: IntegrationService): void {
    this.integrations.set(id, service);
  }

  getIntegration(id: string): IntegrationService | undefined {
    return this.integrations.get(id);
  }

  getAllIntegrations(): Map<string, IntegrationService> {
    return new Map(this.integrations);
  }

  removeIntegration(id: string): boolean {
    return this.integrations.delete(id);
  }

  async testIntegration(id: string): Promise<boolean> {
    const integration = this.integrations.get(id);
    if (!integration) return false;

    try {
      // Teste básico - cada integração pode implementar seu próprio teste
      const response = await integration.get('/health', false);
      return response.success;
    } catch {
      return false;
    }
  }

  async testAllIntegrations(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [id, integration] of this.integrations) {
      results[id] = await this.testIntegration(id);
    }

    return results;
  }
}

// ============================================================================
// INSTÂNCIA GLOBAL
// ============================================================================

export const integrationManager = new IntegrationManager();

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Inicializa todas as integrações configuradas
 */
export function initializeIntegrations(configs: Record<string, IntegrationConfig>): void {
  Object.entries(configs).forEach(([id, config]) => {
    let service: IntegrationService;

    switch (config.type) {
      case 'api':
        service = new IntegrationService(config);
        break;
      default:
        service = new IntegrationService(config);
    }

    integrationManager.registerIntegration(id, service);
  });
}

/**
 * Cria um webhook handler
 */
export function createWebhookHandler(
  secret: string,
  handler: (payload: WebhookPayload) => Promise<void>
) {
  return async (req: Request): Promise<Response> => {
    try {
      const payload = await req.json();
      
      // Verificar assinatura se fornecida
      if (secret && payload.signature) {
        // Implementar verificação de assinatura
        // const expectedSignature = createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
        // if (payload.signature !== expectedSignature) {
        //   return new Response('Unauthorized', { status: 401 });
        // }
      }

      await handler(payload);
      return new Response('OK', { status: 200 });
    } catch (error) {
      console.error('Webhook error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  };
}
