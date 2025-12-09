'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

interface DashboardChartsProps {
  salesData?: Array<{ month: string; sales: number }>
  categoryData?: Array<{ name: string; value: number }>
  revenueData?: Array<{ day: string; revenue: number }>
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function DashboardCharts({ 
  salesData = [], 
  categoryData = [], 
  revenueData = [] 
}: DashboardChartsProps) {
  
  const defaultSalesData = [
    { month: 'Lun 2', sales: 5 },
    { month: 'Mar 3', sales: 8 },
    { month: 'Mié 4', sales: 3 },
    { month: 'Jue 5', sales: 12 },
    { month: 'Vie 6', sales: 7 },
    { month: 'Sáb 7', sales: 15 },
    { month: 'Dom 8', sales: 4 },
  ]

  const defaultCategoryData = [
    { name: 'Raquetas', value: 45 },
    { name: 'Pelotas', value: 25 },
    { name: 'Ropa', value: 20 },
    { name: 'Accesorios', value: 10 },
  ]

  const defaultRevenueData = [
    { day: 'Sem 25 Nov', revenue: 8400 },
    { day: 'Sem 2 Dic', revenue: 12200 },
    { day: 'Sem 9 Dic', revenue: 9800 },
    { day: 'Sem 16 Dic', revenue: 15100 },
    { day: 'Sem 23 Dic', revenue: 11800 },
    { day: 'Sem 30 Dic', revenue: 18500 },
  ]

  const chartSalesData = salesData.length > 0 ? salesData : defaultSalesData
  const chartCategoryData = categoryData.length > 0 ? categoryData : defaultCategoryData
  const chartRevenueData = revenueData.length > 0 ? revenueData : defaultRevenueData

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-8">
      {}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 xl:col-span-3">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Ventas de los Últimos 7 Días</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartSalesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={'#e2e8f0'} />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip 
                formatter={(value) => [`${value} ventas`, 'Ventas']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: `1px solid ${'#e2e8f0'}`,
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="sales" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 xl:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Ventas por Categoría</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartCategoryData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} productos`, 'Productos']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: `1px solid ${'#e2e8f0'}`,
                  borderRadius: '8px',
                  color: '#374151'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {chartCategoryData.map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-slate-600">{entry.name}</span>
              </div>
              <span className="font-medium text-slate-900">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 xl:col-span-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Ingresos por Semana</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={'#e2e8f0'} />
              <XAxis 
                dataKey="day" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ingresos']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: `1px solid ${'#e2e8f0'}`,
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}