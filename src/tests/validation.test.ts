import { validateField, validateForm, CLINIC_VALIDATIONS } from '../lib/validation'

describe('Validation System', () => {
  describe('validateField', () => {
    test('should validate required fields', () => {
      const rules = [{ required: true }]
      expect(validateField('', rules)).toContain('Este campo é obrigatório')
      expect(validateField('test', rules)).toHaveLength(0)
    })

    test('should validate email format', () => {
      const rules = [{ email: true }]
      expect(validateField('invalid-email', rules)).toContain('Email inválido')
      expect(validateField('test@example.com', rules)).toHaveLength(0)
    })

    test('should validate CPF format', () => {
      const rules = [{ cpf: true }]
      expect(validateField('123.456.789-00', rules)).toContain('CPF inválido')
      expect(validateField('00000000000', rules)).toHaveLength(0)
    })

    test('should validate phone format', () => {
      const rules = [{ phone: true }]
      expect(validateField('123', rules)).toContain('Telefone inválido')
      expect(validateField('11999999999', rules)).toHaveLength(0)
    })
  })

  describe('validateForm', () => {
    test('should validate complete form', () => {
      const data = {
        nome: 'João Silva',
        email: 'joao@example.com',
        cpf: '00000000000'
      }
      
      const result = validateForm(data, CLINIC_VALIDATIONS.usuario)
      expect(result.isValid).toBe(true)
    })

    test('should return errors for invalid form', () => {
      const data = {
        nome: '',
        email: 'invalid-email',
        cpf: '123'
      }
      
      const result = validateForm(data, CLINIC_VALIDATIONS.usuario)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})
