// ============================================================================
// EXEMPLOS DE USO - Componentes e Hooks
// ============================================================================
// Demonstração de como usar os novos componentes e hooks implementados
// ============================================================================

import React, { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardBody,
  Modal,
  LoadingSpinner,
} from '@/components/UI';
import { useForm, useDebounce, useAsync, useLocalStorage } from '@/hooks';
// import { useApp } from '@/contexts/AppContext';

// ============================================================================
// EXEMPLO DE FORMULÁRIO COM VALIDAÇÃO
// ============================================================================

export function FormExample() {
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
    },
    validationRules: {
      name: { required: true, minLength: 2 },
      email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      phone: { required: true, pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/ },
    },
    onSubmit: async values => {
      console.log('Formulário enviado:', values);
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 2000));
    },
  });

  return (
    <Card className='max-w-md mx-auto'>
      <CardHeader>
        <h3 className='text-lg font-semibold'>Exemplo de Formulário</h3>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            label='Nome'
            value={values.name}
            onChange={handleChange('name')}
            onBlur={handleBlur('name')}
            error={errors.name}
            placeholder='Digite seu nome'
          />

          <Input
            label='Email'
            type='email'
            value={values.email}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
            error={errors.email}
            placeholder='Digite seu email'
          />

          <Input
            label='Telefone'
            value={values.phone}
            onChange={handleChange('phone')}
            onBlur={handleBlur('phone')}
            error={errors.phone}
            placeholder='(11) 99999-9999'
            helperText='Formato: (XX) XXXXX-XXXX'
          />

          <Button
            type='submit'
            variant='primary'
            fullWidth
            loading={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// EXEMPLO DE DEBOUNCE
// ============================================================================

export function SearchExample() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Simular busca
  React.useEffect(() => {
    if (debouncedSearchTerm) {
      console.log('Buscando por:', debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <Card className='max-w-md mx-auto'>
      <CardHeader>
        <h3 className='text-lg font-semibold'>Exemplo de Busca com Debounce</h3>
      </CardHeader>
      <CardBody>
        <Input
          label='Buscar'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder='Digite para buscar...'
        />
        <p className='mt-2 text-sm text-gray-600'>
          Termo de busca: {debouncedSearchTerm || 'Nenhum'}
        </p>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// EXEMPLO DE OPERAÇÃO ASSÍNCRONA
// ============================================================================

export function AsyncExample() {
  const fetchData = async () => {
    // Simular requisição
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { message: 'Dados carregados com sucesso!' };
  };

  const { data, loading, error, execute } = useAsync(fetchData, {
    onSuccess: data => console.log('Sucesso:', data),
    onError: error => console.error('Erro:', error),
  });

  return (
    <Card className='max-w-md mx-auto'>
      <CardHeader>
        <h3 className='text-lg font-semibold'>
          Exemplo de Operação Assíncrona
        </h3>
      </CardHeader>
      <CardBody>
        {loading && <LoadingSpinner text='Carregando dados...' />}
        {error && <p className='text-red-600'>Erro: {error.message}</p>}
        {data && <p className='text-green-600'>{data.message}</p>}

        <Button onClick={execute} disabled={loading} className='mt-4'>
          {loading ? 'Carregando...' : 'Carregar Dados'}
        </Button>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// EXEMPLO DE LOCAL STORAGE
// ============================================================================

export function LocalStorageExample() {
  const [preferences, setPreferences, clearPreferences] = useLocalStorage(
    'user-preferences',
    {
      theme: 'dark',
      language: 'pt-BR',
      notifications: true,
    }
  );

  return (
    <Card className='max-w-md mx-auto'>
      <CardHeader>
        <h3 className='text-lg font-semibold'>Exemplo de Local Storage</h3>
      </CardHeader>
      <CardBody>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Tema</label>
            <select
              value={preferences.theme}
              onChange={e =>
                setPreferences({ ...preferences, theme: e.target.value })
              }
              className='w-full p-2 border rounded'
            >
              <option value='light'>Claro</option>
              <option value='dark'>Escuro</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Idioma</label>
            <select
              value={preferences.language}
              onChange={e =>
                setPreferences({ ...preferences, language: e.target.value })
              }
              className='w-full p-2 border rounded'
            >
              <option value='pt-BR'>Português</option>
              <option value='en-US'>English</option>
            </select>
          </div>

          <div className='flex items-center'>
            <input
              type='checkbox'
              checked={preferences.notifications}
              onChange={e =>
                setPreferences({
                  ...preferences,
                  notifications: e.target.checked,
                })
              }
              className='mr-2'
            />
            <label>Receber notificações</label>
          </div>

          <Button onClick={clearPreferences} variant='danger' size='sm'>
            Limpar Preferências
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// EXEMPLO DE MODAL
// ============================================================================

export function ModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Card className='max-w-md mx-auto'>
      <CardHeader>
        <h3 className='text-lg font-semibold'>Exemplo de Modal</h3>
      </CardHeader>
      <CardBody>
        <Button onClick={() => setIsModalOpen(true)}>Abrir Modal</Button>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title='Exemplo de Modal'
          size='md'
        >
          <div className='space-y-4'>
            <p>Este é um exemplo de modal reutilizável.</p>
            <p>Ele suporta diferentes tamanhos e funcionalidades.</p>

            <div className='flex justify-end space-x-2'>
              <Button variant='outline' onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant='primary' onClick={() => setIsModalOpen(false)}>
                Confirmar
              </Button>
            </div>
          </div>
        </Modal>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// EXEMPLO DE CONTEXT API
// ============================================================================

export function ContextExample() {
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
    console.log(`Notificação ${type}: Esta é uma notificação do tipo ${type}`);
  };

  return (
    <Card className='max-w-md mx-auto'>
      <CardHeader>
        <h3 className='text-lg font-semibold'>Exemplo de Context API</h3>
      </CardHeader>
      <CardBody>
        <div className='grid grid-cols-2 gap-2'>
          <Button
            variant='success'
            size='sm'
            onClick={() => showNotification('success')}
          >
            Sucesso
          </Button>
          <Button
            variant='danger'
            size='sm'
            onClick={() => showNotification('error')}
          >
            Erro
          </Button>
          <Button
            variant='warning'
            size='sm'
            onClick={() => showNotification('warning')}
          >
            Aviso
          </Button>
          <Button
            variant='secondary'
            size='sm'
            onClick={() => showNotification('info')}
          >
            Info
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL COM TODOS OS EXEMPLOS
// ============================================================================

export default function ComponentExamples() {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-8'>
      <div className='max-w-6xl mx-auto px-4'>
        <h1 className='text-3xl font-bold text-center mb-8'>
          Exemplos de Componentes e Hooks
        </h1>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <FormExample />
          <SearchExample />
          <AsyncExample />
          <LocalStorageExample />
          <ModalExample />
          <ContextExample />
        </div>
      </div>
    </div>
  );
}
