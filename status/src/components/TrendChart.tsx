import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Building2 } from 'lucide-react';
import { EmployerData, globalAverageApprovalRate } from '../data/employerData';

interface TrendChartProps {
  employer: EmployerData;
}

export function TrendChart({ employer }: TrendChartProps) {
  const data = employer.yearlyHistory.map(y => ({
    year: y.year.toString(),
    rate: Math.round((y.approvals / (y.approvals + y.denials)) * 100 * 10) / 10 || 0,
    approvals: y.approvals,
    denials: y.denials,
    globalAverage: globalAverageApprovalRate
  }));

  if (data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-500">Historical data not available for {employer.name}</p>
      </div>
    );
  }

  const firstRate = data[0].rate;
  const lastRate = data[data.length - 1].rate;
  const change = lastRate - firstRate;
  const percentChange = firstRate > 0 ? ((change / firstRate) * 100).toFixed(1) : '0';

  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const trendColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
  const trendBg = change > 0 ? 'bg-green-50' : change < 0 ? 'bg-red-50' : 'bg-gray-50';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              H1B Trend Analysis
            </h3>
            <p className="text-sm text-gray-600">
              Historical approval rates for {employer.name}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${trendBg}`}>
          <TrendIcon className={`w-5 h-5 ${trendColor}`} />
          <span className={`font-medium ${trendColor}`}>
            {change > 0 ? '+' : ''}{percentChange}% since {data[0].year}
          </span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="year" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              unit="%"
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'rate') return [`${value.toFixed(1)}%`, 'Approval Rate'];
                return [value.toLocaleString(), name === 'approvals' ? 'Approved' : 'Denied'];
              }}
            />
            <ReferenceLine 
              y={globalAverageApprovalRate} 
              stroke="#6b7280" 
              strokeDasharray="5 5"
              label={{ value: 'Industry Avg', position: 'right', fill: '#6b7280', fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-6 gap-2 text-center">
        {employer.yearlyHistory.map((yearData) => {
          const rate = yearData.approvals + yearData.denials > 0 
            ? (yearData.approvals / (yearData.approvals + yearData.denials)) * 100 
            : 0;
          return (
            <div key={yearData.year} className="p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">{yearData.year}</div>
              <div className={`font-semibold ${
                rate >= 90 ? 'text-green-600' :
                rate >= 80 ? 'text-lime-600' :
                rate >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {rate.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400">
                {yearData.approvals}/{yearData.denials}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Data source: USCIS H-1B Employer Data Hub (2020-2025)
      </div>
    </div>
  );
}
