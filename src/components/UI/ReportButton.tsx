import React from 'react';
import { FileText } from 'lucide-react';

interface ReportButtonProps {
  onGenerateReport: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ReportButton: React.FC<ReportButtonProps> = ({
  onGenerateReport,
  variant = 'outline',
  size = 'md',
  className = '',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'outline':
      default:
        return 'btn-outline-secondary';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'btn-sm';
      case 'lg':
        return 'btn-lg';
      case 'md':
      default:
        return '';
    }
  };

  const baseClasses = 'btn d-flex align-items-center gap-2';
  const variantClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      onClick={onGenerateReport}
      title='Gerar e baixar relatório em PDF'
    >
      <FileText size={16} />
      Gerar Relatório
    </button>
  );
};

export default ReportButton;
