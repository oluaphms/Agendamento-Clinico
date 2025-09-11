// ============================================================================
// HOOK: useForm - Gerenciamento de Formulários
// ============================================================================
// Hook customizado para gerenciar formulários com validação
// ============================================================================

import { useState, useCallback, useRef } from 'react';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type ValidationRule<T> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
};

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

export interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit?: (values: T) => void | Promise<void>;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormOptions<T>) {
  // ============================================================================
  // ESTADO LOCAL
  // ============================================================================
  
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);

  // ============================================================================
  // FUNÇÃO DE VALIDAÇÃO
  // ============================================================================
  
  const validateField = useCallback(
    (fieldName: keyof T, value: T[keyof T]): string | null => {
      const rules = validationRules[fieldName];
      if (!rules) return null;

      // Validação obrigatória
      if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return 'Este campo é obrigatório';
      }

      // Validação de comprimento mínimo
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        return `Mínimo de ${rules.minLength} caracteres`;
      }

      // Validação de comprimento máximo
      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        return `Máximo de ${rules.maxLength} caracteres`;
      }

      // Validação de padrão
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        return 'Formato inválido';
      }

      // Validação customizada
      if (rules.custom) {
        return rules.custom(value);
      }

      return null;
    },
    [validationRules]
  );

  // ============================================================================
  // VALIDAÇÃO DE TODOS OS CAMPOS
  // ============================================================================
  
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;

    Object.keys(values).forEach((fieldName) => {
      const fieldKey = fieldName as keyof T;
      const error = validateField(fieldKey, values[fieldKey]);
      
      if (error) {
        newErrors[fieldKey] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  // ============================================================================
  // ATUALIZAR VALOR DE CAMPO
  // ============================================================================
  
  const setValue = useCallback(
    (fieldName: keyof T, value: T[keyof T]) => {
      setValues(prev => ({ ...prev, [fieldName]: value }));
      
      // Limpar erro quando usuário começa a digitar
      if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: undefined }));
      }
    },
    [errors]
  );

  // ============================================================================
  // HANDLER DE MUDANÇA DE CAMPO
  // ============================================================================
  
  const handleChange = useCallback(
    (fieldName: keyof T) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value as T[keyof T];
      setValue(fieldName, value);
    },
    [setValue]
  );

  // ============================================================================
  // HANDLER DE BLUR (PERDA DE FOCO)
  // ============================================================================
  
  const handleBlur = useCallback(
    (fieldName: keyof T) => () => {
      setTouched(prev => ({ ...prev, [fieldName]: true }));
      
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      }
    },
    [values, validateField]
  );

  // ============================================================================
  // SUBMISSÃO DO FORMULÁRIO
  // ============================================================================
  
  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      if (event) {
        event.preventDefault();
      }

      // Marcar todos os campos como tocados
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Partial<Record<keyof T, boolean>>);
      setTouched(allTouched);

      // Validar formulário
      if (!validateForm()) {
        return;
      }

      // Executar submit
      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Erro no submit do formulário:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [values, validateForm, onSubmit]
  );

  // ============================================================================
  // RESET DO FORMULÁRIO
  // ============================================================================
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // ============================================================================
  // RETORNO
  // ============================================================================
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    formRef,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validateForm,
    validateField,
  };
}
