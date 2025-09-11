// =====================================================
// UTILITÁRIOS PARA HASH DE SENHAS
// Compatibilidade entre banco local e Supabase
// =====================================================

// Simulação de bcrypt para ambiente de desenvolvimento
// Em produção, use: npm install bcrypt @types/bcrypt

interface HashResult {
  hash: string;
  salt: string;
}

interface VerifyResult {
  isValid: boolean;
  needsUpdate?: boolean;
}

// Função para gerar salt (simulação)
const generateSalt = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let salt = '';
  for (let i = 0; i < 16; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt;
};

// Função para hash de senha (simulação de bcrypt)
const hashPassword = (password: string, salt?: string): HashResult => {
  const actualSalt = salt || generateSalt();
  
  // Simulação simples de hash (em produção use bcrypt)
  const combined = password + actualSalt;
  let hash = '';
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash += char.toString(16).padStart(2, '0');
  }
  
  // Adicionar prefixo para identificar o tipo de hash
  return {
    hash: `$2b$10$${actualSalt}$${hash}`,
    salt: actualSalt
  };
};

// Função para verificar senha
const verifyPassword = (password: string, hash: string): VerifyResult => {
  try {
    // Verificar se é um hash válido
    if (!hash.startsWith('$2b$10$')) {
      return { isValid: false, needsUpdate: true };
    }
    
    // Extrair salt do hash
    const parts = hash.split('$');
    if (parts.length !== 4) {
      return { isValid: false, needsUpdate: true };
    }
    
    const salt = parts[2];
    const storedHash = parts[3];
    
    // Gerar hash da senha fornecida
    const { hash: computedHash } = hashPassword(password, salt);
    const computedParts = computedHash.split('$');
    const computedHashPart = computedParts[3];
    
    // Comparar hashes
    const isValid = computedHashPart === storedHash;
    
    return {
      isValid,
      needsUpdate: !isValid && hash.includes('temp_hash_')
    };
  } catch (error) {
    console.error('Erro ao verificar senha:', error);
    return { isValid: false, needsUpdate: true };
  }
};

// Função para migrar senhas antigas
const migratePassword = (oldPassword: string): HashResult => {
  return hashPassword(oldPassword);
};

// Função para verificar se senha precisa ser migrada
const needsMigration = (hash: string): boolean => {
  return hash.startsWith('temp_hash_');
};

// Função para gerar senha temporária
const generateTemporaryPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Função para validar força da senha
const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 3) {
    errors.push('Senha deve ter pelo menos 3 caracteres');
  }
  
  if (password.length > 128) {
    errors.push('Senha deve ter no máximo 128 caracteres');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export {
  hashPassword,
  verifyPassword,
  migratePassword,
  needsMigration,
  generateTemporaryPassword,
  validatePasswordStrength,
  type HashResult,
  type VerifyResult
};
