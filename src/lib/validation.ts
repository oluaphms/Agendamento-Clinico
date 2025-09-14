export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  cpf?: boolean;
  cnpj?: boolean;
  phone?: boolean;
  date?: boolean;
  futureDate?: boolean;
  pastDate?: boolean;
  minValue?: number;
  maxValue?: number;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule[];
}

// Validações específicas para o sistema de clínica
export const CLINIC_VALIDATIONS = {
  // Validações de usuário
  usuario: {
    nome: [
      { required: true, minLength: 2, maxLength: 100 },
      {
        pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
        custom: (value: any) =>
          !/^[a-zA-ZÀ-ÿ\s]+$/.test(value)
            ? 'Nome deve conter apenas letras'
            : null,
      },
    ],
    email: [{ required: true, email: true }, { maxLength: 255 }],
    cpf: [{ required: true, cpf: true }],
    telefone: [{ phone: true }],
    cargo: [{ required: true, minLength: 2, maxLength: 50 }],
    nivel_acesso: [
      {
        required: true,
        pattern: /^(admin|gerente|usuario|recepcao|profissional)$/,
      },
    ],
  },

  // Validações de paciente
  paciente: {
    nome: [{ required: true, minLength: 2, maxLength: 100 }],
    cpf: [{ required: true, cpf: true }],
    data_nascimento: [{ required: true, date: true, pastDate: true }],
    telefone: [{ phone: true }],
    email: [{ email: true }],
  },

  // Validações de agendamento
  agendamento: {
    paciente_id: [{ required: true, minValue: 1 }],
    profissional_id: [{ required: true, minValue: 1 }],
    servico_id: [{ required: true, minValue: 1 }],
    data: [{ required: true, date: true, futureDate: true }],
    hora: [{ required: true, pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ }],
  },

  // Validações de serviço
  servico: {
    nome: [{ required: true, minLength: 2, maxLength: 100 }],
    duracao: [{ required: true, minValue: 15, maxValue: 480 }],
    valor: [{ required: true, minValue: 0.01 }],
  },

  // Validações de profissional
  profissional: {
    nome: [{ required: true, minLength: 2, maxLength: 100 }],
    cpf: [{ cpf: true }],
    telefone: [{ phone: true }],
    email: [{ email: true }],
    especialidade: [{ required: true, minLength: 2, maxLength: 100 }],
    crm_cro: [{ minLength: 3, maxLength: 20 }],
    valor_consulta: [{ minValue: 0.01 }],
  },
};

/**
 * Valida um campo específico
 */
export function validateField(value: any, rules: ValidationRule[]): string[] {
  const errors: string[] = [];

  for (const rule of rules) {
    // Validação de campo obrigatório
    if (
      rule.required &&
      (value === null || value === undefined || value === '')
    ) {
      errors.push('Este campo é obrigatório');
      continue;
    }

    // Se o valor está vazio e não é obrigatório, pular outras validações
    if (value === null || value === undefined || value === '') {
      continue;
    }

    // Validação de comprimento mínimo
    if (rule.minLength && String(value).length < rule.minLength) {
      errors.push(`Mínimo de ${rule.minLength} caracteres`);
    }

    // Validação de comprimento máximo
    if (rule.maxLength && String(value).length > rule.maxLength) {
      errors.push(`Máximo de ${rule.maxLength} caracteres`);
    }

    // Validação de padrão regex
    if (rule.pattern && !rule.pattern.test(String(value))) {
      errors.push('Formato inválido');
    }

    // Validação de email
    if (rule.email && !isValidEmail(value)) {
      errors.push('Email inválido');
    }

    // Validação de CPF
    if (rule.cpf && !isValidCPF(value)) {
      errors.push('CPF inválido');
    }

    // Validação de CNPJ
    if (rule.cnpj && !isValidCNPJ(value)) {
      errors.push('CNPJ inválido');
    }

    // Validação de telefone
    if (rule.phone && !isValidPhone(value)) {
      errors.push('Telefone inválido');
    }

    // Validação de data
    if (rule.date && !isValidDate(value)) {
      errors.push('Data inválida');
    }

    // Validação de data futura
    if (rule.futureDate && isValidDate(value)) {
      const date = new Date(value);
      if (date <= new Date()) {
        errors.push('Data deve ser futura');
      }
    }

    // Validação de data passada
    if (rule.pastDate && isValidDate(value)) {
      const date = new Date(value);
      if (date >= new Date()) {
        errors.push('Data deve ser passada');
      }
    }

    // Validação de valor mínimo
    if (rule.minValue !== undefined && Number(value) < rule.minValue) {
      errors.push(`Valor mínimo: ${rule.minValue}`);
    }

    // Validação de valor máximo
    if (rule.maxValue !== undefined && Number(value) > rule.maxValue) {
      errors.push(`Valor máximo: ${rule.maxValue}`);
    }

    // Validação customizada
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors.push(customError);
      }
    }
  }

  return errors;
}

/**
 * Valida um formulário completo
 */
export function validateForm(
  data: any,
  validations: FieldValidation
): ValidationResult {
  const errors: string[] = [];
  const _fieldErrors: { [fieldName: string]: string[] } = {};

  for (const [fieldName, rules] of Object.entries(validations)) {
    const fieldErrors = validateField(data[fieldName], rules);

    if (fieldErrors.length > 0) {
      errors.push(...fieldErrors);
      _fieldErrors[fieldName] = _fieldErrors;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valida um campo específico e retorna o primeiro erro
 */
export function validateFieldSingle(
  value: any,
  rules: ValidationRule[]
): string | null {
  const errors = validateField(value, rules);
  return errors.length > 0 ? errors[0] : null;
}

// Funções auxiliares de validação

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;

  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;

  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
}

function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  // Validação dos dígitos verificadores
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  let digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
}

function isValidPhone(phone: string): boolean {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');

  // Verifica se tem entre 10 e 11 dígitos (com DDD)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

function isValidDate(date: string): boolean {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

// Hooks de validação para React

export function useFieldValidation(
  value: any,
  rules: ValidationRule[],
  touched: boolean = false
) {
  const errors = validateField(value, rules);
  const hasError = touched && errors.length > 0;
  const firstError = errors[0] || null;

  return {
    errors,
    hasError,
    firstError,
    isValid: errors.length === 0,
  };
}

export function useFormValidation(
  data: any,
  validations: FieldValidation,
  touched: { [fieldName: string]: boolean } = {}
) {
  const result = validateForm(data, validations);
  const _fieldErrors: { [fieldName: string]: string[] } = {};

  // Separar erros por campo
  for (const [fieldName, rules] of Object.entries(validations)) {
    fieldErrors[fieldName] = validateField(data[fieldName], rules);
  }

  // Verificar se há erros em campos tocados
  const hasTouchedErrors = Object.keys(touched).some(
    fieldName => touched[fieldName] && fieldErrors[fieldName]?.length > 0
  );

  return {
    ...result,
    fieldErrors,
    hasTouchedErrors,
    getFieldError: (fieldName: string) => fieldErrors[fieldName] || [],
    getFieldFirstError: (fieldName: string) =>
      fieldErrors[fieldName]?.[0] || null,
    isFieldValid: (fieldName: string) =>
      !fieldErrors[fieldName] || fieldErrors[fieldName].length === 0,
  };
}
