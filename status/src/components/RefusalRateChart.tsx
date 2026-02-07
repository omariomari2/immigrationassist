import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { CountryData, globalAverageRefusalRate } from '../data/visaData';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface RefusalRateChartProps {
  country: CountryData;
}

export function RefusalRateChart({ country }: RefusalRateChartProps) {
  const data = [
    { name: 'Your Country', rate: country.refusalRate, type: 'country' },
    { name: 'Global Average', rate: globalAverageRefusalRate, type: 'average' },
  ];

  const getRiskColor = (rate: number) => {
    if (rate < 15) return '#22c55e'; // green
    if (rate < 30) return '#eab308'; // yellow
    if (rate < 50) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getRiskLabel = (rate: number) => {
    if (rate < 15) return 'Low Risk';
    if (rate < 30) return 'Moderate Risk';
    if (rate < 50) return 'High Risk';
    return 'Very High Risk';
  };

  const getRiskIcon = (rate: number) => {
    if (rate < 15) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (rate < 30) return <Info className="w-6 h-6 text-yellow-600" />;
    return <AlertTriangle className="w-6 h-6 text-orange-600" />;
  };

  const riskColor = getRiskColor(country.refusalRate);
  const difference = country.refusalRate - globalAverageRefusalRate;
  const higherOrLower = difference > 0 ? 'higher' : 'lower';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${riskColor}20` }}>
          {getRiskIcon(country.refusalRate)}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {country.country} - B-Visa Refusal Rate
          </h3>
          <p className="text-sm text-gray-600">
            Fiscal Year 2024 • Adjusted Rate
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="text-center p-6 rounded-xl" style={{ backgroundColor: `${riskColor}10` }}>
          <div className="text-5xl font-bold mb-2" style={{ color: riskColor }}>
            {country.refusalRate.toFixed(1)}%
          </div>
          <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Refusal Rate
          </div>
          <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: riskColor, color: 'white' }}>
            {getRiskLabel(country.refusalRate)}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Total Applications</span>
            <span className="font-semibold text-gray-900">
              {(country.issuances + country.refusals).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span className="text-green-700">Visas Issued</span>
            <span className="font-semibold text-green-900">
              {country.issuances.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
            <span className="text-red-700">Refusals</span>
            <span className="font-semibold text-red-900">
              {country.refusals.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-700">Overcomes</span>
            <span className="font-semibold text-blue-900">
              {country.overcomes.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(country.refusalRate, 100)}%`, backgroundColor: riskColor }}
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

      <div className={`p-4 rounded-lg ${difference > 0 ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
        <p className={`text-sm ${difference > 0 ? 'text-orange-800' : 'text-green-800'}`}>
          <strong>{country.country}</strong> has a refusal rate that is{' '}
          <strong>{Math.abs(difference).toFixed(1)} percentage points {higherOrLower}</strong> than the global average of {globalAverageRefusalRate}%.
          {difference > 10 && ' Applicants from this country should prepare additional documentation to strengthen their case.'}
        </p>
      </div>

      <div className="mt-6 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} unit="%" />
            <YAxis type="category" dataKey="name" width={100} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Refusal Rate']}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <ReferenceLine x={globalAverageRefusalRate} stroke="#6b7280" strokeDasharray="3 3" />
            <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={30}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.type === 'country' ? riskColor : '#9ca3af'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
