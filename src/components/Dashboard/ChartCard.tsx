// ============================================================================
// COMPONENTE: ChartCard - Card de Gráfico
// ============================================================================
// Card para exibir gráficos de métricas
// ============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardBody } from '@/components/UI';
import { Button } from '@/components/UI';
import { ChartData } from '@/lib/metrics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type ChartType = 'line' | 'bar' | 'pie';
export type ChartPeriod = '7d' | '30d' | '90d';

interface ChartCardProps {
  title: string;
  data: ChartData;
  type?: ChartType;
  period?: ChartPeriod;
  onPeriodChange?: (period: ChartPeriod) => void;
  className?: string;
  height?: number;
}

// ============================================================================
// CONFIGURAÇÕES DE CORES
// ============================================================================

const COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  data,
  type = 'line',
  period = '30d',
  onPeriodChange,
  className = '',
  height = 300,
}) => {
  // ============================================================================
  // ESTADO LOCAL
  // ============================================================================
  
  const [activePeriod, setActivePeriod] = useState<ChartPeriod>(period);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handlePeriodChange = (newPeriod: ChartPeriod) => {
    setActivePeriod(newPeriod);
    onPeriodChange?.(newPeriod);
  };

  // ============================================================================
  // CONFIGURAÇÕES DE PERÍODO
  // ============================================================================
  
  const periodOptions: { value: ChartPeriod; label: string }[] = [
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: '90d', label: '90 dias' },
  ];

  // ============================================================================
  // RENDERIZAÇÃO DE GRÁFICO
  // ============================================================================
  
  const renderChart = () => {
    if (!data.labels.length || !data.datasets.length) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <p className="text-sm">Nenhum dado disponível</p>
            <p className="text-xs mt-1">Tente selecionar um período diferente</p>
          </div>
        </div>
      );
    }

    const chartData = data.labels.map((label, index) => ({
      name: label,
      ...data.datasets.reduce((acc, dataset, datasetIndex) => {
        acc[dataset.label] = dataset.data[index] || 0;
        return acc;
      }, {} as Record<string, number>),
    }));

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
                labelStyle={{ color: 'white' }}
              />
              {data.datasets.map((dataset, index) => (
                <Line
                  key={dataset.label}
                  type="monotone"
                  dataKey={dataset.label}
                  stroke={dataset.borderColor || COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: dataset.borderColor || COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
                labelStyle={{ color: 'white' }}
              />
              {data.datasets.map((dataset, index) => (
                <Bar
                  key={dataset.label}
                  dataKey={dataset.label}
                  fill={dataset.backgroundColor || COLORS[index % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = data.labels.map((label, index) => ({
          name: label,
          value: data.datasets[0]?.data[index] || 0,
        }));

        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
                labelStyle={{ color: 'white' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
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
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            
            {onPeriodChange && (
              <div className="flex space-x-1">
                {periodOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={activePeriod === option.value ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handlePeriodChange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardBody className="p-6">
          <div className="w-full">
            {renderChart()}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ChartCard;
