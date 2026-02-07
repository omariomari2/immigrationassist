import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { EmployerData, globalAverageApprovalRate, getApprovalLevel, getApprovalStyles } from '../data/employerData';
import { Building2, ThumbsUp, ThumbsDown, FileCheck, Calendar } from 'lucide-react';
import { useState } from 'react';

interface H1BStatsChartProps {
  employer: EmployerData;
}

export function H1BStatsChart({ employer }: H1BStatsChartProps) {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  // Get stats based on selected year
  const stats = selectedYear === 'all' 
    ? {
        year: 'all' as const,
        cases: employer.totalCases,
        approvals: employer.totalApprovals,
        denials: employer.totalDenials,
        approvalRate: employer.approvalRate,
        denialRate: employer.denialRate,
      }
    : (() => {
        const yearData = employer.yearlyHistory.find(y => y.year === selectedYear);
        if (!yearData) {
          return { year: selectedYear, cases: 0, approvals: 0, denials: 0, approvalRate: 0, denialRate: 0 };
        }
        const total = yearData.approvals + yearData.denials;
        return {
          year: selectedYear,
          cases: total,
          approvals: yearData.approvals,
          denials: yearData.denials,
          approvalRate: total > 0 ? (yearData.approvals / total) * 100 : 0,
          denialRate: total > 0 ? (yearData.denials / total) * 100 : 0,
        };
      })();

  const approvalLevel = getApprovalLevel(stats.approvalRate);
  const styles = getApprovalStyles(approvalLevel);

  const data = [
    { name: employer.name.slice(0, 20) + (employer.name.length > 20 ? '...' : ''), rate: stats.approvalRate, type: 'employer' },
    { name: 'Industry Avg', rate: globalAverageApprovalRate, type: 'average' },
  ];

  const difference = stats.approvalRate - globalAverageApprovalRate;
  const higherOrLower = difference > 0 ? 'higher' : 'lower';

  // Available years from employer data
  const availableYears = employer.yearlyHistory
    .filter(y => y.approvals > 0 || y.denials > 0)
    .map(y => y.year)
    .sort((a, b) => b - a);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${styles.color}20` }}>
          <Building2 className="w-6 h-6" style={{ color: styles.color }} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {employer.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-sm text-gray-600 bg-transparent border-b border-gray-300 hover:border-gray-500 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Years (2020-2025)</option>
              {availableYears.map(year => (
                <option key={year} value={year}>FY {year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="text-center p-6 rounded-xl" style={{ backgroundColor: `${styles.color}10` }}>
          <div className="text-5xl font-bold mb-2" style={{ color: styles.color }}>
            {stats.approvalRate.toFixed(1)}%
          </div>
          <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Approval Rate
          </div>
          <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: styles.color }}>
            {styles.label}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Total H1B Cases
            </span>
            <span className="font-semibold text-gray-900">
              {stats.cases.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span className="text-green-700 flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              Approved
            </span>
            <span className="font-semibold text-green-900">
              {stats.approvals.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
            <span className="text-red-700 flex items-center gap-2">
              <ThumbsDown className="w-4 h-4" />
              Denied
            </span>
            <span className="font-semibold text-red-900">
              {stats.denials.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-700">Denial Rate</span>
            <span className="font-semibold text-blue-900">
              {stats.denialRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.approvalRate}%`, backgroundColor: styles.color }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      <div className={`p-4 rounded-lg ${difference > 0 ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
        <p className={`text-sm ${difference > 0 ? 'text-green-800' : 'text-orange-800'}`}>
          <strong>{employer.name}</strong> has an approval rate that is{' '}
          <strong>{Math.abs(difference).toFixed(1)} percentage points {higherOrLower}</strong> than the industry average of {globalAverageApprovalRate}%.
          {difference > 10 && ' This employer has an excellent track record for H1B sponsorship.'}
          {difference < -10 && ' Consider additional documentation when applying through this employer.'}
        </p>
      </div>

      <div className="mt-6 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} unit="%" />
            <YAxis type="category" dataKey="name" width={120} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Approval Rate']}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <ReferenceLine x={globalAverageApprovalRate} stroke="#6b7280" strokeDasharray="3 3" />
            <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={30}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.type === 'employer' ? styles.color : '#9ca3af'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
