import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className='min-vh-100 d-flex align-items-center justify-content-center bg-light'>
      <div className='container'>
        <div className='row justify-content-center'>
          <div className='col-md-6 col-lg-4'>
            <div className='card shadow-lg border-0'>
              <div className='card-body p-5 text-center'>
                <div
                  className='bg-danger bg-opacity-10 rounded-circle mx-auto mb-4'
                  style={{ width: '80px', height: '80px' }}
                >
                  <div className='d-flex align-items-center justify-content-center h-100'>
                    <AlertTriangle size={40} className='text-danger' />
                  </div>
                </div>

                <h4 className='text-danger mb-3'>Oops! Algo deu errado</h4>
                <p className='text-muted mb-4'>
                  Ocorreu um erro inesperado. Por favor, tente novamente ou
                  entre em contato com o suporte.
                </p>

                {import.meta.env.DEV && (
                  <details className='mb-4'>
                    <summary className='text-muted cursor-pointer'>
                      Detalhes do erro (desenvolvimento)
                    </summary>
                    <pre className='bg-light p-3 rounded mt-2 text-start'>
                      <code className='small'>
                        {error?.message || 'Erro desconhecido'}
                      </code>
                    </pre>
                  </details>
                )}

                <div className='d-grid gap-2'>
                  <button
                    className='btn btn-primary'
                    onClick={resetErrorBoundary}
                  >
                    <RefreshCw size={16} className='me-2' />
                    Tentar Novamente
                  </button>

                  <a href='/' className='btn btn-outline-secondary'>
                    <Home size={16} className='me-2' />
                    Voltar ao Início
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
