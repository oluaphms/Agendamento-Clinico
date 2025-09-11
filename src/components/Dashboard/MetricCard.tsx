// ============================================================================
// COMPONENTE: MetricCard - Card de Métrica
// ============================================================================
// Card para exibir métricas individuais com tendências
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody } from '@/components/UI';
import { Icon } from '@/components/UI';
import { MetricData, METRIC_CONFIG } from '@/lib/metrics';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface MetricCardProps {
  metric: MetricData;
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const MetricCard: React.FC<MetricCardProps> = ({ metric, className = '' }) => {
  // ============================================================================
  // CONFIGURAÇÕES DA MÉTRICA
  // ============================================================================
  
  const config = METRIC_CONFIG[metric.category as keyof typeof METRIC_CONFIG] || {
    name: metric.name,
    unit: metric.unit,
    icon: 'Activity',
    color: 'gray',
  };

  // ============================================================================
  // CONFIGURAÇÕES DE COR
  // ============================================================================
  
  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
    red: 'text-red-600 dark:text-red-400',
    pink: 'text-pink-600 dark:text-pink-400',
    gray: 'text-gray-600 dark:text-gray-400',
  };

  const bgColorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20',
    green: 'bg-green-100 dark:bg-green-900/20',
    purple: 'bg-purple-100 dark:bg-purple-900/20',
    orange: 'bg-orange-100 dark:bg-orange-900/20',
    red: 'bg-red-100 dark:bg-red-900/20',
    pink: 'bg-pink-100 dark:bg-pink-900/20',
    gray: 'bg-gray-100 dark:bg-gray-900/20',
  };

  // ============================================================================
  // CONFIGURAÇÕES DE TENDÊNCIA
  // ============================================================================
  
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getChangeIcon = () => {
    if (metric.changePercent > 0) {
      return <ArrowUpRight className="w-3 h-3" />;
    } else if (metric.changePercent < 0) {
      return <ArrowDownRight className="w-3 h-3" />;
    }
    return null;
  };

  // ============================================================================
  // FORMATAÇÃO DE VALOR
  // ============================================================================
  
  const formatValue = (value: number, unit: string) => {
    if (unit === 'R$') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    }
    
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
        <CardBody className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`p-2 rounded-lg ${bgColorClasses[config.color as keyof typeof bgColorClasses]}`}>
                  <Icon 
                    icon={config.icon as any} 
                    size="md" 
                    className={colorClasses[config.color as keyof typeof colorClasses]}
                  />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {config.name}
                </h3>
              </div>
              
              <div className="mb-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatValue(metric.value, metric.unit)}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
                  {getChangeIcon()}
                  <span className="text-sm font-medium">
                    {Math.abs(metric.changePercent).toFixed(1)}%
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  vs período anterior
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className={`p-1 rounded-full ${getTrendColor()}`}>
                {getTrendIcon()}
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {metric.timestamp.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default MetricCard;
