import React from 'react';

const CardioMonitor: React.FC = () => {
  return (
    <div className='flex items-center justify-center h-screen bg-black'>
      <svg
        viewBox='0 0 500 100'
        className='w-full max-w-5xl'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M0,50 L40,50 L60,20 L80,80 L120,50 L180,50 L200,30 L220,70 L240,50 L500,50'
          fill='none'
          stroke='#0066ff'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          filter='url(#glow)'
        >
          <animate
            attributeName='stroke-dasharray'
            from='0,1000'
            to='1000,0'
            dur='3s'
            repeatCount='indefinite'
          />
        </path>

        {/* Definição do efeito Glow */}
        <defs>
          <filter id='glow' x='-50%' y='-50%' width='200%' height='200%'>
            <feGaussianBlur stdDeviation='3' result='blur' />
            <feMerge>
              <feMergeNode in='blur' />
              <feMergeNode in='SourceGraphic' />
              <feMergeNode in='blur' />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default CardioMonitor;
